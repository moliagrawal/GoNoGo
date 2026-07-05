from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    role = Column(String, nullable=False)          # "user" | "assistant" | "tool"
    content = Column(Text, nullable=False)
    tool_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    session = relationship("Session", back_populates="messages")

class SavedPlan(Base):
    __tablename__ = "saved_plans"
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    city = Column(String)
    headcount = Column(Integer)
    base_budget = Column(Float)
    backup_cost_delta = Column(Float)
    weather_risk = Column(Boolean)
    final_per_person_cost = Column(Float)
    recommendation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
