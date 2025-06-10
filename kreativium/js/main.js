// js/main.js
import * as Data from './data-manager.js';
import * as UI from './ui-handler.js';

// --- App Initialization ---
const startApp = async () => {
    try {
        // 1. Connect to Firebase and sign in the user
        await Data.connectToFirebase();

        // 2. Initialize the User Interface (setup event listeners, etc.)
        UI.initializeUI();

        console.log("Kreativeium App Started Successfully!");

    } catch (error) {
        console.error("Failed to start the application:", error);
        UI.showToast(error.message, 'error');
    }
};

// --- Start the application once the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', startApp); 