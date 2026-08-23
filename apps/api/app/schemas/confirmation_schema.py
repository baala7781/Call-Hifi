"""JSON Schema for CALL-E booking confirmation calls."""

CONFIRMATION_RESULT_SCHEMA = {
    "type": "object",
    "required": [
        "confirmed"
    ],
    "properties": {
        "confirmed": {
            "type": "string",
            "enum": [
                "yes",
                "no",
                "unknown"
            ],
            "description": "Whether the reservation is officially confirmed with the hotel."
        },
        "confirmation_number": {
            "type": ["string", "null"],
            "description": "The hotel's official booking reference or reservation number."
        },
        "final_amount": {
            "type": ["number", "null"],
            "description": "The final verified stay price in agreed currency."
        },
        "currency": {
            "type": ["string", "null"],
            "description": "Currency for the final amount (e.g. INR, USD, EUR)."
        },
        "room_type": {
            "type": ["string", "null"],
            "description": "Confirmed room type."
        },
        "check_in": {
            "type": ["string", "null"],
            "description": "Confirmed check-in date."
        },
        "check_out": {
            "type": ["string", "null"],
            "description": "Confirmed check-out date."
        },
        "benefits_confirmed": {
            "type": "array",
            "items": {
                "type": "string"
            },
            "description": "List of confirmed perks (e.g., breakfast included, free cancellation, airport pickup)."
        },
        "notes": {
            "type": ["string", "null"],
            "description": "Important notes or instructions from the front desk."
        }
    }
}
