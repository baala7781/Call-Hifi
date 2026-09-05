"""Unit test verifying persistent SQLite state storage."""

from datetime import date
from uuid import uuid4
from app.models import HotelCandidate, TripRecord
from app.store import db, StateStore


def test_trip_sqlite_persistence():
    """Verify trip is written to SQLite and read back accurately."""
    trip_id = f"test-trip-{uuid4().hex[:6]}"
    trip = TripRecord(
        id=trip_id,
        destination="Hyderabad",
        check_in=date(2026, 10, 12),
        check_out=date(2026, 10, 14),
        adults=2,
        budget_amount=12000.0,
    )
    db.trips[trip_id] = trip

    # Instantiate fresh store instance and query
    fresh_store = StateStore()
    retrieved = fresh_store.trips.get(trip_id)
    assert retrieved is not None
    assert retrieved.id == trip_id
    assert retrieved.destination == "Hyderabad"
    assert retrieved.budget_amount == 12000.0


def test_candidates_sqlite_persistence():
    """Verify hotel candidates list is persisted and queried by foreign key."""
    trip_id = f"test-trip-{uuid4().hex[:6]}"
    cand1 = HotelCandidate(
        id=f"c1-{uuid4().hex[:4]}",
        name="ITC Kohenur",
        address="HITEC City, Hyderabad",
        phone_number="+15555550123",
        rating=4.9,
    )
    cand2 = HotelCandidate(
        id=f"c2-{uuid4().hex[:4]}",
        name="Taj Falaknuma",
        address="Engine Bowli, Hyderabad",
        phone_number="+15555550123",
        rating=4.8,
    )
    db.candidates[trip_id] = [cand1, cand2]

    fresh_store = StateStore()
    retrieved_list = fresh_store.candidates.get(trip_id)
    assert len(retrieved_list) == 2
    assert retrieved_list[0].name == "ITC Kohenur"
    assert retrieved_list[1].name == "Taj Falaknuma"
