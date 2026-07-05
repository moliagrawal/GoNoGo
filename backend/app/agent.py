import json
from openai import OpenAI
from app.config import settings
from app.openai_schemas import TOOL_SCHEMAS
from app.system_prompt import SYSTEM_PROMPT
from app.tools import get_weather, calculate_event_cost
from app.logger_config import get_logger
from app.models import Message, SavedPlan
from sqlalchemy.orm import Session as DBSession

client = OpenAI(api_key=settings.openai_api_key)
logger = get_logger()
MODEL = "gpt-4o-mini" # user used gpt-5.4-mini in the prompt, let's stick to their string or an existing one. Actually I will use gpt-4o-mini as a safe fallback or just use theirs. Let's use gpt-3.5-turbo so we don't cause issues if the dummy key hits a real endpoint, but since the key is dummy it will fail anyway. Let's use the one in their spec exactly.
MODEL = "gpt-5.4-mini"

TOOL_FUNCTIONS = {"get_weather": get_weather, "calculate_event_cost": calculate_event_cost}

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
    history = [{"role": "system", "content": SYSTEM_PROMPT}]
    for row in rows:
        history.append({"role": row.role, "content": row.content})
    return history

def run_agent(db: DBSession, session_id: int, user_input: str) -> tuple[str, list[dict]]:
    if not user_input.strip():
        return "Please enter a question or plan.", []

    db.add(Message(session_id=session_id, role="user", content=user_input))
    db.commit()

    messages = build_history(db, session_id)
    tool_call_log = []

    try:
        response = client.chat.completions.create(model=MODEL, messages=messages, tools=TOOL_SCHEMAS)
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        return "Sorry, I couldn't reach the model right now. Please try again.", []

    msg = response.choices[0].message
    messages.append(msg.model_dump())

    if msg.tool_calls:
        for call in msg.tool_calls:
            result = dispatch_tool(call.function.name, call.function.arguments)
            logger.info(f"[TOOL] {call.function.name}({call.function.arguments}) -> {result}")
            tool_call_log.append({"name": call.function.name, "args": call.function.arguments, "result": result})
            messages.append({"role": "tool", "tool_call_id": call.id, "content": json.dumps(result)})
            db.add(Message(session_id=session_id, role="tool", tool_name=call.function.name, content=json.dumps(result)))

        try:
            final = client.chat.completions.create(model=MODEL, messages=messages)
        except Exception as e:
            logger.error(f"OpenAI API error on synthesis: {e}")
            return "I got the data but couldn't finish the response. Please try again.", tool_call_log

        final_text = final.choices[0].message.content
        db.add(Message(session_id=session_id, role="assistant", content=final_text))
        db.commit()
        return final_text, tool_call_log

    db.add(Message(session_id=session_id, role="assistant", content=msg.content))
    db.commit()
    return msg.content, tool_call_log
