"""Unit tests for offer validation, normalization, and scoring."""

from datetime import date
from app.models import CallTaskRecord, HotelCandidate, TripRecord
from app.services.offer_service import (
    calculate_offer_score,
    generate_recommendation_reason,
    validate_and_normalize_raw_result,
)


def test_offer_normalization_and_savings():
    trip = TripRecord(
        destination="Bali",
        check_in=date(2026, 10, 12),
        check_out=date(2026, 10, 17),
        budget_amount=50000,
    )
    hotel = HotelCandidate(
        id="h-1",
        name="Ocean Pearl Resort",
        address="Nusa Dua",
        rating=4.8,
    )
    task = CallTaskRecord(
        trip_id=trip.id,
        hotel_id=hotel.id,
        hotel_name=hotel.name,
        completion_confidence=0.95,
    )

    raw_data = {
        "availability": "available",
        "original_total": 45000.0,
        "negotiated_total": 41000.0,
        "currency": "INR",
        "breakfast_included": True,
        "free_cancellation": True,
        "special_benefits": ["Complimentary breakfast", "Airport transfer"],
    }

    offer = validate_and_normalize_raw_result(raw_data, trip, hotel, task)

    assert offer.available is True
    assert offer.original_total == 45000.0
    assert offer.negotiated_total == 41000.0
    assert offer.negotiated_savings == 4000.0
    assert offer.breakfast_included is True
    assert offer.free_cancellation is True
    assert offer.score > 80.0


def test_negotiation_guard_cannot_exceed_original():
    trip = TripRecord(
        destination="Bali",
        check_in=date(2026, 10, 12),
        check_out=date(2026, 10, 17),
    )
    hotel = HotelCandidate(id="h-1", name="Hotel A", address="Address")
    task = CallTaskRecord(trip_id=trip.id, hotel_id=hotel.id, hotel_name=hotel.name)

    # Malformed data where negotiated is higher
    raw_data = {
        "availability": "available",
        "original_total": 40000.0,
        "negotiated_total": 45000.0,
    }

    offer = validate_and_normalize_raw_result(raw_data, trip, hotel, task)
    assert offer.negotiated_total == 40000.0
    assert offer.negotiated_savings == 0.0


def test_recommendation_reason_generation():
    trip = TripRecord(
        destination="Bali",
        check_in=date(2026, 10, 12),
        check_out=date(2026, 10, 17),
        budget_amount=50000,
    )
    hotel = HotelCandidate(id="h-1", name="Ocean Pearl Resort", address="Bali")
    task = CallTaskRecord(trip_id=trip.id, hotel_id=hotel.id, hotel_name=hotel.name)

    raw_data = {
        "availability": "available",
        "original_total": 45000.0,
        "negotiated_total": 41000.0,
        "currency": "INR",
        "breakfast_included": True,
        "free_cancellation": True,
    }
    offer = validate_and_normalize_raw_result(raw_data, trip, hotel, task)
    reason = generate_recommendation_reason(offer, trip)

    assert "Ocean Pearl Resort is our top recommendation" in reason
    assert "4,000" in reason
    assert "breakfast" in reason
    assert "free cancellation" in reason
