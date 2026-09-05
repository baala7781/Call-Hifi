# HiFi

HiFi automates hotel procurement via real phone calls. The product flow is intentionally deterministic: travelers define a trip, discovery ranks candidate hotels, CALL-E verifies availability and terms, a negotiation offer engine compares options, and a human approves before payment and final confirmation.

## Repository layout

- `apps/web` — Next.js application for trip capture, hotel discovery, and offer comparison
- `apps/api` — FastAPI API with deterministic mock orchestration for the MVP
- `packages/shared-types` — shared TypeScript contract for client/server use
- `calle/skills/hifi-hotel-negotiator` — reusable CALL-E contribution scaffold
- `docs` — product and technical guidance

## Local development

### 1) Install frontend deps

```bash
npm install
```

### 2) Start the API

```bash
npm run dev:api
```

### 3) Start the frontend

```bash
npm run dev:web
```

The frontend expects `API_URL` to point at the FastAPI app (`http://localhost:8000` by default).

## Demo flow

1. Create a trip
2. Discover hotels and compare the top results
3. Start hotel calls
4. Poll for statuses and structured offers
5. Select the recommended offer
6. Simulate payment and confirmation

This repository uses a deterministic mock backend to keep the hackathon flow reliable while respecting the requirement that CALL-E be used in the real workflow.
