"""Base abstract call provider interface for HiFi voice agents."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from app.models import CallTaskRecord, HotelCandidate, HotelOfferRecord, TripRecord


class BaseCallProvider(ABC):
    """Abstract base class defining interface for telephony & voice agent providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Returns unique identifier for the provider (e.g. 'calle')."""
        pass

    @abstractmethod
    async def execute_discovery_call(
        self,
        task_record: CallTaskRecord,
        trip: TripRecord,
        hotel: HotelCandidate,
        index: int,
    ) -> dict[str, Any]:
        """Executes discovery and rate negotiation phone call."""
        pass

    @abstractmethod
    async def execute_confirmation_call(
        self,
        trip: TripRecord,
        hotel: HotelCandidate,
        offer: HotelOfferRecord,
    ) -> dict[str, Any]:
        """Executes booking and payment confirmation phone call."""
        pass

    @abstractmethod
    def create_single_call(
        self,
        phone_number: str,
        task: str,
    ) -> dict[str, Any]:
        """Initiates a single outbound phone call or test ping."""
        pass
