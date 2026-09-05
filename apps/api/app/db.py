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
                    user_email TEXT DEFAULT '',
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
                conn.execute("ALTER TABLE trips ADD COLUMN user_email TEXT DEFAULT ''")
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


def seed_default_history_if_empty() -> None:
    """Seeds 4 clean, verified historical trips with call transcripts and offers if database is empty upon deployment."""
    conn = get_db_connection()
    try:
        count = conn.execute("SELECT COUNT(*) as c FROM trips").fetchone()["c"]
        if count > 0:
            return

        seed_file = Path(__file__).resolve().parent / "seed_history.json"
        if not seed_file.exists():
            return

        with open(seed_file, "r") as f:
            data = json.load(f)

        with conn:
            for t in data.get("trips", []):
                conn.execute(
                    """INSERT OR IGNORE INTO trips (id, user_email, destination, check_in, check_out, adults, children, rooms, budget_amount, budget_currency, min_rating, breakfast_required, free_cancellation_required, airport_transfer_preferred, room_upgrade_preferred, late_checkout_preferred, status, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        t["id"], t.get("user_email", ""), t["destination"], t["check_in"], t["check_out"],
                        t.get("adults", 2), t.get("children", 0), t.get("rooms", 1), t.get("budget_amount", 600.0),
                        t.get("budget_currency", "USD"), t.get("min_rating", 4.0), t.get("breakfast_required", 0),
                        t.get("free_cancellation_required", 0), t.get("airport_transfer_preferred", 0),
                        t.get("room_upgrade_preferred", 0), t.get("late_checkout_preferred", 0),
                        t.get("status", "OFFERS_READY"), t["data_json"], t["created_at"], t["updated_at"]
                    )
                )
            for c in data.get("candidates", []):
                conn.execute(
                    """INSERT OR IGNORE INTO candidates (id, trip_id, name, phone_number, rating, data_json) VALUES (?, ?, ?, ?, ?, ?)""",
                    (c["id"], c["trip_id"], c["name"], c.get("phone_number"), c.get("rating"), c["data_json"])
                )
            for ct in data.get("call_tasks", []):
                conn.execute(
                    """INSERT OR IGNORE INTO call_tasks (id, trip_id, hotel_id, hotel_name, status, data_json) VALUES (?, ?, ?, ?, ?, ?)""",
                    (ct["id"], ct["trip_id"], ct["hotel_id"], ct["hotel_name"], ct["status"], ct["data_json"])
                )
            for o in data.get("offers", []):
                conn.execute(
                    """INSERT OR IGNORE INTO offers (id, trip_id, hotel_id, total_price, negotiated_total, data_json) VALUES (?, ?, ?, ?, ?, ?)""",
                    (o["id"], o["trip_id"], o["hotel_id"], o.get("total_price"), o.get("negotiated_total"), o["data_json"])
                )
            for b in data.get("bookings", []):
                conn.execute(
                    """INSERT OR IGNORE INTO bookings (id, trip_id, hotel_id, confirmation_status, data_json) VALUES (?, ?, ?, ?, ?)""",
                    (b["id"], b["trip_id"], b["hotel_id"], b["confirmation_status"], b["data_json"])
                )
        logger.info("Successfully seeded verified historical calls/trips into SQLite.")
    except Exception as e:
        logger.warning(f"Failed to seed default history: {e}")
    finally:
        conn.close()


init_sqlite_db()
seed_default_history_if_empty()
