"""
Simple YOLO Tracker for weapon detection
Uses YOLO's built-in tracking (ByteTrack/BoTSORT) without Kalman or classical trackers
"""

import cv2
import sys
import os
import torch
import numpy as np
from typing import Optional, Dict, Tuple, List
from huggingface_hub import hf_hub_download
from ultralytics import YOLO

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.config import MODEL_NAME


class SimpleYoloTracker:
    """
    Simple YOLO-only tracker using built-in ByteTrack/BoTSORT
    
    Features:
    - YOLO detection + tracking every frame
    - Persistent object IDs via ByteTrack
    - No Kalman filter or classical trackers
    - Timeout when object not detected for N seconds
    """
    
    def __init__(
        self,
        target_labels: List[str] = None,
        conf_threshold: float = 0.6,
        timeout_seconds: float = 5.0,
        tracker_type: str = "bytetrack.yaml"
    ):
        """
        Initialize simple YOLO tracker
        
        Args:
            target_labels: List of weapon class names to detect (default: ["Gun"])
            conf_threshold: Confidence threshold for detection
            timeout_seconds: Seconds without detection before resetting
            tracker_type: YOLO tracker config ("bytetrack.yaml" or "botsort.yaml")
        """
        self.target_labels = target_labels or ["Gun"]
        self.conf_threshold = conf_threshold
        self.timeout_seconds = timeout_seconds
        self.tracker_type = tracker_type
        
        # State variables
        self.frame_idx = 0
        self.tracking = False
        self.last_detection_time = None
        self.tracked_id = None  # Current tracked object ID
        self.last_class_name = None
        self.last_confidence = 0.0
        
        # FPS tracking for timeout calculation
        self.fps = 10.0  # Default, will be updated
        self.last_process_time = None
        self.frame_times = []
        self.fps_window = 30
        
        # Load YOLO model
        self.device = self._get_device()
        self.yolo_model = self._load_model()
        
        print(f"[SimpleYoloTracker] Initialized")
        print(f"  - Device: {self.device}")
        print(f"  - Target labels: {self.target_labels}")
        print(f"  - Confidence threshold: {conf_threshold}")
        print(f"  - Tracker: {tracker_type}")
        print(f"  - Timeout: {timeout_seconds}s")
    
    def _get_device(self) -> str:
        """Determine best available device"""
        if torch.backends.mps.is_available():
            return "mps"
        elif torch.cuda.is_available():
            return "cuda"
        else:
            return "cpu"
    
    def _load_model(self):
        """Load YOLO weapon detection model from HuggingFace with caching"""
        try:
            # First, try to load from cache only
            try:
                print(f"[SimpleYoloTracker] Checking cache for model: {MODEL_NAME}")
                model_path = hf_hub_download(
                    repo_id=MODEL_NAME,
                    filename="weights/best.pt",
                    local_files_only=True
                )
                print(f"[SimpleYoloTracker] ✓ Model found in cache: {model_path}")
            except Exception:
                # Not in cache, download it
                print(f"[SimpleYoloTracker] Model not in cache, downloading...")
                model_path = hf_hub_download(
                    repo_id=MODEL_NAME,
                    filename="weights/best.pt",
                    local_files_only=False
                )
                print(f"[SimpleYoloTracker] ✓ Model downloaded and cached: {model_path}")
            
            model = YOLO(model_path)
            print(f"[SimpleYoloTracker] ✓ Model initialized successfully")
            return model
        except Exception as e:
            print(f"[SimpleYoloTracker] Error loading model: {e}")
            print("[SimpleYoloTracker] Using generic YOLOv8 model")
            return YOLO("yolov8m.pt")
    
    def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Optional[Dict]]:
        """
        Process a frame with YOLO tracking
        
        Args:
            frame: Input frame (BGR format)
            
        Returns:
            Tuple of (annotated_frame, tracking_info)
            tracking_info is None if no weapon detected, otherwise contains:
            {
                "bbox": {"x1": int, "y1": int, "x2": int, "y2": int},
                "center": {"x": int, "y": int},
                "class": str,
                "confidence": float,
                "source": "yolo",
                "track_id": int,
                "time_since_yolo": float
            }
        """
        import time as time_module
        
        self.frame_idx += 1
        annotated_frame = frame.copy()
        
        # Update FPS calculation
        current_time = time_module.time()
        if self.last_process_time is not None:
            frame_time = current_time - self.last_process_time
            self.frame_times.append(frame_time)
            
            if len(self.frame_times) > self.fps_window:
                self.frame_times.pop(0)
            
            if len(self.frame_times) >= 10 and self.frame_idx % 10 == 0:
                avg_frame_time = sum(self.frame_times) / len(self.frame_times)
                if avg_frame_time > 0:
                    calculated_fps = 1.0 / avg_frame_time
                    if abs(calculated_fps - self.fps) > 2.0:
                        self.fps = calculated_fps
        
        self.last_process_time = current_time
        
        # =============================
        # RUN YOLO TRACKING
        # =============================
        try:
            results = self.yolo_model.track(
                frame,
                persist=True,
                tracker=self.tracker_type,
                conf=self.conf_threshold,
                verbose=False
            )[0]
        except Exception as e:
            # Fallback to predict if track fails
            print(f"[SimpleYoloTracker] Track error: {e}, falling back to predict")
            results = self.yolo_model.predict(frame, conf=self.conf_threshold, verbose=False)[0]
        
        # =============================
        # FIND BEST WEAPON DETECTION
        # =============================
        best_detection = None
        best_confidence = 0.0
        
        if results.boxes is not None and len(results.boxes) > 0:
            for i, box in enumerate(results.boxes):
                class_id = int(box.cls[0])
                class_name = results.names[class_id]
                confidence = float(box.conf[0])
                
                # Check if matches target labels
                if class_name in self.target_labels and confidence >= self.conf_threshold:
                    if confidence > best_confidence:
                        # Get track ID if available
                        track_id = None
                        if box.id is not None:
                            track_id = int(box.id[0])
                        
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        
                        best_detection = {
                            "bbox": (x1, y1, x2, y2),
                            "class_name": class_name,
                            "confidence": confidence,
                            "track_id": track_id
                        }
                        best_confidence = confidence
        
        # =============================
        # UPDATE STATE AND DRAW
        # =============================
        tracking_info = None
        
        if best_detection is not None:
            # Weapon detected
            x1, y1, x2, y2 = best_detection["bbox"]
            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2
            
            self.tracking = True
            self.last_detection_time = current_time
            self.tracked_id = best_detection["track_id"]
            self.last_class_name = best_detection["class_name"]
            self.last_confidence = best_detection["confidence"]
            
            # Draw detection
            color = (0, 255, 0)  # Green for active detection
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 3)
            cv2.circle(annotated_frame, (cx, cy), 5, color, -1)
            
            # Label with track ID if available
            if self.tracked_id is not None:
                label = f"YOLO #{self.tracked_id}: {self.last_class_name} {self.last_confidence:.2f}"
            else:
                label = f"YOLO: {self.last_class_name} {self.last_confidence:.2f}"
            
            cv2.putText(annotated_frame, label, (x1, max(y1 - 10, 20)),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            
            # Build tracking info
            tracking_info = {
                "bbox": {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2
                },
                "center": {
                    "x": cx,
                    "y": cy
                },
                "class": self.last_class_name,
                "confidence": self.last_confidence,
                "source": "yolo",
                "track_id": self.tracked_id,
                "time_since_yolo": 0.0
            }
            
        else:
            # No detection - check timeout
            if self.tracking and self.last_detection_time is not None:
                time_since_detection = current_time - self.last_detection_time
                
                if time_since_detection >= self.timeout_seconds:
                    print(f"[SimpleYoloTracker] ⏰ Timeout: {time_since_detection:.1f}s without detection")
                    self._reset_tracker()
        
        return annotated_frame, tracking_info
    
    def _reset_tracker(self):
        """Reset tracker state"""
        self.tracking = False
        self.last_detection_time = None
        self.tracked_id = None
        self.last_class_name = None
        self.last_confidence = 0.0
    
    def set_fps(self, fps: float):
        """Update FPS for timeout calculation"""
        self.fps = fps
        print(f"[SimpleYoloTracker] FPS updated to {fps}")
    
    def reset(self):
        """Public method to reset tracker"""
        self._reset_tracker()
        self.frame_idx = 0


if __name__ == "__main__":
    # Test the simple YOLO tracker
    tracker = SimpleYoloTracker()
    print("Simple YOLO tracker initialized successfully")
