"""
Hybrid YOLO + Classical Tracker for weapon detection
Combines YOLO detections with CSRT/KCF tracker for smooth, persistent tracking
"""

import cv2
import sys
import os
import torch
import numpy as np
from typing import Optional, Dict, Tuple
from huggingface_hub import hf_hub_download
from ultralytics import YOLO

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.config import MODEL_NAME

# Add tracking directory to path
tracking_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tracking")
sys.path.append(tracking_dir)
from clasicov2 import create_tracker


class HybridWeaponTracker:
    """
    Hybrid tracker combining YOLO detection with classical tracking
    
    Features:
    - YOLO detection every N frames
    - Classical tracker (CSRT/KCF) between YOLO detections
    - 5-second timeout before disabling tracker when YOLO loses sight
    - Dual confidence thresholds (high for initial, lower for redetection)
    """
    
    def __init__(
        self,
        target_labels=None,
        conf_threshold_initial=0.8,
        conf_threshold_redetect=0.6,
        yolo_refresh_every=10,
        timeout_seconds=5.0,
        fps=30.0
    ):
        """
        Initialize hybrid tracker
        
        Args:
            target_labels: List of weapon class names to detect (default: ["Gun"])
            conf_threshold_initial: Confidence threshold for initial detection (0.8)
            conf_threshold_redetect: Confidence threshold for redetection (0.6)
            yolo_refresh_every: Run YOLO every N frames (default: 10)
            timeout_seconds: Seconds without YOLO detection before disabling (default: 5.0)
            fps: Frames per second for timeout calculation (default: 30.0)
        """
        self.target_labels = target_labels or ["Gun"]
        self.conf_threshold_initial = conf_threshold_initial
        self.conf_threshold_redetect = conf_threshold_redetect
        self.yolo_refresh_every = yolo_refresh_every
        self.timeout_seconds = timeout_seconds
        self.fps = fps
        
        # State variables
        self.frame_idx = 0
        self.tracker = None
        self.tracking = False
        self.last_yolo_detection_time = None
        self.last_yolo_box = None
        self.last_class_name = None
        self.last_confidence = 0.0
        
        # FPS tracking for accurate timeout
        self.last_process_time = None
        self.frame_times = []
        self.fps_window = 30  # Calculate FPS over last 30 frames
        
        # Load YOLO model
        self.device = self._get_device()
        self.yolo_model = self._load_model()
        
        print(f"[HybridTracker] Initialized")
        print(f"  - Device: {self.device}")
        print(f"  - Target labels: {self.target_labels}")
        print(f"  - Thresholds: initial={conf_threshold_initial}, redetect={conf_threshold_redetect}")
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
                print(f"[HybridTracker] Checking cache for model: {MODEL_NAME}")
                model_path = hf_hub_download(
                    repo_id=MODEL_NAME,
                    filename="weights/best.pt",
                    local_files_only=True  # Only use cache, don't download
                )
                print(f"[HybridTracker] ✓ Model found in cache: {model_path}")
            except Exception:
                # Not in cache, download it
                print(f"[HybridTracker] Model not in cache, downloading...")
                model_path = hf_hub_download(
                    repo_id=MODEL_NAME,
                    filename="weights/best.pt",
                    local_files_only=False
                )
                print(f"[HybridTracker] ✓ Model downloaded and cached: {model_path}")
            
            model = YOLO(model_path)
            print(f"[HybridTracker] ✓ Model initialized successfully")
            return model
        except Exception as e:
            print(f"[HybridTracker] Error loading model: {e}")
            print("[HybridTracker] Using generic YOLOv8 model")
            return YOLO("yolov8m.pt")
    
    def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Optional[Dict]]:
        """
        Process a frame with hybrid tracking
        
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
                "source": "yolo" or "tracker",
                "time_since_yolo": float (seconds)
            }
        """
        self.frame_idx += 1
        annotated_frame = frame.copy()
        
        # Update FPS calculation based on actual frame timing
        import time as time_module
        current_time = time_module.time()
        if self.last_process_time is not None:
            frame_time = current_time - self.last_process_time
            self.frame_times.append(frame_time)
            
            # Keep only last N frame times
            if len(self.frame_times) > self.fps_window:
                self.frame_times.pop(0)
            
            # Update FPS every 10 frames
            if len(self.frame_times) >= 10 and self.frame_idx % 10 == 0:
                avg_frame_time = sum(self.frame_times) / len(self.frame_times)
                calculated_fps = 1.0 / avg_frame_time if avg_frame_time > 0 else self.fps
                # Smooth update - only change if significantly different
                if abs(calculated_fps - self.fps) > 2.0:
                    self.fps = calculated_fps
                    print(f"[HybridTracker] FPS adjusted to {self.fps:.1f}")
        
        self.last_process_time = current_time
        
        # =============================
        # 1) PERIODIC YOLO DETECTION
        # =============================
        yolo_detected_this_frame = False
        if self.frame_idx % self.yolo_refresh_every == 0:
            yolo_detected_this_frame = self._run_yolo_detection(frame)
        
        # =============================
        # 2) CHECK TIMEOUT
        # =============================
        if self.tracking and self.last_yolo_detection_time is not None:
            current_time = self.frame_idx / self.fps
            time_since_detection = current_time - self.last_yolo_detection_time
            
            if time_since_detection >= self.timeout_seconds:
                print(f"[HybridTracker] ⏰ Timeout: {time_since_detection:.1f}s without YOLO detection")
                self._reset_tracker()
        
        # =============================
        # 3) CLASSICAL TRACKING
        # =============================
        tracking_info = None
        
        if self.tracking and self.tracker is not None:
            ok, bbox = self.tracker.update(frame)
            
            if ok:
                x, y, w, h = [int(v) for v in bbox]
                cx = x + w // 2
                cy = y + h // 2
                
                # Calculate time since last YOLO detection
                if self.last_yolo_detection_time is not None:
                    current_time = self.frame_idx / self.fps
                    time_since_detection = current_time - self.last_yolo_detection_time
                else:
                    time_since_detection = 0.0
                
                # Choose color and label based on source
                if yolo_detected_this_frame:
                    # YOLO just detected - show in blue (YOLO priority)
                    color = (255, 0, 0)  # Blue
                    label = f"YOLO: {self.last_class_name} {self.last_confidence:.2f}"
                    thickness = 3
                elif time_since_detection > 0.5:
                    # Tracker in grace period (no recent YOLO) - red with countdown
                    color = (0, 0, 255)  # Red
                    time_remaining = self.timeout_seconds - time_since_detection
                    label = f"Tracking [{time_remaining:.1f}s]"
                    thickness = 2
                else:
                    # Tracker with recent YOLO backup - green
                    color = (0, 255, 0)  # Green
                    label = f"Tracking: {self.last_class_name}"
                    thickness = 2
                
                # Draw tracker bbox
                cv2.rectangle(annotated_frame, (x, y), (x + w, y + h), color, thickness)
                cv2.circle(annotated_frame, (cx, cy), 4, color, -1)
                
                cv2.putText(annotated_frame, label, (x, max(y - 10, 0)),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                
                # Build tracking info
                tracking_info = {
                    "bbox": {
                        "x1": x,
                        "y1": y,
                        "x2": x + w,
                        "y2": y + h
                    },
                    "center": {
                        "x": cx,
                        "y": cy
                    },
                    "class": self.last_class_name or "weapon",
                    "confidence": self.last_confidence,
                    "source": "tracker",
                    "time_since_yolo": time_since_detection
                }
            else:
                # Tracker lost object
                print("[HybridTracker] ❌ Tracker lost object")
                self._reset_tracker()
        
        return annotated_frame, tracking_info
    
    def _run_yolo_detection(self, frame: np.ndarray) -> bool:
        """
        Run YOLO detection on frame and update tracker if needed
        Returns True if weapon was detected, False otherwise
        """
        results = self.yolo_model.predict(frame, verbose=False)[0]
        
        # Determine threshold based on current state
        current_threshold = (
            self.conf_threshold_initial if not self.tracking 
            else self.conf_threshold_redetect
        )
        
        best_box = None
        best_class_name = None
        best_confidence = 0.0
        
        # Find best matching detection
        for box in results.boxes:
            class_id = int(box.cls[0])
            class_name = results.names[class_id]
            confidence = float(box.conf[0])
            
            # Check if matches target labels and threshold
            if class_name in self.target_labels and confidence >= current_threshold:
                if best_box is None or confidence > best_confidence:
                    best_box = box
                    best_class_name = class_name
                    best_confidence = confidence
        
        if best_box is not None:
            # YOLO detected weapon
            x1, y1, x2, y2 = map(int, best_box.xyxy[0])
            self.last_yolo_box = (x1, y1, x2, y2)
            
            # Update timestamp
            self.last_yolo_detection_time = self.frame_idx / self.fps
            
            # SIEMPRE reiniciar tracker con detección de YOLO (prioridad YOLO)
            w = x2 - x1
            h = y2 - y1
            bbox = (x1, y1, w, h)
            
            self.tracker = create_tracker()
            self.tracker.init(frame, bbox)
            self.tracking = True
            self.last_class_name = best_class_name
            self.last_confidence = best_confidence
            
            print(f"[HybridTracker] 🎯 YOLO Priority: {best_class_name} ({best_confidence:.2f}) - Tracker updated")
            return True
        else:
            # YOLO didn't detect weapon, but don't disable tracker immediately
            self.last_yolo_box = None
            return False
    
    def _reset_tracker(self):
        """Reset tracker state"""
        self.tracking = False
        self.tracker = None
        self.last_yolo_detection_time = None
        self.last_yolo_box = None
        self.last_class_name = None
        self.last_confidence = 0.0
    
    def set_fps(self, fps: float):
        """Update FPS for accurate timeout calculation"""
        self.fps = fps
        print(f"[HybridTracker] FPS updated to {fps}")
    
    def reset(self):
        """Public method to reset tracker"""
        self._reset_tracker()
        self.frame_idx = 0


if __name__ == "__main__":
    # Test the hybrid tracker
    tracker = HybridWeaponTracker()
    print("Hybrid tracker initialized successfully")
