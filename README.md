# AFT Workout Tracker

A small, installable, offline-first web app for the four-day Army fitness training split.

## Included

- Four primary workout days plus an optional recovery session
- Coach-controlled, versioned workout prescriptions in `program-config.js`
- Saved prescription snapshots so later program changes do not rewrite old workouts, while current logging/equipment choices remain available when editing history
- A read-only current run stage with per-session logging of the stage actually completed
- A built-in walk-first interval timer with live phase, round, next-segment, sound/vibration cues, pause, skip, and reset controls
- Separate programmed interval time, total elapsed time, calculated pace, and device-reported pace
- Indoor/outdoor, treadmill incline, speed, warm-up/cooldown, heart-rate, and run-discomfort logging
- An optional total-session timer with pause/resume, reload recovery, automatic duration, and manual override
- Numbered exercise order and a day-specific active warm-up shown before Exercise 1
- Exercise and equipment variants for normal commercial-gym substitutions
- Trap-bar plate-per-side logging with 45/55/60/custom bar weights and a live total
- Combined-plate and direct-total modes for other barbell and machine variations
- Mobile-friendly set and per-set rep selectors prefilled from each prescription
- Automatic Day 1 → Day 4 rotation that ignores recovery sessions
- Variation-aware last results plus a collapsed three-result history on every exercise card
- Optional **Use last load** actions that copy only compatible load fields
- Coach-controlled, exercise-specific note overlays that can be resolved without changing the program version or historical prescriptions
- A separate derived prescription-adherence result for met, below-target, partial, not-assessable, and optional work
- A pre-save review for unchecked result data and incomplete or entirely missing rep/time set logs when other results were entered
- Strength, running, standard-gym conditioning, and calisthenics logging
- Separate readiness, sleep quality, muscle soreness, session pain, and optional structured exercise-specific pain tracking
- Weekly push-up and front-plank progress totals
- Weekly run distance/time, pain-free run counts, recent pace, and stage-specific best-pace metrics
- Autosaved workout drafts and durable on-device workout history
- Five rolling local restore points, protected-storage status, and backup reminders
- Edit/delete saved sessions
- Progress summary
- Detailed Markdown export for the coach chat, including adherence, one prior comparable result, active coach notes, and full exercise/session notes
- JSON backup/import and CSV export
- PWA manifest, offline service worker, and iPhone home-screen icon

## Data storage

Workout data stays in the browser on the device where it was entered. It is not synced to a server.

The app requests protected browser storage when the user chooses **Protect device storage**, autosaves the active workout and session timer, and keeps up to five rolling restore points before important writes, imports, and deletions. Those measures protect against accidental in-app changes and reduce browser-eviction risk, but they cannot survive a lost device, device wipe, cleared Safari data, or a changed site address. Export a JSON backup periodically for that protection.

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
```

## Equipment assumptions

The default program is designed for a normal commercial gym. It uses free weights, dumbbells, common resistance machines, cardio machines, and open floor space when available. It does not require a weighted sled, turf lane, or dedicated Army testing equipment.

Day 3 uses a coach-capped two-round conditioning circuit: a 45 lb-per-hand farmer carry, lateral step-ups, 45 seconds of hard bike/rower/elliptical work, and 2:30 rest.

Program v1.3 displays the synchronized Day 3 Romanian-deadlift target as 95 lb total for 2 × 8. The load is a visible target and is not prefilled as if it had already been performed.

Day 1 deadlifts can be logged separately with a trap/hex bar, conventional barbell, sumo barbell, or dumbbells. Exercises with realistic commercial-gym substitutions include an explicit variation selector, and coach notes come directly from the current program configuration.

New workouts use the device-local calendar date and default to the day following the most recent saved primary session. Optional recovery sessions appear in history and exports but do not advance that rotation. The **New Workout** action returns to the suggested primary day without affecting saved history.

Run progression is coach-directed rather than automatically advanced. Program v1.3 uses Stage 2—one minute walking followed by 1:30 running for eight rounds—on Days 1 and 4. The timer starts every interval round with walking, automatically logs completed rounds and programmed interval time, and marks the run exercise done. Total elapsed time remains a separate user-entered value.

Calculated pace uses total elapsed time divided by distance. A plain elapsed-time value such as `20` means 20 minutes; `20:00` is equivalent. Timed strength fields keep their existing seconds-based behavior. When elapsed time is blank, the app can use programmed interval time and labels that basis explicitly. Device-reported pace remains independently editable; a material difference produces an informational warning without blocking the save.

Exercise cards keep the coach prescription, previous results, and today's result visually separate. Last-result lookup uses saved workout date and `updatedAt`, accepts meaningful data even when an older Completed box was missed, excludes the workout currently being edited, and derives compatibility IDs without rewriting history. Different machine variations are labeled as not directly comparable. **Use last load** appears only for an exact compatible variation and never copies completion, sets, reps, RPE, notes, or pain.

Prescription adherence is derived conservatively from explicit set, rep, timed-set, cardio-duration, and load targets. It never changes programming automatically. The coach export also reuses the same comparability rules to include at most one chronologically prior compatible result per completed exercise.

The full Day 1 walk/run interval block remains after the primary strength work because it is conditioning, not the warm-up. Every workout displays a separate 5–10 minute active warm-up. Day 4 starts with its primary run after that warm-up, and every walk/run timer begins with the walk segment before progressing to the run segment.

Trap-bar deadlifts default to plate weight per side plus an explicit 45, 55, 60, or custom bar weight. Other bar-based movements support combined plate weight plus bar weight or a directly entered total. The app uses calculated total weight in history, progress, Markdown, JSON, and CSV output. Older records without a load mode remain interpreted as the single total originally entered; the app never guesses a bar weight for them.
