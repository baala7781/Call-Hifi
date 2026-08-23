"""JSON Schema for CALL-E hotel discovery and negotiation calls."""

HOTEL_RESULT_SCHEMA = {
    "type": "object",
    "required": [
        "availability",
        "currency"
    ],
    "properties": {
        "availability": {
            "type": "string",
            "enum": [
                "available",
                "unavailable",
                "unknown"
            ],
            "description": "Whether the hotel has rooms available for the exact dates and guest count."
        },
        "room_type": {
            "type": ["string", "null"],
            "description": "Specific room category offered by the hotel."
        },
        "max_guests": {
            "type": ["integer", "null"],
            "description": "Maximum guest occupancy allowed in the offered room."
        },
        "price_per_night": {
            "type": ["number", "null"],
            "description": "Quoted room price per night in the quoted currency."
        },
        "total_price": {
            "type": ["number", "null"],
            "description": "Initial total stay price quoted before negotiation."
        },
        "currency": {
            "type": "string",
            "description": "Currency code (e.g., INR, USD, EUR, IDR)."
        },
        "taxes_included": {
            "type": ["boolean", "null"],
            "description": "Whether the quoted price includes all local taxes and service charges."
        },
        "mandatory_fees": {
            "type": ["number", "null"],
            "description": "Any mandatory resort or facility fees."
        },
        "breakfast_included": {
            "type": ["boolean", "null"],
            "description": "Whether daily breakfast is included for all guests."
        },
        "breakfast_price": {
            "type": ["number", "null"],
            "description": "Additional cost for breakfast if not included."
        },
        "airport_transfer_available": {
            "type": ["boolean", "null"],
            "description": "Whether the hotel offers airport pickup/drop."
        },
        "airport_transfer_price": {
            "type": ["number", "null"],
            "description": "Cost for airport transfer if not complimentary."
        },
        "free_cancellation": {
            "type": ["boolean", "null"],
            "description": "Whether free cancellation is offered."
        },
        "cancellation_deadline": {
            "type": ["string", "null"],
            "description": "Cancellation policy terms and deadline (e.g., 48 hours prior to check-in)."
        },
        "advance_payment_required": {
            "type": ["boolean", "null"],
            "description": "Whether an advance deposit or full prepayment is required."
        },
        "advance_payment_amount": {
            "type": ["number", "null"],
            "description": "Deposit amount required."
        },
        "extra_bed_available": {
            "type": ["boolean", "null"],
            "description": "Whether an extra bed or rollaway cot is available."
        },
        "extra_bed_price": {
            "type": ["number", "null"],
            "description": "Cost per night for an extra bed."
        },
        "early_checkin_available": {
            "type": ["boolean", "null"],
            "description": "Whether early check-in is supported."
        },
        "late_checkout_available": {
            "type": ["boolean", "null"],
            "description": "Whether late checkout can be accommodated."
        },
        "original_total": {
            "type": ["number", "null"],
            "description": "Initial quoted stay price before negotiation."
        },
        "negotiated_total": {
            "type": ["number", "null"],
            "description": "Final total agreed direct-booking price after negotiation."
        },
        "negotiated_savings": {
            "type": ["number", "null"],
            "description": "Direct monetary savings achieved through negotiation."
        },
        "special_benefits": {
            "type": "array",
            "items": {
                "type": "string"
            },
            "description": "Additional perks negotiated (e.g., complimentary breakfast, airport transfer, free room upgrade)."
        },
        "notes": {
            "type": ["string", "null"],
            "description": "Summary notes or special remarks from the front desk."
        }
    }
}
