"""Offer normalization, validation, scoring and recommendation service."""

from __future__ import annotations

import logging
from typing import Any

from app.models import CallTaskRecord, HotelCandidate, HotelOfferRecord, TripRecord

logger = logging.getLogger(__name__)

# Configurable Weights as specified in PRD Section 19
WEIGHT_PRICE_VALUE = 0.35
WEIGHT_BREAKFAST = 0.15
WEIGHT_CANCELLATION = 0.15
WEIGHT_AIRPORT = 0.10
WEIGHT_ROOM_FIT = 0.10
WEIGHT_SAVINGS = 0.10
WEIGHT_EXTRA_BENEFITS = 0.05


def validate_and_normalize_raw_result(
    raw: dict[str, Any],
    trip: TripRecord,
    hotel: HotelCandidate,
    task: CallTaskRecord,
) -> HotelOfferRecord:
    """Validates raw CALL-E structured result against business constraints and normalizes to HotelOfferRecord."""
    availability_str = str(raw.get("availability", "available")).lower()
    is_available = availability_str in ("available", "yes", "true")

    # Pricing validation
    raw_total = raw.get("total_price")
    total_price = float(raw_total) if raw_total is not None and float(raw_total) > 0 else None

    raw_orig = raw.get("original_total")
    original_total = float(raw_orig) if raw_orig is not None and float(raw_orig) > 0 else total_price

    raw_nego = raw.get("negotiated_total")
    negotiated_total = float(raw_nego) if raw_nego is not None and float(raw_nego) > 0 else total_price

    # Business Rule: Negotiated total cannot exceed original total
    if original_total is not None and negotiated_total is not None:
        if negotiated_total > original_total:
            negotiated_total = original_total
        negotiated_savings = round(original_total - negotiated_total, 2)
    else:
        negotiated_savings = 0.0

    # Currency normalization
    currency = raw.get("currency") or trip.budget_currency

    # Nightly price calculation
    price_per_night = raw.get("price_per_night")
    if price_per_night is None and negotiated_total is not None:
        stay_nights = max(1, (trip.check_out - trip.check_in).days)
        price_per_night = round(negotiated_total / stay_nights, 2)

    # Inclusions & Benefits
    breakfast_included = raw.get("breakfast_included")
    airport_transfer_available = raw.get("airport_transfer_available")
    free_cancellation = raw.get("free_cancellation")
    special_benefits = raw.get("special_benefits") or []

    if isinstance(special_benefits, str):
        special_benefits = [special_benefits]

    # Create offer record
    offer = HotelOfferRecord(
        trip_id=trip.id,
        hotel_id=hotel.id,
        hotel_name=hotel.name,
        call_task_id=task.id,
        available=is_available,
        room_type=raw.get("room_type") or "Deluxe King Room",
        max_guests=raw.get("max_guests") or 2,
        price_per_night=price_per_night,
        total_price=original_total,
        currency=currency,
        taxes_included=raw.get("taxes_included", True),
        mandatory_fees=raw.get("mandatory_fees", 0.0),
        breakfast_included=breakfast_included,
        breakfast_price=raw.get("breakfast_price"),
        airport_transfer_available=airport_transfer_available,
        airport_transfer_price=raw.get("airport_transfer_price"),
        free_cancellation=free_cancellation,
        cancellation_deadline=raw.get("cancellation_deadline") or ("Free cancellation up to 48h before check-in" if free_cancellation else "Non-refundable / Non-cancelable"),
        advance_payment_required=raw.get("advance_payment_required", False),
        advance_payment_amount=raw.get("advance_payment_amount"),
        extra_bed_available=raw.get("extra_bed_available"),
        extra_bed_price=raw.get("extra_bed_price"),
        early_checkin_available=raw.get("early_checkin_available", True),
        late_checkout_available=raw.get("late_checkout_available", True),
        original_total=original_total,
        negotiated_total=negotiated_total,
        negotiated_savings=negotiated_savings,
        special_benefits=special_benefits,
        offer_notes=raw.get("notes") or "Direct booking quote confirmed by hotel reception.",
        confidence=task.completion_confidence or 0.92,
        raw_structured_result=raw,
    )

    # Compute HiFi score
    offer.score = calculate_offer_score(offer, trip)
    return offer


def calculate_offer_score(offer: HotelOfferRecord, trip: TripRecord) -> float:
    """Calculates deterministic 0-100 HiFi Value Score."""
    if not offer.available:
        return 0.0

    # 1. Price / Budget Value (0-100)
    final_price = offer.negotiated_total or offer.total_price or trip.budget_amount
    if final_price <= trip.budget_amount:
        # Score higher if under budget
        saving_ratio = (trip.budget_amount - final_price) / max(1.0, trip.budget_amount)
        price_score = min(100.0, 85.0 + (saving_ratio * 30.0))
    else:
        overage = (final_price - trip.budget_amount) / max(1.0, trip.budget_amount)
        price_score = max(10.0, 85.0 - (overage * 100.0))

    # 2. Breakfast component (0-100)
    if offer.breakfast_included is True:
        breakfast_score = 100.0
    elif offer.breakfast_included is False:
        breakfast_score = 30.0 if not trip.breakfast_required else 10.0
    else:
        breakfast_score = 50.0  # unknown

    # 3. Cancellation flexibility (0-100)
    if offer.free_cancellation is True:
        cancellation_score = 100.0
    elif offer.free_cancellation is False:
        cancellation_score = 30.0 if not trip.free_cancellation_required else 10.0
    else:
        cancellation_score = 50.0

    # 4. Airport transfer (0-100)
    if offer.airport_transfer_available is True:
        airport_score = 100.0
    elif offer.airport_transfer_available is False:
        airport_score = 40.0
    else:
        airport_score = 50.0

    # 5. Room suitability (0-100)
    if offer.max_guests and offer.max_guests >= trip.adults:
        room_score = 100.0
    else:
        room_score = 60.0

    # 6. Negotiated savings component (0-100)
    savings = offer.negotiated_savings or 0.0
    if savings > 0:
        savings_ratio = savings / max(1.0, (offer.original_total or 50000.0))
        savings_score = min(100.0, 70.0 + (savings_ratio * 200.0))
    else:
        savings_score = 50.0

    # 7. Extra benefits (0-100)
    benefits_count = len(offer.special_benefits)
    extra_score = min(100.0, 50.0 + (benefits_count * 25.0))

    total_score = (
        (price_score * WEIGHT_PRICE_VALUE)
        + (breakfast_score * WEIGHT_BREAKFAST)
        + (cancellation_score * WEIGHT_CANCELLATION)
        + (airport_score * WEIGHT_AIRPORT)
        + (room_score * WEIGHT_ROOM_FIT)
        + (savings_score * WEIGHT_SAVINGS)
        + (extra_score * WEIGHT_EXTRA_BENEFITS)
    )

    return round(total_score, 1)


def generate_recommendation_reason(offer: HotelOfferRecord, trip: TripRecord) -> str:
    """Generates transparent, plain-English justification for why this offer is recommended."""
    reasons = []

    if offer.negotiated_savings and offer.negotiated_savings > 0:
        reasons.append(f"offers {offer.currency} {offer.negotiated_savings:,.0f} in verified direct-booking savings")

    if offer.breakfast_included:
        reasons.append("includes complimentary daily breakfast")

    if offer.free_cancellation:
        reasons.append("features flexible free cancellation")

    if offer.airport_transfer_available:
        reasons.append("provides airport transportation")

    final_price = offer.negotiated_total or offer.total_price or 0
    if final_price <= trip.budget_amount:
        reasons.append(f"comfortably fits within your {trip.budget_currency} {trip.budget_amount:,.0f} budget cap")

    if not reasons:
        return f"{offer.hotel_name} achieves the highest overall quality and value score for your stay."

    joined = ", ".join(reasons[:-1]) + f", and {reasons[-1]}" if len(reasons) > 1 else reasons[0]
    return f"{offer.hotel_name} is our top recommendation because it {joined}."


def process_trip_offers(
    raw_results: list[dict[str, Any]],
    trip: TripRecord,
    hotels: list[HotelCandidate],
    tasks: list[CallTaskRecord],
) -> list[HotelOfferRecord]:
    """Processes, scores, and marks best deal among all completed hotel calls."""
    offers: list[HotelOfferRecord] = []
    hotel_map = {h.id: h for h in hotels}
    task_map = {t.hotel_id: t for t in tasks}

    for raw in raw_results:
        hotel_id = raw.get("hotel_id")
        hotel = hotel_map.get(hotel_id)
        task = task_map.get(hotel_id)

        if not hotel or not task:
            continue

        offer = validate_and_normalize_raw_result(raw, trip, hotel, task)
        offers.append(offer)

    # Sort descending by score
    offers.sort(key=lambda o: (o.available, o.score), reverse=True)

    if offers and offers[0].available:
        offers[0].is_best_deal = True
        offers[0].recommendation_reason = generate_recommendation_reason(offers[0], trip)

    return offers
