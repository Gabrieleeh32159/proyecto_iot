"""
Display client - Receives and displays annotated frames from backend
This is where you see the video with weapon detection annotations
"""

import cv2
import base64
import json
import asyncio
import websockets
import numpy as np
import sys
import os
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.config import (
    WEBSOCKET_HOST,
    WEBSOCKET_PORT,
    DISPLAY_WINDOW_NAME,
    ALERT_COLOR,
    TEXT_COLOR
)


class DisplayClient:
    def __init__(self):
        self.websocket_url = f"ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}/ws/display"
        self.running = False
        self.current_frame = None
        self.detections_log = []
    
    def decode_frame(self, encoded_frame):
        """Decode base64 frame to numpy array"""
        frame_data = base64.b64decode(encoded_frame)
        np_arr = np.frombuffer(frame_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return frame
    
    def add_detection_info(self, frame, detections, weapon_detected):
        """Add detection information overlay to frame"""
        height, width = frame.shape[:2]
        
        # Add timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(
            frame,
            timestamp,
            (10, height - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            TEXT_COLOR,
            1
        )
        
        # Add detection count
        detection_text = f"Detections: {len(detections)}"
        cv2.putText(
            frame,
            detection_text,
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            TEXT_COLOR,
            2
        )
        
        # Add alert if weapon detected
        if weapon_detected:
            alert_text = "⚠️ WEAPON DETECTED!"
            text_size = cv2.getTextSize(alert_text, cv2.FONT_HERSHEY_SIMPLEX, 1.2, 3)[0]
            text_x = (width - text_size[0]) // 2
            
            # Add background rectangle for alert
            cv2.rectangle(
                frame,
                (text_x - 10, 50),
                (text_x + text_size[0] + 10, 50 + text_size[1] + 10),
                ALERT_COLOR,
                -1
            )
            
            cv2.putText(
                frame,
                alert_text,
                (text_x, 50 + text_size[1]),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.2,
                TEXT_COLOR,
                3
            )
            
            # List detected weapons
            y_offset = 100
            for i, det in enumerate(detections):
                det_text = f"{det['class']}: {det['confidence']:.2f} at ({det['bbox']['x1']}, {det['bbox']['y1']})"
                cv2.putText(
                    frame,
                    det_text,
                    (10, y_offset + i * 25),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    ALERT_COLOR,
                    2
                )
        
        return frame
    
    def log_detection(self, detections):
        """Log detection information"""
        if len(detections) > 0:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            for det in detections:
                log_entry = {
                    "timestamp": timestamp,
                    "class": det["class"],
                    "confidence": det["confidence"],
                    "location": det["bbox"]
                }
                self.detections_log.append(log_entry)
                print(f"[{timestamp}] WEAPON DETECTED: {det['class']} "
                      f"(confidence: {det['confidence']:.2f}) "
                      f"at position ({det['bbox']['x1']}, {det['bbox']['y1']})")
    
    async def receive_frames(self):
        """Receive and display frames from backend"""
        self.running = True
        
        try:
            async with websockets.connect(self.websocket_url) as websocket:
                print(f"Connected to backend: {self.websocket_url}")
                print("Receiving frames... Press 'q' to quit")
                
                # Create display window
                cv2.namedWindow(DISPLAY_WINDOW_NAME, cv2.WINDOW_NORMAL)
                
                frame_count = 0
                
                # Send keep-alive messages
                async def keep_alive():
                    while self.running:
                        try:
                            await websocket.send(json.dumps({"type": "ping"}))
                            await asyncio.sleep(1)
                        except:
                            break
                
                # Start keep-alive task
                keep_alive_task = asyncio.create_task(keep_alive())
                
                while self.running:
                    try:
                        # Receive message from backend
                        message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                        data = json.loads(message)
                        
                        if "frame" in data:
                            # Decode frame
                            frame = self.decode_frame(data["frame"])
                            
                            if frame is not None:
                                # Get detection info
                                detections = data.get("detections", [])
                                weapon_detected = data.get("weapon_detected", False)
                                
                                # Add detection overlay
                                display_frame = self.add_detection_info(
                                    frame,
                                    detections,
                                    weapon_detected
                                )
                                
                                # Log detections
                                if weapon_detected:
                                    self.log_detection(detections)
                                
                                # Display frame
                                cv2.imshow(DISPLAY_WINDOW_NAME, display_frame)
                                
                                frame_count += 1
                                
                                # Check for quit key
                                if cv2.waitKey(1) & 0xFF == ord('q'):
                                    print("\nQuitting...")
                                    self.running = False
                                    break
                    
                    except asyncio.TimeoutError:
                        print("Waiting for frames...")
                        continue
                    except json.JSONDecodeError:
                        continue
                
                keep_alive_task.cancel()
        
        except websockets.exceptions.WebSocketException as e:
            print(f"WebSocket error: {e}")
        except KeyboardInterrupt:
            print("\nStopping display...")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Release resources"""
        self.running = False
        cv2.destroyAllWindows()
        
        # Save detection log
        if len(self.detections_log) > 0:
            log_file = f"detections_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(log_file, 'w') as f:
                json.dump(self.detections_log, f, indent=2)
            print(f"\nDetection log saved to: {log_file}")
        
        print("Display client stopped")
    
    async def run(self):
        """Run the display client"""
        try:
            await self.receive_frames()
        except Exception as e:
            print(f"Error: {e}")
            self.cleanup()


async def main():
    client = DisplayClient()
    await client.run()


if __name__ == "__main__":
    print("=" * 60)
    print("DISPLAY CLIENT - Backend Video View")
    print("=" * 60)
    print(f"Connecting to: {WEBSOCKET_HOST}:{WEBSOCKET_PORT}")
    print("This window shows the processed video from backend")
    print("Press 'q' in the video window to quit")
    print("=" * 60)
    
    asyncio.run(main())
