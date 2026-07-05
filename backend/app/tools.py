import httpx

def get_weather(city: str) -> dict:
    """
    Get the current weather for a given city using Open-Meteo.
    """
    try:
        # Step 1: Geocoding
        # Open-Meteo Geocoding works best with simple city names, so we strip state/country if present
        if "," in city:
            city = city.split(",")[0].strip()
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1"
        geo_resp = httpx.get(geo_url, timeout=5.0)
        geo_resp.raise_for_status()
        geo_data = geo_resp.json()
        
        if not geo_data.get("results"):
            return {"error": f"City '{city}' not found. Please provide a more specific location."}
            
        location = geo_data["results"][0]
        lat, lon = location["latitude"], location["longitude"]
        
        # Step 2: Weather forecast (get precipitation probability)
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=precipitation_probability_max&timezone=auto"
        weather_resp = httpx.get(weather_url, timeout=5.0)
        weather_resp.raise_for_status()
        weather_data = weather_resp.json()
        
        precip_prob = weather_data["daily"]["precipitation_probability_max"][0]
        
        return {
            "city": location["name"],
            "country": location.get("country", ""),
            "precipitation_chance": precip_prob
        }
    except Exception as e:
        return {"error": f"Failed to fetch weather: {str(e)}"}

def calculate_event_cost(base_budget: float, headcount: int, backup_cost_delta: float = 0, weather_risk: bool = False, currency: str = "USD") -> dict:
    """
    Calculate the total cost of an event given headcount and per-person base budget.
    Adds a rain contingency backup cost if weather_risk is true.
    """
    try:
        backup_cost_delta = 0.0
        if weather_risk:
            # e.g. renting a tent adds 30% to base budget
            backup_cost_delta = base_budget * 0.3
            
        final_per_person_cost = base_budget + backup_cost_delta
        total_cost = headcount * final_per_person_cost
        
        return {
            "headcount": headcount,
            "base_budget": base_budget,
            "backup_cost_delta": backup_cost_delta,
            "weather_risk": weather_risk,
            "final_per_person_cost": final_per_person_cost,
            "currency": currency,
            "total_cost": total_cost
        }
    except Exception as e:
        return {"error": f"Failed to calculate cost: {str(e)}"}
