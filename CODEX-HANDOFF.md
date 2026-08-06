# Codex Deployment Handoff

## Goal

Maintain and deploy this mobile-first, coach-driven AFT Workout Tracker as a static Progressive Web App on GitHub Pages from `tylerdmcanally/PT-tracker`.

## Current training constraint

The baseline versioned program must work in a standard commercial gym and does not require a weighted sled, turf lane, or dedicated Army Fitness Test equipment. A temporary next-Day-3-only coach directive adds controlled sled exposure when the gym has suitable equipment; it does not rewrite the versioned prescription.

Day 3 is **Lower Strength and Gym Conditioning**. Its current program-version limit is exactly two conditioning rounds:

1. Farmer carry: 45 lb per hand for about 30 seconds
2. Lateral step-ups: 6 per side
3. Bike, rower, elliptical, or short safe sprint: 45 seconds hard
4. Rest: 2 minutes 30 seconds

The current block also includes a low-fatigue Test Skill Practice group. The one-occurrence directive changes the hard interval to approximately 30 seconds and inserts one backward sled drag and one forward sled push before rest, while retaining exactly two rounds. Ordered component logging supports shared or per-round results. Sled entry distinguishes added plates, known empty-sled weight, known total system weight, and unknown total; it also supports known distance, an unknown-length gym lane, or unknown distance. Legacy `sledLoad` fields remain readable.

The version 1.3 Day 3 Romanian-deadlift prescription is **95 lb total for 2 × 8**. This is a synchronization correction, not a new program version. Keep the two-round conditioning prescription unchanged.

## Current program model

`program-config.js` is the single source of truth for program metadata, daily prescriptions, stable exercise IDs, target RPEs, coaching notes, run stage, recovery work, and auxiliary templates. The active primary program is **AFT Foundation Block 1**, version **1.3**, effective **2026-08-01**. The independent auxiliary template is **AFT Skill Microdose**, version **1.0**, effective **2026-08-06**; it does not create Foundation Block version 1.4.

Do not add an automatic coaching or load-progression algorithm. ChatGPT is the coach; Codex updates `program-config.js` after the user reviews recommendations.

Temporary exercise-specific coach instructions live in `coachNoteOverlays`. An overlay is scoped to program version, workout day, exercise identity, and effective date. Set its status to `resolved` (and add `resolvedDate`) to remove a normal overlay from future cards and exports without rewriting prescriptions or workout history. A `next_occurrence` directive is copied into the saved exercise result and considered consumed only after that exercise is saved as completed. The active version 1.3 Day 2 lateral-raise overlay advises a pain-free machine/cuffed-cable variation or omission after a right medial-elbow twinge. The active Day 3 directive is the controlled sled-measurement exposure after August 5.

Every saved workout stores program metadata and a complete `prescriptionSnapshot`. Editing an old workout renders that snapshot—or its own legacy saved exercise list—not the current program. This is required so a later coach update never changes historical prescriptions. Current variation/equipment logging options are merged into snapshot-backed edit screens, but the saved prescription, targets, names, and coaching details remain untouched.

Run training defines 12 possible stages, but the current stage is read-only and coach-directed. Day 1 and Day 4 use Stage 2: 1:00 walk / 1:30 run × 8. A user can still record a different actual stage inside a session. Completion counts are informational and never advance the program.

Run/walk and continuous-run cards include an offline timer with a large current-phase countdown, round and segment tracking, next-segment preview, pause/resume, skip, reset, sound/vibration transitions, and Screen Wake Lock support when the browser provides it. Every interval round starts with walking and then changes to running. Completing the timer fills completed rounds and programmed interval time; it does not overwrite total elapsed time.

Run cards follow a visible three-step sequence: set the interval plan, run the workout with the timer, then record the result. Device/environment, speed, heart-rate, and split fields live in a secondary drawer that opens automatically when saved optional data exists. Run results separately store programmed interval time, total elapsed time, distance, calculated pace and its time basis, device-reported pace, warm-up/cooldown duration, walking/running speed, treadmill/outdoor setting, incline, heart rate, discomfort, RPE, structure, and notes. Calculated pace prefers elapsed time and falls back to programmed time only when elapsed time is blank. In run-duration fields, a plain numeric value means minutes; the general timed-set parser still treats plain values as seconds. Device/calculated discrepancies are informational and never block saving.

The workout view shows required and optional completion counts plus a **Go to next** action that resumes at the first unfinished required exercise. Each exercise card separates today's prescription, the last saved result, and today's inputs. The live logging fields remain visible; previous-result history is a compact expandable reference; notes and exercise-specific pain share one optional drawer; and the completion control follows the logging fields at the bottom of the card. Blank prescription-adherence results stay hidden until actual result data or completion exists. Mobile save actions remain at the end of the workout instead of covering the active card.

Previous-result lookup sorts by session date and `updatedAt`, excludes the workout being edited, accepts meaningful legacy results even when Completed was missed, and uses canonical exercise aliases without rewriting saved entries. Exact variation matches take priority; other machine variations carry a not-directly-comparable warning. A collapsed list shows up to three recent results. **Use last load** copies only compatible raw load, load-mode, and bar-weight fields; totals are recalculated and completion, sets, reps, RPE, notes, and pain are never copied.

New variation-bearing results store a stable optional `variationId` alongside the existing human-readable `variation`. Older text-only variations are mapped at lookup time. The existing program exercise IDs remain canonical; coach-suggested and legacy IDs are compatibility aliases.

Trap-bar deadlifts default to **Plates per side + bar**, with 45, 55, 60, and custom bar choices. The calculation is `bar + (plate weight per side × 2)`. Other bar-based variations can use combined plates plus bar or total weight. Legacy records without a mode remain direct totals; never infer a bar weight for them.

Set-based strength and calisthenics exercises use mobile-friendly selectors. The prescribed set count is selected by default, the user can reduce or increase it within the available range, and each visible set has its own reps selector plus an `Other…` numeric fallback. Timed sets support per-set targets without prefilling completed values; Day 4 currently displays 30, 30, and 25 seconds. Existing comma-separated `reps` and `times` values remain compatible.

The nonblocking pre-save review flags meaningful data on unchecked exercises and rep/time counts that do not match the selected set count. This includes zero rep or time entries when another meaningful result such as load or RPE was recorded; untouched cards and notes-only cards do not create false warnings.

An optional Recovery Session logs modality, duration, RPE, pre/post soreness, and notes. It appears in history and exports but is ignored by next-day rotation and primary-workout counts.

The optional AFT Skill Microdose prescribes hand-release push-ups 3 × 4, front plank 3 × 20 seconds, and up to five minutes of gentle optional mobility at session RPE 3–4. It shares the `aft_pushup_plank_microdose` Monday–Sunday dose with Day 3’s optional push-up/plank bundle. A full session from either source satisfies the week; partial work warns but does not rewrite either prescription. An additional session requires explicit acknowledgement and stores `weeklyFrequencyOverride` plus its reason. Saved microdoses are classified as `skill_microdose`, remain outside primary/recovery counts, never alter Run Stage 2, and contribute only to weekly practice volume. There are no air squats, automatic scheduling, automatic progression, or medical/recovery recommendations.

Every day displays a specific active warm-up and exercises are numbered in intended completion order. Day 1 keeps its full walk/run block after strength work because it is conditioning rather than the warm-up. Day 4 begins with its walk/run session after a separate walking and dynamic warm-up. Air squats are not in the current block.

Blank primary workouts select the day after the most recent primary workout using session date and then `updatedAt`; recovery and skill microdoses are ignored. Dates use device-local components. **New Workout** and the post-save reset apply these defaults. Editing preserves the saved date, day, and prescription.

Session tracking separates pre-session soreness, readiness, pain during training, pain location, and post-session notes. Recovery also records post-session soreness. The old `painScore` field remains explicitly labeled as legacy pain/discomfort and is never reinterpreted.

Sleep quality is an optional five-value pre-session field. Exercise results may also store an optional `exercisePain` object with severity, location, laterality, note, and whether the symptom stopped the exercise. Neither field drives automatic recommendations or blocks saving.

The optional session timer persists across reloads, supports pause/resume, fills duration only when manual duration is blank, and does not mark exercises complete. The walk/run timer remains separate.

Progress and exports include Monday–Sunday hand-release push-up volume, front-plank time, running distance, and running time. Side-plank time is excluded from front-plank totals. Running progress includes pain-free session count, most-recent distance and pace, longest distance, and best calculated pace grouped by stage.

The coaching Markdown export includes every planned exercise, completion status, derived prescription adherence and all reasons, ordered circuit components, baseline and directive adherence, explicit unknown sled measurements, one chronologically prior directly comparable result, active coach overlays, detailed result fields, exercise-specific pain, sleep quality, coach instructions, exercise RPE, run metrics, full multiline exercise notes, and full post-session notes. CSV includes a compact component summary plus the lossless component JSON and directive/adherence fields. JSON carries the same underlying values without conflating device and calculated pace. The practice section is named **AFT-event practice volume** and explicitly states that accumulated work is not a benchmark or official event result.

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

Data schema version 11 adds optional auxiliary-template metadata, the `skill_microdose` category, shared weekly skill-dose metadata, and an explicit weekly-frequency override record. Version 10 adds optional ordered `components`, `appliedCoachDirective`, structured multi-reason adherence, and the targeted idempotent August 5 Day 3 circuit correction. The correction preserves the prescription snapshot, keeps the selected hard-cardio modality, records the two sled directions separately, and leaves unknown sled measurements explicitly unknown. Prescription adherence is derived at display/export time whenever explicit snapshot metadata or a safely parseable saved prescription is available; otherwise it is `not_assessable`. Version 9 sleep/pain/override values, version 8 variation IDs, and version 7 run fields remain compatible. A safety snapshot is created before the version marker advances.

The app requests persistent browser storage on demand. This reduces eviction risk but does not sync across devices. JSON backup/import remains the only portable, device-loss-safe copy.
