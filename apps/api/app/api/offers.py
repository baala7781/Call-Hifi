"""Offers API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.models import HotelOfferRecord, OfferComparisonResponse
from app.store import db

router = APIRouter(tags=["Offers"])


@router.get("/trips/{trip_id}/offers", response_model=OfferComparisonResponse)
async def get_trip_offers(trip_id: str) -> OfferComparisonResponse:
    """Gets all normalized hotel offers and the recommended best value deal for a trip."""
    trip = db.trips.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    offers = db.offers.get(trip_id, [])
    best_offer = next((o for o in offers if o.is_best_deal), None)
    if not best_offer and offers:
        best_offer = offers[0]

    summary = (
        best_offer.recommendation_reason
        if best_offer and best_offer.recommendation_reason
        else f"Evaluated {len(offers)} hotel offers based on your budget and preferences."
    )

    return OfferComparisonResponse(
        trip_id=trip_id,
        offers=offers,
        best_offer=best_offer,
        summary=summary,
    )


@router.get("/offers/{offer_id}", response_model=HotelOfferRecord)
async def get_offer_detail(offer_id: str) -> HotelOfferRecord:
    """Gets full detail for a specific offer."""
    for offer_list in db.offers.values():
        for offer in offer_list:
            if offer.id == offer_id:
                return offer
    raise HTTPException(status_code=404, detail="Offer not found")
