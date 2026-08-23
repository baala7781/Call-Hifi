# CALL-E Integration Guide

HiFi leverages CALL-E as the real-world voice execution layer for hotel stay verification, direct rate negotiation, and booking confirmation.

## Architecture

```text
       ┌───────────────────────────────┐
       │          FastAPI App          │
       └──────────────┬────────────────┘
                      │
       ┌──────────────┴────────────────┐
       │   CalleService (Python SDK)   │
       └──────────────┬────────────────┘
                      │
            Outbound Phone Calls
                      │
                      ▼
       ┌───────────────────────────────┐
       │      Hotel Front Desks        │
       └──────────────┬────────────────┘
                      │
         Structured Result Payloads
                      │
                      ▼
       ┌───────────────────────────────┐
       │    Offer Normalization &      │
       │       Scoring Engine          │
       └───────────────────────────────┘
```

## Key Capabilities

1. **Non-Blocking Background Tasks**: Fast API responses with non-blocking async calling workers.
2. **Deterministic Schemas**: Using JSON Schemas for rigorous type safety on both discovery/negotiation calls and confirmation calls.
3. **Structured Evidence & Transcripts**: CALL-E outputs are validated against business rules (no negative prices, negotiation cannot exceed original total, max occupancy checks).
4. **Safety Boundaries**: Zero financial credentials over the phone; explicit human consent required before placing calls and confirming reservations.
