"""SQLite persistence layer for HiFi Hotel Procurement Agent."""

from __future__ import annotations

import json
import logging
import sqlite3
from pathlib import Path
from typing import Any

logger = logging.getLogger("hifi.db")

DB_PATH = Path(__file__).resolve().parent.parent / "hifi.db"


def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_sqlite_db() -> None:
    """Initializes SQLite database tables if they do not exist."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS trips (
                    id TEXT PRIMARY KEY,
                    user_email TEXT DEFAULT 'baala3536@gmail.com',
                    destination TEXT NOT NULL,
                    check_in TEXT NOT NULL,
                    check_out TEXT NOT NULL,
                    adults INTEGER DEFAULT 2,
                    children INTEGER DEFAULT 0,
                    rooms INTEGER DEFAULT 1,
                    budget_amount REAL DEFAULT 600.0,
                    budget_currency TEXT DEFAULT 'USD',
                    min_rating REAL DEFAULT 4.0,
                    breakfast_required INTEGER DEFAULT 0,
                    free_cancellation_required INTEGER DEFAULT 0,
                    airport_transfer_preferred INTEGER DEFAULT 0,
                    room_upgrade_preferred INTEGER DEFAULT 0,
                    late_checkout_preferred INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'DRAFT',
                    data_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            # Migration: Add user_email column if not already present
            try:
                conn.execute("ALTER TABLE trips ADD COLUMN user_email TEXT DEFAULT 'baala3536@gmail.com'")
            except Exception:
                pass

            conn.execute("""
                CREATE TABLE IF NOT EXISTS candidates (
                    id TEXT NOT NULL,
                    trip_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    phone_number TEXT,
                    rating REAL,
                    data_json TEXT NOT NULL,
                    PRIMARY KEY (id, trip_id)
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS call_tasks (
                    id TEXT NOT NULL,
                    trip_id TEXT NOT NULL,
                    hotel_id TEXT NOT NULL,
                    hotel_name TEXT NOT NULL,
                    status TEXT NOT NULL,
                    data_json TEXT NOT NULL,
                    PRIMARY KEY (id, trip_id)
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS offers (
                    id TEXT NOT NULL,
                    trip_id TEXT NOT NULL,
                    hotel_id TEXT NOT NULL,
                    total_price REAL,
                    negotiated_total REAL,
                    data_json TEXT NOT NULL,
                    PRIMARY KEY (id, trip_id)
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS bookings (
                    id TEXT PRIMARY KEY,
                    trip_id TEXT NOT NULL,
                    hotel_id TEXT NOT NULL,
                    confirmation_status TEXT NOT NULL,
                    data_json TEXT NOT NULL
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS app_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                )
            """)

            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    email TEXT PRIMARY KEY,
                    role TEXT DEFAULT 'user',
                    last_login TEXT NOT NULL
                )
            """)
        logger.info(f"SQLite database initialized at: {DB_PATH}")
    except Exception as e:
        logger.error(f"Error initializing SQLite database: {e}", exc_info=True)
    finally:
        conn.close()


init_sqlite_db()
