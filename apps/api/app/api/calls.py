"""Calls orchestration API router."""

from __future__ import annotations

import asyncio
import logging
from typing import Any
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from app.config import settings
from app.models import CallStartResponse, CallStatusResponse, CallTaskRecord
from app.services.calle_service import CalleService, sanitize_phone_e164
from app.services.offer_service import process_trip_offers
from app.store import db

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Calls"])
calle_service = CalleService()


async def run_call_workflow(trip_id: str) -> None:
    """Async background worker orchestrating hotel phone calls."""
    from app.services.calle_service import get_voice_provider
    active_prov = get_voice_provider()
    
    trip = db.trips.get(trip_id)
    candidates = db.candidates.get(trip_id, [])
    task_records = db.call_tasks.get(trip_id, [])

    if not trip or not candidates or not task_records:
        return

    logger.info(f"🎙️ [CALL WORKFLOW START] Trip {trip_id} | Provider: {active_prov.provider_name.upper()}")

    # Call only 1 hotel for demo mode
    selected_candidates = candidates[: len(task_records)]

    call_coroutines = [
        active_prov.execute_discovery_call(
            task_record=task_records[idx],
            trip=trip,
            hotel=selected_candidates[idx],
            index=idx,
        )
        for idx in range(len(task_records))
    ]

    raw_results = await asyncio.gather(*call_coroutines, return_exceptions=True)
    valid_results = [r for r in raw_results if isinstance(r, dict)]

    # Normalize, validate and score all resulting hotel offers
    offers = process_trip_offers(
        raw_results=valid_results,
        trip=trip,
        hotels=selected_candidates,
        tasks=task_records,
    )

    db.offers[trip_id] = offers
    trip.status = "OFFERS_READY"
    logger.info(f"✅ [CALL WORKFLOW COMPLETE] Trip {trip_id} offers generated: {len(offers)}")


class CallStartRequest(BaseModel):
    hotel_ids: list[str] | None = None
    demo_mode: bool | None = None
    test_phone_number: str | None = None


@router.post("/trips/{trip_id}/calls/start", response_model=CallStartResponse, status_code=202)
async def start_calls(
    trip_id: str,
    background_tasks: BackgroundTasks,
    payload: CallStartRequest | None = None,
) -> CallStartResponse:
    """Initiates non-blocking voice phone call to selected or top ranked candidate hotels."""
    from app.services.calle_service import get_voice_provider
    active_prov = get_voice_provider()
    
    trip = db.trips.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    candidates = db.candidates.get(trip_id, [])
    if not candidates:
        raise HTTPException(status_code=400, detail="No hotel candidates discovered yet")

    # Filter by user-selected hotel IDs if provided
    if payload and payload.hotel_ids:
        selected_set = set(payload.hotel_ids)
        target_candidates = [c for c in candidates if c.id in selected_set]
        if not target_candidates:
            target_candidates = candidates[:3]
    else:
        target_candidates = candidates[:3]

    # Resolve demo mode and phone number
    is_demo = payload.demo_mode if (payload and payload.demo_mode is not None) else settings.demo_mode
    test_phone = payload.test_phone_number if (payload and payload.test_phone_number) else settings.test_phone_number

    tasks: list[CallTaskRecord] = []

    for idx, hotel in enumerate(target_candidates):
        if is_demo:
            target_phone = sanitize_phone_e164(test_phone)
        else:
            target_phone = sanitize_phone_e164(hotel.phone_number or test_phone)

        task = CallTaskRecord(
            trip_id=trip_id,
            hotel_id=hotel.id,
            hotel_name=hotel.name,
            phone_number=target_phone,
            purpose="hotel_negotiation",
            status="queued",
            evidence=[],
        )
        tasks.append(task)

    db.call_tasks[trip_id] = tasks
    db.offers[trip_id] = []
    trip.status = "CALLING"

    background_tasks.add_task(run_call_workflow, trip_id)

    return CallStartResponse(
        trip_id=trip_id,
        call_count=len(tasks),
        calls=[
            {
                "call_task_id": t.id,
                "hotel_id": t.hotel_id,
                "hotel_name": t.hotel_name,
                "status": t.status,
            }
            for t in tasks
        ],
    )


@router.get("/trips/{trip_id}/calls/status", response_model=CallStatusResponse)
async def get_call_status(trip_id: str) -> CallStatusResponse:
    """Polls real-time calling progress and structured results."""
    trip = db.trips.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    tasks = db.call_tasks.get(trip_id, [])
    offers = db.offers.get(trip_id, [])

    completed_count = sum(1 for t in tasks if t.status in ("completed", "failed", "no_answer"))
    best_offer = next((o for o in offers if o.is_best_deal), None)

    total_savings = sum(o.negotiated_savings or 0.0 for o in offers if o.available)

    return CallStatusResponse(
        trip_id=trip_id,
        trip_status=trip.status,
        call_count=len(tasks),
        completed_count=completed_count,
        calls=tasks,
        offers=offers,
        best_offer_id=best_offer.id if best_offer else None,
        total_negotiated_savings=round(total_savings, 2),
    )


@router.post("/test-call")
async def test_call(phone: str | None = None, provider: str | None = None) -> dict[str, Any]:
    """Test endpoint to trigger an outbound test phone call via active provider (CALL-E or Cartesia)."""
    from app.services.calle_service import get_voice_provider
    active_prov = get_voice_provider(provider)
    target_phone = sanitize_phone_e164(phone or settings.test_phone_number)
    
    result = active_prov.create_single_call(
        phone_number=target_phone,
        task="Call the user and say: 'Hello! This is HiFi AI Hotel Agent. Can you hear me clearly?'",
    )
    result["phone"] = target_phone
    result["provider"] = active_prov.provider_name
    result["message"] = f"Test call dispatched to {target_phone} via {active_prov.provider_name.upper()}."
    return result
