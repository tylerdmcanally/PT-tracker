# AFT Workout Tracker

A small, installable, offline-first web app for the four-day Army fitness training split.

## Included

- Four selectable workout-day cards
- Strength, running, standard-gym conditioning, and calisthenics logging
- Persistent on-device workout history
- Edit/delete saved sessions
- Progress summary
- Markdown export designed to paste into the master ChatGPT training thread
- JSON backup/import and CSV export
- PWA manifest, offline service worker, and iPhone home-screen icon

## Data storage

Workout data stays in the browser on the device where it was entered. It is not synced to a server. Export a JSON backup periodically and before clearing Safari data, replacing the phone, or changing the deployed site address.

## Fastest deployment: Vercel

1. Unzip this folder.
2. Create a new Vercel project and upload/import the folder.
3. No framework or build command is required; it is a static site.
4. Deploy and open the HTTPS address in Safari.

The same folder also works on Netlify, GitHub Pages, or Cloudflare Pages.

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
