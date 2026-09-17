# AFT Workout Tracker

A small, installable, offline-first web app for coach-directed Army fitness training.

## System boundary

This public repository is canonical for the tracker application, its tests and deployment, workout storage behavior, and the minimum active runtime prescription. Private coaching, Health snapshots, nutrition state, and workout history live in the separate private `tylerdmcanally/aft-coaching` repository. For coaching use, local Codex normally reads reasonably fresh current-day Apple Health data from the separate private `aft-health-ingest` cache and uses `health-auto-export` MCP for optional live/high-resolution refreshes. Neither Health path is integrated into this PWA, and neither requires ChatGPT as a bridge.

## Included

- Six active primary sessions, historical compatibility for legacy Day 1–Day 4 and the retired v1.5.5 Day 1 illness-recovery session, and separate optional recovery and AFT Skill Microdose sessions
- Coach-controlled, versioned workout prescriptions in `program-config.js`
- Saved prescription snapshots so later program changes do not rewrite old workouts, while current logging/equipment choices remain available when editing history
- A read-only current run stage with per-session logging of the stage actually completed
- A built-in walk-first interval timer with live phase, round, next-segment, sound/vibration cues, pause, skip, and reset controls
- Separate programmed interval time, total elapsed time, calculated pace, and device-reported pace
- A dark mobile layout with compact session setup, large completion controls, and one-tap compatible last-load reuse
- A three-step run flow for interval setup, the live timer, and post-run result entry
- Indoor/outdoor, treadmill incline, speed, warm-up/cooldown, heart-rate, and run-discomfort logging
- An optional total-session timer with pause/resume, reload recovery, automatic duration, and manual override
- Numbered exercise order and a session-specific active warm-up shown before Exercise 1
- Guided required/optional workout progress with a one-tap jump to the next unfinished exercise
- Streamlined cards with compact previous results, collapsible notes/pain, and completion controls after the live logging fields
- Exercise and equipment variants for normal commercial-gym substitutions
- Trap-bar plate-per-side logging with 45/55/60/custom bar weights and a live total
- Combined-plate and direct-total modes for other barbell and machine variations
- Mobile-friendly set and per-set rep selectors prefilled from each prescription
- An ordered six-session primary rotation; legacy primary records remain classified as primary history, while recovery and skill-microdose sessions never advance the active rotation
- An independently versioned, once-weekly AFT Skill Microdose with 3 × 4 hand-release push-ups, 3 × 20-second front planks, and optional gentle mobility
- A Monday–Sunday skill-dose rule with the standalone microdose as the sole optional extra in program v1.5.9 while historical v1.3 Day 3 bundles remain compatible
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
- Weekly run distance/time, pain-free run counts, recent pace, and stage-specific best-pace metrics
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

The default versioned program is designed around normal commercial-gym strength and cardio equipment. Program v1.4 added controlled sled work to the legacy Day 3 baseline; active v1.5.9 keeps it in Strength 3 when the gym provides a suitable sled and lane. The same two-round circuit retains the known Torque Fitness TANK M4 Level 3 setup on the approximately 20-yard gym lane. The logger can explicitly preserve unknown loads or distances when exact measurements are unavailable, and an M4 resistance level is never converted to pounds.

Strength 3 uses a coach-capped two-round conditioning circuit: a 45 lb-per-hand farmer carry, lateral step-ups, approximately 30 seconds of hard bike/rower/elliptical work, one controlled backward sled drag, one controlled forward sled push, and 2:30 rest. Sled resistance, hard-cardio duration, and round count never progress automatically.

Historical version 1.3 snapshots retain the original four-component circuit and any saved one-occurrence sled directive. Versions 1.4 through 1.4.4 use a 115 lb total Romanian-deadlift target for 2 × 8 and the original sled-enhanced `foundation-1.4` circuit. Versions 1.4.5 through 1.4.8 use 125 lb for 2 × 8 and a separately versioned circuit template for the known M4 setup. Versions 1.4.9 through 1.5.1 use 135 lb for 2 × 8 without changing the two-round circuit. The September 3 workout remains an immutable v1.5.1 snapshot. Versions 1.5.3 through 1.5.7 use 145 lb for 2 × 8 while retaining the same circuit. Active v1.5.9 Strength 3 uses 155 lb for 2 × 8 and keeps that circuit unchanged. Public v1.5.8 was never installed or synthesized. Visible target loads are never prefilled as completed results.

The active primary program is **AFT Foundation Block 1 v1.5.9**, effective September 17, 2026, with service-worker cache **v53** and data schema 11. Its ordered primary rotation is **Strength 1 — Upper Body and AFT Calisthenics**, **Run 1 — Easy Aerobic Stage 4**, **Strength 2 — Heavy Strength and Carries**, **Aerobic Base — Low-Impact Cardio**, **Strength 3 — Lower / Full Body and SDC**, and **Run 2 — Controlled Stage 4 and Mobility**. Version 1.5.9 redistributes the existing stable exercise identities into these dedicated containers without adding automatic progression or strength volume. Strength 3 carries the cumulative coach-directed changes: Romanian deadlift 155 lb for 2 × 8, one-arm row 50 lb for 3 × 9 per side, tempo body-weight split squat 2 × 12 per leg, 50-second front and side planks, hammer curl 25 lb per hand for 2 × 15, and same-setup overhead cable triceps extension 110 displayed for 2 × 12. Goblet squat, incline press, the two-round circuit, and all TANK metadata remain constrained as prescribed.

The completed September 13 Day 2 workout remains immutable v1.5.6 history, including its saved prescription snapshot, results, RPE, pain, and notes; active v1.5.9 targets never rewrite it. Version 1.5.6 retired the v1.5.5 **Day 1 — Illness Recovery** definition and selector option without replacing it. The completed September 10 v1.5.5 session remains historical data backed by its immutable snapshot and `rotationDayKey: day1`, so it continues to load, edit, export, sync, and count as primary. Legacy Day 1–Day 4 entries, including v1.5.7 Day 3 history, remain immutable and retain their saved primary classification even though those keys are no longer active. September 3 and September 5 remain immutable v1.5.1 and v1.5.3 history, any v1.5.4 workout remains immutable, and versions 1.5.2 and 1.5.8 were never installed or synthesized in the public app.

Strength 2 deadlifts can be logged separately with a trap/hex bar, conventional barbell, sumo barbell, or dumbbells. Exercises with realistic commercial-gym substitutions include an explicit variation selector, and coach notes come directly from the current program configuration.

New workouts use the device-local calendar date and advance only within the six active session keys. When the most recent primary workout uses a retired legacy key, the deterministic boundary default is Strength 1; historical primary classification itself does not depend on active-rotation membership. No illness-recovery definition or coach-directed-alternatives group is active in v1.5.9. Optional recovery and skill-microdose sessions remain non-advancing. The **New Workout** action returns to the suggested active primary session without affecting saved history.

The separately versioned **AFT Skill Microdose v1.0** is available at most once per Monday–Sunday week under normal use. It adds low-fatigue hand-release push-up and front-plank practice without advancing the primary rotation or changing the coach-directed run stage. It is the sole optional extra push-up/plank practice in program v1.5.9; historical v1.3 Day 3 skill bundles continue to retain their original weekly-dose behavior. Completed microdose reps and front-plank seconds count only as AFT-event practice volume, never as benchmark results.

Run progression is coach-directed rather than automatically advanced. Program v1.5.9 holds Stage 4—one minute walking followed by two minutes thirty seconds running for six rounds, totaling 21 programmed minutes—in two dedicated sessions. Run 1 is easy aerobic work at RPE 4–5 using a full-sentence talk test, beginning around 5.4–5.5 mph or slower as needed. Run 2 is controlled work at RPE 5–6, beginning around 5.7–5.8 mph and moving toward 5.9–6.0 only while RPE remains at or below 5 with relaxed mechanics; reduce toward 5.5 or lower if RPE exceeds 6. Both include the same pain and next-day hold/regress safeguards and prioritize duration and reserve over pace. The timer starts every interval round with walking, automatically logs completed rounds and programmed interval time, and marks the run exercise done. Each transition uses a large visual alert, a phase-specific multi-tone pattern, and an optional spoken WALK/RUN cue; a Test RUN alert control lets the user set device or headphone volume before starting. Browser vibration remains a progressive enhancement and is not available through iPhone Safari or directly on Apple Watch. Total elapsed time remains a separate user-entered value and is not used to judge structured interval adherence.

Calculated pace uses total elapsed time divided by distance. A plain elapsed-time value such as `20` means 20 minutes; `20:00` is equivalent. Timed strength fields keep their existing seconds-based behavior. For compatibility, a plain numeric legacy whole-session mobility value follows its saved minute-based prescription, while plank sets remain seconds. When elapsed time is blank, the app can use programmed interval time and labels that basis explicitly. Device-reported pace remains independently editable; a material difference produces an informational warning without blocking the save.

Exercise cards keep the coach prescription, previous results, and today's result visually separate. Last-result lookup uses saved workout date and `updatedAt`, accepts meaningful data even when an older Completed box was missed, excludes the workout currently being edited, and derives compatibility IDs without rewriting history. Different machine variations are labeled as not directly comparable. **Use last load** appears only for an exact compatible variation and never copies completion, sets, reps, RPE, notes, or pain.

Seated and modified-standing lat pulldowns have separate stable variation IDs. A targeted idempotent historical classification corrects only the ambiguous variation metadata on the August 11 and August 18 Day 2 results; their prescription snapshots, loads, repetitions, RPEs, notes, and other completed-session values remain unchanged.

Prescription adherence is derived conservatively from explicit set, rep, timed-set, carry trip/distance, cardio-duration, structured run, circuit-component, round-count, and load targets. A walk/run result is assessable from its stage, walk and run durations, planned rounds, and completed rounds; extra elapsed time does not invalidate an exact interval result. Carry duration or load is ignored unless the prescription explicitly targets it. A completed load above or below an explicit load target is **Modified**, not automatically considered met. Multiple structured reasons remain visible in the workout, history, Markdown, and CSV. Adherence never changes programming automatically. The coach export also reuses the same comparability rules to include at most one chronologically prior compatible result per completed exercise and calculates represented weekly practice rows from complete Monday–Sunday history.

Each of the six active primary sessions displays its own warm-up and ordered exercises. Runs are dedicated sessions rather than post-strength blocks, Aerobic Base remains low-impact cardio rather than an automatic third run, and every walk/run timer begins with the walk segment before progressing to the run segment. The retired September 10 snapshot preserves its own return-to-exercise check for historical rendering only.

Trap-bar deadlifts default to plate weight per side plus an explicit 45, 55, 60, or custom bar weight. Other bar-based movements support combined plate weight plus bar weight or a directly entered total. The app uses calculated total weight in history, progress, Markdown, JSON, and CSV output. Older records without a load mode remain interpreted as the single total originally entered; the app never guesses a bar weight for them.
