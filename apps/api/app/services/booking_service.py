"""Booking, simulated payment, and reservation confirmation service."""

from __future__ import annotations

import logging
from datetime import datetime
from uuid import uuid4

from app.models import BookingRecord, HotelCandidate, HotelOfferRecord, TripRecord
from app.services.calle_service import CalleService

logger = logging.getLogger(__name__)


class BookingService:
    def __init__(self, calle_service: CalleService | None = None) -> None:
        self.calle_service = calle_service or CalleService()

    def create_booking(
        self,
        trip: TripRecord,
        hotel: HotelCandidate,
        offer: HotelOfferRecord,
    ) -> BookingRecord:
        """Creates an initial pending booking record."""
        stay_nights = max(1, (trip.check_out - trip.check_in).days)
        guests_summary = f"{trip.adults} Adults" + (f", {trip.children} Children" if trip.children else "")

        final_amount = offer.negotiated_total or offer.total_price or 0.0

        booking = BookingRecord(
            id=f"book-{uuid4().hex[:8]}",
            trip_id=trip.id,
            hotel_id=hotel.id,
            hotel_name=hotel.name,
            offer_id=offer.id,
            payment_status="pending",
            confirmation_status="pending",
            final_amount=final_amount,
            currency=offer.currency or trip.budget_currency,
            check_in=str(trip.check_in),
            check_out=str(trip.check_out),
            guests_summary=guests_summary,
            confirmed_inclusions=offer.special_benefits or (["Daily breakfast"] if offer.breakfast_included else []),
        )
        return booking

    async def execute_simulated_payment_and_confirmation(
        self,
        booking: BookingRecord,
        trip: TripRecord,
        hotel: HotelCandidate,
        offer: HotelOfferRecord,
    ) -> BookingRecord:
        """Processes simulated payment and executes CALL-E confirmation call."""
        # 1. Authorize simulated payment
        booking.payment_status = "simulated_success"
        booking.confirmation_status = "confirming"

        # 2. Trigger CALL-E Confirmation call
        confirmation_result = await self.calle_service.execute_confirmation_call(trip, hotel, offer)

        # 3. Update booking record based on actual hotel response
        is_ok = confirmation_result.get("confirmed") == "yes" or confirmation_result.get("confirmation_status") == "confirmed"
        if is_ok:
            booking.confirmation_status = "confirmed"
            booking.confirmation_number = confirmation_result.get("confirmation_code") or confirmation_result.get("confirmation_number") or f"HIFI-{uuid4().hex[:5].upper()}"
            booking.confirmed_at = datetime.utcnow()
            booking.confirmed_inclusions = confirmation_result.get("confirmed_perks") or confirmation_result.get("benefits_confirmed") or booking.confirmed_inclusions
            booking.confirmation_notes = confirmation_result.get("notes") or "Reservation confirmed with hotel front desk."
        else:
            booking.confirmation_status = "failed"
            booking.failure_reason = confirmation_result.get("failure_reason") or confirmation_result.get("reason") or "Hotel front desk reported payment was not received or declined reservation."
            booking.confirmation_notes = confirmation_result.get("notes") or "Hotel front desk could not verify payment."

        return booking
