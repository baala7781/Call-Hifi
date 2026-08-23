"""Tests for multi-provider voice agent switching (CALL-E and Cartesia)."""

import pytest
from app.services.calle_service import get_voice_provider
from app.services.providers.calle_provider import CalleProvider
from app.services.providers.cartesia_provider import CartesiaVoiceProvider


def test_get_voice_provider_default():
    """Verify default provider resolution."""
    prov = get_voice_provider("calle")
    assert isinstance(prov, CalleProvider)
    assert prov.provider_name == "calle"


def test_get_voice_provider_cartesia():
    """Verify Cartesia provider resolution."""
    prov = get_voice_provider("cartesia")
    assert isinstance(prov, CartesiaVoiceProvider)
    assert prov.provider_name == "cartesia"


def test_cartesia_single_call():
    """Verify Cartesia provider single call creation format."""
    prov = CartesiaVoiceProvider()
    result = prov.create_single_call(
        phone_number="+919705730130",
        task="Test Cartesia Voice task",
    )
    assert result["provider"] == "cartesia"
    assert "calle_call_id" in result
    assert result["status"] in ("queued", "rejected", "completed")
