# Codex Deployment Handoff

## Goal

Maintain and deploy this mobile-first, coach-driven AFT Workout Tracker as a static Progressive Web App on GitHub Pages from `tylerdmcanally/PT-tracker`.

## Current training constraint

The program must work in a standard commercial gym. Do not require a weighted sled, turf lane, or dedicated Army Fitness Test equipment.

Day 3 is **Lower Strength and Gym Conditioning**. Its current program-version limit is exactly two conditioning rounds:

1. Farmer carry: 45 lb per hand for about 30 seconds
2. Lateral step-ups: 6 per side
3. Bike, rower, or elliptical: 45 seconds hard
4. Rest: 2 minutes 30 seconds

The current block also includes a low-fatigue Test Skill Practice group. Legacy `sledLoad` fields remain readable in historical summaries, but no new sled input is shown.

## Current program model

`program-config.js` is the single source of truth for program metadata, daily prescriptions, stable exercise IDs, target RPEs, coaching notes, run stage, and recovery work. The active program is **AFT Foundation Block 1**, version **1.2**, effective **2026-07-29**.

Do not add an automatic coaching or load-progression algorithm. ChatGPT is the coach; Codex updates `program-config.js` after the user reviews recommendations.

Every saved workout stores program metadata and a complete `prescriptionSnapshot`. Editing an old workout renders that snapshot—or its own legacy saved exercise list—not the current program. This is required so a later coach update never changes historical prescriptions.

Run training defines 12 possible stages, but the current stage is read-only and coach-directed. Day 1 and Day 4 currently use Stage 1. A user can still record a different actual stage inside a session. Completion counts are informational and never advance the program.

Run/walk and continuous-run cards include an offline timer with a large current-phase countdown, round and segment tracking, next-segment preview, pause/resume, skip, reset, sound/vibration transitions, and Screen Wake Lock support when the browser provides it. Every interval round starts with walking and then changes to running. Completing the timer fills completed rounds and planned elapsed time and marks the run exercise done.

New exercise cards show the most recent result for the same stable ID as a reference. Completion status, exercise RPE, pain, and notes are never copied forward.

Trap-bar deadlifts default to **Plates per side + bar**, with 45, 55, 60, and custom bar choices. The calculation is `bar + (plate weight per side × 2)`. Other bar-based variations can use combined plates plus bar or total weight. Legacy records without a mode remain direct totals; never infer a bar weight for them.

Set-based strength and calisthenics exercises use mobile-friendly selectors. The prescribed set count is selected by default, the user can reduce or increase it within the available range, and each visible set has its own reps selector plus an `Other…` numeric fallback. Existing comma-separated `reps` values remain compatible when older workouts are edited or exported.

An optional Recovery Session logs modality, duration, RPE, pre/post soreness, and notes. It appears in history and exports but is ignored by next-day rotation and primary-workout counts.

Every day displays a specific active warm-up and exercises are numbered in intended completion order. Day 1 keeps its full walk/run block after strength work because it is conditioning rather than the warm-up. Day 4 begins with its walk/run session after a separate walking and dynamic warm-up. Air squats are not in the current block.

Blank primary workouts select the day after the most recent primary workout using session date and then `updatedAt`; recovery is ignored. Dates use device-local components. **New Workout** and the post-save reset apply these defaults. Editing preserves the saved date, day, and prescription.

Session tracking separates pre-session soreness, readiness, pain during training, pain location, and post-session notes. Recovery also records post-session soreness. The old `painScore` field remains explicitly labeled as legacy pain/discomfort and is never reinterpreted.

The optional session timer persists across reloads, supports pause/resume, fills duration only when manual duration is blank, and does not mark exercises complete. The walk/run timer remains separate.

Progress and exports include Monday–Sunday hand-release push-up volume and front-plank time. Side-plank time is excluded from front-plank totals. Markdown exports show planned versus completed results and end with the exact coaching request in `app.js`.

The PWA uses versioned CSS/JavaScript/config URLs and network-first same-origin fetching with offline cache fallback. When a newly activated service worker takes control, a persistent **Reload update** banner appears. Reloading first autosaves the active draft.

## Deployment tasks

1. Run the app through a local HTTP server.
2. Check JavaScript syntax and browser console errors.
3. Run `node tests/app-model.test.cjs`.
4. Test saving, draft recovery, editing legacy entries, deleting/restoring, Markdown export, JSON backup/import, and CSV export.
5. Confirm the manifest and service worker load correctly.
6. Verify offline behavior after the first load.
7. In repository Pages settings, deploy the `main` branch from `/ (root)`.
8. Test iPhone Safari and Add to Home Screen.
9. Return the production HTTPS URL and any GitHub setup instructions.

## Data model

The canonical workout array stays under the existing `aftWorkoutEntries.v1` localStorage key for compatibility. The app adds:

- `aftWorkoutDraft.v1` — autosaved active form
- `aftSessionTimer.v1` — reload-safe total session timer
- `aftWorkoutSnapshots.v1` — up to five local restore points
- `aftBackupMeta.v1` — last downloaded JSON backup metadata
- `aftDataVersion.v1` — app data migration marker

The app requests persistent browser storage on demand. This reduces eviction risk but does not sync across devices. JSON backup/import remains the only portable, device-loss-safe copy.
