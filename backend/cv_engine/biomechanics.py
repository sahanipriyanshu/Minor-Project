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

    def process_squat(self, hip, knee, ankle, shoulder):
        """
        Process the squat logic for a single frame.
        Includes state machine, rep counting, and basic form checking.
        """
        raw_angle = self.calculate_angle(hip, knee, ankle)
        smoothed_angle = self.smooth_angle(raw_angle)
        
        feedback = []
        
        # Form Validation: Back straightness (simplified by hip-shoulder vertical alignment)
        # In a real 3D model we'd measure torso lean heavily. For 2D MVP, just check extreme lean.
        hip_x, hip_y = hip
        shoulder_x, shoulder_y = shoulder
        if abs(shoulder_x - hip_x) > 0.3: # Threshold depends on normalized coords [0,1]
            feedback.append("Keep Back Straight")

        # Form Validation: Knee collapse can be somewhat inferred if x coords of knee and ankle differ wildly
        # but 3D landmarks work better. We will stick to the back for now.

        # State Machine Transitions
        # angle > 160 -> Standing (UP)
        # angle < 90 -> Squat (DOWN)
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
                
        # Prompting user to go lower if they are lingering in middle
        elif 90 <= smoothed_angle <= 130 and self.state == "UP":
             feedback.append("Go Lower")
             
        # Record incorrect posture stats
        if "Keep Back Straight" in feedback or "Knees collapsing inward" in feedback:
            self.incorrect_posture_count += 1

        return {
            "angle": round(smoothed_angle, 1),
            "state": self.state,
            "reps": self.rep_count,
            "feedback": feedback[-1] if feedback else "" # Returning the most urgent feedback
        }
