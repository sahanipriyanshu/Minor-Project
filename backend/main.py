from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
import json
from datetime import datetime

from cv_engine.pose_detector import PoseDetector
from cv_engine.biomechanics import BiomechanicsEngine
from models.database import get_db, SessionStats
from sqlalchemy.orm import Session

app = FastAPI(title="AI Fitness Coach API")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pose_detector = PoseDetector(model_complexity=1) # 1 for better performance/accuracy balance

@app.get("/")
def read_root():
    return {"message": "AI Fitness Coach Backend is running"}

@app.websocket("/ws/cv")
async def cv_websocket(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    biomechanics = BiomechanicsEngine(smoothing_window=5)
    
    # Track the start of a session
    new_session = SessionStats(exercise="squat", start_time=datetime.utcnow())
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    try:
        while True:
            # Receive base64 image string from frontend
            data = await websocket.receive_text()
            
            # The frontend typically prefixes base64 with "data:image/jpeg;base64,"
            if "base64," in data:
                base64_img = data.split(",")[1]
            else:
                base64_img = data
                
            img_data = base64.b64decode(base64_img)
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                continue

            # Convert BGR to RGB
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            # Detect pose
            results = pose_detector.find_pose(img_rgb, draw=False)
            landmarks = pose_detector.extract_key_landmarks(results)

            if landmarks:
                # Process Biomechanics for Squat (Hip, Knee, Ankle)
                metrics = biomechanics.process_squat(
                    hip=landmarks["hip"],
                    knee=landmarks["knee"],
                    ankle=landmarks["ankle"],
                    shoulder=landmarks["shoulder"]
                )
                
                # Bundle the results to send back
                response_data = {
                    "status": "success",
                    "metrics": metrics,
                    "landmarks": landmarks["raw_landmarks"] # Sent back to draw on frontend canvas
                }
            else:
                response_data = {
                    "status": "no_pose_detected",
                    "metrics": None,
                    "landmarks": []
                }

            # Send back real-time metrics
            await websocket.send_text(json.dumps(response_data))
            
    except WebSocketDisconnect:
        # Save session stats when user disconnects
        print("Frontend disconnected.")
        new_session.end_time = datetime.utcnow()
        new_session.total_reps = biomechanics.rep_count
        new_session.incorrect_postures = biomechanics.incorrect_posture_count
        db.commit()
    except Exception as e:
        print(f"WebSocket error: {e}")
