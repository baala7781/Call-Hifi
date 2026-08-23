"""Voice Provider Factory and backward-compatible service exports with rich logging."""

from __future__ import annotations

import logging
import os
from typing import Any

from app.config import settings
from app.services.providers.base import BaseCallProvider
from app.services.providers.calle_provider import CalleProvider, sanitize_phone_e164
from app.services.providers.cartesia_provider import CartesiaVoiceProvider

logger = logging.getLogger("hifi.voice")


def get_voice_provider(override_name: str | None = None) -> BaseCallProvider:
    """Factory returning the active voice agent provider based on env configuration."""
    raw_provider = (override_name or os.getenv("VOICE_PROVIDER") or settings.voice_provider or "calle").lower().strip()
    
    # Fuzzy match cartesia vs calle
    if "cart" in raw_provider or "crte" in raw_provider:
        provider = CartesiaVoiceProvider()
        logger.info(f"🎙️ [VOICE ROUTER] Selected Provider: CARTESIA (Voice ID: {provider.voice_id})")
        return provider
    
    provider = CalleProvider()
    logger.info("🎙️ [VOICE ROUTER] Selected Provider: CALL-E")
    return provider


class CalleService(BaseCallProvider):
    """Dynamic proxy delegating to whichever voice provider is configured (calle or cartesia)."""

    def __init__(self, override_provider: str | None = None) -> None:
        self.provider: BaseCallProvider = get_voice_provider(override_provider)

    @property
    def provider_name(self) -> str:
        return self.provider.provider_name

    @property
    def client(self) -> Any:
        return getattr(self.provider, "client", None)

    def build_hotel_discovery_task(self, trip: Any, hotel: Any) -> str:
        if hasattr(self.provider, "build_hotel_discovery_task"):
            return self.provider.build_hotel_discovery_task(trip, hotel)
        from app.prompts.hotel_discovery import build_hotel_discovery_prompt
        return build_hotel_discovery_prompt(trip, hotel)

    def build_confirmation_task(self, trip: Any, hotel: Any, offer: Any) -> str:
        if hasattr(self.provider, "build_confirmation_task"):
            return self.provider.build_confirmation_task(trip, hotel, offer)
        from app.prompts.hotel_confirmation import build_hotel_confirmation_prompt
        return build_hotel_confirmation_prompt(trip, hotel, offer)

    def create_single_call(self, phone_number: str, task: str) -> dict[str, Any]:
        return self.provider.create_single_call(phone_number, task)

    async def execute_discovery_call(self, task_record: Any, trip: Any, hotel: Any, index: int) -> dict[str, Any]:
        return await self.provider.execute_discovery_call(task_record, trip, hotel, index)

    async def execute_live_or_simulated_discovery_call(self, task_record: Any, trip: Any, hotel: Any, index: int) -> dict[str, Any]:
        """Backward-compatible alias for execute_discovery_call."""
        return await self.provider.execute_discovery_call(task_record, trip, hotel, index)

    async def execute_confirmation_call(self, trip: Any, hotel: Any, offer: Any) -> dict[str, Any]:
        return await self.provider.execute_confirmation_call(trip, hotel, offer)


__all__ = [
    "BaseCallProvider",
    "CalleProvider",
    "CartesiaVoiceProvider",
    "CalleService",
    "get_voice_provider",
    "sanitize_phone_e164",
]
