"""
Servo Controller for weapon tracking system
Calculates servo angles to point at detected weapons
"""

import sys
import os
from typing import Dict, List, Tuple, Optional

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.config import (
    CAMERA_FOV_HORIZONTAL,
    CAMERA_FOV_VERTICAL,
    SERVO_X_MIN,
    SERVO_X_MAX,
    SERVO_X_CENTER,
    SERVO_Y_MIN,
    SERVO_Y_MAX,
    SERVO_Y_CENTER,
    FRAME_WIDTH,
    FRAME_HEIGHT
)


class ServoController:
    def __init__(self):
        self.last_x_angle = SERVO_X_CENTER
        self.last_y_angle = SERVO_Y_CENTER
        print(f"Servo Controller initialized - Center: ({SERVO_X_CENTER}°, {SERVO_Y_CENTER}°)")
    
    def find_largest_weapon(self, detections: List[Dict]) -> Optional[Dict]:
        """
        Find the largest weapon (by bounding box area) from detections
        Returns the detection with largest bbox, or None if no detections
        """
        if not detections or len(detections) == 0:
            return None
        
        largest = None
        max_area = 0
        
        for detection in detections:
            bbox = detection.get("bbox", {})
            x1 = bbox.get("x1", 0)
            y1 = bbox.get("y1", 0)
            x2 = bbox.get("x2", 0)
            y2 = bbox.get("y2", 0)
            
            # Calculate area
            width = x2 - x1
            height = y2 - y1
            area = width * height
            
            if area > max_area:
                max_area = area
                largest = detection
        
        return largest
    
    def calculate_angles(self, bbox: Dict) -> Tuple[int, int]:
        """
        Calculate servo angles to point at the center of a bounding box
        
        Args:
            bbox: Dictionary with keys x1, y1, x2, y2 (pixel coordinates)
            
        Returns:
            Tuple of (x_angle, y_angle) in degrees [0-180]
        """
        # Get bbox coordinates
        x1 = bbox.get("x1", 0)
        y1 = bbox.get("y1", 0)
        x2 = bbox.get("x2", 0)
        y2 = bbox.get("y2", 0)
        
        # Calculate center of bounding box
        center_x = (x1 + x2) / 2.0
        center_y = (y1 + y2) / 2.0
        
        # Normalize to [-0.5, 0.5] range (0 = center of frame)
        norm_x = (center_x / FRAME_WIDTH) - 0.5
        norm_y = (center_y / FRAME_HEIGHT) - 0.5
        
        # Convert to angle offset based on FOV
        # Horizontal: FOV spread across frame width (inverted for correct direction)
        angle_offset_x = -norm_x * CAMERA_FOV_HORIZONTAL
        
        # Vertical: FOV spread across frame height (positive to point up when object is up)
        angle_offset_y = norm_y * CAMERA_FOV_VERTICAL
        
        # Apply offset to center position
        servo_x = SERVO_X_CENTER + angle_offset_x
        servo_y = SERVO_Y_CENTER + angle_offset_y
        
        # Clamp to servo ranges
        servo_x = max(SERVO_X_MIN, min(SERVO_X_MAX, servo_x))
        servo_y = max(SERVO_Y_MIN, min(SERVO_Y_MAX, servo_y))
        
        # Round to integers
        servo_x = int(round(servo_x))
        servo_y = int(round(servo_y))
        
        # Update last position
        self.last_x_angle = servo_x
        self.last_y_angle = servo_y
        
        return (servo_x, servo_y)
    
    def get_servo_command(self, detections: List[Dict]) -> Optional[Dict]:
        """
        Process detections and generate servo command
        
        Args:
            detections: List of weapon detections with bbox and class info
            
        Returns:
            Dictionary with servo command, or None if no weapons detected
        """
        # Find largest weapon
        target = self.find_largest_weapon(detections)
        
        if target is None:
            # No weapons detected - maintain last position (do nothing)
            return None
        
        # Calculate angles for target
        bbox = target.get("bbox", {})
        x_angle, y_angle = self.calculate_angles(bbox)
        
        # Create command
        command = {
            "type": "servo_command",
            "x_angle": x_angle,
            "y_angle": y_angle,
            "weapon_class": target.get("class", "unknown"),
            "confidence": target.get("confidence", 0.0),
            "target_position": {
                "center_x": int((bbox.get("x1", 0) + bbox.get("x2", 0)) / 2),
                "center_y": int((bbox.get("y1", 0) + bbox.get("y2", 0)) / 2),
                "width": bbox.get("x2", 0) - bbox.get("x1", 0),
                "height": bbox.get("y2", 0) - bbox.get("y1", 0)
            }
        }
        
        return command
    
    def get_current_position(self) -> Tuple[int, int]:
        """Get last known servo position"""
        return (self.last_x_angle, self.last_y_angle)


if __name__ == "__main__":
    # Test servo controller
    controller = ServoController()
    
    # Test detection
    test_detections = [
        {
            "class": "pistol",
            "confidence": 0.85,
            "bbox": {"x1": 200, "y1": 150, "x2": 280, "y2": 210}
        },
        {
            "class": "rifle",
            "confidence": 0.92,
            "bbox": {"x1": 100, "y1": 100, "x2": 250, "y2": 200}
        }
    ]
    
    command = controller.get_servo_command(test_detections)
    print(f"Command: {command}")
