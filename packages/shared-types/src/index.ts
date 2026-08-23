export type TripStatus =
  | "DRAFT"
  | "SEARCHING"
  | "CANDIDATES_READY"
  | "CALLING"
  | "CALLS_COMPLETED"
  | "OFFERS_READY"
  | "OFFER_SELECTED"
  | "PAYMENT_PENDING"
  | "PAYMENT_SUCCESS"
  | "CONFIRMING"
  | "CONFIRMED"
  | "FAILED";

export type CallStatus = "queued" | "calling" | "completed" | "failed" | "no_answer";

export interface TripInput {
  destination: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  rooms: number;
  budget_amount: number;
  budget_currency: string;
  min_rating?: number | null;
  breakfast_required?: boolean;
  free_cancellation_required?: boolean;
  airport_transfer_preferred?: boolean;
  room_upgrade_preferred?: boolean;
  late_checkout_preferred?: boolean;
}

export interface TripRecord extends TripInput {
  id: string;
  status: TripStatus;
  created_at: string;
}

export interface HotelCandidate {
  id: string;
  name: string;
  address: string;
  phone_number: string | null;
  rating: number | null;
  review_count: number | null;
  ranking_score?: number;
  score?: number;
  website: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price_level?: string | null;
  base_price_estimate?: number | null;
  discovery_source: string;
  photo_url?: string | null;
}

export interface TranscriptTurn {
  speaker: string;
  text: string;
}

export interface CallTaskRecord {
  id: string;
  trip_id: string;
  hotel_id: string;
  hotel_name: string;
  phone_number?: string | null;
  purpose: "hotel_discovery" | "hotel_negotiation" | "hotel_confirmation";
  calle_call_id?: string | null;
  status: CallStatus;
  task_completed?: boolean | null;
  completion_confidence?: number | null;
  evidence: string[];
  transcript_available: boolean;
  transcript: TranscriptTurn[];
  raw_structured_result?: Record<string, unknown>;
  duration_seconds: number;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
}

export interface HotelOfferRecord {
  id: string;
  trip_id: string;
  hotel_id: string;
  hotel_name: string;
  call_task_id?: string | null;
  available: boolean;
  room_type?: string | null;
  max_guests?: number | null;
  price_per_night?: number | null;
  total_price?: number | null;
  currency: string;
  taxes_included?: boolean | null;
  mandatory_fees?: number | null;
  breakfast_included?: boolean | null;
  breakfast_price?: number | null;
  airport_transfer_available?: boolean | null;
  airport_transfer_price?: number | null;
  free_cancellation?: boolean | null;
  cancellation_deadline?: string | null;
  advance_payment_required?: boolean | null;
  advance_payment_amount?: number | null;
  extra_bed_available?: boolean | null;
  extra_bed_price?: number | null;
  early_checkin_available?: boolean | null;
  late_checkout_available?: boolean | null;
  original_total?: number | null;
  negotiated_total?: number | null;
  negotiated_savings?: number | null;
  special_benefits: string[];
  offer_notes?: string | null;
  confidence?: number | null;
  score: number;
  recommendation_reason?: string | null;
  is_best_deal?: boolean;
}

export interface BookingRecord {
  id: string;
  trip_id: string;
  hotel_id: string;
  hotel_name: string;
  offer_id: string;
  payment_status: "pending" | "simulated_success" | "failed";
  confirmation_status: "pending" | "confirming" | "confirmed" | "failed";
  confirmation_number?: string | null;
  failure_reason?: string | null;
  confirmation_notes?: string | null;
  final_amount: number;
  currency: string;
  confirmation_call_task_id?: string | null;
  confirmed_inclusions: string[];
  check_in?: string | null;
  check_out?: string | null;
  guests_summary?: string | null;
  created_at: string;
  confirmed_at?: string | null;
}

export interface CallStatusResponse {
  trip_id: string;
  trip_status: TripStatus;
  call_count: number;
  completed_count: number;
  calls: CallTaskRecord[];
  offers: HotelOfferRecord[];
  best_offer_id?: string | null;
  total_negotiated_savings: number;
}
