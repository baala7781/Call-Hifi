"""HiFi — AI Hotel Procurement & Negotiation Agent FastAPI Server."""

from __future__ import annotations

import logging
import os
from typing import Any
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.bookings import router as bookings_router
from app.api.calls import router as calls_router
from app.api.debug import router as debug_router
from app.api.hotels import router as hotels_router
from app.api.offers import router as offers_router
from app.api.settings_api import router as settings_router
from app.api.trips import router as trips_router
from app.config import settings

# Configure rich logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("hifi.server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Prints rich startup banner showing active voice provider and settings."""
    active_prov = (os.getenv("VOICE_PROVIDER") or settings.voice_provider or "calle").upper()
    calle_key = os.getenv("CALLE_API_KEY") or settings.calle_api_key or ""
    phone = os.getenv("TEST_PHONE_NUMBER") or settings.test_phone_number or ""

    banner = f"""
======================================================================
  🎙️  HIFI VOICE AGENT ENGINE - READY
======================================================================
  🎯 ACTIVE PROVIDER  : {active_prov}
  📞 TARGET PHONE     : {phone}
  🔑 CALL-E API KEY   : {'PRESENT (' + calle_key[:8] + '...)' if calle_key else 'NOT CONFIGURED'}
  ⚙️  DEMO MODE        : {settings.demo_mode}
======================================================================
"""
    print(banner)
    logger.info(f"HiFi Server started. Active voice provider: {active_prov}")
    yield
    logger.info("HiFi Server shutting down.")


app = FastAPI(
    title=settings.app_name,
    description="Autonomous AI Hotel Procurement & Negotiation Agent powered by CALL-E telephony and Google Gemini.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Next.js web application and any client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers under /api/v1
app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(settings_router, prefix=settings.api_prefix)
app.include_router(trips_router, prefix=settings.api_prefix)
app.include_router(hotels_router, prefix=settings.api_prefix)
app.include_router(calls_router, prefix=settings.api_prefix)
app.include_router(offers_router, prefix=settings.api_prefix)
app.include_router(bookings_router, prefix=settings.api_prefix)
app.include_router(debug_router, prefix=settings.api_prefix)


@app.get("/health")
@app.get("/api/v1/health")
async def healthcheck() -> dict[str, Any]:
    """Healthcheck endpoint reporting active voice provider and system status."""
    return {
        "status": "ok",
        "app": settings.app_name,
        "demo_mode": str(settings.demo_mode),
        "voice_provider": "calle",
        "calle_configured": bool(os.getenv("CALLE_API_KEY") or settings.calle_api_key),
    }
