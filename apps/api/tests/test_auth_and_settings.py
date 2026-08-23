"""Unit tests for Auth allowlist, Runtime Settings API, and Call Selection."""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.auth import is_email_allowed

client = TestClient(app)


def test_auth_allowlist_wildcard():
    """Verify email check with wildcard allowlist."""
    assert is_email_allowed("baala@example.com") is True
    assert is_email_allowed("judge@devpost.com") is True


def test_login_flow():
    """Verify login returns token and creates user record."""
    response = client.post("/api/v1/auth/login", json={"email": "judge@devpost.com"})
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["email"] == "judge@devpost.com"
    assert data["role"] == "authorized_user"


def test_runtime_settings_get_and_post():
    """Verify dynamic settings retrieval and updates."""
    # 1. Get settings
    get_res = client.get("/api/v1/settings")
    assert get_res.status_code == 200
    settings_data = get_res.json()
    assert "demo_mode" in settings_data
    assert "test_phone_number" in settings_data
    assert "voice_provider" in settings_data

    # 2. Update settings dynamically
    post_res = client.post(
        "/api/v1/settings",
        json={
            "demo_mode": True,
            "test_phone_number": "+919705730130",
            "voice_provider": "calle",
        },
    )
    assert post_res.status_code == 200
    updated = post_res.json()
    assert updated["demo_mode"] is True
    assert updated["test_phone_number"] == "+919705730130"
    assert updated["voice_provider"] == "calle"
