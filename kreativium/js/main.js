// js/main.js
import * as Data from './data-manager.js';
import * as UI from './ui-handler.js';
import '../tailwind.css';

// --- DOM Elements ---
const logForm = document.getElementById('log-form');

// --- App Initialization ---
const startApp = async () => {
    try {
        // 1. Connect to Firebase and sign in the user
        await Data.connectToFirebase();

        // 2. Initialize the User Interface (setup event listeners, etc.)
        UI.initializeUI();

        // 3. Start listening for quest updates (this will also do initial render)
        Data.listenForQuestUpdates();

        // 4. Attach log form submission listener
        if (logForm) {
            logForm.addEventListener('submit', UI.saveEvent);
        } else {
            console.warn('Could not find log-form to attach event listener.');
        }

        console.log("Kreativeium App Started Successfully!");

    } catch (error) {
        console.error("Failed to start the application:", error);
        UI.showToast(error.message, 'error');
    }
};

// --- Start the application once the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', startApp); 