from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import base64
import json
from datetime import datetime

from cv_engine.pose_detector import PoseDetector
from cv_engine.biomechanics import BiomechanicsEngine
from models.database import get_db
from routes.auth_routes import router as auth_router
from routes.admin_routes import router as admin_router
from bson import ObjectId

app = FastAPI(title="Athletica AI API")

# Register Routers
app.include_router(auth_router, prefix="/api/auth")
app.include_router(admin_router, prefix="/api/admin")


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
    return {"message": "Athletica AI Backend is running"}

@app.websocket("/ws/cv")
async def cv_websocket(websocket: WebSocket, exercise: str = "squat", uid: str = "guest", db=Depends(get_db)):
    await websocket.accept()
    biomechanics = BiomechanicsEngine(smoothing_window=5)
    
    # Track the start of a session
    start_time = datetime.utcnow()

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
                # Process Biomechanics dynamically based on chosen exercise
                metrics = biomechanics.process_exercise(exercise, landmarks)
                
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
        # Save session stats async when user disconnects
        print("Frontend disconnected.")
        end_time = datetime.utcnow()
        duration_seconds = int((end_time - start_time).total_seconds())

        session_data = {
            "user_id": uid,
            "exercise": exercise,
            "start_time": start_time,
            "end_time": end_time,
            "duration": duration_seconds,
            "total_reps": biomechanics.rep_count,
            "incorrect_postures": biomechanics.incorrect_posture_count
        }
        
        # Insert into MongoDB collection 'sessions'
        await db.sessions.insert_one(session_data)
        
        # If real user, update lifetime metrics via $inc globally
        if uid != "guest":
            try:
                await db.users.update_one(
                    {"_id": ObjectId(uid)},
                    {"$inc": {"total_app_time": duration_seconds, "lifetime_reps": biomechanics.rep_count}}
                )
                print(f"Updated lifetime stats for {uid}")
            except Exception as e:
                print(f"Failed to update user stats: {e}")
                
        print("Session saved to MongoDB Atlas.")
    except Exception as e:
        print(f"WebSocket error: {e}")
