from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os

DATABASE_URL = "sqlite:///./fitness_app.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class SessionStats(Base):
    __tablename__ = "session_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, default="guest") # Extendable later
    exercise = Column(String) # e.g., 'squat'
    total_reps = Column(Integer, default=0)
    incorrect_postures = Column(Integer, default=0)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
