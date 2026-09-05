"""Integration tests for the complete HiFi API procurement and booking flow."""

from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_healthcheck():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@patch("app.services.providers.calle_provider.CalleProvider.execute_discovery_call")
@patch("app.services.providers.calle_provider.CalleProvider.create_single_call")
def test_full_hotel_procurement_flow(mock_create_call, mock_exec_call):
    mock_create_call.return_value = {
        "call_id": "test-call-id-123",
        "status": "queued",
        "provider": "calle",
    }
    mock_exec_call.return_value = {
        "availability": "available",
        "room_type": "Standard Room",
        "total_price": 45000.0,
        "negotiated_total": 40000.0,
        "currency": "INR",
    }

    # 1. Create Trip
    trip_payload = {
        "destination": "Bali",
        "check_in": "2026-10-12",
        "check_out": "2026-10-17",
        "adults": 2,
        "children": 0,
        "rooms": 1,
        "budget_amount": 50000,
        "budget_currency": "INR",
        "breakfast_required": True,
        "free_cancellation_required": True,
        "airport_transfer_preferred": True,
    }
    trip_res = client.post("/api/v1/trips", json=trip_payload)
    assert trip_res.status_code == 201
    trip = trip_res.json()
    trip_id = trip["id"]

    # 2. Discover Hotels
    disc_res = client.post(f"/api/v1/trips/{trip_id}/hotels/discover")
    assert disc_res.status_code == 200
    disc_data = disc_res.json()
    assert disc_data["discovered_count"] > 0
    assert len(disc_data["candidates"]) >= 5

    # 3. Start Calls (Non-blocking async)
    call_start_res = client.post(f"/api/v1/trips/{trip_id}/calls/start")
    assert call_start_res.status_code == 202
    call_start_data = call_start_res.json()
    assert call_start_data["call_count"] >= 1

    # 4. Check Call Status
    status_res = client.get(f"/api/v1/trips/{trip_id}/calls/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["call_count"] >= 1

    # 5. Test Quick Call Endpoint
    test_call_res = client.post("/api/v1/test-call", json={"phone": "+15555550123"})
    assert test_call_res.status_code == 200
    assert test_call_res.json()["status"] in ("queued", "completed")
