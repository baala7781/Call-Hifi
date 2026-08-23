"""Unit tests for deterministic hotel candidate ranking algorithm."""

from datetime import date
from app.models import TripRecord
from app.services.hotel_ranker import (
    calculate_budget_fit,
    calculate_preference_match,
    calculate_rating_score,
    rank_candidates,
    score_candidate,
)


def test_calculate_rating_score():
    assert calculate_rating_score(5.0) == 100.0
    assert calculate_rating_score(3.0) == 0.0
    assert calculate_rating_score(4.0) == 50.0
    assert calculate_rating_score(None) == 50.0


def test_calculate_budget_fit():
    # Exactly on budget
    score_on_budget = calculate_budget_fit(50000, 50000)
    assert score_on_budget == 100.0

    # Over budget penalized
    score_over_budget = calculate_budget_fit(65000, 50000)
    assert score_over_budget < 80.0

    # Under budget
    score_under_budget = calculate_budget_fit(40000, 50000)
    assert score_under_budget >= 90.0


def test_preference_matching():
    trip = TripRecord(
        destination="Bali",
        check_in=date(2026, 10, 12),
        check_out=date(2026, 10, 17),
        breakfast_required=True,
        free_cancellation_required=True,
        airport_transfer_preferred=True,
    )

    hotel_all_match = {
        "breakfast_included": True,
        "free_cancellation": True,
        "transfer_available": True,
    }
    assert calculate_preference_match(hotel_all_match, trip) == 100.0

    hotel_partial = {
        "breakfast_included": True,
        "free_cancellation": False,
        "transfer_available": False,
    }
    assert calculate_preference_match(hotel_partial, trip) < 50.0


def test_rank_candidates_produces_sorted_top_5():
    trip = TripRecord(
        destination="Bali",
        check_in=date(2026, 10, 12),
        check_out=date(2026, 10, 17),
        budget_amount=50000,
        min_rating=4.0,
        breakfast_required=True,
        free_cancellation_required=True,
    )

    raw_hotels = [
        {"id": "h1", "name": "Low Rating", "rating": 3.5, "review_count": 100, "base_price": 40000},
        {"id": "h2", "name": "Top Hotel", "rating": 4.9, "review_count": 1500, "base_price": 48000, "breakfast_included": True, "free_cancellation": True},
        {"id": "h3", "name": "Good Hotel", "rating": 4.6, "review_count": 800, "base_price": 45000, "breakfast_included": True, "free_cancellation": True},
        {"id": "h4", "name": "Mid Hotel", "rating": 4.3, "review_count": 400, "base_price": 42000},
        {"id": "h5", "name": "Budget Hotel", "rating": 4.4, "review_count": 500, "base_price": 38000},
        {"id": "h6", "name": "Expensive", "rating": 4.8, "review_count": 600, "base_price": 80000},
    ]

    candidates = rank_candidates(raw_hotels, trip)
    # Filtered out 3.5 rating because min_rating is 4.0
    assert all(c.rating >= 4.0 for c in candidates)
    # At most 5 candidates returned
    assert len(candidates) <= 5
    # First is Top Hotel
    assert candidates[0].name == "Top Hotel"
    # Strictly descending scores
    scores = [c.score for c in candidates]
    assert scores == sorted(scores, reverse=True)
