import math
import numpy as np
from collections import deque

class BiomechanicsEngine:
    def __init__(self, smoothing_window=5):
        self.smoothing_window = smoothing_window
        self.angle_history = deque(maxlen=smoothing_window)
        self.state = "UP"  # Initial state
        self.rep_count = 0
        
        # Form tracking
        self.incorrect_posture_count = 0
        
    def calculate_angle(self, a, b, c):
        """
        Calculate angle at joint 'b' given coordinates a, b, c.
        Uses arccos of dot product formula.
        a, b, c are tuples or lists of (x, y) coordinates.
        """
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        ba = a - b
        bc = c - b
        
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
        # Handle floating point inaccuracies
        cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
        angle = np.arccos(cosine_angle)
        
        # Convert to degrees
        return np.degrees(angle)

    def smooth_angle(self, angle):
        """Applies a moving average to stabilize the angle."""
        self.angle_history.append(angle)
        return sum(self.angle_history) / len(self.angle_history)

    def process_exercise(self, exercise_type, landmarks_dict):
        """
        Process logic based on exercise type.
        landmarks_dict expects: hip, knee, ankle, shoulder, elbow, wrist
        """
        feedback = []
        smoothed_angle = 180
        
        if exercise_type == 'squat':
            raw_angle = self.calculate_angle(landmarks_dict['hip'], landmarks_dict['knee'], landmarks_dict['ankle'])
            smoothed_angle = self.smooth_angle(raw_angle)
            
            # Form Validation: Back straightness
            hip_x, hip_y = landmarks_dict['hip']
            shoulder_x, shoulder_y = landmarks_dict['shoulder']
            if abs(shoulder_x - hip_x) > 0.3:
                feedback.append("Keep Back Straight")

            # State Machine Transitions
            if smoothed_angle > 160:
                if self.state == "DOWN":
                    self.state = "UP"
                    self.rep_count += 1
                    feedback.append("Good Rep!")
                else:
                    self.state = "UP"
            elif smoothed_angle < 90:
                if self.state == "UP":
                    self.state = "DOWN"
                    feedback.append("Hold... Now Go Up")
            elif 90 <= smoothed_angle <= 130 and self.state == "UP":
                 feedback.append("Go Lower")
                 
        elif exercise_type == 'pushup':
            raw_angle = self.calculate_angle(landmarks_dict['shoulder'], landmarks_dict['elbow'], landmarks_dict['wrist'])
            smoothed_angle = self.smooth_angle(raw_angle)
            
            # Form Validation: Hip/Shoulder alignment can be added later
            # State Machine Transitions
            if smoothed_angle > 160:
                if self.state == "DOWN":
                    self.state = "UP"
                    self.rep_count += 1
                    feedback.append("Good Pushup!")
                else:
                    self.state = "UP"
            elif smoothed_angle < 90:
                if self.state == "UP":
                    self.state = "DOWN"
                    feedback.append("Push Upwards")
                    
        elif exercise_type == 'bicep_curl':
            raw_angle = self.calculate_angle(landmarks_dict['shoulder'], landmarks_dict['elbow'], landmarks_dict['wrist'])
            smoothed_angle = self.smooth_angle(raw_angle)
            
            # State Machine
            if smoothed_angle > 150: # Extended
                if self.state == "UP":
                    self.state = "DOWN"
                    self.rep_count += 1
                    feedback.append("Good Curl!")
                else:
                    self.state = "DOWN"
            elif smoothed_angle < 45: # Flexed
                if self.state == "DOWN":
                    self.state = "UP"
                    feedback.append("Lower slowly")

        # Record incorrect posture stats
        if any(f in ["Keep Back Straight", "Knees collapsing inward"] for f in feedback):
            self.incorrect_posture_count += 1

        return {
            "angle": round(smoothed_angle, 1),
            "state": self.state,
            "reps": self.rep_count,
            "feedback": feedback[-1] if feedback else ""
        }
