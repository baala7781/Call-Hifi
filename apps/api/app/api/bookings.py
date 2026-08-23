"""Bookings and confirmation API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.models import BookingCreate, BookingRecord
from app.services.booking_service import BookingService
from app.store import db

router = APIRouter(tags=["Bookings"])
booking_service = BookingService()


@router.post("/bookings", response_model=BookingRecord, status_code=201)
async def create_booking(payload: BookingCreate) -> BookingRecord:
    """Creates a new pending booking after user approves an offer."""
    trip = db.trips.get(payload.trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    candidates = db.candidates.get(payload.trip_id, [])
    hotel = next((h for h in candidates if h.id == payload.hotel_id), None)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel candidate not found")

    offers = db.offers.get(payload.trip_id, [])
    offer = next((o for o in offers if o.id == payload.offer_id), None)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    trip.status = "OFFER_SELECTED"
    booking = booking_service.create_booking(trip, hotel, offer)
    db.bookings[booking.id] = booking
    trip.status = "PAYMENT_PENDING"

    return booking


@router.post("/bookings/{booking_id}/confirm", response_model=BookingRecord)
async def confirm_booking(booking_id: str) -> BookingRecord:
    """Processes simulated payment and performs secondary CALL-E confirmation call."""
    booking = db.bookings.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    trip = db.trips.get(booking.trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    candidates = db.candidates.get(booking.trip_id, [])
    hotel = next((h for h in candidates if h.id == booking.hotel_id), None)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    offers = db.offers.get(booking.trip_id, [])
    offer = next((o for o in offers if o.id == booking.offer_id), None)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    trip.status = "PAYMENT_SUCCESS"
    trip.status = "CONFIRMING"

    updated_booking = await booking_service.execute_simulated_payment_and_confirmation(
        booking=booking,
        trip=trip,
        hotel=hotel,
        offer=offer,
    )

    if updated_booking.confirmation_status == "confirmed":
        trip.status = "CONFIRMED"
    else:
        trip.status = "FAILED"

    return updated_booking


@router.get("/bookings/{booking_id}", response_model=BookingRecord)
async def get_booking(booking_id: str) -> BookingRecord:
    """Gets booking record by ID."""
    booking = db.bookings.get(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
