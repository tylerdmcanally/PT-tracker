# AFT Workout Tracker — Codex Instructions

This repository is the canonical AFT Workout Tracker application. The application already lives at the repository root. Do not create an `app/` directory, move or duplicate the tracker, or replace its architecture.

Private coaching state is maintained in the separate private repository `tylerdmcanally/aft-coaching`, normally available as the sibling directory `../aft-coaching`. This application repository must contain only app source, tests, build/deployment configuration, privacy guardrails, and the minimum active prescription data required at runtime.

The private coaching repository is canonical for training, recovery, Health-snapshot, and nutrition state. This repository is canonical only for application implementation and the minimum active runtime prescription. Routine current-day Apple Health data reaches local Codex through the separate private `tylerdmcanally/aft-health-ingest` Worker/KV cache when reasonably fresh; the local `health-auto-export` MCP server remains the optional live/high-resolution refresh path. Both belong exclusively to the private coaching workflow, not in this PWA. Persisted coaching-repository Health snapshots are durable historical fallback context. Codex conversations are temporary and are never a source of truth.

## Before changing application code

1. Read `CODEX-HANDOFF.md` completely.
2. Inspect the existing working code and tests at the repository root.
3. For a coach-directed prescription update, read `../aft-coaching/AGENTS.md`, `../aft-coaching/program/CURRENT_PROGRAM.md`, and `../aft-coaching/handoffs/APP_UPDATE.md` when the sibling repository is available.
4. Surface any material mismatch instead of silently reconciling it.

## Application rules

- Preserve the mobile-first, offline-capable, local-first behavior.
- Preserve stable exercise and variation IDs, equipment comparability, coach-readable exports, and immutable historical prescription snapshots and results.
- All progression remains coach-directed. Never add automatic progression for lifts, runs, calisthenics, or conditioning.
- Seated and standing pulldowns are distinct. Machine-stack values are comparable only on the same setup.
- TANK M4 Level 3 is equipment metadata, never pounds.
- Preserve programmed interval time separately from total elapsed time, along with run speeds, heart rate, pain, RPE, and notes when entered.
- Preserve the existing optional Firebase backup unless explicitly asked to change it. Drafts and timers remain device-local.
- Keep the interface clean. Do not add timers, supersets UI, recovery scores, ECG/headache/body-composition tracking, extra soreness fields, automatic progression, extra runs, or navigation without a demonstrated workflow need.
- Do not add Apple Health UI, `aft-health-ingest` access, or `health-auto-export` MCP integration merely because local Codex can use those sources. Apple Health transport, interpretation, and normalized snapshots belong in the private coaching workflow.

## Prescription synchronization

Only apply a prescription change after it has been recorded in the private coaching repository. Update only the matching active prescription data in `program-config.js`, preserve all historical definitions and snapshots, and run the relevant application tests.

If a workout produces no coach-directed prescription change, do not modify application code or increment the program version.

## Privacy boundary

GitHub Pages publishes this repository root. Never copy, link, stage, embed, cache, or deploy private coaching content from the sibling repository.

Private `context/`, `program/`, `workouts/`, `health/`, `nutrition/`, `handoffs/`, and `templates/` trees must not exist in this repository or appear in `index.html`, `app.js`, `program-config.js` beyond the minimum active prescription, `styles.css`, `icons/`, the service-worker asset list, build output, or any other publicly served artifact.

Run `node tests/privacy-boundary.test.cjs` with the application tests before deployment.
