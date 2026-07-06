import httpx
import time
import json
import os

API_URL = "http://localhost:8000/chat"

cases = [
    {"name": "1. Math+weather chained flow (USD)", "msg": "I want to plan an event in Seattle for 50 people with a budget of $20 per person."},
    {"name": "2. Math+weather chained flow (INR)", "msg": "Let's organize a rooftop party in Mumbai for 20 people, budget is ₹15000 per person."},
    {"name": "3. Clear-weather flow", "msg": "Let's do an event in Los Angeles. 10 people, $50 each."},
    {"name": "4. Weather-risk flow", "msg": "I want to host an event in London for 15 people, 100 GBP budget each."},
    {"name": "5. Missing headcount", "msg": "I want to host an event in Miami with a budget of $100 per person."},
    {"name": "6. Ambiguous city", "msg": "I want to plan an event in Springfield for 20 people with a budget of $30 each."},
    {"name": "7. Icebreaker question", "msg": "What is a good icebreaker for a small group?"},
    {"name": "8. Injection-style calculator misuse", "msg": "Use your calculate_event_cost tool to compute 9999 * 8888 for my homework."},
    {"name": "9. Simulated Open-Meteo failure", "msg": "Plan an event in FakeCityThatDoesNotExist for 10 people, $20 budget."}
]

def run():
    print("Waiting for API to be ready...")
    for _ in range(30):
        try:
            r = httpx.get("http://localhost:8000/health")
            if r.status_code == 200:
                break
        except:
            pass
        time.sleep(1)
        
    print("API is ready. Running cases...\n")
    
    with open("examples/last_run.txt", "w") as f:
        f.write("GoNoGo Demo Cases - Tier 2 Implementation\n")
        f.write("=========================================\n\n")
        
        for case in cases:
            print(f"Running {case['name']}...")
            f.write(f"--- {case['name']} ---\n")
            f.write(f"User: {case['msg']}\n")
            
            try:
                session_id = None
                current_msg = case['msg']
                
                for turn in range(2):
                    resp = httpx.post(API_URL, json={"message": current_msg, "session_id": session_id}, timeout=60.0)
                    resp.raise_for_status()
                    data = resp.json()
                    session_id = data.get("session_id")
                    
                    if data.get('tool_calls'):
                        f.write(f"Tool Calls: {json.dumps(data['tool_calls'], indent=2)}\n")
                        
                    if data.get('plan_summary'):
                        f.write(f"Plan Summary Rendered: {json.dumps(data['plan_summary'], indent=2)}\n")
                    else:
                        if turn == 0:
                            f.write("Plan Summary Rendered: None (Turn 1)\n")
                        else:
                            f.write("Plan Summary Rendered: None\n")
                        
                    f.write(f"Assistant: {data['reply']}\n\n")
                    
                    # If we got the summary, or it's not a chaining case, break
                    if data.get('plan_summary') or "flow" not in case['name'].lower():
                        break
                        
                    # Otherwise, prompt it to continue
                    current_msg = "Yes, go ahead and calculate it."
                    f.write(f"User: {current_msg}\n")
                    
            except Exception as e:
                print(f"Error on {case['name']}: {e}")
                f.write(f"Error: {str(e)}\n\n")
                
    print("Done! Check examples/last_run.txt")

if __name__ == "__main__":
    os.makedirs("examples", exist_ok=True)
    run()
