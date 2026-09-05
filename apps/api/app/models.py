from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator

TripStatus = Literal[
    "DRAFT",
    "SEARCHING_HOTELS",
    "CANDIDATES_FOUND",
    "CALLING",
    "OFFERS_READY",
    "BOOKING_INITIATED",
    "CONFIRMING_CALL",
    "CONFIRMED",
    "FAILED",
]


class TripCreate(BaseModel):
    destination: str
    check_in: date
    check_out: date
    adults: int = Field(default=2, ge=1)
    children: int = Field(default=0, ge=0)
    rooms: int = Field(default=1, ge=1)
    budget_amount: float = Field(default=600.0, gt=0)
    budget_currency: str = Field(default="USD")
    min_rating: float | None = 4.0
    room_type_preference: str = "any"
    breakfast_required: bool = False
    free_cancellation_required: bool = False
    airport_transfer_preferred: bool = False
    room_upgrade_preferred: bool = False
    late_checkout_preferred: bool = False
    user_email: str = ""

    @field_validator("check_out")
    @classmethod
    def validate_dates(cls, v: date, info: Any) -> date:
        check_in = info.data.get("check_in")
        if check_in and v <= check_in:
            raise ValueError("check_out must be strictly after check_in")
        return v


class TripRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid4()))
    destination: str
    check_in: date
    check_out: date
    adults: int = 2
    children: int = 0
    rooms: int = 1
    budget_amount: float = 600.0
    budget_currency: str = "USD"
    min_rating: float | None = 4.0
    room_type_preference: str = "any"
    breakfast_required: bool = False
    free_cancellation_required: bool = False
    airport_transfer_preferred: bool = False
    room_upgrade_preferred: bool = False
    late_checkout_preferred: bool = False
    user_email: str = ""
    status: TripStatus = "DRAFT"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class HotelCandidate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    name: str
    address: str
    phone_number: str = ""
    rating: float = 4.0
    review_count: int = 100
    website: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    base_price_estimate: float | None = None
    breakfast_included: bool = False
    transfer_available: bool = False
    free_cancellation: bool = True
    upgrade_available: bool = False
    late_checkout_available: bool = False
    score: float = 0.0
    rank: int = 0
    photo_url: str | None = None
    photos: list[str] = Field(default_factory=list)
    maps_url: str | None = None
    maps_embed_url: str | None = None
    place_id: str | None = None
    discovery_source: str = "curated_regional"


class HotelDiscoveryResult(BaseModel):
    trip_id: str
    destination: str
    discovered_count: int
    candidates: list[HotelCandidate]


class CallTaskRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid4()))
    trip_id: str
    hotel_id: str
    hotel_name: str
    phone_number: str = ""
    calle_call_id: str | None = None
    purpose: Literal["hotel_negotiation", "booking_confirmation"] = "hotel_negotiation"
    status: Literal["queued", "calling", "completed", "failed", "no_answer"] = "queued"
    started_at: datetime | None = None
    completed_at: datetime | None = None
    duration_seconds: int | None = None
    transcript_available: bool = False
    transcript: list[dict[str, Any]] = Field(default_factory=list)
    raw_structured_result: dict[str, Any] | None = None
    task_completed: bool | None = None
    completion_confidence: float | None = None
    evidence: list[str] = Field(default_factory=list)
    error_message: str | None = None


class HotelOfferRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid4()))
    trip_id: str
    hotel_id: str
    hotel_name: str
    call_task_id: str | None = None
    available: bool = True
    room_type: str | None = None
    max_guests: int | None = None
    price_per_night: float | None = None
    total_price: float | None = None
    currency: str = "USD"
    taxes_included: bool | None = None
    mandatory_fees: float | None = None
    breakfast_included: bool | None = None
    breakfast_price: float | None = None
    airport_transfer_available: bool | None = None
    airport_transfer_price: float | None = None
    free_cancellation: bool | None = None
    cancellation_deadline: str | None = None
    advance_payment_required: bool | None = None
    advance_payment_amount: float | None = None
    extra_bed_available: bool | None = None
    extra_bed_price: float | None = None
    early_checkin_available: bool | None = None
    late_checkout_available: bool | None = None
    original_total: float | None = None
    negotiated_total: float | None = None
    negotiated_savings: float | None = None
    special_benefits: list[str] = Field(default_factory=list)
    offer_notes: str | None = None
    confidence: float | None = None
    raw_structured_result: dict[str, Any] = Field(default_factory=dict)
    score: float = 0.0
    recommendation_reason: str | None = None
    is_best_deal: bool = False
    photo_url: str | None = None
    photos: list[str] = Field(default_factory=list)
    maps_url: str | None = None
    maps_embed_url: str | None = None
    address: str | None = None
    rating: float | None = None
    review_count: int | None = None
    latitude: float | None = None
    longitude: float | None = None


class BookingCreate(BaseModel):
    trip_id: str
    hotel_id: str
    offer_id: str


class BookingRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid4()))
    trip_id: str
    hotel_id: str
    hotel_name: str = ""
    offer_id: str
    payment_status: Literal["pending", "simulated_success", "failed"] = "pending"
    confirmation_status: Literal["pending", "confirming", "confirmed", "failed"] = "pending"
    confirmation_number: str | None = None
    failure_reason: str | None = None
    confirmation_notes: str | None = None
    final_amount: float = 0.0
    currency: str = "USD"
    confirmation_call_task_id: str | None = None
    confirmed_inclusions: list[str] = Field(default_factory=list)
    check_in: str | None = None
    check_out: str | None = None
    guests_summary: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    confirmed_at: datetime | None = None
    photo_url: str | None = None
    photos: list[str] = Field(default_factory=list)
    maps_url: str | None = None
    maps_embed_url: str | None = None
    address: str | None = None


class CallStartResponse(BaseModel):
    trip_id: str
    call_count: int
    calls: list[dict[str, Any]]


class CallStatusResponse(BaseModel):
    trip_id: str
    trip_status: TripStatus
    call_count: int
    completed_count: int
    calls: list[CallTaskRecord]
    offers: list[HotelOfferRecord] = Field(default_factory=list)
    best_offer_id: str | None = None
    total_negotiated_savings: float = 0.0


class OfferComparisonResponse(BaseModel):
    trip_id: str
    offers: list[HotelOfferRecord]
    best_offer: HotelOfferRecord | None = None
    summary: str
