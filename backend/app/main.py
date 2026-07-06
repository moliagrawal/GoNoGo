from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session as DBSession
from app.db import get_db, engine, Base
from app.schemas import ChatRequest, ChatResponse
from app.agent import run_agent
from app.models import Session as SessionModel, Message as MessageModel
from app.config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GoNoGo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/session")
def create_session(db: DBSession = Depends(get_db)):
    session = SessionModel()
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": session.id}

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, db: DBSession = Depends(get_db)):
    if not req.session_id:
        session = SessionModel()
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id
    else:
        session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
        if not session:
            session = SessionModel()
            db.add(session)
            db.commit()
            db.refresh(session)
        session_id = session.id

    reply, tool_calls, plan_summary = run_agent(db, session_id, req.message, req.target_date)
    return ChatResponse(session_id=session_id, reply=reply, tool_calls=tool_calls, plan_summary=plan_summary)

@app.get("/sessions")
def get_sessions(db: DBSession = Depends(get_db)):
    sessions = db.query(SessionModel).order_by(SessionModel.created_at.desc()).limit(20).all()
    results = []
    for s in sessions:
        first_msg = db.query(MessageModel).filter(MessageModel.session_id == s.id, MessageModel.role == 'user').order_by(MessageModel.created_at.asc()).first()
        title = "New Plan"
        if first_msg:
            title = first_msg.content[:50] + "..." if len(first_msg.content) > 50 else first_msg.content
        results.append({"id": s.id, "title": title, "created_at": s.created_at})
    return results

@app.get("/session/{session_id}/messages")
def get_session_messages(session_id: str, db: DBSession = Depends(get_db)):
    messages = db.query(MessageModel).filter(MessageModel.session_id == session_id).order_by(MessageModel.created_at.asc()).all()
    # For UI we only need to reconstruct what happened
    history = []
    # To reconstruct, we group them roughly. But since we need to send them as a list of DisplayMessage:
    # Actually, the UI just wants a list of messages. Let's return raw for now and we can map them in the frontend.
    return messages



@app.get("/health")
def health():
    return {"status": "ok"}
