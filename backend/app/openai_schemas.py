TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather and precipitation chance for a specific city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "The city to get the weather for, e.g., 'San Francisco, CA'"
                    }
                },
                "required": ["city"],
                "additionalProperties": False
            },
            "strict": True
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_event_cost",
            "description": "Calculate the total cost of an event given headcount, per-person base budget, and weather risk.",
            "parameters": {
                "type": "object",
                "properties": {
                    "headcount": {
                        "type": "integer",
                        "description": "Number of people attending"
                    },
                    "base_budget": {
                        "type": "number",
                        "description": "The base cost per person"
                    },
                    "weather_risk": {
                        "type": "boolean",
                        "description": "Whether rain contingency is needed based on weather."
                    }
                },
                "required": ["headcount", "base_budget", "weather_risk"],
                "additionalProperties": False
            },
            "strict": True
        }
    }
]
