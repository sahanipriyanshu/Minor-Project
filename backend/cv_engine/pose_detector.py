import cv2
import mediapipe as mp

class PoseDetector:
    def __init__(self, static_image_mode=False, model_complexity=1, min_detection_confidence=0.5, min_tracking_confidence=0.5):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=static_image_mode,
            model_complexity=model_complexity,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        self.mp_draw = mp.solutions.drawing_utils

    def find_pose(self, img, draw=True):
        """
        Process the image and find pose landmarks.
        img format must be RGB.
        """
        results = self.pose.process(img)
        
        # Optionally draw the skeleton (though usually we will just send landmarks to frontend to draw)
        if draw and results.pose_landmarks:
            self.mp_draw.draw_landmarks(img, results.pose_landmarks, self.mp_pose.POSE_CONNECTIONS)
            
        return results

    def extract_key_landmarks(self, results):
        """
        Extracts relevant landmarks needed for the biomechanics engine (Squat).
        Extracts left and right sides, but defaults to using the side that is more visible,
        or just the Left side for simplicity.
        """
        if not results.pose_landmarks:
            return None
            
        landmarks = results.pose_landmarks.landmark
        
        # Mapping index to mediapipe pose enum
        # 23 = left hip, 25 = left knee, 27 = left ankle, 11 = left shoulder
        # For simplicity, let's track the left side. 
        # A bonus implementation could use visibility scores to pick the better side.
        
        left_hip = [landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].x, 
                    landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].y]
                    
        left_knee = [landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].x, 
                     landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                     
        left_ankle = [landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].x, 
                      landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                      
        left_shoulder = [landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, 
                         landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                         
        left_elbow = [landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].x, 
                      landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                      
        left_wrist = [landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].x, 
                      landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                         
        # Return normalized coordinates natively
        return {
            "hip": left_hip,
            "knee": left_knee,
            "ankle": left_ankle,
            "shoulder": left_shoulder,
            "elbow": left_elbow,
            "wrist": left_wrist,
            "raw_landmarks": [{"x": lm.x, "y": lm.y, "z": lm.z, "visibility": lm.visibility, "presence": getattr(lm, 'presence', 0.0)} for lm in landmarks]
        }
