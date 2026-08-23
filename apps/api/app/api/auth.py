"""Authentication and authorization API router."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.db import get_db_connection

logger = logging.getLogger("hifi.auth")
router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: str
    password: str = ""


class LoginResponse(BaseModel):
    token: str
    email: str
    role: str
    message: str


def is_email_allowed(email: str) -> bool:
    """Checks if the given email is permitted by ALLOWED_EMAILS config."""
    configured = (settings.allowed_emails or "baala3536@gmail.com").strip().lower()
    if configured == "*" or not configured:
        return True
    
    allowed_list = [e.strip() for e in configured.split(",") if e.strip()]
    return email.strip().lower() in allowed_list


def verify_credentials(email: str, password: str) -> bool:
    """Verifies email and password against authorized admin credentials."""
    clean_email = email.strip().lower()
    clean_pw = password.strip()
    
    # Check if email is in allowed list
    if not is_email_allowed(clean_email):
        return False

    expected_pw = (settings.admin_password or "1234567890").strip()
    return clean_pw == expected_pw


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest) -> LoginResponse:
    """Authenticates user via email and password."""
    email = payload.email.strip().lower()
    password = payload.password.strip()

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email format")

    if not verify_credentials(email, password):
        logger.warning(f"Failed login attempt for email: {email}")
        raise HTTPException(
            status_code=401,
            detail="Access restricted: Invalid email or password. Only authorized accounts may access the application.",
        )

    token = f"hifi_jwt_{uuid4().hex}"
    conn = get_db_connection()
    try:
        with conn:
            conn.execute(
                """
                INSERT INTO users (email, role, last_login)
                VALUES (?, 'authorized_user', ?)
                ON CONFLICT(email) DO UPDATE SET last_login = excluded.last_login
                """,
                (email, datetime.now(timezone.utc).isoformat()),
            )
    finally:
        conn.close()

    logger.info(f"User login successful: {email}")
    return LoginResponse(
        token=token,
        email=email,
        role="authorized_user",
        message="Authentication successful",
    )


@router.get("/me")
async def get_me(email: str | None = None) -> dict[str, Any]:
    """Returns active user session info."""
    if email and is_email_allowed(email):
        return {
            "authenticated": True,
            "email": email,
            "role": "authorized_user",
        }
    return {
        "authenticated": False,
        "email": None,
        "role": "anonymous",
    }
