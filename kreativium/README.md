# Kreativeium Tracker

A sensory tracking web application designed for neurodivergent individuals to monitor and manage sensory experiences, overstimulation triggers, and emotional states.

## Setup Instructions

### 1. Configure Firebase

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Navigate to Project Settings (gear icon)
4. Under "Your apps", click on the web icon (</>)
5. Register your app and copy the Firebase configuration object
6. Open `kreativeium/js/data-manager.js`
7. Replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

### 2. Enable Anonymous Authentication

1. In Firebase Console, go to Authentication
2. Click on "Sign-in method" tab
3. Enable "Anonymous" authentication

### 3. Set up Firestore Database

1. In Firebase Console, go to Firestore Database
2. Create a database (start in test mode for development)
3. The app will automatically create the necessary collections

### 4. Run the Application

Since the app uses ES6 modules, you need to serve it through a local web server:

#### Option 1: VS Code Live Server
- Install the "Live Server" extension in VS Code
- Right-click on `kreativeium/index.html`
- Select "Open with Live Server"

#### Option 2: Using http-server
```bash
# Install globally
npm install -g http-server

# Navigate to the kreativeium directory
cd kreativeium

# Start the server
http-server -p 8080
```

Then open `http://localhost:8080` in your browser.

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