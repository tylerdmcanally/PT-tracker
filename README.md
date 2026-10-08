# AFT Workout Tracker

A small, installable, offline-first web app for coach-directed Army fitness training.

## System boundary

This public repository is canonical for the tracker application, its tests and deployment, workout storage behavior, and the minimum active runtime prescription. Private coaching, Health snapshots, nutrition state, and workout history live in the separate private `tylerdmcanally/aft-coaching` repository. For coaching use, local Codex normally reads reasonably fresh current-day Apple Health data from the separate private `aft-health-ingest` cache and uses `health-auto-export` MCP for optional live/high-resolution refreshes. Neither Health path is integrated into this PWA, and neither requires ChatGPT as a bridge.

## Included

- Three active primary strength sessions, historical compatibility for legacy Day 1–Day 4, the retired v1.5.5 Day 1 illness-recovery session, and the retired v1.5.10 run/aerobic sessions, plus separate optional recovery and AFT Skill Microdose sessions
- Coach-controlled, versioned workout prescriptions in `program-config.js`
- Saved prescription snapshots so later program changes do not rewrite old workouts, while current logging/equipment choices remain available when editing history
- No active AFT-managed run stage; historical workouts retain the stage actually completed
- A built-in walk-first interval timer with live phase, round, next-segment, sound/vibration cues, pause, skip, and reset controls for historical workouts and in-progress retired-session drafts
- Separate programmed interval time, total elapsed time, calculated pace, and device-reported pace
- A dark mobile layout with compact session setup, large completion controls, and one-tap compatible last-load reuse
- A three-step run flow retained for historical interval setup, the live timer, and post-run result entry
- Historical indoor/outdoor, treadmill incline, speed, warm-up/cooldown, heart-rate, and run-discomfort logging
- An optional total-session timer with pause/resume, reload recovery, automatic duration, and manual override
- Numbered exercise order and a session-specific active warm-up shown before Exercise 1
- Guided required/optional workout progress with a one-tap jump to the next unfinished exercise
- Streamlined cards with compact previous results, collapsible notes/pain, and completion controls after the live logging fields
- Exercise and equipment variants for normal commercial-gym substitutions
- Trap-bar plate-per-side logging with 45/55/60/custom bar weights and a live total
- Combined-plate and direct-total modes for other barbell and machine variations
- A collapsed inline plate calculator for known bar lifts and the confirmed plate-weight-only leg press, with editable totals, clearly previewed nearby choices, and an explicit Apply step
- Mobile-friendly set and per-set rep selectors prefilled from each prescription
- An ordered three-session primary strength rotation; retired run/aerobic and legacy primary records remain classified as primary history, while recovery and skill-microdose sessions never advance the active rotation
- An independently versioned, once-weekly AFT Skill Microdose with 3 × 4 hand-release push-ups, 3 × 20-second front planks, and optional gentle mobility
- A Monday–Sunday skill-dose rule with the standalone microdose as the sole optional extra in program v1.5.18 while historical v1.3 Day 3 bundles remain compatible
- A deliberate coach-directed override for additional weekly skill work, recorded in history, Markdown, JSON, and CSV
- Variation-aware last results plus a collapsed three-result history on every exercise card
- Optional **Use last load** actions that copy only compatible load fields
- Coach-controlled, exercise-specific note overlays that can be resolved without changing the program version or historical prescriptions
- One-occurrence coach directives that remain separate from immutable program prescriptions and are consumed only by a saved completed workout
- A separate derived prescription-adherence result for met, below-target, modified, partial, not-assessable, and optional work, with structured reasons
- Ordered circuit logging with a fast shared-across-rounds result and optional per-round differences
- Separate backward-drag and forward-push sled records with trip, distance, load-basis, duration, equipment, surface, RPE, and note fields
- A pre-save review for unchecked result data and incomplete or entirely missing rep/time set logs when other results were entered
- Strength, running, standard-gym conditioning, and calisthenics logging
- Separate readiness, sleep quality, muscle soreness, session pain, and optional structured exercise-specific pain tracking
- Weekly push-up and front-plank progress totals
- Historical AFT-tracker run distance/time, pain-free run counts, recent pace, and stage-specific best-pace metrics
- Autosaved workout drafts and durable on-device workout history
- Five rolling local restore points, protected-storage status, and backup reminders
- Optional private Firebase backup with Google sign-in, offline-safe per-workout sync, and deletion tombstones
- Edit/delete saved sessions
- Progress summary
- Detailed Markdown export for the coach chat, including adherence reasons, ordered circuit components, explicit unknown sled values, one prior comparable result, active coach notes/directives, and full exercise/session notes
- JSON backup/import and CSV export
- PWA manifest, offline service worker, and iPhone home-screen icon

## Data storage

Device storage remains the app's primary working copy. Workout logging, active drafts, interval timers, history, and exports continue to work without a network connection or cloud account.

The app requests protected browser storage when the user chooses **Protect device storage**, autosaves the active workout and session timer, and keeps up to five rolling restore points before important writes, imports, and deletions. Those measures protect against accidental in-app changes and reduce browser-eviction risk, but they cannot survive a lost device, device wipe, cleared Safari data, or a changed site address.

When the optional Firebase connection is enabled, each completed workout is also stored as a private Firestore document owned by the signed-in user. Saves, edits, imports, restores, and deletions are reconciled by a separate change timestamp; deletions use tombstones so an older device cannot accidentally resurrect a removed workout. A device's sync state binds to the first Google account used so local history cannot be silently copied to a different account later. Active drafts and timers are intentionally device-only. JSON export remains an independent portable backup.

## Firebase cloud backup

The app is connected to the account-owned `fitness-tracker-16dfb` Firebase project. Google Authentication and the default Firestore database must remain enabled, and the deployed database rules must match `firestore.rules`.

For a replacement Firebase project, complete this one-time setup:

1. Create a no-cost Firebase project and register a Web app in the [Firebase console](https://console.firebase.google.com/).
2. Open **Authentication → Sign-in method** and enable Google.
3. Add `tylerdmcanally.github.io` under **Authentication → Settings → Authorized domains**.
4. Create a Cloud Firestore database. Use production mode and choose the nearest U.S. region.
5. Publish the contents of `firestore.rules` as the database rules. They limit each signed-in user to their own workout path.
6. Copy the Web app's Firebase configuration values into `cloud-config.js`, then set `enabled:true`.
7. Test Google sign-in and **Sync now** locally, push the configuration change, and verify it once on GitHub Pages.

Firebase's browser configuration is a public project identifier, not an administrator credential. Never add a service-account key or Firebase Admin credential to this static repository. Firestore Security Rules and Firebase Authentication protect the data.

## Deployment: GitHub Pages

1. Push the project to the `main` branch of `tylerdmcanally/PT-tracker`.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main`, choose `/ (root)`, and save.
5. Open the published HTTPS address in Safari.

No framework or build command is required; this is a static site.

## Add to iPhone Home Screen

1. Open the deployed HTTPS URL in Safari.
2. Tap Share.
3. Tap **Add to Home Screen**.
4. Launch **AFT Log** from the new icon.

## Local test

From this directory:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`. Full iPhone installation should use the deployed HTTPS URL.

Run the data-model checks with:

```bash
node tests/app-model.test.cjs
node tests/cloud-sync-model.test.cjs
node tests/privacy-boundary.test.cjs
```

## Equipment assumptions

The default versioned program is designed around normal commercial-gym strength and cardio equipment. Program v1.4 added controlled sled work to the legacy Day 3 baseline; active v1.5.18 keeps it in Strength 3 when the gym provides a suitable sled and lane. The same two-round circuit retains the known Torque Fitness TANK M4 Level 3 setup on the approximately 20-yard gym lane. The logger can explicitly preserve unknown loads or distances when exact measurements are unavailable, and an M4 resistance level is never converted to pounds.

Strength 3 uses a coach-capped two-round conditioning circuit: a 45 lb-per-hand farmer carry, lateral step-ups, approximately 30 seconds of hard bike/rower/elliptical work, one controlled backward sled drag, one controlled forward sled push, and 2:30 rest. Sled resistance, hard-cardio duration, and round count never progress automatically.

Historical version 1.3 snapshots retain the original four-component circuit and any saved one-occurrence sled directive. Versions 1.4 through 1.4.4 use a 115 lb total Romanian-deadlift target for 2 × 8 and the original sled-enhanced `foundation-1.4` circuit. Versions 1.4.5 through 1.4.8 use 125 lb for 2 × 8 and a separately versioned circuit template for the known M4 setup. Versions 1.4.9 through 1.5.1 use 135 lb for 2 × 8 without changing the two-round circuit. The September 3 workout remains an immutable v1.5.1 snapshot. Versions 1.5.3 through 1.5.7 use 145 lb for 2 × 8 while retaining the same circuit. Versions 1.5.9 through 1.5.18 Strength 3 use 155 lb for 2 × 8 and keep that circuit unchanged. Public v1.5.8 was never installed or synthesized. Visible target loads are never prefilled as completed results.

The active primary program is **AFT Foundation Block 1 v1.5.18**, effective October 9, 2026, with service-worker cache **v65** and data schema 11. Its ordered primary rotation is **Strength 1 — Upper Body and AFT Calisthenics**, **Strength 2 — Heavy Strength and Carries**, and **Strength 3 — Lower / Full Body and SDC**. Version 1.5.11 removed Run 1, Aerobic Base, and Run 2 only from active selection; their exact v1.5.10 definitions remain available for historical records and in-progress legacy drafts. Version 1.5.12 retained a null active AFT run stage and changed only active Strength 2: trap-bar deadlift is 185 lb for 3 × 5, hand-release push-ups are 4 × 10, leg press is 160 lb on the same confirmed setup for 3 × 10, and seated cable row is 154 displayed on the same setup for 3 × 10. Version 1.5.13 retains those Strength 2 targets, the null active AFT run stage, and separate Runna ownership without integration into this PWA. It changes only active Strength 1: hand-release push-ups are **5 × 12** at RPE 6–8, seated dumbbell overhead press is **25 lb per hand for 3 × 10** at RPE 7–8, and same-machine row is **110 lb displayed for 3 × 10** at RPE 7–8. Push-ups remain five equal, technically clean, submaximal sets with strong whole-body bracing and no failure or maximal set. The press follows the priority push-up work with clean repetitions and no make-up repetitions, grinding, failure work, or return to 30 lb without a later coach-directed version. The row stays on the same confirmed machine and setup at 110 lb and is not comparable to another row machine. The other six Strength 1 items and every Strength 2 and Strength 3 prescription remain exactly v1.5.12, including all setup-comparability rules and the two-round TANK circuit. Version 1.5.14 retains the Strength 1 changes, the null active AFT run stage, and every Strength 3 prescription while changing only three active Strength 2 targets: trap-bar deadlift is **195 lb total for 3 × 5** at RPE 6–8, seated cable row is the **next smallest comparable increment above 154 lb displayed on the same setup, expected approximately 165 lb if that stack uses 11-lb increments, for 3 × 8–10** at RPE 6–8, and front plank is **3 × 50 seconds** at RPE 6–8. The deadlift stays technically clean with no grinding and remains at 195 lb for confirmation before any later coach-directed increase. The row increment is specific to the same confirmed cable setup and is not transferable to another cable, pulley, or machine. Each plank set stops rather than extending through lumbar compensation. Strength 2 hand-release push-ups remain 4 × 10 at RPE 5–7, leg press remains 160 lb plates total with the carriage excluded on the same setup for 3 × 10 at approximately RPE 7, dumbbell bench remains 40 lb per hand for 3 × 8 at RPE 7–8, and farmer carry remains 45 lb per hand for four trips of approximately 40 yd at RPE 6–8. All setup-comparability rules and the two-round TANK circuit remain unchanged. Version 1.5.15 changes only four active Strength 3 targets: incline dumbbell press is **35 lb per hand for 3 × 10** at RPE 7–8, one-arm dumbbell row is **50 lb for 3 × 10 per side** at RPE 6–8, Strength 3 front plank is **3 × 55 seconds** at RPE 6–8, and overhead cable triceps extension is the **next smallest comparable increment above 110 lb displayed on the same confirmed rope/cable setup, expected approximately 121 lb only if that stack uses 11-lb increments, for 2 × 10–12** at RPE 7–9. The press confirms three technically clean sets at the current load before any later increase, uses normal rest, and stops before grinding or technical failure without make-up repetitions. The row progresses repetitions at the confirmed load with both sides technically clean and no load increase yet. The front plank stops rather than extending through lumbar compensation. The triceps increment is specific to the same rope, cable, pulley, and machine setup, must remain pain-free through the shoulder with a controlled stretch, and is held for confirmation before later progression. Every lower-body and SDC prescription, side plank, hammer curl, all Strength 1 and Strength 2 work, the null active AFT run stage, retired compatibility definitions, stable identities, equipment-comparability rules, plate-calculator behavior, and local/Firebase storage behavior remain unchanged. Version 1.5.16 changes only two active Strength 1 targets: seated dumbbell overhead press is **30 lb per hand for 3 × 8** at RPE 7–8, and machine row is the **next smallest comparable increment above 110 lb displayed on the same confirmed machine and setup, expected approximately 121 lb only if that machine uses 11-lb increments, for 3 × 8–10** at RPE 7–8. The press remains behind priority hand-release push-ups, uses controlled, technically clean, submaximal repetitions with no make-up work, grinding, or failure, and stays at 30 lb per hand for confirmation. The row increment remains specific to the same confirmed machine and setup and is held for confirmation. Every other active prescription and all prior compatibility behavior remain unchanged.

Version 1.5.17 changes only active Strength 1 hand-release push-ups: set 1 is **15 continuous test-standard repetitions** at RPE no higher than 8, followed by sets 2–5 at **10 repetitions each** and RPE 6–7. The definition-level `prescribedReps: [15, 10, 10, 10, 10]` metadata drives exact per-set helper text, **Fill prescribed**, snapshots, and adherence while completed repetitions retain the existing comma-separated `reps` result shape. Exact targets are Met, any below-target set is Below target, and any above-target set is Modified. Set 1 stops at 15 without an in-set rest, grinding, or technical failure; rest three minutes before the back-off work and 90–120 seconds between sets 2–5. There is no maximal set, extra repetition work, automatic progression, or added skill microdose. Cache v64 established the guard that keeps snapshotless legacy entries bound to their saved prescription-facing fields while allowing current logging-option fallback; active exact-repetition, target-RPE, and coaching metadata are not backfilled into old records. Every non-HRPU prescription and all prior compatibility, storage, Firebase, and privacy behavior remain unchanged; schema 11 remains current.

Version 1.5.18 changes only two active Strength 3 targets. Side plank is **3 × 55 seconds per side** at RPE 6–8, with all three prescribed times set to 55 seconds; maintain a clean hip and lumbar position and stop a set rather than extending through compensation. Hammer curl is the **next smallest comparable dumbbell increment above 25 lb per hand, expected 30 lb per hand if available, for 2 × 10–12** at RPE 7–9; apply that target only to the same dumbbell-hammer-curl variation, keep repetitions controlled, hold the new load for confirmation, and do not transfer it to the rope-cable variation. Cache v65 carries forward the snapshotless-history guard and every prior compatibility, storage, Firebase, and privacy behavior; schema 11 remains current.

The completed September 13 Day 2 workout remains immutable v1.5.6 history, including its saved prescription snapshot, results, RPE, pain, and notes; active v1.5.18 targets never rewrite it. September 16 Run 2 and September 18 Strength 1 likewise remain immutable v1.5.9 history with their original snapshots and results, and September 20 Run 1 remains immutable v1.5.10 history. The completed September 22 Strength 2 workout remains immutable v1.5.11 history with its saved 175-lb deadlift, generic next-increment leg-press, and 132-displayed row prescriptions; its saved results are never relabeled or rewritten as a later active version. September 24 Strength 3 and all other v1.5.12 records remain immutable. The completed September 27 Strength 1 workout remains immutable v1.5.12 history with its saved 5 × 11 hand-release push-up, 25-lb-per-hand overhead-press 3 × 8–10, and same-machine 110-lb row 3 × 9 prescriptions plus its saved results; it is never rewritten as v1.5.13. The completed September 29 Strength 2 workout remains immutable v1.5.13 history with its saved 185-lb deadlift, 154-displayed seated-row, and 3 × 45-second front-plank prescription snapshot plus its saved results; it is never rewritten as v1.5.14. The completed October 1 Strength 3 workout remains immutable v1.5.14 history with its saved 35-lb-per-hand incline-press 3 × 9, 50-lb one-arm-row 3 × 9 per side, 3 × 50-second front-plank, and same-setup 110-lb overhead-triceps-extension 2 × 12 prescription snapshot plus its saved results; it is never rewritten as v1.5.15. The completed October 4 Strength 1 workout remains immutable v1.5.15 history with its saved 5 × 12 hand-release push-ups, 25-lb-per-hand seated dumbbell overhead press 3 × 10, and same-machine 110-lb row 3 × 10 prescription snapshot plus its saved results; it is never rewritten as v1.5.16. The completed October 6 Strength 2 workout remains immutable v1.5.16 history through its exact saved prescription snapshot and results; it is never rewritten or relabeled as v1.5.17. The completed October 8 Strength 3 workout remains immutable v1.5.17 history with its exact saved prescription snapshot and results, including side plank 3 × 50 seconds per side and dumbbell hammer curl 25 lb per hand for 2 × 15; it is never rewritten or relabeled as v1.5.18. Version 1.5.6 retired the v1.5.5 **Day 1 — Illness Recovery** definition and selector option without replacing it. The completed September 10 v1.5.5 session remains historical data backed by its immutable snapshot and `rotationDayKey: day1`, so it continues to load, edit, export, sync, and count as primary. Legacy Day 1–Day 4 entries, including v1.5.7 Day 3 history, remain immutable and retain their saved primary classification even though those keys are no longer active. September 3 and September 5 remain immutable v1.5.1 and v1.5.3 history, any v1.5.4 workout remains immutable, and versions 1.5.2 and 1.5.8 were never installed or synthesized in the public app.

Strength 2 deadlifts can be logged separately with a trap/hex bar, conventional barbell, sumo barbell, or dumbbells. Exercises with realistic commercial-gym substitutions include an explicit variation selector, and coach notes come directly from the current program configuration.

New workouts use the device-local calendar date and advance only within the three active strength keys. Strength 1 advances to Strength 2, Strength 2 advances to Strength 3, and Strength 3 wraps to Strength 1. A retired Run 1 record anchors after Strength 1 and therefore advances to Strength 2; retired Aerobic Base advances to Strength 3; and retired Run 2 wraps to Strength 1. Other legacy primary records remain primary history without being reinterpreted as active sessions. No illness-recovery definition or coach-directed-alternatives group is active in v1.5.18. Optional recovery and skill-microdose sessions remain non-advancing. The **New Workout** action returns to the suggested active primary session without affecting saved history.

The separately versioned **AFT Skill Microdose v1.0** is available at most once per Monday–Sunday week under normal use. It adds low-fatigue hand-release push-up and front-plank practice without advancing the primary strength rotation or creating an AFT-managed run stage. It is the sole optional extra push-up/plank practice in program v1.5.18; historical v1.3 Day 3 skill bundles continue to retain their original weekly-dose behavior. Completed microdose reps and front-plank seconds count only as AFT-event practice volume, never as benchmark results.

Versions 1.5.9 and 1.5.10 held AFT-managed Stage 4—one minute walking followed by two minutes thirty seconds running for six rounds, totaling 21 programmed minutes—in two dedicated sessions. Historical Run 1 is easy aerobic work at RPE 4–5 using a full-sentence talk test, beginning around 5.4–5.5 mph or slower as needed. Historical Run 2 is controlled work at RPE 5–6, beginning around 5.7–5.8 mph and moving toward 5.9–6.0 only while RPE remains at or below 5 with relaxed mechanics; it reduces toward 5.5 or lower if RPE exceeds 6. Both saved prescriptions retain their pain and next-day hold/regress safeguards and prioritize duration and reserve over pace. The compatibility timer starts every interval round with walking, automatically logs completed rounds and programmed interval time, and marks the historical run exercise done. Each transition uses a large visual alert, a phase-specific multi-tone pattern, and an optional spoken WALK/RUN cue; a Test RUN alert control lets the user set device or headphone volume before starting. Browser vibration remains a progressive enhancement and is not available through iPhone Safari or directly on Apple Watch. Total elapsed time remains a separate user-entered value and is not used to judge structured interval adherence. Beginning with v1.5.11, the AFT program has no active run stage; Runna separately owns current running prescription, tracking, and progression without integration into this PWA. The retired run definitions, result fields, timer, and alert behavior remain only for historical workouts and in-progress legacy drafts.

Calculated pace uses total elapsed time divided by distance. A plain elapsed-time value such as `20` means 20 minutes; `20:00` is equivalent. Timed strength fields keep their existing seconds-based behavior. For compatibility, a plain numeric legacy whole-session mobility value follows its saved minute-based prescription, while plank sets remain seconds. When elapsed time is blank, the app can use programmed interval time and labels that basis explicitly. Device-reported pace remains independently editable; a material difference produces an informational warning without blocking the save.

Exercise cards keep the coach prescription, previous results, and today's result visually separate. Last-result lookup uses saved workout date and `updatedAt`, accepts meaningful data even when an older Completed box was missed, excludes the workout currently being edited, and derives compatibility IDs without rewriting history. Different machine variations are labeled as not directly comparable. **Use last load** appears only for an exact compatible variation and never copies completion, sets, reps, RPE, notes, or pain.

Seated and modified-standing lat pulldowns have separate stable variation IDs. A targeted idempotent historical classification corrects only the ambiguous variation metadata on the August 11 and August 18 Day 2 results; their prescription snapshots, loads, repetitions, RPEs, notes, and other completed-session values remain unchanged.

Prescription adherence is derived conservatively from explicit set, rep, timed-set, carry trip/distance, cardio-duration, structured run, circuit-component, round-count, and load targets. A walk/run result is assessable from its stage, walk and run durations, planned rounds, and completed rounds; extra elapsed time does not invalidate an exact interval result. Carry duration or load is ignored unless the prescription explicitly targets it. A completed load above or below an explicit load target is **Modified**, not automatically considered met. Multiple structured reasons remain visible in the workout, history, Markdown, and CSV. Adherence never changes programming automatically. The coach export also reuses the same comparability rules to include at most one chronologically prior compatible result per completed exercise and calculates represented weekly practice rows from complete Monday–Sunday history.

Each of the three active primary strength sessions displays its own warm-up and ordered exercises. The retired v1.5.9/v1.5.10 Run 1, Aerobic Base, and Run 2 definitions remain available for historical rendering and in-progress legacy drafts, and every retained walk/run timer begins with the walk segment before progressing to the run segment. The retired September 10 snapshot preserves its own return-to-exercise check for historical rendering only.

Trap-bar deadlifts default to plate weight per side plus an explicit 45, 55, 60, or custom bar weight. Other bar-based movements support combined plate weight plus bar weight or a directly entered total. A collapsed calculator uses 45, 35, 25, 10, 5, and 2.5 lb plates to show the minimum plate count per side; plans remain transient while nearby stacks are chosen, and only the explicit **Apply … to today’s result** action changes the workout fields. Compatible bar-variation changes preserve total load while converting its entry representation; switching between bar/plate-only and incompatible equipment clears only the load fields and asks for confirmation on the new setup. Every generic `Leg press` entry and the explicit plate-loaded leg-press variation treat the recorded load as combined plate weight only: 160 lb means 80 lb of plates per side, with no carriage or starting resistance added. Current cards, previous results, history, and coaching summaries retain that plate-only wording. The known TANK M4 sled never receives this calculator or any plate/total-weight entry controls; generic and legacy non-TANK sled records retain their compatibility fields. Applying a calculation writes only the existing load, load-mode, and bar-weight fields as appropriate, never changes the prescription, and never progresses a lift automatically. Bar lifts use calculated total weight in history, progress, Markdown, JSON, and CSV output; plate-only leg press keeps its combined-plates meaning. Older records without a load mode remain interpreted as the single total originally entered; the app never guesses a bar weight for them or enables the calculator until a bar weight is explicit.
