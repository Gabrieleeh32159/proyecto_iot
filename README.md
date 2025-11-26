# Weapon Detection System - IoT Project

Real-time weapon detection system using YOLOv8 and WebSocket streaming. Optimized for Apple Silicon M3 with MPS acceleration.

## Architecture

```
[Webcam Client] --WebSocket--> [FastAPI Backend + Model] --WebSocket--> [Display Client]
     (Captures)                  (Detects Weapons)                    (Shows Results)
```

## Features

- ✅ Real-time weapon detection using YOLOv8 from HuggingFace
- ✅ MPS (Metal Performance Shaders) acceleration for M3 MacBook
- ✅ WebSocket-based streaming architecture
- ✅ Separate webcam capture and display clients
- ✅ Detection logging with timestamps and locations
- ✅ Configurable confidence thresholds and frame rates
- ✅ ~15-20 FPS balanced performance

## Project Structure

```
iot/
├── backend/
│   ├── main.py              # FastAPI server with WebSocket endpoints
│   ├── model_handler.py     # YOLOv8 weapon detection model
│   └── requirements.txt     # Backend dependencies
├── client/
│   ├── webcam_client.py     # Captures and streams webcam frames
│   ├── display_client.py    # Displays annotated video from backend
│   └── requirements.txt     # Client dependencies
├── shared/
│   └── config.py            # Shared configuration
└── venv/                    # Virtual environment
```

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Client Dependencies

```bash
cd ../client
pip install -r requirements.txt
```

### 3. Download the Model (First Run)

The model will be automatically downloaded from HuggingFace on first run. This may take a few minutes.

## Running the System

You need to run **3 terminals** simultaneously:

### Terminal 1: Start Backend Server

```bash
cd backend
python main.py
```

Expected output:
```
Using device: mps
Loading model: keremberke/yolov8m-weapon-detection
Model loaded successfully!
Starting server on port 8000
```

### Terminal 2: Start Webcam Client (Capture Only)

```bash
cd client
python webcam_client.py
```

This client captures your webcam and sends frames to the backend. **No video display here.**

### Terminal 3: Start Display Client (View Processed Video)

```bash
cd client
python display_client.py
```

This client displays the **backend's processed video** with weapon detection annotations.

**Press 'q' in the video window to quit the display client.**

## Configuration

Edit `shared/config.py` to customize:

```python
# WebSocket Configuration
WEBSOCKET_HOST = "localhost"
WEBSOCKET_PORT = 8000

# Video Configuration
FRAME_WIDTH = 640
FRAME_HEIGHT = 480
FPS_TARGET = 20

# Model Configuration
CONFIDENCE_THRESHOLD = 0.5  # Detection confidence (0.0-1.0)
IOU_THRESHOLD = 0.45        # Non-max suppression threshold
```

## How It Works

1. **Webcam Client** captures frames from your webcam at ~20 FPS
2. Frames are encoded (JPEG + base64) and sent via WebSocket to backend
3. **Backend** receives frames, runs YOLOv8 weapon detection using MPS acceleration
4. Detected weapons are annotated with bounding boxes and labels
5. Annotated frames + detection metadata are broadcast to all display clients
6. **Display Client** shows the processed video with detection overlays
7. When weapons are detected, alerts are shown and logged to JSON file

## Detection Output

When a weapon is detected, you'll see:

- **Visual**: Red bounding box with class label and confidence score
- **Console**: Real-time alert with detection details
- **Log File**: JSON file (`detections_YYYYMMDD_HHMMSS.json`) with all detections

Example detection log entry:
```json
{
  "timestamp": "2025-11-25 14:30:45.123",
  "class": "pistol",
  "confidence": 0.87,
  "location": {
    "x1": 245,
    "y1": 180,
    "x2": 390,
    "y2": 310
  }
}
```

## Performance Tips

### For Better Speed:
- Lower `FRAME_WIDTH` and `FRAME_HEIGHT` (e.g., 320x240)
- Increase `CONFIDENCE_THRESHOLD` to 0.6 or 0.7
- Use smaller model variant (change model in `config.py`)

### For Better Accuracy:
- Increase resolution to 1280x720
- Lower `CONFIDENCE_THRESHOLD` to 0.3
- Use larger model variant (e.g., yolov8l-weapon-detection)

## Troubleshooting

### "Could not open webcam"
- Check camera permissions in System Preferences > Privacy & Security > Camera
- Try different camera index: `cv2.VideoCapture(1)` in `webcam_client.py`

### "Import torch could not be resolved"
- Make sure you're using the virtual environment: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r backend/requirements.txt`

### "Connection refused"
- Start the backend server first (Terminal 1)
- Check if port 8000 is available: `lsof -i :8000`

### Low FPS
- Your M3 should handle 15-20 FPS easily with MPS
- Check Activity Monitor for CPU/GPU usage
- Reduce resolution in `config.py`

## API Endpoints

- `GET /` - Server status
- `GET /health` - Health check and model status
- `WebSocket /ws/webcam` - Endpoint for webcam client
- `WebSocket /ws/display` - Endpoint for display clients

## Model Information

Default model: `keremberke/yolov8m-weapon-detection`

Detects: pistols, rifles, knives, and other weapons

Alternative models:
- `EdBianchi/yolov8s-weapon-detection` (faster, less accurate)
- Custom models can be specified in `config.py`

## License

This project is for educational/IoT purposes. Ensure compliance with local laws regarding surveillance and weapon detection systems.

## Credits

- YOLOv8 by Ultralytics
- Model from HuggingFace community
- Built for UTEC IoT Project
