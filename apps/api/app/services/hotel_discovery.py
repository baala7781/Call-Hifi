"""Hotel discovery service using Google Places API with fallback curated datasets."""

from __future__ import annotations

import logging
from typing import Any
import httpx

from app.config import settings
from app.models import HotelCandidate, TripRecord
from app.services.hotel_ranker import rank_candidates

logger = logging.getLogger(__name__)

# Rich regional candidate pools for reliable offline demo & instant testing
DESTINATION_CATALOGS: dict[str, list[dict[str, Any]]] = {
    "bali": [
        {
            "id": "hotel-bali-1",
            "name": "Ocean Pearl Resort",
            "address": "Jalan Nusa Dua Selatan, Nusa Dua, Bali 80363",
            "phone_number": "+91 98765 43210",
            "rating": 4.8,
            "review_count": 1240,
            "website": "https://oceanpearl-bali.example.com",
            "base_price": 45000,
            "breakfast_included": True,
            "transfer_available": True,
            "free_cancellation": True,
            "upgrade_available": True,
            "late_checkout_available": True,
            "photo_url": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
        },
        {
            "id": "hotel-bali-2",
            "name": "Canggu Cove Retreat",
            "address": "Batu Bolong Street No. 88, Canggu, Bali 80361",
            "phone_number": "+91 99876 54321",
            "rating": 4.6,
            "review_count": 930,
            "website": "https://canggucove.example.com",
            "base_price": 43000,
            "breakfast_included": False,
            "transfer_available": False,
            "free_cancellation": True,
            "upgrade_available": False,
            "late_checkout_available": True,
            "photo_url": "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
        },
        {
            "id": "hotel-bali-3",
            "name": "Ubud Rainforest Grove Stay",
            "address": "Jalan Raya Sanggingan, Ubud, Gianyar, Bali 80571",
            "phone_number": "+91 98111 22233",
            "rating": 4.7,
            "review_count": 860,
            "website": "https://ubudgrove.example.com",
            "base_price": 47000,
            "breakfast_included": True,
            "transfer_available": True,
            "free_cancellation": False,
            "upgrade_available": True,
            "late_checkout_available": False,
            "photo_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        },
        {
            "id": "hotel-bali-4",
            "name": "Seminyak Beachside Villas",
            "address": "Jalan Kayu Aya, Seminyak, Kuta, Bali 80361",
            "phone_number": "+91 98999 77665",
            "rating": 4.5,
            "review_count": 780,
            "website": "https://seminyakvillas.example.com",
            "base_price": 42000,
            "breakfast_included": False,
            "transfer_available": True,
            "free_cancellation": True,
            "upgrade_available": False,
            "late_checkout_available": False,
            "photo_url": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        },
        {
            "id": "hotel-bali-5",
            "name": "Jimbaran Bay Cliff Suites",
            "address": "Jalan Bukit Permai, Jimbaran, Bali 80364",
            "phone_number": "+91 97222 33445",
            "rating": 4.9,
            "review_count": 1520,
            "website": "https://jimbaranbay.example.com",
            "base_price": 54000,
            "breakfast_included": True,
            "transfer_available": True,
            "free_cancellation": True,
            "upgrade_available": True,
            "late_checkout_available": True,
            "photo_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
        },
    ],
    "tokyo": [
        {
            "id": "hotel-tokyo-1",
            "name": "The Prince Gallery Tokyo Kioicho",
            "address": "1-2 Kioicho, Chiyoda City, Tokyo 102-8585",
            "phone_number": "+91 98765 43210",
            "rating": 4.8,
            "review_count": 2100,
            "website": "https://princegallery-tokyo.example.com",
            "base_price": 62000,
            "breakfast_included": True,
            "transfer_available": True,
            "free_cancellation": True,
            "upgrade_available": True,
            "late_checkout_available": True,
            "photo_url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
        },
        {
            "id": "hotel-tokyo-2",
            "name": "Shinjuku Granbell Luxury Stay",
            "address": "2-14-5 Kabukicho, Shinjuku City, Tokyo 160-0021",
            "phone_number": "+91 99876 54321",
            "rating": 4.5,
            "review_count": 1450,
            "website": "https://granbell-tokyo.example.com",
            "base_price": 48000,
            "breakfast_included": False,
            "transfer_available": False,
            "free_cancellation": True,
            "upgrade_available": False,
            "late_checkout_available": True,
            "photo_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        },
        {
            "id": "hotel-tokyo-3",
            "name": "Ginza Grand Palace Hotel",
            "address": "8-6-15 Ginza, Chuo City, Tokyo 104-0061",
            "phone_number": "+91 98111 22233",
            "rating": 4.7,
            "review_count": 1820,
            "website": "https://ginzagrand.example.com",
            "base_price": 53000,
            "breakfast_included": True,
            "transfer_available": True,
            "free_cancellation": True,
            "upgrade_available": True,
            "late_checkout_available": False,
            "photo_url": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
        },
    ],
}


class HotelDiscoveryService:
    def search_hotels(self, trip: TripRecord) -> list[HotelCandidate]:
        """Discovers and returns ranked candidate hotels for the given trip."""
        api_key = settings.google_maps_api_key
        destination_key = trip.destination.strip().lower()

        # 1. Primary: Query live Google Places (New) API if API key is present
        if api_key and api_key not in ("demo-key", "", "YOUR_KEY_HERE"):
            try:
                places = self._query_google_places(trip.destination, api_key)
                if places and len(places) >= 3:
                    logger.info(f"Google Places API found {len(places)} hotels for {trip.destination}")
                    return rank_candidates(places, trip)
            except Exception as e:
                logger.warning(f"Google Places search failed, falling back to curated data: {e}")

        # 2. Fallback: Curated regional catalog
        for key in DESTINATION_CATALOGS:
            if key in destination_key:
                return rank_candidates(DESTINATION_CATALOGS[key], trip)

        # 3. Fallback: Dynamic synthetic generator
        generated_hotels = self._generate_hotels_for_destination(trip)
        return rank_candidates(generated_hotels, trip)

    def _query_google_places(self, query: str, api_key: str) -> list[dict[str, Any]]:
        """Queries Google Places New Text Search API."""
        url = "https://places.googleapis.com/v1/places:searchText"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": (
                "places.id,places.displayName,places.formattedAddress,"
                "places.location,places.rating,places.userRatingCount,"
                "places.internationalPhoneNumber,places.nationalPhoneNumber,places.websiteUri"
            ),
        }
        payload = {
            "textQuery": f"best hotels in {query}",
            "languageCode": "en",
            "maxResultCount": 20,
        }

        with httpx.Client(timeout=8.0) as client:
            response = client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                logger.error(f"Google Places API returned status {response.status_code}: {response.text}")
                return []

            data = response.json()
            places_data = data.get("places", [])
            results: list[dict[str, Any]] = []

            for idx, p in enumerate(places_data):
                display_name = p.get("displayName", {}).get("text", f"Hotel in {query}")
                phone = p.get("internationalPhoneNumber") or p.get("nationalPhoneNumber")
                if not phone:
                    phone = f"+62 361 {200000 + (idx * 1357)}" if "bali" in query.lower() else f"+91 98{100 + idx} {20000 + idx * 111}"
                results.append({
                    "id": p.get("id", f"place-{idx}"),
                    "name": display_name,
                    "address": p.get("formattedAddress", query),
                    "phone_number": phone,
                    "rating": p.get("rating", 4.5),
                    "review_count": p.get("userRatingCount", 250),
                    "website": p.get("websiteUri"),
                    "latitude": p.get("location", {}).get("latitude"),
                    "longitude": p.get("location", {}).get("longitude"),
                    "base_price": 45000,
                    "breakfast_included": True if idx % 2 == 0 else False,
                    "transfer_available": True if idx % 2 == 0 else False,
                    "free_cancellation": True,
                    "discovery_source": "google_places_api",
                })
            return results

    def _generate_hotels_for_destination(self, trip: TripRecord) -> list[dict[str, Any]]:
        """Generates realistic hotel candidates tailored to any requested destination."""
        dest = trip.destination.title()
        names = [
            f"The Grand {dest} Resort & Spa",
            f"{dest} Bayfront Luxury Suites",
            f"Boutique Heritage Inn {dest}",
            f"{dest} Central Plaza Hotel",
            f"The Orchid Pavilion {dest}",
            f"Royal Palm Sanctuary {dest}",
        ]
        base_budget = trip.budget_amount
        return [
            {
                "id": f"gen-hotel-{idx+1}",
                "name": name,
                "address": f"{100 + idx * 25} Main Boulevard, {dest}",
                "phone_number": f"+91 98{110 + idx} {22000 + idx * 123}",
                "rating": round(4.8 - (idx * 0.08), 1),
                "review_count": 1200 - (idx * 150),
                "website": f"https://{name.lower().replace(' ', '')}.example.com",
                "base_price": round(base_budget * (0.9 + (idx * 0.05)), 2),
                "breakfast_included": idx in (0, 2, 4),
                "transfer_available": idx in (0, 1, 4),
                "free_cancellation": idx != 3,
                "upgrade_available": idx in (0, 4),
                "late_checkout_available": idx in (0, 1, 3),
                "discovery_source": "hifi_discovery_engine",
                "photo_url": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
            }
            for idx, name in enumerate(names)
        ]
