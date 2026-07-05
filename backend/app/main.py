from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session as DBSession
from app.db import get_db, engine, Base
from app.schemas import ChatRequest, ChatResponse
from app.agent import run_agent
from app.models import Session as SessionModel
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
    if req.session_id is None:
        session = SessionModel()
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id
    else:
        session = db.query(SessionModel).get(req.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="session not found")
        session_id = req.session_id

    reply, tool_calls, plan_summary = run_agent(db, session_id, req.message)
    return ChatResponse(session_id=session_id, reply=reply, tool_calls=tool_calls, plan_summary=plan_summary)

@app.get("/health")
def health():
    return {"status": "ok"}
