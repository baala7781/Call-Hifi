"""Debug & observability API router for inspecting CALL-E logs and transcripts."""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, HTTPException
from app.store import db

router = APIRouter(prefix="/debug", tags=["Debug"])


@router.get("/trip/{trip_id}")
async def get_trip_debug_dump(trip_id: str) -> dict[str, Any]:
    """Returns complete state dump including raw CALL-E outputs and transcripts for a trip."""
    trip = db.trips.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    tasks = db.call_tasks.get(trip_id, [])
    offers = db.offers.get(trip_id, [])
    candidates = db.candidates.get(trip_id, [])

    return {
        "trip": trip,
        "candidates_count": len(candidates),
        "candidates": candidates,
        "call_tasks": [
            {
                "id": t.id,
                "hotel_name": t.hotel_name,
                "status": t.status,
                "duration_seconds": t.duration_seconds,
                "task_completed": t.task_completed,
                "completion_confidence": t.completion_confidence,
                "evidence": t.evidence,
                "transcript": t.transcript,
                "raw_structured_result": t.raw_structured_result,
            }
            for t in tasks
        ],
        "offers": offers,
    }


@router.get("/calls/{call_task_id}")
async def get_call_task_debug(call_task_id: str) -> dict[str, Any]:
    """Returns detailed technical log for a specific CALL-E call."""
    for tasks in db.call_tasks.values():
        for t in tasks:
            if t.id == call_task_id:
                return {
                    "call_task_id": t.id,
                    "trip_id": t.trip_id,
                    "hotel_id": t.hotel_id,
                    "hotel_name": t.hotel_name,
                    "phone_number": t.phone_number,
                    "status": t.status,
                    "task_completed": t.task_completed,
                    "completion_confidence": t.completion_confidence,
                    "evidence": t.evidence,
                    "transcript": t.transcript,
                    "raw_structured_result": t.raw_structured_result,
                    "started_at": t.started_at,
                    "completed_at": t.completed_at,
                }
    raise HTTPException(status_code=404, detail="Call task not found")
