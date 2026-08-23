"""Hotels discovery API router."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.models import HotelDiscoveryResult
from app.services.hotel_discovery import HotelDiscoveryService
from app.store import db

router = APIRouter(prefix="/trips", tags=["Hotels"])
discovery_service = HotelDiscoveryService()


@router.post("/{trip_id}/hotels/discover", response_model=HotelDiscoveryResult)
async def discover_hotels(trip_id: str) -> HotelDiscoveryResult:
    """Discovers and ranks top 5 candidate hotels for a trip."""
    trip = db.trips.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    trip.status = "SEARCHING_HOTELS"
    candidates = discovery_service.search_hotels(trip)

    db.candidates[trip_id] = candidates
    trip.status = "CANDIDATES_FOUND"

    return HotelDiscoveryResult(
        trip_id=trip_id,
        destination=trip.destination,
        discovered_count=len(candidates),
        candidates=candidates,
    )


@router.get("/{trip_id}/hotels", response_model=list)
async def get_discovered_hotels(trip_id: str):
    """Gets currently discovered candidate hotels for a trip."""
    if trip_id not in db.trips:
        raise HTTPException(status_code=404, detail="Trip not found")
    return db.candidates.get(trip_id, [])
