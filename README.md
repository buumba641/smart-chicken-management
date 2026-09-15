# Smart Chicken

## Overview

Smart Chicken is a practical poultry-house monitoring and management application. It reads live sensor documents from Firebase Firestore, tracks the active chick cycle, and gives farmers a focused dashboard for house conditions, mortality, reminders, feed phases, vaccinations, and health guidance.

## Features

- Live Firestore listeners (no polling) for the latest `sensorReadings` document
- Health status with critical/warning priority rules
- Sensor cards for temperature, humidity, water level, and feed level
- Heater ON/OFF state from the Firestore relay value
- Current-cycle chick age, mortality, feed phase, and destructive cycle reset
- Calendar events for feed phases, vaccinations, stress-pack recommendations, and custom reminders
- Current-cycle records with real-time mortality updates
- ChicDoc chat through a server-side Gemini endpoint with Firestore knowledge-base retrieval
- Line charts for temperature, humidity, and water/feed levels (last 50 readings)
- Loading, empty, and error states
- Responsive layout for desktop, tablet, and mobile

## Tech Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- Firebase Firestore
- Recharts
- Lucide React

## Architecture

- `src/lib/firebase.ts` initializes the Firebase client and Firestore
- `src/services/sensorReadings.ts` owns live sensor queries
- `src/services/cycles.ts` owns active-cycle, mortality, reminder, and permanent deletion operations
- `src/lib/health.ts` and `src/lib/cycle.ts` contain testable business rules and schedules
- `src/App.tsx` composes the responsive Dashboard, Calendar, Diagnosis, and Records views
- `api/chicdoc.js` retrieves relevant Firestore knowledge and calls Gemini server-side

## Getting Started

```bash
git clone https://github.com/buumba641/smart-chicken-management.git
cd smart-chicken-management
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

## Environment Variables

The dashboard is configured for the `smart-chicken-management` Firebase project. You can override the public web config with Vite environment variables. Copy `.env.example` to `.env` if you want to set them locally:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_API_KEY` must only be configured as a server/deployment secret. Never put it in a `VITE_` variable, browser code, or the repository. Do not place Firebase Admin SDK private keys in this frontend project.

Firestore must allow client reads on `sensorReadings` for the dashboard to load.

## Firestore Collections

- `sensorReadings/{readingId}` stores ESP8266 sensor readings.
- `cycles/{cycleId}` stores the active chick cycle and arrival date.
- `cycles/{cycleId}/mortality/{recordId}` stores mortality records.
- `cycles/{cycleId}/reminders/{reminderId}` stores custom cycle reminders.
- `knowledgeBase/{documentId}` stores optional ChicDoc reference material.

Starting a new cycle permanently deletes the active cycle, its mortality documents, and its reminder documents before creating the replacement cycle. The application does not archive previous cycles.

Protect write access with Firestore Security Rules and authentication appropriate for the deployment. Do not make the database publicly writable.

## Build

```bash
npm run build
npm run preview
```

## Deployment

The `api/chicdoc.js` endpoint is a Vercel-style serverless function, so deploy this project to Vercel (or adapt the endpoint to the server runtime of another platform). Configure the Firebase `VITE_` variables plus `GEMINI_API_KEY` and `GEMINI_MODEL` in the deployment environment. `vercel.json` keeps the client-side application routeable while preserving the API function.

The GitHub Pages workflow can publish the static dashboard, but it cannot run the server-side ChicDoc endpoint.
