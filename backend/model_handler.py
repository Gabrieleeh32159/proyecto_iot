"""
Model handler for weapon detection using YOLOv8
Optimized for Apple Silicon M3 with MPS acceleration
"""

import torch
from ultralytics import YOLO
import cv2
import numpy as np
from typing import List, Dict, Tuple
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.config import MODEL_NAME, CONFIDENCE_THRESHOLD, IOU_THRESHOLD


class WeaponDetector:
    def __init__(self):
        self.device = self._get_device()
        print(f"Using device: {self.device}")
        self.model = None
        self.load_model()
    
    def _get_device(self) -> str:
        """Determine the best available device (MPS for M3, CPU fallback)"""
        if torch.backends.mps.is_available():
            return "mps"
        elif torch.cuda.is_available():
            return "cuda"
        else:
            return "cpu"
    
    def load_model(self):
        """Load the YOLOv8 weapon detection model from HuggingFace"""
        try:
            print(f"Loading model: {MODEL_NAME}")
            # Load from HuggingFace hub using the correct path
            from huggingface_hub import hf_hub_download
            
            # Download model weights from HuggingFace (specific path for this model)
            model_path = hf_hub_download(
                repo_id=MODEL_NAME,
                filename="weights/best.pt"
            )
            self.model = YOLO(model_path)
            
            print(f"Firearm detection model loaded successfully from: {model_path}")
        except Exception as e:
            print(f"Error loading firearm model: {e}")
            print("Attempting to use default YOLOv8 model for demo...")
            print("⚠️  WARNING: Using generic object detection - will detect 'person' not weapons")
            self.model = YOLO("yolov8m.pt")
    
    def detect(self, frame: np.ndarray) -> Tuple[np.ndarray, List[Dict]]:
        """
        Run weapon detection on a frame
        
        Args:
            frame: Input image as numpy array (BGR format)
            
        Returns:
            annotated_frame: Frame with bounding boxes drawn
            detections: List of detection dictionaries with class, bbox, confidence
        """
        if self.model is None:
            return frame, []
        
        try:
            # Run inference using the model directly (following documentation example)
            results = self.model(
                frame,
                conf=CONFIDENCE_THRESHOLD,
                device=self.device,
                verbose=False
            )
            
            detections = []
            annotated_frame = frame.copy()
            
            # Process results
            for result in results:
                boxes = result.boxes
                
                for box in boxes:
                    # Get box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = float(box.conf[0].cpu().numpy())
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = result.names[class_id]
                    
                    # Store detection
                    detections.append({
                        "class": class_name,
                        "confidence": confidence,
                        "bbox": {
                            "x1": int(x1),
                            "y1": int(y1),
                            "x2": int(x2),
                            "y2": int(y2)
                        }
                    })
                    
                    # Draw bounding box
                    cv2.rectangle(
                        annotated_frame,
                        (int(x1), int(y1)),
                        (int(x2), int(y2)),
                        (0, 255, 0),
                        2
                    )
                    
                    # Draw label
                    label = f"{class_name} {confidence:.2f}"
                    label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
                    cv2.rectangle(
                        annotated_frame,
                        (int(x1), int(y1) - label_size[1] - 10),
                        (int(x1) + label_size[0], int(y1)),
                        (0, 255, 0),
                        -1
                    )
                    cv2.putText(
                        annotated_frame,
                        label,
                        (int(x1), int(y1) - 5),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        (0, 0, 0),
                        2
                    )
            
            return annotated_frame, detections
            
        except Exception as e:
            print(f"Error during detection: {e}")
            return frame, []


if __name__ == "__main__":
    # Test the detector
    detector = WeaponDetector()
    print(f"Detector initialized with device: {detector.device}")
