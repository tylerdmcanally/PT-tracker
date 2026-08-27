# Codex Deployment Handoff

## Goal

Maintain and deploy this mobile-first, coach-driven AFT Workout Tracker as a static Progressive Web App on GitHub Pages from `tylerdmcanally/PT-tracker`.

## Durable system boundary

This repository is canonical for application code, tests, deployment configuration, local/cloud workout storage behavior, and the minimum active runtime prescription. The separate private `tylerdmcanally/aft-coaching` repository is canonical for coaching, recovery, workout history, Health snapshots, nutrition, and the rationale for prescription decisions. For routine current-day Health questions, a local Codex session uses the separate private `aft-health-ingest` Worker/KV cache when it is reasonably fresh; `health-auto-export` MCP remains the optional live/high-resolution path when the cache is stale, incomplete, or insufficiently detailed. Persisted private Health files are durable historical fallback context only. Codex conversations are temporary and no ChatGPT data bridge is required.

Do not copy private coaching, Health, nutrition, symptom, recovery, or workout-history content into this public GitHub Pages repository. Do not add Apple Health UI, automated-cache access, or MCP integration to the PWA without a separately demonstrated application workflow need.

## Current training constraint

Day 3 is **Lower Strength and Gym Conditioning**. Version 1.4.9 retains exactly two conditioning rounds in this order:

1. Farmer carry: 45 lb per hand for about 30 seconds
2. Lateral step-ups: 6 per side
3. Bike, rower, elliptical, or short safe sprint: about 30 seconds hard
4. One controlled backward sled drag
5. One controlled forward sled push
6. Rest: 2 minutes 30 seconds

The known sled setup is a Torque Fitness TANK M4 at Level 3 on the same approximately 20-yard gym lane. Level 3 is equipment resistance, never pounds. Do not automatically increase sled resistance, hard-cardio duration, or round count. Ordered component logging supports shared or per-round results. Sled entry distinguishes added plates, known empty-sled weight, known total system weight, and unknown total; it also supports known distance, an unknown-length gym lane, or unknown distance plus duration, surface, RPE, equipment, direction, and notes. Legacy `sledLoad` fields remain readable.

Historical version 1.3 Day 3 snapshots retain the 95 lb Romanian-deadlift target, the four-component `foundation-1.2` circuit, and any saved one-occurrence sled directive. Versions 1.4 through 1.4.4 use **115 lb total for 2 × 8** and the six-component `foundation-1.4` circuit as their baseline. Versions 1.4.5 through 1.4.8 use **125 lb total for 2 × 8** and `foundation-1.4.5`, which preserves the same circuit work while adding the known M4 equipment and lane guidance. Version 1.4.9 advances only the active Romanian-deadlift prescription to **135 lb total for 2 × 8**; the circuit remains unchanged. Never revise the older template in place.

## Current program model

`program-config.js` is the single source of truth for program metadata, daily prescriptions, stable exercise IDs, target RPEs, coaching notes, run stage, recovery work, and auxiliary templates. The active primary program is **AFT Foundation Block 1**, version **1.4.9**, effective **2026-08-28**. The independent auxiliary template is **AFT Skill Microdose**, version **1.0**, effective **2026-08-06**.

Version 1.4.9 changes Day 3 only: Romanian deadlift is 135 lb total for 2 × 8; goblet squat is 55 lb for 3 × 10; incline dumbbell press is 35 lb per hand for 3 × 8; one-arm dumbbell row is 45 lb for 3 × 12 per side; body-weight split squat is 2 × 12 per leg; side plank is 3 × 45 seconds per side; hammer curl is 25 lb per hand for 2 × 10; and overhead cable triceps uses the next comparable increment above 88 lb—approximately 99 displayed only on the same setup—for 2 × 10–12. Days 1, 2, and 4, Stage 4, the progressive Day 3 warm-up, two-round circuit, known TANK M4 Level 3 metadata, and auxiliary microdose remain unchanged. There is no weekday scheduling, third weekly run, or automatic progression.

Do not add an automatic coaching or load-progression algorithm. Coaching decisions are made in the private coaching workflow and must be durably recorded there before Codex updates the matching active data in `program-config.js`.

Temporary exercise-specific coach instructions live in `coachNoteOverlays`. An overlay is scoped to program version, workout day, exercise identity, and effective date. Set its status to `resolved` and add `resolvedDate` to remove it from workouts on and after that date; date-aware historical cards and exports before the resolution date still show the note. A `next_occurrence` directive is copied into the saved exercise result and considered consumed only after that exercise is saved as completed. The v1.3 and v1.4 Day 2 lateral-raise safety overlays are resolved as of August 12 without deleting their historical context. The old version 1.3 Day 3 next-occurrence sled directive remains available only to historical v1.3 contexts; v1.4 and later make that sequence the baseline circuit.

Every saved workout stores program metadata and a complete `prescriptionSnapshot`. Editing an old workout renders that snapshot—or its own legacy saved exercise list—not the current program. This is required so a later coach update never changes historical prescriptions. Current variation/equipment logging options are merged into snapshot-backed edit screens, but the saved prescription, targets, names, and coaching details remain untouched.

Run training defines 12 possible stages, but the current stage is read-only and coach-directed. Version 1.4.9 holds active Stage 4 at 1:00 walk / 2:30 run × 6: six minutes walking plus fifteen minutes running for 21 programmed minutes. The post-strength Day 1 running segments begin around 6.0–6.1 mph; the fresh-leg Day 4 running range remains approximately 6.2–6.4 mph. Both target RPE 5–6 and prioritize longer continuous-running segments with reserve rather than speed, total distance, or average pace. Every round begins with walking. The existing walk/run speed fields record actual speeds; completion never advances or regresses the program automatically. Historical Stage 3 workouts retain their saved 1:00/2:00 × 7 prescription and result fields and are not directly comparable with Stage 4.

Run/walk and continuous-run cards include an offline timer with a large current-phase countdown, round and segment tracking, next-segment preview, pause/resume, skip, reset, sound/vibration transitions, and Screen Wake Lock support when the browser provides it. Every interval round starts with walking and then changes to running. Completing the timer fills completed rounds and programmed interval time; it does not overwrite total elapsed time.

Run cards follow a visible three-step sequence: set the interval plan, run the workout with the timer, then record the result. Device/environment, speed, heart-rate, and split fields live in a secondary drawer that opens automatically when saved optional data exists. Run results separately store programmed interval time, total elapsed time, distance, calculated pace and its time basis, device-reported pace, warm-up/cooldown duration, walking/running speed, treadmill/outdoor setting, incline, heart rate, discomfort, RPE, structure, and notes. Calculated pace prefers elapsed time and falls back to programmed time only when elapsed time is blank. In run-duration fields, a plain numeric value means minutes; the general timed-set parser still treats plain values as seconds. Device/calculated discrepancies are informational and never block saving.

The workout view shows required and optional completion counts plus a **Go to next** action that resumes at the first unfinished required exercise. Each exercise card separates today's prescription, the last saved result, and today's inputs. The live logging fields remain visible; previous-result history is a compact expandable reference; notes and exercise-specific pain share one optional drawer; and the completion control follows the logging fields at the bottom of the card. Blank prescription-adherence results stay hidden until actual result data or completion exists. Mobile save actions remain at the end of the workout instead of covering the active card.

Previous-result lookup sorts by session date and `updatedAt`, excludes the workout being edited, accepts meaningful legacy results even when Completed was missed, and uses canonical exercise aliases without rewriting saved entries. Exact variation matches take priority; other machine variations carry a not-directly-comparable warning. A collapsed list shows up to three recent results. **Use last load** copies only compatible raw load, load-mode, and bar-weight fields; totals are recalculated and completion, sets, reps, RPE, notes, and pain are never copied.

New variation-bearing results store a stable optional `variationId` alongside the existing human-readable `variation`. Older text-only variations are mapped at lookup time. Seated and modified-standing lat pulldowns have separate stable IDs. A targeted idempotent historical correction classifies the generic August 11 result as modified standing and the generic August 18 result as seated, without changing either prescription snapshot, load, repetitions, RPE, notes, or any other performance value. The existing program exercise IDs remain canonical; coach-suggested and legacy IDs are compatibility aliases.

Trap-bar deadlifts default to **Plates per side + bar**, with 45, 55, 60, and custom bar choices. The calculation is `bar + (plate weight per side × 2)`. Other bar-based variations can use combined plates plus bar or total weight. Legacy records without a mode remain direct totals; never infer a bar weight for them.

Set-based strength and calisthenics exercises use mobile-friendly selectors. The prescribed set count is selected by default, the user can reduce or increase it within the available range, and each visible set has its own reps selector plus an `Other…` numeric fallback. Timed sets support per-set targets without prefilling completed values; Day 1 and Day 4 currently display 45, 45, and 45 seconds. Existing comma-separated `reps` and `times` values remain compatible. A definition-aware compatibility layer treats a legacy plain numeric whole-session mobility value as minutes when its saved prescription is minute-based; timed plank-set values remain seconds and raw history is not rewritten.

The nonblocking pre-save review flags meaningful data on unchecked exercises and rep/time counts that do not match the selected set count. This includes zero rep or time entries when another meaningful result such as load or RPE was recorded; untouched cards and notes-only cards do not create false warnings.

The optional Recovery Session prescribes 15–20 minutes of easy stationary biking or walking at RPE 2–3, plus optional 5–10 minutes of gentle mobility. It logs modality, duration, RPE, pre/post soreness, and notes; it appears in history and exports but is ignored by next-day rotation and primary-workout counts.

The optional AFT Skill Microdose prescribes hand-release push-ups 3 × 4, front plank 3 × 20 seconds, and up to five minutes of gentle optional mobility at session RPE 3–4. It is the sole optional extra push-up/plank practice session in version 1.4.9. Historical v1.3 Day 3 bundles still satisfy their saved Monday–Sunday dose, but v1.4 and later Day 3 workouts cannot consume the standalone slot. An additional microdose requires explicit acknowledgement and stores `weeklyFrequencyOverride` plus its reason. Saved microdoses are classified as `skill_microdose`, remain outside primary/recovery counts, never alter the coach-directed run stage, and contribute only to weekly practice volume. There are no air squats, automatic scheduling, automatic progression, or medical/recovery recommendations.

Every day displays a specific active warm-up and exercises are numbered in intended completion order. Day 1 keeps its full walk/run block after strength work because it is conditioning rather than the warm-up. Day 4 begins with its walk/run session after a separate walking and dynamic warm-up. Air squats are not in the current block.

Blank primary workouts select the day after the most recent primary workout using session date and then `updatedAt`; recovery and skill microdoses are ignored. Dates use device-local components. **New Workout** and the post-save reset apply these defaults. Editing preserves the saved date, day, and prescription.

Session tracking separates pre-session soreness, readiness, pain during training, pain location, and post-session notes. Recovery also records post-session soreness. The old `painScore` field remains explicitly labeled as legacy pain/discomfort and is never reinterpreted.

Sleep quality is an optional five-value pre-session field. Exercise results may also store an optional `exercisePain` object with severity, location, laterality, note, and whether the symptom stopped the exercise. Neither field drives automatic recommendations or blocks saving.

The optional session timer persists across reloads, supports pause/resume, fills duration only when manual duration is blank, and does not mark exercises complete. The walk/run timer remains separate.

Progress and exports include Monday–Sunday hand-release push-up volume, front-plank time, running distance, and running time. Side-plank time is excluded from front-plank totals. Coach exports determine which week rows to show from the selected sessions, then calculate each represented Monday–Sunday week from all stored history so a narrow session range cannot truncate weekly totals. Running progress includes pain-free session count, most-recent distance and pace, longest distance, and best calculated pace grouped by stage.

The coaching Markdown export includes every planned exercise, completion status, derived prescription adherence and all reasons, ordered circuit components, baseline and directive adherence, explicit unknown sled measurements, one chronologically prior directly comparable result, active coach overlays, detailed result fields, exercise-specific pain, sleep quality, coach instructions, exercise RPE, run metrics, full multiline exercise notes, and full post-session notes. Structured walk/run adherence compares stage, walk duration, run duration, interval rounds, and completed rounds; total elapsed time is intentionally excluded from adherence. CSV includes a compact component summary plus the lossless component JSON and directive/adherence fields. JSON carries the same underlying values without conflating device and calculated pace. The practice section is named **AFT-event practice volume** and explicitly states that accumulated work is not a benchmark or official event result.

The PWA uses versioned CSS/JavaScript/config URLs and network-first same-origin fetching with offline cache fallback. When a newly activated service worker takes control, a persistent **Reload update** banner appears. Reloading first autosaves the active draft.

Cloud backup is implemented as a local-first Firebase/Firestore adapter and is configured for the account-owned `fitness-tracker-16dfb` project in `cloud-config.js`. The app remains fully usable when cloud code is disabled, signed out, offline, or unavailable. On sign-in, completed workouts sync as full JSON documents under `users/{uid}/workouts/{encodedEntryId}`. A separate per-entry `changedAt` clock resolves conflicts and deleted workouts remain as tombstones so stale devices cannot resurrect them. The local sync state binds to the first authenticated UID and refuses to upload to a different account. Active drafts and both timers never leave the device. `firestore.rules` restricts every workout path to its authenticated owner; never place an Admin SDK or service-account credential in this static repository.

## Deployment tasks

1. Run the app through a local HTTP server.
2. Check JavaScript syntax and browser console errors.
3. Run `node tests/app-model.test.cjs`.
4. Run `node tests/cloud-sync-model.test.cjs`.
5. Run `node tests/privacy-boundary.test.cjs`.
6. Test saving, draft recovery, editing legacy entries, deleting/restoring, Markdown export, JSON backup/import, and CSV export.
7. When cloud backup is enabled, verify Google sign-in, first upload, manual Sync now, offline/local logging, and recovery in a clean browser profile.
8. Confirm the manifest and service worker load correctly.
9. Verify offline behavior after the first load.
10. In repository Pages settings, deploy the `main` branch from `/ (root)`.
11. Test iPhone Safari and Add to Home Screen.
12. Return the production HTTPS URL and any GitHub/Firebase setup instructions.

## Data model

The canonical workout array stays under the existing `aftWorkoutEntries.v1` localStorage key for compatibility. The app adds:

- `aftWorkoutDraft.v1` — autosaved active form
- `aftSessionTimer.v1` — reload-safe total session timer
- `aftWorkoutSnapshots.v1` — up to five local restore points
- `aftBackupMeta.v1` — last downloaded JSON backup metadata
- `aftDataVersion.v1` — app data migration marker
- `aftCloudSyncState.v1` — per-workout cloud change clocks, deletion state, and last-sync metadata

Data schema version 11 adds optional auxiliary-template metadata, the `skill_microdose` category, shared weekly skill-dose metadata, and an explicit weekly-frequency override record. Version 10 adds optional ordered `components`, `appliedCoachDirective`, structured multi-reason adherence, and the targeted idempotent August 5 Day 3 circuit correction. Known historical corrections also include the idempotent August 11/August 18 pulldown variation classification; correction markers are persisted locally and queued for cloud sync without changing prescription snapshots or performance values. The circuit correction preserves the selected hard-cardio modality, records the two sled directions separately, and leaves unknown sled measurements explicitly unknown. Prescription adherence is derived at display/export time whenever explicit snapshot metadata or a safely parseable saved prescription is available; otherwise it is `not_assessable`. Version 9 sleep/pain/override values, version 8 variation IDs, and version 7 run fields remain compatible. A safety snapshot is created before the version marker advances.

The app requests persistent browser storage on demand. This reduces eviction risk. When optional Firebase backup is disabled, JSON backup/import remains the only portable, device-loss-safe copy; when enabled, Firestore adds private account recovery without replacing local storage or the independent JSON backup.
