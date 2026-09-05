"""Dynamic runtime settings API router backed by SQLite."""

from __future__ import annotations

import logging
from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel

from app.config import settings
from app.services.providers.calle_provider import sanitize_phone_e164
from app.services.runtime_settings import (
    get_active_voice_provider_name,
    get_runtime_setting,
    get_test_phone_number,
    is_demo_mode,
    set_runtime_setting,
)

logger = logging.getLogger("hifi.settings")
router = APIRouter(prefix="/settings", tags=["Settings"])


class SettingsUpdateRequest(BaseModel):
    demo_mode: bool | None = None
    test_phone_number: str | None = None
    voice_provider: str | None = None


@router.get("")
async def get_settings() -> dict[str, Any]:
    """Returns current active dynamic settings."""
    return {
        "demo_mode": is_demo_mode(),
        "test_phone_number": get_test_phone_number(),
        "voice_provider": get_active_voice_provider_name(),
        "allowed_emails": settings.allowed_emails,
        "calle_configured": bool(settings.calle_api_key),
    }


@router.post("")
async def update_settings(payload: SettingsUpdateRequest) -> dict[str, Any]:
    """Updates runtime settings dynamically from the UI."""
    if payload.demo_mode is not None:
        set_runtime_setting("demo_mode", "true" if payload.demo_mode else "false")
        logger.info(f"Updated runtime demo_mode in SQLite: {payload.demo_mode}")

    if payload.test_phone_number is not None:
        clean_phone = sanitize_phone_e164(payload.test_phone_number)
        set_runtime_setting("test_phone_number", clean_phone)
        logger.info(f"Updated runtime test_phone_number in SQLite: {clean_phone}")

    if payload.voice_provider is not None:
        set_runtime_setting("voice_provider", payload.voice_provider.lower().strip())
        logger.info(f"Updated runtime voice_provider in SQLite: {payload.voice_provider}")

    return await get_settings()
