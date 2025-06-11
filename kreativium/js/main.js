// js/main.js
import * as Data from './data-manager.js';
import * as UI from './ui-handler.js';

// --- DOM Elements ---
const logForm = document.getElementById('log-form');

// --- App Initialization ---
const startApp = async () => {
    try {
        // 1. Connect to Firebase and sign in the user
        await Data.connectToFirebase();

        // 2. Initialize the User Interface (setup event listeners, load initial data etc.)
        // This will also call renderDashboardCharts internally via loadInitialData
        UI.initializeUI(); 

        // 3. Start listening for quest updates (this will also do initial render)
        Data.listenForQuestUpdates();

        // 4. Attach log form submission listener
        if (logForm) {
            logForm.addEventListener('submit', UI.saveEvent);
        } else {
            // It's possible the log form isn't on every page, so this might not be an error
            // console.warn('Could not find log-form to attach event listener.'); 
        }

        console.log("Kreativeium App Started Successfully!");

    } catch (error) {
        console.error("Error starting Kreativeium App:", error);
        UI.showToast("Critical error starting the app. Please refresh.", "error");
    }
};

// --- Wait for the DOM to be fully loaded before starting the app ---
document.addEventListener('DOMContentLoaded', startApp); 