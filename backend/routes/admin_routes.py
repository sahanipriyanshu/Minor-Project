from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from models.database import get_db

router = APIRouter()

@router.get("/stats")
async def get_macro_stats(db=Depends(get_db)):
    # Calculate total users
    total_users = await db.users.count_documents({})
    
    # Aggregate total lifetime_reps and total_app_time globally
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_global_reps": {"$sum": "$lifetime_reps"},
                "total_global_time": {"$sum": "$total_app_time"}
            }
        }
    ]
    cursor = db.users.aggregate(pipeline)
    aggs = await cursor.to_list(length=1)
    
    stats = aggs[0] if aggs else {"total_global_reps": 0, "total_global_time": 0}
    
    return {
        "athlete_count": total_users,
        "global_reps": stats.get("total_global_reps", 0),
        "global_time_seconds": stats.get("total_global_time", 0)
    }

@router.get("/users")
async def get_all_users(db=Depends(get_db)):
    # Returns ALL users securely (without passwords)
    cursor = db.users.find({}, {"password": 0})
    users = await cursor.to_list(length=1000)
    
    # Convert ObjectIds to strings
    for user in users:
        user["_id"] = str(user["_id"])
        
    return {"athletes": users}


@router.delete("/users/{uid}")
async def delete_user(uid: str, db=Depends(get_db)):
    try:
        target_id = ObjectId(uid)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID block.")
        
    # Prevent deleting the master admin accidentally
    target_user = await db.users.find_one({"_id": target_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="Athlete not found.")
        
    if target_user.get("email") == "sahanipriyanshu19@gmail.com":
        raise HTTPException(status_code=403, detail="Cannot overthrow the master administrator.")
        
    # Delete their profile
    await db.users.delete_one({"_id": target_id})
    # Optional: Delete their standalone session logs
    await db.sessions.delete_many({"user_id": uid})
    
    return {"message": "Account eradicated successfully."}
