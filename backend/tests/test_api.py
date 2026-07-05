from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    assert client.get("/health").status_code == 200

def test_chat_creates_session_and_replies():
    resp = client.post("/chat", json={"message": "What's a good icebreaker for 12 people?"})
    assert resp.status_code == 200
    body = resp.json()
    assert "session_id" in body
    assert body["reply"]

def test_chat_empty_message():
    resp = client.post("/chat", json={"message": ""})
    assert resp.status_code == 200
