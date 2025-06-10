// js/main.js
import * as UI from './ui-handler.js';
import '../tailwind.css';

// Decide which data manager to load
const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const dataModulePath = useMock ? './data-manager.mock.js' : './data-manager.js';

let Data = null;

// --- DOM Elements ---
const logForm = document.getElementById('log-form');

// --- App Initialization ---
const startApp = async () => {
    try {
        // Dynamically import the appropriate data layer
        Data = await import(dataModulePath);

        // Connect (real or mock)
        await Data.connectToFirebase();

        // Initialize UI
        UI.initializeUI();

        // Quest updates (mock implements a noop)
        if (typeof Data.listenForQuestUpdates === 'function') {
            Data.listenForQuestUpdates();
        }

        // Attach form handler
        if (logForm) {
            logForm.addEventListener('submit', UI.saveEvent);
        }

        console.log(`Kreativeium App Started in ${useMock ? 'MOCK' : 'LIVE'} mode`);

    } catch (error) {
        console.error('Failed to start the application:', error);
        UI.showToast(error.message || 'Initialization error', 'error');
    }
};

// --- Start the application once the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', startApp); 