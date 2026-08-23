# HiFi technical design

## Core flow

1. A traveler completes the trip form.
2. The backend resolves a destination and ranks candidate hotels.
3. The user explicitly approves hotel calls.
4. CALL-E executes real calls using a structured task and result schema.
5. Offer normalization validates the raw evidence and creates comparable opportunities.
6. The best option is selected by deterministic scoring.
7. Simulated payment and final confirmation are handled only after explicit approval.

## Safety rules

- No API keys are exposed to the browser.
- No blocking HTTP requests are allowed during the calling workflow.
- Missing hotel data is represented as `null` or `unknown`.
- The UI must surface explicit user consent for real-world phone actions.

## MVP boundary

The current implementation keeps the core flow deterministic and reliable while using a mock orchestration layer that matches the CALL-E-style contract expected in the project brief.
