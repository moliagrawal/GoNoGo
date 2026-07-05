TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather and forecast for a specific city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "The city to get the weather for, e.g., 'San Francisco, CA'"
                    }
                },
                "required": ["city"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_event_cost",
            "description": "Calculate the total cost of an event given headcount and per-person base budget.",
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
                    }
                },
                "required": ["headcount", "base_budget"]
            }
        }
    }
]
