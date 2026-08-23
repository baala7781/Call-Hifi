"""Trips API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models import TripCreate, TripRecord, CallTaskRecord, HotelCandidate, HotelOfferRecord
from app.store import db
from app.db import get_db_connection

router = APIRouter(prefix="/trips", tags=["Trips"])


class TripSummary(BaseModel):
    """Lightweight trip summary for the history list."""
    id: str
    destination: str
    check_in: str
    check_out: str
    adults: int
    budget_amount: float
    budget_currency: str
    status: str
    created_at: str
    call_count: int = 0
    offer_count: int = 0
    best_offer_total: float | None = None


class TripHistoryResponse(BaseModel):
    trips: list[TripSummary]
    total: int


class TripResumeResponse(BaseModel):
    trip: TripRecord
    candidates: list[HotelCandidate]
    calls: list[CallTaskRecord]
    offers: list[HotelOfferRecord]


@router.get("", response_model=TripHistoryResponse)
async def list_trips(user_email: str | None = None) -> TripHistoryResponse:
    """Returns all past trips for the given user with call/offer counts for the history view."""
    conn = get_db_connection()
    try:
        query = """
            SELECT
                t.id, t.destination, t.check_in, t.check_out, t.adults,
                t.budget_amount, t.budget_currency, t.status, t.created_at,
                (SELECT COUNT(*) FROM call_tasks ct WHERE ct.trip_id = t.id) as call_count,
                (SELECT COUNT(*) FROM offers o WHERE o.trip_id = t.id) as offer_count,
                (SELECT MIN(o.negotiated_total) FROM offers o WHERE o.trip_id = t.id AND o.negotiated_total > 0) as best_offer_total
            FROM trips t
            WHERE 1=1
        """
        params: list[str] = []
        if user_email and user_email.strip():
            query += " AND LOWER(t.user_email) = ?"
            params.append(user_email.strip().lower())

        query += " ORDER BY t.created_at DESC"
        rows = conn.execute(query, tuple(params)).fetchall()

        summaries = []
        for row in rows:
            # Skip test trips
            if str(row["id"]).startswith("test-trip-"):
                continue
            summaries.append(TripSummary(
                id=row["id"],
                destination=row["destination"],
                check_in=row["check_in"],
                check_out=row["check_out"],
                adults=row["adults"],
                budget_amount=row["budget_amount"],
                budget_currency=row["budget_currency"],
                status=row["status"],
                created_at=row["created_at"],
                call_count=row["call_count"],
                offer_count=row["offer_count"],
                best_offer_total=row["best_offer_total"],
            ))

        return TripHistoryResponse(trips=summaries, total=len(summaries))
    finally:
        conn.close()


@router.post("", response_model=TripRecord, status_code=201)
async def create_trip(payload: TripCreate) -> TripRecord:
    """Creates a new structured trip request."""
    trip = TripRecord(**payload.model_dump())
    db.trips[trip.id] = trip
    db.candidates[trip.id] = []
    db.call_tasks[trip.id] = []
    db.offers[trip.id] = []
    return trip


@router.get("/{trip_id}", response_model=TripRecord)
async def get_trip(trip_id: str) -> TripRecord:
    """Fetches an existing trip by ID."""
    trip = db.trips.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.get("/{trip_id}/resume", response_model=TripResumeResponse)
async def resume_trip(trip_id: str) -> TripResumeResponse:
    """Loads the full state of a past trip so the user can resume or review it."""
    trip = db.trips.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    candidates = db.candidates.get(trip_id, [])
    calls = db.call_tasks.get(trip_id, [])
    offers = db.offers.get(trip_id, [])

    return TripResumeResponse(
        trip=trip,
        candidates=candidates,
        calls=calls,
        offers=offers,
    )

