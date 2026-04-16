"""
One-time bootstrap script to seed the Admin user into MongoDB.
Run once from the backend directory with the venv activated:
  python seed_admin.py
"""
import asyncio
from datetime import datetime
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ADMIN_EMAIL = "sahanipriyanshu19@gmail.com"
ADMIN_NAME  = "Priyanshu Sahani"
ADMIN_PASS  = "123456"

async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client["athletica_ai"]

    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing:
        print(f"[SKIP] Admin account already exists for {ADMIN_EMAIL}")
        client.close()
        return

    admin_doc = {
        "email": ADMIN_EMAIL,
        "name": ADMIN_NAME,
        "password": pwd_context.hash(ADMIN_PASS),
        "created_at": datetime.utcnow(),
        "streak": 0,
        "last_login_date": None,
        "total_app_time": 0,
        "lifetime_reps": 0,
        "is_admin": True
    }

    result = await db.users.insert_one(admin_doc)
    print(f"[OK] Admin account created! MongoDB ID: {result.inserted_id}")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
