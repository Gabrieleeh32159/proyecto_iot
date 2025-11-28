"""
FastAPI WebSocket server for weapon detection
Receives frames from webcam client, runs inference, and streams back results
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
import json
import asyncio
import time
from typing import List
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.config import WEBSOCKET_PORT
from hybrid_tracker import HybridWeaponTracker
from servo_controller import ServoController

app = FastAPI(title="Weapon Detection API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize hybrid tracker and servo controller
tracker = HybridWeaponTracker(
    target_labels=["Gun"],
    conf_threshold_initial=0.8,
    conf_threshold_redetect=0.6,
    yolo_refresh_every=10,
    timeout_seconds=5.0,
    fps=30.0  # Will be updated with actual FPS from webcam
)
servo_controller = ServoController()

# Store connected clients
class ConnectionManager:
    def __init__(self):
        self.display_connections: List[WebSocket] = []
        self.servo_connections: List[WebSocket] = []
    
    async def connect_display(self, websocket: WebSocket):
        await websocket.accept()
        self.display_connections.append(websocket)
    
    async def connect_servo(self, websocket: WebSocket):
        await websocket.accept()
        self.servo_connections.append(websocket)
        print(f"Servo controller connected - Total: {len(self.servo_connections)}")
    
    def disconnect_display(self, websocket: WebSocket):
        if websocket in self.display_connections:
            self.display_connections.remove(websocket)
    
    def disconnect_servo(self, websocket: WebSocket):
        if websocket in self.servo_connections:
            self.servo_connections.remove(websocket)
            print(f"Servo controller disconnected - Remaining: {len(self.servo_connections)}")
    
    async def broadcast_display(self, message: dict):
        """Broadcast message to all display clients"""
        for connection in self.display_connections:
            try:
                await connection.send_json(message)
            except:
                pass
    
    async def broadcast_servo(self, x_angle: int, y_angle: int):
        """Broadcast servo commands to all servo controllers in text format: 'X,Y'"""
        text_command = f"{x_angle},{y_angle}"
        for connection in self.servo_connections:
            try:
                await connection.send_text(text_command)
            except Exception as e:
                print(f"Error sending to servo: {e}")

manager = ConnectionManager()


@app.get("/")
async def root():
    return {"message": "Weapon Detection API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": tracker.yolo_model is not None}


@app.websocket("/ws/webcam")
async def websocket_webcam_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for receiving frames from webcam client
    Supports both JSON (Python client) and binary JPEG (ESP32)
    Process and discard immediately - no frame storage
    """
    await websocket.accept()
    print("Webcam client connected - streaming mode")
    
    try:
        while True:
            # Receive frame from webcam client (text or binary)
            try:
                # Try to receive as bytes first (ESP32 binary mode)
                raw_data = await websocket.receive()
                
                # Check if binary (ESP32) or text (Python client)
                if "bytes" in raw_data:
                    # ESP32 binary JPEG data
                    jpeg_data = raw_data["bytes"]
                    np_arr = np.frombuffer(jpeg_data, np.uint8)
                    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                    is_binary = True
                    
                elif "text" in raw_data:
                    # Python client JSON data
                    message = json.loads(raw_data["text"])
                    if "frame" not in message:
                        continue
                    
                    frame_data = base64.b64decode(message["frame"])
                    np_arr = np.frombuffer(frame_data, np.uint8)
                    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                    is_binary = False
                    
                else:
                    continue
                    
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                continue
            except Exception as e:
                print(f"Error receiving data: {type(e).__name__}: {e}")
                break
            
            # Process frame
            try:
                if frame is None:
                    continue
                
                # Run hybrid tracking (YOLO + classical tracker)
                annotated_frame, tracking_info = await asyncio.to_thread(
                    tracker.process_frame, frame
                )
                
                # Encode result (no storage)
                encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
                success, buffer = cv2.imencode('.jpg', annotated_frame, encode_params)
                
                if not success:
                    continue
                
                encoded_frame = base64.b64encode(buffer.tobytes()).decode('utf-8')
                
                # Convert tracking_info to detections format for backwards compatibility
                detections = []
                weapon_detected = False
                
                if tracking_info is not None:
                    weapon_detected = True
                    detections.append({
                        "class": tracking_info["class"],
                        "confidence": tracking_info["confidence"],
                        "bbox": tracking_info["bbox"],
                        "source": tracking_info["source"],
                        "time_since_yolo": tracking_info["time_since_yolo"]
                    })
                
                # Prepare response (discard after sending)
                response = {
                    "frame": encoded_frame,
                    "detections": detections,
                    "weapon_detected": weapon_detected,
                    "timestamp": time.time(),
                    "source": "esp32" if is_binary else "python",
                    "tracking_active": tracking_info is not None
                }
                
                # Broadcast to display clients
                await manager.broadcast_display(response)
                
                # Calculate and send servo commands
                if weapon_detected and tracking_info is not None:
                    # Weapon detected - point servos at target
                    servo_command = servo_controller.get_servo_command(detections)
                    if servo_command:
                        x_angle = servo_command['x_angle']
                        y_angle = servo_command['y_angle']
                        weapon_class = servo_command['weapon_class']
                        
                        # Send simple text format to ESP32: "X,Y"
                        await manager.broadcast_servo(x_angle, y_angle)
                        print(f"🎯 Servo: X={x_angle}° Y={y_angle}° → {weapon_class} (source: {tracking_info['source']})")
                else:
                    # No weapon detected - reset servos to center (90, 90)
                    await manager.broadcast_servo(90, 90)
                    # Only print occasionally to avoid spam
                    if tracker.frame_idx % 30 == 0:
                        print("🟢 No weapon detected - Servos at center (90°, 90°)")
                
                # Send acknowledgment only to Python clients (ESP32 doesn't need it)
                if not is_binary:
                    await websocket.send_json({
                        "status": "processed", 
                        "detection_count": len(detections),
                        "weapon_detected": weapon_detected,
                        "tracking_active": tracking_info is not None
                    })
                
                # Explicitly discard to free memory
                del frame, annotated_frame, buffer, encoded_frame, response, np_arr
                    
            except Exception as e:
                print(f"Error processing frame: {e}")
                continue
    
    except WebSocketDisconnect:
        print("Webcam client disconnected")
    except Exception as e:
        print(f"Error in webcam endpoint: {e}")


@app.websocket("/ws/display")
async def websocket_display_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for sending annotated frames to display client
    """
    await manager.connect_display(websocket)
    print("Display client connected")
    
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    
    except WebSocketDisconnect:
        manager.disconnect_display(websocket)
        print("Display client disconnected")
    except Exception as e:
        print(f"Error in display endpoint: {e}")
        manager.disconnect_display(websocket)


@app.websocket("/ws/servos")
async def websocket_servos_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for ESP32-Servos
    Receives connection and sends servo commands when weapons detected
    """
    await manager.connect_servo(websocket)
    
    try:
        while True:
            # Receive status messages from ESP32 (optional)
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Log servo status if provided
                if message.get("type") == "status":
                    print(f"Servo status: X={message.get('current_x')}° Y={message.get('current_y')}° Ready={message.get('ready')}")
                    
            except asyncio.TimeoutError:
                # No message received, that's fine
                continue
            except json.JSONDecodeError:
                continue
    
    except WebSocketDisconnect:
        manager.disconnect_servo(websocket)
    except Exception as e:
        print(f"Error in servos endpoint: {e}")
        manager.disconnect_servo(websocket)


if __name__ == "__main__":
    import uvicorn
    print(f"Starting server on port {WEBSOCKET_PORT}")
    print("Endpoints:")
    print(f"  - WebSocket (webcam): ws://localhost:{WEBSOCKET_PORT}/ws/webcam")
    print(f"  - WebSocket (display): ws://localhost:{WEBSOCKET_PORT}/ws/display")
    print(f"  - WebSocket (servos): ws://localhost:{WEBSOCKET_PORT}/ws/servos")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=WEBSOCKET_PORT,
        ws_ping_interval=20.0,  # Send WebSocket ping every 20 seconds
        ws_ping_timeout=20.0,   # Wait 20 seconds for pong response
        timeout_keep_alive=120  # Keep connection alive for 120 seconds
    )
