import json
from openai import OpenAI
from app.config import settings
from app.openai_schemas import TOOL_SCHEMAS
from app.system_prompt import SYSTEM_PROMPT
from app.tools import get_weather, calculate_event_cost
from app.logger_config import get_logger
from app.models import Message, SavedPlan
from app.schemas import PlanSummary
from sqlalchemy.orm import Session as DBSession

client = OpenAI(api_key=settings.openai_api_key)
logger = get_logger()
MODEL = "gpt-4o-mini"

TOOL_FUNCTIONS = {"get_weather": get_weather, "calculate_event_cost": calculate_event_cost}

PLAN_SUMMARY_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "city": {"type": "string"},
        "headcount": {"type": "integer"},
        "base_budget": {"type": "number"},
        "backup_cost_delta": {"type": "number"},
        "weather_risk": {"type": "boolean"},
        "final_per_person_cost": {"type": "number"},
        "currency": {"type": "string"},
        "recommendation": {"type": "string"}
    },
    "required": ["city", "headcount", "base_budget", "backup_cost_delta", "weather_risk", "final_per_person_cost", "currency", "recommendation"],
    "additionalProperties": False
}

def extract_plan_summary(final_reply: str, tool_results: list[dict]) -> dict | None:
    """
    Runs only if a cost calculation happened this turn. Extracts structured
    data for the UI card. Does not replace the natural-language reply.
    """
    if not any(r["name"] == "calculate_event_cost" for r in tool_results):
        return None
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{
                "role": "user",
                "content": f"Extract plan details as JSON from this text and tool data:\n\n{final_reply}\n\nTool data: {tool_results}"
            }],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "plan_summary",
                    "strict": True,
                    "schema": PLAN_SUMMARY_JSON_SCHEMA
                }
            }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        logger.warning(f"Plan summary extraction failed (non-fatal): {e}")
        return None

def dispatch_tool(name: str, raw_args: str) -> dict:
    try:
        args = json.loads(raw_args)
    except json.JSONDecodeError:
        return {"error": "malformed tool arguments"}
    fn = TOOL_FUNCTIONS.get(name)
    if not fn:
        return {"error": f"unknown tool {name}"}
    try:
        return fn(**args)
    except TypeError as e:
        return {"error": f"invalid arguments: {e}"}

def build_history(db: DBSession, session_id: int) -> list[dict]:
    rows = db.query(Message).filter_by(session_id=session_id).order_by(Message.id).all()
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for h in rows:
        if h.role == "tool":
            messages.append({"role": "tool", "content": h.content, "tool_call_id": h.tool_name})
        elif h.role == "assistant" and h.tool_name == "tool_calls":
            messages.append({"role": "assistant", "content": None, "tool_calls": json.loads(h.content)})
        else:
            messages.append({"role": h.role, "content": h.content})
    return messages

def run_agent(db: DBSession, session_id: int, user_input: str) -> tuple[str, list[dict], dict | None]:
    if not user_input.strip():
        return "Please enter a question or plan.", [], None

    db.add(Message(session_id=session_id, role="user", content=user_input))
    db.commit()

    messages = build_history(db, session_id)
    tool_call_log = []

    try:
        response = client.chat.completions.create(model=MODEL, messages=messages, tools=TOOL_SCHEMAS)
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        return "Sorry, I couldn't reach the model right now. Please try again.", [], None

    msg = response.choices[0].message
    messages.append(msg.model_dump())

    plan_summary = None

    while msg.tool_calls:
        # Save the assistant's tool calls to the database so they can be replayed on next turn
        db.add(Message(session_id=session_id, role="assistant", tool_name="tool_calls", content=json.dumps([t.model_dump() for t in msg.tool_calls])))
        
        for call in msg.tool_calls:
            result = dispatch_tool(call.function.name, call.function.arguments)
            logger.info(f"[TOOL] {call.function.name}({call.function.arguments}) -> {result}")
            tool_call_log.append({"name": call.function.name, "args": call.function.arguments, "result": result})
            messages.append({"role": "tool", "tool_call_id": call.id, "content": json.dumps(result)})
            db.add(Message(session_id=session_id, role="tool", tool_name=call.id, content=json.dumps(result)))

        try:
            response = client.chat.completions.create(model=MODEL, messages=messages, tools=TOOL_SCHEMAS)
        except Exception as e:
            logger.error(f"OpenAI API error on synthesis: {e}")
            return "I got the data but couldn't finish the response. Please try again.", tool_call_log, None
            
        msg = response.choices[0].message
        if msg.content is not None or msg.tool_calls:
            messages.append(msg.model_dump())

    final_text = msg.content or "Done."
    db.add(Message(session_id=session_id, role="assistant", content=final_text))
    db.commit()
    
    plan_summary = extract_plan_summary(final_text, tool_call_log)
    
    return final_text, tool_call_log, plan_summary
