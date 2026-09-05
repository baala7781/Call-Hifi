"""Tests for CALL-E voice agent provider."""

import pytest
from app.services.calle_service import get_voice_provider
from app.services.providers.calle_provider import CalleProvider


def test_get_voice_provider_default():
    """Verify default provider resolution."""
    prov = get_voice_provider("calle")
    assert isinstance(prov, CalleProvider)
    assert prov.provider_name == "calle"


def test_calle_single_call_format():
    """Verify CALL-E provider single call creation format."""
    prov = CalleProvider()
    result = prov.create_single_call(
        phone_number="+15555550123",
        task="Test CALL-E Voice task",
    )
    assert result["provider"] == "calle"
    assert "calle_call_id" in result
    assert result["status"] in ("queued", "completed", "calling")
