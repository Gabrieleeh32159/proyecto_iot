"""
Webcam client - Captures frames and sends them to backend via WebSocket
No display on this client - only captures and sends
"""

import cv2
import base64
import json
import asyncio
import websockets
import time
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.config import (
    WEBSOCKET_HOST,
    WEBSOCKET_PORT,
    FRAME_WIDTH,
    FRAME_HEIGHT,
    JPEG_QUALITY,
    FPS_TARGET
)


class WebcamClient:
    def __init__(self):
        self.websocket_url = f"ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}/ws/webcam"
        self.cap = None
        self.running = False
        self.frame_delay = 1.0 / FPS_TARGET
    
    def initialize_camera(self):
        """Initialize webcam capture"""
        # Try to use built-in MacBook camera (index 0 or 1)
        # If Continuity Camera activates, try index 1
        camera_index = 0
        self.cap = cv2.VideoCapture(camera_index)
        
        # Check if it's Continuity Camera and try next index
        if self.cap.isOpened():
            backend = self.cap.getBackendName()
            if 'AVFoundation' in backend:
                # Try built-in camera specifically
                self.cap.release()
                self.cap = cv2.VideoCapture(0, cv2.CAP_AVFOUNDATION)
        
        if not self.cap.isOpened():
            raise Exception("Could not open webcam")
        
        # Set camera resolution
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
        
        print(f"Webcam initialized: {FRAME_WIDTH}x{FRAME_HEIGHT}")
        print(f"Camera backend: {self.cap.getBackendName()}")
    
    def capture_frame(self):
        """Capture a single frame from webcam"""
        if self.cap is None:
            return None
        
        ret, frame = self.cap.read()
        if not ret:
            print("Failed to capture frame")
            return None
        
        return frame
    
    def encode_frame(self, frame):
        """Encode frame to JPEG and base64"""
        encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), int(JPEG_QUALITY)]
        success, buffer = cv2.imencode('.jpg', frame, encode_params)
        if not success:
            raise Exception("Failed to encode frame")
        encoded = base64.b64encode(buffer.tobytes()).decode('utf-8')
        return encoded
    
    async def stream_frames(self):
        """Main streaming loop - no frame counting"""
        self.running = True
        
        try:
            # Connect with ping/pong keepalive and larger timeout
            async with websockets.connect(
                self.websocket_url,
                ping_interval=None,  # Disable automatic ping (server handles it)
                ping_timeout=None,   # Disable ping timeout
                close_timeout=10,
                max_size=10 * 1024 * 1024  # 10MB max message size
            ) as websocket:
                print(f"Connected to backend: {self.websocket_url}")
                print("Streaming frames... Press Ctrl+C to stop")
                
                # Create task to handle incoming acknowledgments
                async def handle_acks():
                    try:
                        while self.running:
                            response = await websocket.recv()
                            ack = json.loads(response)
                            detection_count = ack.get("detection_count", 0)
                            if detection_count > 0:
                                print(f"⚠️  WEAPON DETECTED! ({detection_count} detection(s))")
                    except Exception:
                        pass
                
                # Start ack handler in background
                ack_task = asyncio.create_task(handle_acks())
                
                try:
                    while self.running:
                        loop_start = time.time()
                        
                        # Capture frame
                        frame = self.capture_frame()
                        if frame is None:
                            await asyncio.sleep(0.1)
                            continue
                        
                        # Encode frame
                        try:
                            encoded_frame = self.encode_frame(frame)
                        except Exception as e:
                            print(f"Encoding error: {e}")
                            del frame
                            continue
                        
                        # Prepare message (no frame number)
                        message = {
                            "frame": encoded_frame,
                            "timestamp": time.time()
                        }
                        
                        # Send to backend (don't wait for ack)
                        try:
                            await websocket.send(json.dumps(message))
                        except Exception as e:
                            print(f"Send error: {e}")
                            del frame, encoded_frame, message
                            break
                        
                        # Frame rate control
                        elapsed = time.time() - loop_start
                        sleep_time = max(0, self.frame_delay - elapsed)
                        if sleep_time > 0:
                            await asyncio.sleep(sleep_time)
                        
                        # Discard frame data
                        del frame, encoded_frame, message
                
                finally:
                    ack_task.cancel()
        
        except websockets.exceptions.WebSocketException as e:
            print(f"WebSocket error: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
        except KeyboardInterrupt:
            print("\nStopping webcam stream...")
        except Exception as e:
            print(f"Unexpected error: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Release resources"""
        self.running = False
        if self.cap is not None:
            self.cap.release()
        print("Webcam released")
    
    async def run(self):
        """Initialize and run the webcam client"""
        try:
            self.initialize_camera()
            await self.stream_frames()
        except Exception as e:
            print(f"Error: {e}")
            self.cleanup()


async def main():
    client = WebcamClient()
    await client.run()


if __name__ == "__main__":
    print("=" * 60)
    print("WEBCAM CLIENT - Frame Capture & Streaming")
    print("=" * 60)
    print(f"Target: {WEBSOCKET_HOST}:{WEBSOCKET_PORT}")
    print(f"Resolution: {FRAME_WIDTH}x{FRAME_HEIGHT}")
    print(f"Target FPS: {FPS_TARGET}")
    print("=" * 60)
    
    asyncio.run(main())
