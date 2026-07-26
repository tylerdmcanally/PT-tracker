# AFT Workout Tracker

A small, installable, offline-first web app for the four-day Army fitness training split.

## Included

- Four selectable workout-day cards
- Guided run/walk progression through continuous running and a two-mile development phase
- A built-in run/walk timer with live phase, round, next-segment, sound/vibration cues, pause, skip, and reset controls
- Exercise and equipment variants for normal commercial-gym substitutions
- Plate-only entry with live total-weight calculation for barbell, trap-bar, and Smith-machine variations
- Mobile-friendly set and per-set rep selectors prefilled from each prescription
- Automatic next-workout selection in the Day 1 → Day 4 rotation
- Optional arm supersets on Days 1 and 3 plus lateral raises on Day 2
- Strength, running, standard-gym conditioning, and calisthenics logging
- Persistent on-device workout history
- Edit/delete saved sessions
- Progress summary
- Markdown export designed to paste into the master ChatGPT training thread
- JSON backup/import and CSV export
- PWA manifest, offline service worker, and iPhone home-screen icon

## Data storage

Workout data stays in the browser on the device where it was entered. It is not synced to a server. Export a JSON backup periodically and before clearing Safari data, replacing the phone, or changing the deployed site address.

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

## Equipment assumptions

The default program is designed for a normal commercial gym. It uses free weights, dumbbells, common resistance machines, cardio machines, and open floor space when available. It does not require a weighted sled, turf lane, or dedicated Army testing equipment.

Day 3 develops lower-body strength, grip, lateral stability, and repeat-effort conditioning with reverse lunges, farmer carries or static holds, lateral step-ups, and hard intervals on a bike, rower, elliptical, or treadmill.

Day 1 deadlifts can be logged separately with a trap/hex bar, conventional barbell, sumo barbell, or dumbbells. Exercises with realistic commercial-gym substitutions include an explicit variation selector, and every exercise includes progression guidance.

New workouts use the device-local calendar date and default to the day following the most recent saved session. The **New Workout** action returns to that suggested day without affecting saved history. Exercise records use stable IDs so older workouts remain editable as templates gain new accessories.

Every saved run marked **Done** counts toward the current stage’s two-completion target. Session RPE and pain remain visible coaching signals, but they no longer silently prevent a completed run from appearing in progression. The timer automatically logs completed rounds, fills the planned elapsed time on completion, and marks the run done.

Bar-based movements default to logging the combined plate weight plus an editable bar or machine starting weight. The app shows the calculated total live and uses that total in history, progress, Markdown, JSON, and CSV output. Older records remain interpreted as the total load originally entered unless they are edited and switched to **Plates only + bar**.
