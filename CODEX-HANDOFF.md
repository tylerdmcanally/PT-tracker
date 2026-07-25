# Codex Deployment Handoff

## Goal

Review, test, and deploy this mobile-first AFT Workout Tracker as a static Progressive Web App, preferably on Vercel.

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

## Deployment tasks

1. Run the app through a local HTTP server.
2. Check JavaScript syntax and browser console errors.
3. Test saving, editing, deleting, Markdown export, JSON backup/import, and CSV export.
4. Confirm the manifest and service worker load correctly.
5. Verify offline behavior after the first load.
6. Deploy to Vercel as a static site with no build command.
7. Test iPhone Safari and Add to Home Screen.
8. Return the production HTTPS URL and any GitHub setup instructions.

## Data model

Workout data is stored in browser `localStorage`. This means it persists on the same device and origin but does not automatically sync between devices. JSON backup/import is the supported portability mechanism.
