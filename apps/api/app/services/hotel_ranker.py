"""Deterministic hotel candidate ranking service."""

from __future__ import annotations

import math
from typing import Any

from app.models import HotelCandidate, TripRecord

# Configurable Weights as specified in PRD Section 8
WEIGHT_RATING = 0.30
WEIGHT_REVIEW_CONFIDENCE = 0.15
WEIGHT_BUDGET_FIT = 0.25
WEIGHT_PREFERENCES = 0.20
WEIGHT_LOCATION = 0.10


def calculate_rating_score(rating: float | None) -> float:
    """Normalizes 3.0-5.0 rating to 0-100 score."""
    if rating is None or rating <= 0:
        return 50.0
    clamped = max(3.0, min(5.0, rating))
    return round(((clamped - 3.0) / 2.0) * 100.0, 2)


def calculate_review_confidence(review_count: int | None) -> float:
    """Logarithmic confidence scale from review count."""
    if not review_count or review_count <= 0:
        return 40.0
    # Log10 curve up to 2000 reviews = 100
    score = (math.log10(min(review_count, 2000) + 1) / math.log10(2001)) * 100.0
    return round(score, 2)


def calculate_budget_fit(estimated_price: float | None, budget_amount: float) -> float:
    """Scores candidate based on fit within user total budget."""
    if estimated_price is None or estimated_price <= 0:
        return 70.0  # Neutral assumption

    ratio = estimated_price / budget_amount

    # Ideal ratio is between 0.60 and 1.00 of budget
    if 0.60 <= ratio <= 1.00:
        return 100.0
    elif ratio < 0.60:
        # Too cheap, potential quality mismatch
        return round(max(50.0, ratio / 0.60 * 100.0), 2)
    elif 1.00 < ratio <= 1.15:
        # Slightly above budget but negotiable
        penalty = (ratio - 1.00) / 0.15
        return round(100.0 - (penalty * 35.0), 2)
    else:
        # Significantly over budget
        return round(max(10.0, 100.0 - ((ratio - 1.0) * 120.0)), 2)


def calculate_preference_match(hotel: dict[str, Any], trip: TripRecord) -> float:
    """Scores alignment with user amenity and policy preferences."""
    points = 0
    total_checks = 0

    if getattr(trip, "breakfast_required", False):
        total_checks += 1
        if hotel.get("breakfast_included") is True:
            points += 1

    if getattr(trip, "free_cancellation_required", False):
        total_checks += 1
        if hotel.get("free_cancellation") is not False:
            points += 1

    if getattr(trip, "airport_transfer_preferred", False):
        total_checks += 1
        if hotel.get("transfer_available") is True:
            points += 1

    if getattr(trip, "room_upgrade_preferred", False):
        total_checks += 1
        if hotel.get("upgrade_available") is True:
            points += 1

    if getattr(trip, "late_checkout_preferred", False):
        total_checks += 1
        if hotel.get("late_checkout_available") is True:
            points += 1

    if total_checks == 0:
        return 85.0  # Default baseline when no specific prefs specified

    return round((points / total_checks) * 100.0, 2)


def calculate_location_score(hotel: dict[str, Any]) -> float:
    """Baseline location proximity score."""
    lat = hotel.get("latitude")
    lng = hotel.get("longitude")
    if lat is not None and lng is not None:
        return 85.0
    return 75.0


def score_candidate(hotel: dict[str, Any], trip: TripRecord) -> float:
    """Calculates overall weighted ranking score (0-100) for a candidate hotel."""
    r_score = calculate_rating_score(hotel.get("rating"))
    rc_score = calculate_review_confidence(hotel.get("review_count"))
    b_score = calculate_budget_fit(
        hotel.get("base_price") or hotel.get("base_price_estimate"),
        trip.budget_amount,
    )
    p_score = calculate_preference_match(hotel, trip)
    l_score = calculate_location_score(hotel)

    weighted = (
        (r_score * WEIGHT_RATING)
        + (rc_score * WEIGHT_REVIEW_CONFIDENCE)
        + (b_score * WEIGHT_BUDGET_FIT)
        + (p_score * WEIGHT_PREFERENCES)
        + (l_score * WEIGHT_LOCATION)
    )
    return round(weighted, 2)


def rank_candidates(raw_hotels: list[dict[str, Any]], trip: TripRecord, limit: int = 20) -> list[HotelCandidate]:
    """Filters and deterministically ranks candidate hotels, returning up to limit (default 20)."""
    candidates: list[HotelCandidate] = []

    for index, hotel in enumerate(raw_hotels):
        rating = hotel.get("rating")
        min_r = getattr(trip, "min_rating", None)
        if min_r and rating is not None and rating < min_r:
            continue

        score = score_candidate(hotel, trip)
        candidates.append(
            HotelCandidate(
                id=hotel.get("id") or f"hotel-{index + 1}",
                name=hotel.get("name", "Unknown Hotel"),
                address=hotel.get("address", ""),
                phone_number=hotel.get("phone_number") or "",
                rating=rating or 4.0,
                review_count=hotel.get("review_count") or 100,
                score=score,
                website=hotel.get("website"),
                latitude=hotel.get("latitude"),
                longitude=hotel.get("longitude"),
                base_price_estimate=hotel.get("base_price") or hotel.get("base_price_estimate"),
                discovery_source=hotel.get("discovery_source", "google_places"),
                photo_url=hotel.get("photo_url"),
                photos=hotel.get("photos") or ([hotel.get("photo_url")] if hotel.get("photo_url") else []),
                maps_url=hotel.get("maps_url"),
                maps_embed_url=hotel.get("maps_embed_url"),
                place_id=hotel.get("place_id"),
            )
        )

    # Sort descending by score and assign ranks
    candidates.sort(key=lambda c: c.score, reverse=True)
    for idx, c in enumerate(candidates):
        c.rank = idx + 1
    return candidates[:limit]
