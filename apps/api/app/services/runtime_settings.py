"""Centralized runtime settings accessor synced with SQLite and .env."""

from __future__ import annotations

import os
from app.config import settings
from app.db import get_db_connection


def get_runtime_setting(key: str, default: str) -> str:
    """Reads setting from SQLite app_settings table or falls back to default."""
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT value FROM app_settings WHERE key = ?", (key,)).fetchone()
        if row:
            return row["value"]
        return default
    except Exception:
        return default
    finally:
        conn.close()


def set_runtime_setting(key: str, value: str) -> None:
    """Writes setting to SQLite app_settings table."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute(
                "INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                (key, value),
            )
    finally:
        conn.close()


def is_demo_mode() -> bool:
    """Returns True if Demo Mode is currently active, False for Production."""
    # Check SQLite first
    val = get_runtime_setting("demo_mode", "")
    if val:
        return val.lower() in ("true", "1", "yes")
    # Fallback to env
    env_val = os.getenv("DEMO_MODE", "false").lower()
    return env_val in ("true", "1", "yes")


def get_test_phone_number() -> str:
    """Returns the active test phone number."""
    val = get_runtime_setting("test_phone_number", "")
    if val:
        return val
    return os.getenv("TEST_PHONE_NUMBER", "")


def get_active_voice_provider_name() -> str:
    """Returns 'calle'."""
    return "calle"
