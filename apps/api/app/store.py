"""Persistent state store backed by SQLite database."""

from __future__ import annotations

import json
import logging
from typing import Any
from app.db import get_db_connection, init_sqlite_db
from app.models import BookingRecord, CallTaskRecord, HotelCandidate, HotelOfferRecord, TripRecord

logger = logging.getLogger("hifi.store")


class PersistentDictStore:
    """Wrapper that provides dict-like interface while persisting state to SQLite."""

    def __init__(self, table_name: str, model_cls: Any, is_list: bool = False, foreign_key: str = "trip_id") -> None:
        self.table_name = table_name
        self.model_cls = model_cls
        self.is_list = is_list
        self.foreign_key = foreign_key

    def get(self, key: str, default: Any = None) -> Any:
        conn = get_db_connection()
        try:
            if self.is_list:
                rows = conn.execute(
                    f"SELECT data_json FROM {self.table_name} WHERE {self.foreign_key} = ?",
                    (key,),
                ).fetchall()
                if not rows:
                    return default if default is not None else []
                return [self.model_cls.model_validate_json(r["data_json"]) for r in rows]
            else:
                row = conn.execute(
                    f"SELECT data_json FROM {self.table_name} WHERE id = ?",
                    (key,),
                ).fetchone()
                if not row:
                    return default
                return self.model_cls.model_validate_json(row["data_json"])
        except Exception as e:
            logger.error(f"Error fetching from {self.table_name}: {e}")
            return default
        finally:
            conn.close()

    def __getitem__(self, key: str) -> Any:
        val = self.get(key)
        if val is None:
            raise KeyError(key)
        return val

    def __setitem__(self, key: str, value: Any) -> None:
        conn = get_db_connection()
        try:
            with conn:
                if self.is_list:
                    # Clear existing items for this foreign key
                    conn.execute(f"DELETE FROM {self.table_name} WHERE {self.foreign_key} = ?", (key,))
                    if isinstance(value, list):
                        for item in value:
                            item_id = getattr(item, "id", None)
                            data_json = item.model_dump_json() if hasattr(item, "model_dump_json") else json.dumps(item)
                            
                            if self.table_name == "candidates":
                                conn.execute(
                                    "INSERT OR REPLACE INTO candidates (id, trip_id, name, phone_number, rating, data_json) VALUES (?, ?, ?, ?, ?, ?)",
                                    (item_id, key, getattr(item, "name", ""), getattr(item, "phone_number", ""), getattr(item, "rating", 4.0), data_json),
                                )
                            elif self.table_name == "call_tasks":
                                conn.execute(
                                    "INSERT OR REPLACE INTO call_tasks (id, trip_id, hotel_id, hotel_name, status, data_json) VALUES (?, ?, ?, ?, ?, ?)",
                                    (item_id, key, getattr(item, "hotel_id", ""), getattr(item, "hotel_name", ""), getattr(item, "status", "queued"), data_json),
                                )
                            elif self.table_name == "offers":
                                conn.execute(
                                    "INSERT OR REPLACE INTO offers (id, trip_id, hotel_id, total_price, negotiated_total, data_json) VALUES (?, ?, ?, ?, ?, ?)",
                                    (item_id, key, getattr(item, "hotel_id", ""), getattr(item, "total_price", None), getattr(item, "negotiated_total", None), data_json),
                                )
                else:
                    item_id = key
                    data_json = value.model_dump_json() if hasattr(value, "model_dump_json") else json.dumps(value)
                    
                    if self.table_name == "trips":
                        conn.execute(
                            """
                            INSERT INTO trips (
                                id, user_email, destination, check_in, check_out, adults, children, rooms,
                                budget_amount, budget_currency, min_rating, breakfast_required,
                                free_cancellation_required, airport_transfer_preferred,
                                room_upgrade_preferred, late_checkout_preferred, status,
                                data_json, created_at, updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(id) DO UPDATE SET
                                user_email=excluded.user_email,
                                status=excluded.status,
                                data_json=excluded.data_json,
                                updated_at=excluded.updated_at
                            """,
                            (
                                item_id,
                                getattr(value, "user_email", ""),
                                getattr(value, "destination", ""),
                                str(getattr(value, "check_in", "")),
                                str(getattr(value, "check_out", "")),
                                getattr(value, "adults", 2),
                                getattr(value, "children", 0),
                                getattr(value, "rooms", 1),
                                getattr(value, "budget_amount", 600.0),
                                getattr(value, "budget_currency", "USD"),
                                getattr(value, "min_rating", 4.0),
                                int(getattr(value, "breakfast_required", False)),
                                int(getattr(value, "free_cancellation_required", False)),
                                int(getattr(value, "airport_transfer_preferred", False)),
                                int(getattr(value, "room_upgrade_preferred", False)),
                                int(getattr(value, "late_checkout_preferred", False)),
                                getattr(value, "status", "DRAFT"),
                                data_json,
                                str(getattr(value, "created_at", "")),
                                str(getattr(value, "updated_at", "")),
                            ),
                        )
                    elif self.table_name == "bookings":
                        conn.execute(
                            """
                            INSERT INTO bookings (id, trip_id, hotel_id, confirmation_status, data_json)
                            VALUES (?, ?, ?, ?, ?)
                            ON CONFLICT(id) DO UPDATE SET
                                confirmation_status=excluded.confirmation_status,
                                data_json=excluded.data_json
                            """,
                            (
                                item_id,
                                getattr(value, "trip_id", ""),
                                getattr(value, "hotel_id", ""),
                                getattr(value, "confirmation_status", "pending"),
                                data_json,
                            ),
                        )
        except Exception as e:
            logger.error(f"Error writing to {self.table_name}: {e}", exc_info=True)
        finally:
            conn.close()

    def __contains__(self, key: str) -> bool:
        conn = get_db_connection()
        try:
            field = self.foreign_key if self.is_list else "id"
            row = conn.execute(f"SELECT 1 FROM {self.table_name} WHERE {field} = ? LIMIT 1", (key,)).fetchone()
            return row is not None
        finally:
            conn.close()


class StateStore:
    """Centralized persistent state store for HiFi backend."""

    def __init__(self) -> None:
        init_sqlite_db()
        self.trips = PersistentDictStore("trips", TripRecord, is_list=False)
        self.candidates = PersistentDictStore("candidates", HotelCandidate, is_list=True)
        self.call_tasks = PersistentDictStore("call_tasks", CallTaskRecord, is_list=True)
        self.offers = PersistentDictStore("offers", HotelOfferRecord, is_list=True)
        self.bookings = PersistentDictStore("bookings", BookingRecord, is_list=False)

    def update_task_record(self, trip_id: str, task: CallTaskRecord) -> None:
        """Saves a single task record update immediately to SQLite."""
        conn = get_db_connection()
        try:
            with conn:
                data_json = task.model_dump_json() if hasattr(task, "model_dump_json") else json.dumps(task)
                conn.execute(
                    """
                    INSERT OR REPLACE INTO call_tasks (id, trip_id, hotel_id, hotel_name, status, data_json)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (task.id, trip_id, task.hotel_id, task.hotel_name, task.status, data_json),
                )
        except Exception as e:
            logger.error(f"Error updating task record {task.id}: {e}")
        finally:
            conn.close()


db = StateStore()

__all__ = ["db", "StateStore"]
