# Kreativeium Tracker

A sensory tracking web application designed for neurodivergent individuals to monitor and manage sensory experiences, overstimulation triggers, and emotional states.

## Setup Instructions

### 1. Configure Firebase

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Navigate to Project Settings (gear icon)
4. Under "Your apps", click on the web icon (</>)
5. Register your app and copy the Firebase configuration object
6. Kopier filen `env.example` til `.env` i prosjektets rotmappe og fyll inn dine Firebase-verdier:

```ini
VITE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
VITE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
VITE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
VITE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
VITE_APP_ID="YOUR_FIREBASE_APP_ID"
VITE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"
```

### 2. Enable Anonymous Authentication

1. In Firebase Console, go to Authentication
2. Click on "Sign-in method" tab
3. Enable "Anonymous" authentication

### 3. Set up Firestore Database

1. In Firebase Console, go to Firestore Database
2. Create a database (start in test mode for development)
3. The app will automatically create the necessary collections

### 4. Setup & Running with Vite

1. Klon repositoriet
   ```bash
   git clone https://github.com/whoamaiii/kreativeium-tracker.git
   cd kreativeium-tracker
   ```

2. Installer avhengigheter
   ```bash
   npm install
   ```

3. Opprett `.env` (se steg 1 over).

4. Kjør utviklingsserveren
   ```bash
   npm run dev
   ```
   Som standard er appen tilgjengelig på `http://localhost:5173`.

5. Bygg for produksjon
   ```bash
   npm run build
   ```
   Dette lager en optimalisert versjon i `dist/`-mappen i prosjektets rot.

6. (Valgfritt) forhåndsvis produksjonsbygget
   ```bash
   npm run preview
   ```

## Project Structure

```
kreativeium/
├── index.html          # Main HTML file
├── style.css          # All styles
├── js/
│   ├── main.js        # App initialization
│   ├── data-manager.js # Firebase & data operations
│   ├── ui-handler.js  # UI rendering & interactions
│   └── chart-service.js # Chart.js visualizations
└── README.md          # This file
```

## Features

- **Experience Tracking**: Log sensory triggers, moods, and energy levels
- **Quest System**: Create and track personal goals with subtasks
- **Data Visualization**: View patterns in triggers and mood trends
- **Coping Strategies**: Maintain a personal library of strategies
- **History View**: Search and review past experiences

## Troubleshooting

- **CORS Errors**: Make sure you're running the app through a local server, not opening the HTML file directly
- **Firebase Errors**: Check that your Firebase configuration is correct and authentication is enabled
- **No Data Showing**: The app uses anonymous authentication - data is tied to your browser session 