# Codex Deployment Handoff

## Goal

Review, test, and deploy this mobile-first AFT Workout Tracker as a static Progressive Web App on GitHub Pages from `tylerdmcanally/PT-tracker`.

## Current training constraint

The program must work in a standard commercial gym. Do not require a weighted sled, turf lane, or dedicated Army Fitness Test equipment.

Day 3 is now **Lower Strength + Gym Conditioning**. Its conditioning circuit uses:

1. Dumbbell reverse lunges
2. Farmer carries or heavy static dumbbell holds
3. Lateral step-ups
4. A 45–60 second hard interval on a bike, rower, elliptical, or treadmill
5. Two to three minutes of recovery

The app logs rounds, lunge load, carry/hold load, carry/hold duration, step height, cardio modality, interval duration, circuit time, RPE, and notes.

Legacy `sledLoad` data is still included in the summary function so older saved entries remain readable, but no new sled input is shown.

## Current progression model

Run training uses 12 persisted stages: eight run/walk stages, three continuous-run stages, and a two-mile development phase. Day 1 and Day 4 share the current stage but receive separate session targets. A stage is considered ready after two completed run sessions at session RPE 6 or lower and pain 2/10 or lower; the stage controls remain manually adjustable.

Strength and conditioning exercises include collapsible progression guidance. Equipment-dependent movements expose practical alternatives. Deadlift entries distinguish trap/hex bar, conventional barbell, sumo barbell, and dumbbells, with separate best-load summaries for hex-bar and straight-bar work. Older `Trap-bar deadlift` records are normalized into the hex-bar category.

Set-based strength and calisthenics exercises use mobile-friendly selectors. The prescribed set count is selected by default, the user can reduce or increase it within the available range, and each visible set has its own reps selector plus an `Other…` numeric fallback. Existing comma-separated `reps` values remain compatible when older workouts are edited or exported.

## Deployment tasks

1. Run the app through a local HTTP server.
2. Check JavaScript syntax and browser console errors.
3. Test saving, editing, deleting, Markdown export, JSON backup/import, and CSV export.
4. Confirm the manifest and service worker load correctly.
5. Verify offline behavior after the first load.
6. In repository Pages settings, deploy the `main` branch from `/ (root)`.
7. Test iPhone Safari and Add to Home Screen.
8. Return the production HTTPS URL and any GitHub setup instructions.

## Data model

Workout data is stored in browser `localStorage`. This means it persists on the same device and origin but does not automatically sync between devices. JSON backup/import is the supported portability mechanism.
