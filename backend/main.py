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
from typing import List
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.config import WEBSOCKET_PORT
from model_handler import WeaponDetector

app = FastAPI(title="Weapon Detection API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize detector
detector = WeaponDetector()

# Store connected clients
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()


@app.get("/")
async def root():
    return {"message": "Weapon Detection API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": detector.model is not None}


@app.websocket("/ws/webcam")
async def websocket_webcam_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for receiving frames from webcam client
    Process and discard immediately - no frame storage
    """
    await manager.connect(websocket)
    print("Webcam client connected - streaming mode")
    
    try:
        while True:
            # Receive frame from webcam client
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                continue
            except Exception as e:
                print(f"Error receiving data: {type(e).__name__}: {e}")
                break
            
            if "frame" in message:
                try:
                    # Decode frame (no storage)
                    frame_data = base64.b64decode(message["frame"])
                    np_arr = np.frombuffer(frame_data, np.uint8)
                    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                    
                    if frame is None:
                        continue
                    
                    # Run detection
                    annotated_frame, detections = await asyncio.to_thread(
                        detector.detect, frame
                    )
                    
                    # Encode result (no storage)
                    encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
                    success, buffer = cv2.imencode('.jpg', annotated_frame, encode_params)
                    
                    if not success:
                        continue
                    
                    encoded_frame = base64.b64encode(buffer.tobytes()).decode('utf-8')
                    
                    # Prepare response (discard after sending)
                    response = {
                        "frame": encoded_frame,
                        "detections": detections,
                        "weapon_detected": len(detections) > 0,
                        "timestamp": message.get("timestamp", 0)
                    }
                    
                    # Broadcast to display clients
                    await manager.broadcast(response)
                    
                    # Send acknowledgment
                    await websocket.send_json({
                        "status": "processed", 
                        "detection_count": len(detections),
                        "weapon_detected": len(detections) > 0
                    })
                    
                    # Explicitly discard to free memory
                    del frame, annotated_frame, buffer, encoded_frame, response, frame_data, np_arr
                        
                except Exception as e:
                    print(f"Error processing frame: {e}")
                    continue
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Webcam client disconnected")
    except Exception as e:
        print(f"Error in webcam endpoint: {e}")
        manager.disconnect(websocket)


@app.websocket("/ws/display")
async def websocket_display_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for sending annotated frames to display client
    """
    await manager.connect(websocket)
    print("Display client connected")
    
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Display client disconnected")
    except Exception as e:
        print(f"Error in display endpoint: {e}")
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    print(f"Starting server on port {WEBSOCKET_PORT}")
    print("Endpoints:")
    print(f"  - WebSocket (webcam): ws://localhost:{WEBSOCKET_PORT}/ws/webcam")
    print(f"  - WebSocket (display): ws://localhost:{WEBSOCKET_PORT}/ws/display")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=WEBSOCKET_PORT,
        ws_ping_interval=20.0,  # Send WebSocket ping every 20 seconds
        ws_ping_timeout=20.0,   # Wait 20 seconds for pong response
        timeout_keep_alive=120  # Keep connection alive for 120 seconds
    )
