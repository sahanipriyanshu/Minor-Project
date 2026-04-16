from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os

from models.database import get_db

# Constants
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 Week

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()

# Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register")
async def register_user(user: UserCreate, db=Depends(get_db)):
    # Check if exists
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Admin Override - Master account
    is_admin = True if user.email == "sahanipriyanshu19@gmail.com" else False

    # Gamification structure
    user_doc = {
        "email": user.email,
        "name": user.name,
        "password": get_password_hash(user.password),
        "created_at": datetime.utcnow(),
        "streak": 0,
        "last_login_date": None,
        "total_app_time": 0,    # In seconds
        "lifetime_reps": 0,     # Total across all exercises
        "is_admin": is_admin
    }
    
    result = await db.users.insert_one(user_doc)
    return {"message": "User created successfully", "user_id": str(result.inserted_id)}


@router.post("/login")
async def login_user(user: UserLogin, db=Depends(get_db)):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    # Gamification: Update Streak
    now = datetime.utcnow()
    last_login = db_user.get("last_login_date")
    streak = db_user.get("streak", 0)
    
    if last_login:
        delta = now - last_login
        if delta.days == 1:
            streak += 1 # Continued streak!
        elif delta.days > 1:
            streak = 1  # Reset streak if missed a day
        # If delta.days == 0, they already logged in today, keep streak same
    else:
        streak = 1 # First time login
        
    await db.users.update_one(
        {"_id": db_user["_id"]}, 
        {"$set": {"last_login_date": now, "streak": streak}}
    )
    
    access_token = create_access_token(data={"sub": str(db_user["_id"])}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user_id": str(db_user["_id"]),
        "name": db_user["name"],
        "streak": streak,
        "is_admin": db_user.get("is_admin", False)
    }

@router.get("/leaderboard")
async def get_leaderboard(db=Depends(get_db)):
    # Fetch top 10 users ranked by reps and then app time
    cursor = db.users.find({}, {"name": 1, "lifetime_reps": 1, "total_app_time": 1, "streak": 1, "_id": 0})
    cursor = cursor.sort([("lifetime_reps", -1), ("total_app_time", -1)]).limit(10)
    users = await cursor.to_list(length=10)
    return {"leaderboard": users}
