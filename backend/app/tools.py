def get_weather(city: str) -> dict:
    # Stub for Tier 1 get_weather tool
    return {"city": city, "weather": "Sunny", "temperature": 75}

def calculate_event_cost(headcount: int, base_budget: float) -> dict:
    # Stub for Tier 1 calculate_event_cost tool
    total_cost = headcount * base_budget
    return {"headcount": headcount, "base_budget": base_budget, "total_cost": total_cost}
