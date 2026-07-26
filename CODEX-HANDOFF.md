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

Run training uses 12 persisted stages: eight run/walk stages, three continuous-run stages, and a two-mile development phase. Day 1 and Day 4 share the current stage but receive separate session targets. Every saved run exercise marked **Done** counts toward the two-completion target for its logged stage; session and run-specific effort/pain remain visible coaching signals without silently excluding a completion. The stage controls remain manually adjustable.

Run/walk and continuous-run cards include an offline timer with a large current-phase countdown, round and segment tracking, next-segment preview, pause/resume, skip, reset, sound/vibration transitions, and Screen Wake Lock support when the browser provides it. Every interval round starts with walking and then changes to running. Completing the timer fills completed rounds and planned elapsed time and marks the run exercise done.

Strength and conditioning exercises include collapsible progression guidance. Equipment-dependent movements expose practical alternatives. Deadlift entries distinguish trap/hex bar, conventional barbell, sumo barbell, and dumbbells, with separate best-load summaries for hex-bar and straight-bar work. Older `Trap-bar deadlift` records are normalized into the hex-bar category.

Bar-based variations use a **Plates only + bar** entry mode by default. The user logs the combined plates on both sides, confirms or adjusts the bar/starting resistance, and sees the calculated total live. Total load is used in workout summaries, deadlift progress, Markdown, JSON, and CSV. A **Total weight** mode supports gyms or users who prefer direct totals. Legacy records without a load mode remain total-weight entries so their historical meaning does not change.

Set-based strength and calisthenics exercises use mobile-friendly selectors. The prescribed set count is selected by default, the user can reduce or increase it within the available range, and each visible set has its own reps selector plus an `Other…` numeric fallback. Existing comma-separated `reps` values remain compatible when older workouts are edited or exported.

Days 1 and 3 end with an optional two-exercise arm superset: dumbbell curls and cable triceps pressdowns. Day 2 adds dumbbell lateral raises. These exercises have stable IDs, independent completion and logging controls, export normally, and add secondary progress metrics only after data exists.

Every day displays a specific active warm-up before Exercise 1, and exercise cards are numbered in intended completion order. Day 1 keeps its full walk/run block after the strength work because it is conditioning rather than the warm-up. Day 4 begins with the primary run after its separate walking and dynamic warm-up. Multi-joint work precedes isolation work on Day 2, and Day 4 air squats precede the plank and cooldown mobility.

Blank workouts automatically select the day after the most recent saved workout using session date and then `updatedAt`. They use a device-local `YYYY-MM-DD` date assembled from local date components. **New Workout** and the post-save reset apply these defaults; editing and tab switching preserve the active workout’s day and date.

The PWA uses versioned CSS/JavaScript URLs and network-first same-origin fetching with offline cache fallback. When a newly activated service worker takes control of an already-open app, a persistent **Reload update** banner appears rather than interrupting a workout draft.

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
