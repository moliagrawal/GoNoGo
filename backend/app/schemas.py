from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    target_date: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    tool_calls: list[dict] = []
    plan_summary: Optional[dict] = None

class PlanSummary(BaseModel):
    city: str
    headcount: int
    base_budget: float
    backup_cost_delta: float
    weather_risk: bool
    final_per_person_cost: float
    currency: str
    recommendation: str
    precip_chance: int
    temp: int
