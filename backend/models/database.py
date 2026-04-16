import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
print(f"Connecting to MongoDB...")

client = AsyncIOMotorClient(MONGO_URI)
database = client.athletica_ai  # Our database name

def get_db():
    """Returns the async Motor database instance."""
    return database
