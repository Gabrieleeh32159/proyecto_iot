"""
Shared configuration for weapon detection system
"""

# WebSocket Configuration
WEBSOCKET_HOST = "localhost"
WEBSOCKET_PORT = 8000
WEBSOCKET_URL = f"ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}/ws"

# Video Configuration
FRAME_WIDTH = 640
FRAME_HEIGHT = 480
JPEG_QUALITY = 85
FPS_TARGET = 10

# Model Configuration
MODEL_NAME = "Subh775/Firearm_Detection_Yolov8n"
CONFIDENCE_THRESHOLD = 0.5
IOU_THRESHOLD = 0.45

# Detection Classes
WEAPON_CLASSES = ["pistol", "rifle", "knife", "weapon"]

# Display Configuration
DISPLAY_WINDOW_NAME = "Weapon Detection - Backend View"
ALERT_COLOR = (0, 0, 255)  # Red in BGR
BOX_COLOR = (0, 255, 0)    # Green in BGR
TEXT_COLOR = (255, 255, 255)  # White in BGR

# Servo Configuration
CAMERA_FOV_HORIZONTAL = 78.0  # degrees (standard webcam)
CAMERA_FOV_VERTICAL = 62.0    # degrees (standard webcam)

SERVO_X_MIN = 0      # Minimum angle for X servo (pan)
SERVO_X_MAX = 180    # Maximum angle for X servo (pan)
SERVO_X_CENTER = 90  # Center position for X servo

SERVO_Y_MIN = 0      # Minimum angle for Y servo (tilt)
SERVO_Y_MAX = 180    # Maximum angle for Y servo (tilt)
SERVO_Y_CENTER = 90  # Center position for Y servo
