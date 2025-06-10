// js/ui-handler.js
import * as Data from './data-manager.js';
import * as Charts from './chart-service.js';
import { addRippleListener, showToast } from './ui/index.js';

// --- Global State for Log Form ---
let currentLogData = { mood: null, energy: null };

// Expose for testing purposes (remove in production)
window._currentLogData = currentLogData;

// --- Configuration & Constants ---
export const SENSORY_TRIGGERS = {
    AUDITORY: { id: "AUDITORY", label: "Sounds", icon: "hearing", color: "text-blue-400" },
    VISUAL: { id: "VISUAL", label: "Sights", icon: "visibility", color: "text-pink-400" },
    TACTILE: { id: "TACTILE", label: "Touch", icon: "touch_app", color: "text-green-400" },
    OLFACTORY: { id: "OLFACTORY", label: "Smells", icon: "air", color: "text-yellow-400" },
    GUSTATORY: { id: "GUSTATORY", label: "Tastes", icon: "restaurant", color: "text-orange-400" },
    VESTIBULAR: { id: "VESTIBULAR", label: "Movement", icon: "directions_run", color: "text-purple-400" },
    PROPRIOCEPTION: { id: "PROPRIOCEPTION", label: "Body Sense", icon: "accessibility_new", color: "text-indigo-400" },
    INTEROCEPTION: { id: "INTEROCEPTION", label: "Internal", icon: "thermostat", color: "text-red-400" }
};

export const MOODS = {
    ECSTATIC: { emoji: "🤩", label: "Ecstatic", value: 5, color: "text-yellow-400"},
    HAPPY:    { emoji: "😊", label: "Happy",    value: 4, color: "text-green-400"},
    NEUTRAL:  { emoji: "😐", label: "Neutral",  value: 3, color: "text-blue-400"},
    SAD:      { emoji: "😟", label: "Sad",      value: 2, color: "text-purple-400"},
    DISTRESSED: { emoji: "😫", label: "Distressed",value: 1, color: "text-red-400"}
};

export const ENERGY_LEVELS = {
    HIGH:   { icon: "battery_charging_full", label: "High",   value: 3, color: "text-green-500" },
    MEDIUM: { icon: "battery_5_bar", label: "Medium", value: 2, color: "text-yellow-500" },
    LOW:    { icon: "battery_1_bar", label: "Low",    value: 1, color: "text-red-500" }
};

const PAGES = {
    DASHBOARD: "dashboard-page",
    LOG: "log-page",
    HISTORY: "history-page",
    QUESTS: "quests-page",
    STRATEGIES: "strategies-page"
};

// --- Navigation ---
export function navigateTo(hash) {
    const newHash = hash.startsWith('#') ? hash : '#' + hash;
    const targetPageId = newHash.substring(1).split('/')[0];
    
    document.querySelectorAll(".page").forEach(page => page.classList.add("hidden"));
    const targetPage = document.getElementById(targetPageId + "-page");
    if (targetPage) {
        targetPage.classList.remove("hidden");
    } else {
        document.getElementById("dashboard-page").classList.remove("hidden");
        console.warn(`Page not found for hash: ${newHash}, defaulting to dashboard.`);
    }

    document.querySelectorAll("#sidebar-nav .sidebar-link").forEach(link => {
        if (link.getAttribute("href") === newHash || (newHash.startsWith(link.getAttribute("href")) && link.getAttribute("href") !== '#')) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    // Handle strategies submenu based on hash
    const strategiesToggle = document.getElementById('strategies-toggle');
    const strategiesSubmenu = document.getElementById('strategies-submenu');
    if (newHash.startsWith('#strategies')) {
        strategiesToggle.classList.add('active', 'open');
        strategiesSubmenu.classList.add('open');
        strategiesSubmenu.style.maxHeight = strategiesSubmenu.scrollHeight + "px";
        if (targetPageId === "strategies") {
             document.querySelector('#strategies-submenu a[href="#strategies"]').classList.add('active');
        }
    } else {
        strategiesToggle.classList.remove('active', 'open');
        strategiesSubmenu.classList.remove('open');
        strategiesSubmenu.style.maxHeight = '0';
    }

    window.location.hash = newHash;
    
    // Load page-specific data if needed
    if (targetPageId === "history") renderHistory();
}

function setupNavigation() {
    document.querySelectorAll(".nav-link").forEach(link => {
        addRippleListener(link);
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const href = link.getAttribute("href");
            if (href && href !== '#') {
                navigateTo(href);
            }
        });
    });

    const strategiesToggle = document.getElementById('strategies-toggle');
    if (strategiesToggle) {
        addRippleListener(strategiesToggle); // Ripple for the main strategies toggle
        strategiesToggle.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent hash change if it's an <a> tag
            const submenu = document.getElementById('strategies-submenu');
            const icon = this.querySelector('.material-symbols-outlined.transform');
            this.classList.toggle('open');
            submenu.classList.toggle('open');
            if (submenu.classList.contains('open')) {
                submenu.style.maxHeight = submenu.scrollHeight + "px";
                icon.style.transform = 'rotate(180deg)';
                // If navigating to #strategies, ensure the submenu link is also active
                if(window.location.hash.startsWith('#strategies')) {
                     document.querySelector('#strategies-submenu a[href="#strategies"]').classList.add('active');
                }
            } else {
                submenu.style.maxHeight = '0';
                icon.style.transform = 'rotate(0deg)';
            }
        });
    }

    // Add ripple to submenu links for strategies if they exist
    document.querySelectorAll('#strategies-submenu .nav-link').forEach(addRippleListener);

    window.addEventListener("hashchange", () => navigateTo(window.location.hash));
}

// --- New function to render quests on the dashboard ---
export function renderDashboardQuests(quests) {
    console.log("[ui-handler] renderDashboardQuests received raw quests:", JSON.parse(JSON.stringify(quests))); // Log raw quests
    const questListContainer = document.getElementById('dashboard-quest-list');
    if (!questListContainer) {
        console.error("Dashboard quest list container not found!");
        return;
    }
    questListContainer.innerHTML = ''; // Clear previous content

    // Find quests that are not yet 100% complete
    const activeQuests = quests.filter(quest => {
        if (!quest.subquests || !Array.isArray(quest.subquests) || quest.subquests.length === 0) {
            return quest.hasOwnProperty('subquests'); 
        }
        const completedCount = quest.subquests.filter(sq => sq.completed).length;
        return completedCount < quest.subquests.length;
    });
    console.log("[ui-handler] Filtered activeQuests:", JSON.parse(JSON.stringify(activeQuests))); // Log active quests

    if (activeQuests.length === 0) {
        questListContainer.innerHTML = `<p class="text-gray-400 italic">No active quests for today. Great job!</p>`;
        return;
    }

    // Sort by createdAt ascending (oldest first) to ensure 'slice(-3)' gets the latest three *if* they were oldest
    // The prompt asks for "top 3 oldest quests". If `allQuests` is already sorted with oldest first (ascending), then slice(0,3) is what we need.
    // If `allQuests` is sorted newest first (descending, as often is the case with `orderBy('createdAt', 'desc')`)
    // then `slice(-3).reverse()` would give the 3rd, 2nd, and 1st newest (i.e. 3 newest, with newest first).
    // The prompt's example code uses `activeQuests.slice(-3).reverse();` which implies the original `quests` array might be newest first or unsorted.
    // To be safe and explicit for "oldest quests", let's sort activeQuests by `createdAt` ascending.
    const sortedActiveQuests = activeQuests.sort((a, b) => {
        const dateA = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : (a.createdAt || 0);
        const dateB = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : (b.createdAt || 0);
        return dateA - dateB; // Oldest first
    });

    const questsToShow = sortedActiveQuests.slice(0, 3); // Get the first 3 (oldest)
    console.log("[ui-handler] questsToShow (oldest 3 active):", JSON.parse(JSON.stringify(questsToShow))); // Log quests to show

    questsToShow.forEach(quest => {
        const completedCount = quest.subquests && Array.isArray(quest.subquests) ? quest.subquests.filter(sq => sq.completed).length : 0;
        const totalSubquests = quest.subquests && Array.isArray(quest.subquests) ? quest.subquests.length : 0;
        const progress = totalSubquests > 0 ? (completedCount / totalSubquests) * 100 : 0;

        const questDiv = document.createElement('div');
        questDiv.innerHTML = `
            <div>
                <p class="font-semibold text-gray-200">${quest.title}</p>
                <div class="text-xs text-gray-400 mb-1 text-right">${Math.round(progress)}% Complete</div>
                <div class="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden shadow-inner">
                    <div class="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-500" style="width: ${progress}%;"></div>
                </div>
            </div>
        `;
        questListContainer.appendChild(questDiv);
    });
}

// --- UI Initialization ---
export async function initializeUI() {
    initializeUIElements();
    setupNavigation();
    setupFormListeners();
    
    // Load initial data
    await loadInitialData();
    
    // Navigate to initial page
    navigateTo(window.location.hash || '#dashboard');
}

async function loadInitialData() {
    try {
        await renderDashboardCharts();
        await renderRecentActivities();
        await renderStrategies();
    } catch (error) {
        console.error("Error loading initial data:", error);
        showToast("Error loading data. Please refresh.", "error");
    }
}

function initializeUIElements() {
    // Mood selector
    const moodSelector = document.getElementById("mood-selector");
    Object.values(MOODS).forEach(mood => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `mood-emoji-btn ${mood.color}`;
        button.textContent = mood.emoji;
        button.dataset.value = mood.value;
        button.title = mood.label;
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-label', mood.label);
        button.setAttribute('aria-checked', 'false');
        button.addEventListener("click", (e) => {
            
            // Create ripple effect
            try {
                createRippleEffect(button, e);
            } catch (error) {
                console.error('Ripple effect error:', error);
            }
            
            // Remove selected class from all mood buttons
            document.querySelectorAll('.mood-emoji-btn').forEach(btn => {
                btn.classList.remove('selected');
                // Deselect animation
                if (btn !== button) { // Apply deselect animation only to other buttons
                    btn.style.animation = 'deselectFade 0.3s ease-out';
                    setTimeout(() => { // Clear animation after it plays
                        btn.style.animation = '';
                    }, 300);
                }
            });
            
            // Add selected class to clicked button
            button.classList.add('selected');
            
            // Add selection animation
            button.style.animation = 'selectPulse 0.6s ease-out, emojiSpin 0.5s ease-out';
            
            // Update current mood
            currentLogData.mood = parseInt(mood.value);
            
            // Visual feedback (already part of animations, but can be kept if desired for immediate effect)
            // button.style.transform = 'scale(1.2)'; 
            setTimeout(() => {
                // button.style.transform = 'scale(1)';
                if (button.style.animation.includes('selectPulse') || button.style.animation.includes('emojiSpin')) {
                    // Clear combined animation after it has had time to complete both parts
                    // The longest part is selectPulse at 0.6s
                }
                 // We generally want to clear the animation property after it runs 
                 // to allow it to be re-triggered or for other styles to apply.
                 // However, the selectPulse itself is designed to return to a base state.
                 // If animations are stacking or not resetting, explicitly clear here.
                 // For now, let the combined animation run its course. The timeout for clearing below is better.
            }, 300); // This timeout might be too short for the full 0.6s animation

            // Clear animation after it has completed to allow re-triggering
            setTimeout(() => {
                button.style.animation = '';
            }, 600); // Match the longest animation duration (selectPulse)
            
            console.log('Mood updated:', currentLogData);
        });
        moodSelector.appendChild(button);
    });

    // Energy selector
    const energySelector = document.getElementById("energy-selector");
    Object.values(ENERGY_LEVELS).forEach(level => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `energy-level-btn ${level.color}`;
        button.innerHTML = `<span class="material-symbols-outlined">${level.icon}</span>`;
        button.dataset.value = level.value;
        button.title = level.label;
        button.setAttribute('role', 'radio');
        button.setAttribute('aria-label', level.label);
        button.setAttribute('aria-checked', 'false');
        button.addEventListener("click", (e) => {
            // Add ripple effect
            createRippleEffect(button, e);
            
            // Deselect all buttons with animation
            energySelector.querySelectorAll(".energy-level-btn").forEach(btn => {
                if (btn.classList.contains("selected")) {
                    btn.style.animation = "deselectFade 0.3s ease";
                    setTimeout(() => {
                        btn.style.animation = "";
                    }, 300);
                }
                btn.classList.remove("selected");
                btn.setAttribute('aria-checked', 'false');
            });
            
            // Select this button with enhanced animation
            button.classList.add("selected");
            button.setAttribute('aria-checked', 'true');
            currentLogData.energy = parseInt(level.value); // Store selected energy
            
            // Add haptic-like feedback (visual pulse)
            button.style.animation = "selectPulse 0.6s ease, energyFlash 0.4s ease";
            setTimeout(() => {
                button.style.animation = "";
            }, 600);
            
            console.log('Energy updated:', currentLogData); // Debug log
        });
        energySelector.appendChild(button);
    });

    // Triggers Selection
    const triggersContainer = document.getElementById("triggers-selection");
    if (triggersContainer) {
        Object.values(SENSORY_TRIGGERS).forEach(trigger => {
            const label = document.createElement("label");
            label.className = `trigger-checkbox-label bg-gray-700 p-3 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:bg-gray-600 ${trigger.color.replace('text-', 'border-')} border-2 border-transparent`;
            addRippleListener(label);
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "sr-only trigger-checkbox"; // Screen-reader only, label handles visual
            checkbox.value = trigger.id;
            checkbox.id = `trigger-${trigger.id}`;
            checkbox.addEventListener('change', (e) => {
                currentLogData.triggers = currentLogData.triggers || [];
                if (e.target.checked) {
                    currentLogData.triggers.push(trigger.id);
                    label.classList.add('selected-trigger', trigger.color.replace('text-', 'border-'));
                    label.classList.remove('border-transparent');
                } else {
                    currentLogData.triggers = currentLogData.triggers.filter(t => t !== trigger.id);
                    label.classList.remove('selected-trigger', trigger.color.replace('text-', 'border-'));
                    label.classList.add('border-transparent');
                }
                console.log('Triggers updated:', currentLogData.triggers);
            });

            const iconSpan = document.createElement('span');
            iconSpan.className = `material-symbols-outlined text-4xl mb-2 ${trigger.color}`;
            iconSpan.textContent = trigger.icon;

            const textSpan = document.createElement('span');
            textSpan.className = "text-sm font-medium text-gray-200";
            textSpan.textContent = trigger.label;

            label.appendChild(checkbox);
            label.appendChild(iconSpan);
            label.appendChild(textSpan);
            triggersContainer.appendChild(label);
        });
    }

    const intensitySlider = document.getElementById('log-intensity');
    const intensityValue = document.getElementById('intensity-value');
    if (intensitySlider && intensityValue) {
        intensitySlider.addEventListener('input', (event) => {
            intensityValue.textContent = event.target.value;
        });
        // Ripple for slider is generally not standard, skipping for now
    }

    // Static Buttons ripples
    addRippleListener(document.querySelector('#dashboard-page a[href="#log"]'));
    addRippleListener(document.querySelector('#log-form button[type="submit"]'));
    addRippleListener(document.getElementById('add-subtask-btn'));
    addRippleListener(document.querySelector('#quest-form button[type="submit"]'));
    
    // Add New Strategy Button (assuming an ID, adjust if different)
    addRippleListener(document.getElementById('add-new-strategy-btn')); 

    const strategyModal = document.getElementById('strategy-modal');
    if (strategyModal) {
        addRippleListener(strategyModal.querySelector('.close-modal-btn'));
        addRippleListener(strategyModal.querySelector('#save-strategy-btn'));
    }
    
    // History page elements (example: clear history button)
    addRippleListener(document.getElementById('clear-history-btn'));

    // Quest Log page - Add Quest button is part of quest-form, already covered
    // Individual quest card action buttons are handled in renderQuests

    // Strategies page - Add New Strategy button (already added), individual card actions handled in renderStrategies
}

// --- Form Listeners ---
// New saveEvent function
export async function saveEvent(event) {
    event.preventDefault();
    const logForm = document.getElementById("log-form"); // Get form inside the handler
    const moodButton = logForm.querySelector("#mood-selector .selected");
    const energyButton = logForm.querySelector("#energy-selector .selected");
    const selectedTriggers = Array.from(logForm.querySelectorAll("#triggers-selection input:checked")).map(cb => cb.value);

    // Validate required fields
    if (!moodButton) {
        showToast("Please select how you\'re feeling", "error");
        document.getElementById("mood-selector").scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    if (!energyButton) {
        showToast("Please select your energy level", "error");
        document.getElementById("energy-selector").scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const experienceData = {
        mood: parseInt(moodButton.dataset.value),
        energyLevel: parseInt(energyButton.dataset.value),
        triggers: selectedTriggers,
        intensity: parseInt(document.getElementById("log-intensity").value),
        environment: document.getElementById("log-environment").value.trim(),
        intervention: document.getElementById("log-intervention").value.trim(),
        notes: document.getElementById("log-notes").value.trim(),
    };

    try {
        await Data.logExperience(experienceData);
        showToast("Experience logged successfully!", "success");
        logForm.reset();
        // Reset custom UI elements
        logForm.querySelectorAll("#mood-selector .selected, #energy-selector .selected").forEach(btn => btn.classList.remove("selected"));
        logForm.querySelectorAll("#triggers-selection .selected-trigger").forEach(lbl => lbl.classList.remove("selected-trigger"));
        document.getElementById("intensity-value").textContent = "5"; // Reset intensity display
        
        // Refresh relevant UI parts
        await renderDashboardCharts(); // Ensure this function is accessible or imported if moved
        await renderRecentActivities(); // Ensure this function is accessible or imported if moved
        navigateTo('#dashboard'); // Ensure this function is accessible
    } catch (error) {
        console.error("Failed to log experience:", error); // Log the actual error
        showToast(`Failed to log experience: ${error.message}`, "error");
    }
}

function setupFormListeners() {
    // Log form submission listener removed from here

    // Quest form submission
    const questForm = document.getElementById("quest-form");
    const addSubtaskBtn = document.getElementById("add-subtask-btn");
    const subtasksContainer = document.getElementById("subtasks-container");

    const createSubtaskInput = (value = "", isFirst = false) => {
        const container = document.createElement('div');
        container.className = 'flex items-center space-x-2 subtask-item mb-2';

        const input = document.createElement('input');
        input.type = 'text';
        input.name = 'subtask';
        input.placeholder = isFirst ? 'Break down your quest...' : 'Another sub-task...';
        input.className = 'flex-grow bg-gray-700 text-gray-100 border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm placeholder-gray-500';
        input.value = value;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-subtask-btn text-red-400 hover:text-red-300 p-1 rounded-full no-bubble-ripple'; // Added no-bubble-ripple
        removeBtn.innerHTML = '<span class="material-symbols-outlined text-xl">remove_circle_outline</span>';
        if (isFirst && document.getElementById('subtasks-container').children.length === 0) { // Only hide if it's truly the first and only one being added initially
            removeBtn.classList.add('hidden'); 
        }
        addRippleListener(removeBtn);
        removeBtn.onclick = () => {
            const subtaskContainer = document.getElementById('subtasks-container');
            if (subtaskContainer.children.length > 1) { 
                container.remove();
                // Ensure the first item's remove button is hidden if it becomes the only one
                if (subtaskContainer.children.length === 1) {
                    const firstRemoveBtn = subtaskContainer.querySelector('.subtask-item .remove-subtask-btn');
                    if (firstRemoveBtn) firstRemoveBtn.classList.add('hidden');
                }
            } else {
                showToast("At least one sub-task is required for a quest.", "info");
            }
        };
        
        container.appendChild(input);
        container.appendChild(removeBtn);
        return container;
    };

    addSubtaskBtn.addEventListener("click", () => {
        const newSubtaskField = createSubtaskInput();
        subtasksContainer.appendChild(newSubtaskField);
        newSubtaskField.querySelector('input').focus();
    });

    questForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = questForm.elements.questTitle.value.trim();
        const subtasks = Array.from(questForm.elements.subtask)
                            .map(input => input.value.trim())
                            .filter(text => text !== "");
        if (!title) {
            showToast("Quest title is required.", "error");
            return;
        }
        try {
            await Data.addQuest(title, subtasks);
            showToast("Quest launched!", "success");
            questForm.reset();
            subtasksContainer.innerHTML = '<div class="flex items-center space-x-2"><input class="flex-grow bg-gray-700 text-gray-100 border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm placeholder-gray-500" name="subtask" placeholder="Break down your quest..." type="text"><button class="remove-subtask-btn text-red-400 hover:text-red-300 p-1 rounded-full hidden" type="button"><span class="material-symbols-outlined text-xl">remove_circle_outline</span></button></div>';
            await renderQuests();
        } catch (error) {
            showToast("Failed to launch quest.", "error");
        }
    });

    // History search
    document.getElementById("history-search").addEventListener("input", () => renderHistory());
    
    // Strategy Search
    document.getElementById('strategy-search').addEventListener('input', () => renderStrategies());

    // Strategy Modal & Form
    const strategyModal = document.getElementById('strategy-modal');
    const strategyForm = document.getElementById('strategy-form');
    const addStrategyButton = document.getElementById('add-strategy-button');
    const cancelStrategyButton = document.getElementById('cancel-strategy-button');

    addStrategyButton.addEventListener('click', () => openStrategyModal());
    cancelStrategyButton.addEventListener('click', () => strategyModal.classList.add('hidden'));
    strategyModal.addEventListener('click', (e) => {
        if (e.target === strategyModal) strategyModal.classList.add('hidden');
    });

    strategyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('strategy-id').value;
        const title = document.getElementById('strategy-title').value.trim();
        const description = document.getElementById('strategy-description').value.trim();
        const tagsString = document.getElementById('strategy-tags').value.trim();
        const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        if (!title) {
            showToast('Strategy title is required.', 'error');
            return;
        }
        try {
            await Data.saveStrategy({ title, description, tags }, id || null);
            showToast(id ? "Strategy updated successfully!" : "Strategy added successfully!", "success");
            strategyModal.classList.add('hidden');
            await renderStrategies();
        } catch (error) {
            showToast(`Failed to save strategy: ${error.message}`, "error");
        }
    });

    // SOS Button
    const sosButton = document.getElementById('sos-button');
    sosButton.addEventListener('click', async () => {
        const strategies = await Data.getStrategies();
        if (strategies.length === 0) {
            return showToast("No strategies defined. Add some first!", "warning");
        }
        const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
        
        sosButton.classList.add('sos-active');
        setTimeout(() => sosButton.classList.remove('sos-active'), 1500);

        showToast(`🆘 SOS: ${randomStrategy.title}. ${randomStrategy.description || 'Try this now!'}`, "info", 10000);
    });
}

// --- Rendering Functions ---
async function renderDashboardCharts() {
    const experiences = await Data.getExperiences({limit: 30});
    Charts.renderDashboardCharts(experiences, SENSORY_TRIGGERS);
}

async function renderRecentActivities() {
    const activityList = document.getElementById("recent-activity-list");
    activityList.innerHTML = '<p class="text-gray-400 italic">Loading insights...</p>';
    const experiences = await Data.getExperiences({ limit: 5 });
    if (experiences.length === 0) {
        activityList.innerHTML = '<p class="text-gray-400 italic">Start logging to see your personalized insights here.</p>';
        return;
    }
    activityList.innerHTML = "";
    experiences.forEach(exp => {
        const moodObj = Object.values(MOODS).find(m => m.value === exp.mood);
        const energyObj = Object.values(ENERGY_LEVELS).find(el => el.value === exp.energyLevel);
        const item = document.createElement("div");
        item.className = "p-3 bg-gray-700/50 rounded-lg shadow-sm hover:bg-gray-700 transition-colors duration-200";
        item.innerHTML = `
            <p class="text-sm font-semibold text-pink-400">
                ${moodObj ? moodObj.emoji + " " + moodObj.label : 'Mood not specified'}
                ${energyObj ? '(Energy: ' + energyObj.label + ')' : ''}
            </p>
            <p class="text-xs text-gray-400 mb-1">${exp.timestamp?.toDate?.()?.toLocaleDateString?.() || 'Date unknown'}</p>
            <p class="text-xs text-gray-300 truncate">${exp.notes || "No notes."}</p>
            ${exp.triggers && exp.triggers.length > 0 ? 
                `<div class="mt-1 text-xs text-gray-500">Triggers: ${exp.triggers.map(t_id => SENSORY_TRIGGERS[t_id]?.label || t_id).join(', ')}</div>` : ''}
        `;
        activityList.appendChild(item);
    });
}

async function renderHistory() {
    const historyList = document.getElementById("history-list");
    const searchTerm = document.getElementById("history-search").value.toLowerCase();
    historyList.innerHTML = '<p class="text-gray-400 p-4">Loading history...</p>';
    const experiences = await Data.getExperiences();

    const filteredExperiences = experiences.filter(exp => {
        if (!searchTerm) return true;
        const moodObj = Object.values(MOODS).find(m => m.value === exp.mood);
        const triggersStr = exp.triggers?.map(t_id => SENSORY_TRIGGERS[t_id]?.label.toLowerCase() || '').join(' ') || '';
        return (
            (exp.notes && exp.notes.toLowerCase().includes(searchTerm)) ||
            (exp.environment && exp.environment.toLowerCase().includes(searchTerm)) ||
            (moodObj && moodObj.label.toLowerCase().includes(searchTerm)) ||
            triggersStr.includes(searchTerm)
        );
    });

    if (filteredExperiences.length === 0) {
        historyList.innerHTML = '<p class="text-gray-400 p-4">No events found matching your criteria.</p>';
        return;
    }

    historyList.innerHTML = "";
    filteredExperiences.forEach(exp => {
        const moodObj = Object.values(MOODS).find(m => m.value === exp.mood);
        const energyObj = Object.values(ENERGY_LEVELS).find(el => el.value === exp.energyLevel);
        const item = document.createElement("div");
        item.className = "history-item p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 cursor-pointer";
        item.innerHTML = `
            <div class="flex justify-between items-start mb-1">
                <span class="font-semibold ${moodObj ? moodObj.color : 'text-gray-200'}">
                    ${moodObj ? moodObj.emoji + " " + moodObj.label : 'Mood: Not specified'}
                    ${energyObj ? ` <span class="text-xs ${energyObj.color}">(${energyObj.label} Energy)</span>` : ''}
                </span>
                <span class="text-xs text-gray-400">${exp.timestamp?.toDate?.()?.toLocaleString?.() || 'Date unknown'}</span>
            </div>
            <p class="text-sm text-gray-300 mb-1"><strong>Intensity:</strong> ${exp.intensity || 'N/A'}</p>
            ${exp.environment ? `<p class="text-sm text-gray-300 mb-1"><strong>Environment:</strong> ${exp.environment}</p>` : ''}
            ${exp.triggers && exp.triggers.length > 0 ? 
                `<p class="text-sm text-gray-300 mb-1"><strong>Triggers:</strong> ${exp.triggers.map(t_id => SENSORY_TRIGGERS[t_id]?.label || t_id).join(', ')}</p>` : ''}
            ${exp.intervention ? `<p class="text-sm text-gray-300 mb-1"><strong>Intervention:</strong> ${exp.intervention}</p>` : ''}
            ${exp.notes ? `<p class="text-sm text-gray-300 mt-2 bg-gray-700 p-2 rounded"><em>${exp.notes}</em></p>` : ''}
        `;
        historyList.appendChild(item);
    });
}

export function renderQuests(quests) {
    try {
        const questLogPage = document.getElementById('quests-page');
        if (!questLogPage) {
            console.warn("Quest log page element ('quests-page') not found. Skipping renderQuests.");
            return;
        }
        const questListContainer = questLogPage.querySelector('#quest-list');
        if (!questListContainer) {
             console.warn("Quest list container ('#quest-list') not found in quest log page. Skipping renderQuests.");
             return;
        }
        questListContainer.innerHTML = ''; // Clear previous quests

        if (!quests || quests.length === 0) {
            questListContainer.innerHTML = '<p class="text-gray-400 italic text-center py-8">No quests yet. Create one to get started!</p>';
            return;
        }

        quests.forEach(quest => {
            const questCard = document.createElement('div');
            questCard.className = 'bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-purple-500/40 transition-shadow duration-300 relative';
            questCard.dataset.questId = quest.id;

            const completedCount = quest.subquests ? quest.subquests.filter(sq => sq.completed).length : 0;
            const totalSubquests = quest.subquests ? quest.subquests.length : 0;
            const progress = totalSubquests > 0 ? (completedCount / totalSubquests) * 100 : 0;
            const isCompleted = quest.completed || (totalSubquests > 0 && completedCount === totalSubquests);

            let subquestHTML = '<p class="text-sm text-gray-400 italic mt-2">No sub-quests defined.</p>';
            if (totalSubquests > 0) {
                subquestHTML = quest.subquests.map((sub, index) => `
                    <li class="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                        <label for="subtask-${quest.id}-${index}" class="flex items-center cursor-pointer group">
                            <input type="checkbox" id="subtask-${quest.id}-${index}" data-quest-id="${quest.id}" data-subtask-index="${index}" 
                                   class="subtask-checkbox form-checkbox h-5 w-5 bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-600 rounded mr-3 shadow transition duration-150 ease-in-out" 
                                   ${sub.completed ? 'checked' : ''}>
                            <span class="subtask-label text-gray-300 group-hover:text-purple-300 transition-colors duration-200 ${sub.completed ? 'line-through text-gray-500' : ''}">${sub.text}</span>
                        </label>
                    </li>
                `).join('');
            }
            
            questCard.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-2xl font-semibold text-purple-400 flex-grow pr-2 ${isCompleted ? 'line-through text-purple-600' : ''}">${quest.title}</h3>
                    <button class="delete-quest-btn text-gray-500 hover:text-red-500 transition-colors duration-200" data-quest-id="${quest.id}" aria-label="Delete quest">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
                <div class="mb-4">
                    <div class="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>${Math.round(progress)}%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2.5 shadow-inner overflow-hidden">
                        <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                    </div>
                </div>
                <h4 class="text-sm font-semibold text-gray-400 mb-2">Sub-Quests:</h4>
                <ul class="space-y-1 list-none p-0 mb-4">${subquestHTML}</ul>
                ${isCompleted ? '<div class="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center rounded-xl"><span class="text-3xl font-bold text-green-400 transform -rotate-12">COMPLETED!</span></div>' : ''}
            `;

            questListContainer.appendChild(questCard);

            // Add event listeners for subtask checkboxes
            questCard.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
                addRippleListener(checkbox.parentElement); // Add ripple to the label
                checkbox.addEventListener('change', async (e) => {
                    const qId = e.target.dataset.questId;
                    const sIndex = parseInt(e.target.dataset.subtaskIndex);
                    const isChecked = e.target.checked;
                    try {
                        const completionUpdate = await Data.updateQuestSubtask(qId, sIndex, isChecked);
                        if (completionUpdate) {
                             showToast(`Quest '${completionUpdate.title}' marked as ${completionUpdate.completed ? 'complete' : 'incomplete'}!`, 'success');
                        }
                        // No need to re-render all quests here, listenForQuestUpdates will do it.
                    } catch (error) {
                        console.error("Failed to update subtask:", error);
                        showToast(`Error updating subtask: ${error.message}`, "error");
                        e.target.checked = !isChecked; // Revert checkbox on error
                    }
                });
            });

            // Add event listener for delete button
            const deleteButton = questCard.querySelector('.delete-quest-btn');
            if (deleteButton) {
                addRippleListener(deleteButton);
                 deleteButton.addEventListener('click', async (e) => {
                    e.stopPropagation(); // Prevent card click or other events
                    const qId = deleteButton.dataset.questId;
                    const questTitle = quest.title; // Get title for confirmation
                    
                    // Simple confirmation
                    if (confirm(`Are you sure you want to delete the quest "${questTitle}"?`)) {
                        try {
                            await Data.deleteQuest(qId);
                            showToast(`Quest "${questTitle}" deleted successfully.`, 'success');
                            // The listener will auto-update the UI.
                        } catch (error) {
                            console.error("Failed to delete quest:", error);
                            showToast(`Error deleting quest: ${error.message}`, "error");
                        }
                    }
                });
            }
        });
    } catch (error) {
        console.error("Error rendering quests:", error);
        const questListContainer = document.getElementById('quest-list-container');
        if(questListContainer) questListContainer.innerHTML = '<p class="text-red-500 italic text-center py-8">Could not load quests. Please try again later.</p>';
    }
}

async function renderStrategies() {
    const strategiesList = document.getElementById('strategies-list');
    const noStrategiesMessage = document.getElementById('no-strategies-message');

    if (!strategiesList || !noStrategiesMessage) return;

    try {
        const strategies = await Data.getStrategies();
        strategiesList.innerHTML = '';

        if (strategies.length === 0) {
            noStrategiesMessage.classList.remove('hidden');
        } else {
            noStrategiesMessage.classList.add('hidden');
            strategies.forEach(strategy => {
                const card = document.createElement('div');
                card.className = 'strategy-card bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-purple-500/30 transition-shadow';
                // addRippleListener(card); // Only if the card itself is a single click action

                card.innerHTML = `
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-lg font-semibold text-purple-300">${escapeHTML(strategy.name)}</h3>
                        <div class="flex space-x-1">
                            <button class="edit-strategy-btn text-blue-400 hover:text-blue-300 p-1 rounded-full no-bubble-ripple" data-id="${strategy.id}" title="Edit Strategy">
                                <span class="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button class="delete-strategy-btn text-red-400 hover:text-red-300 p-1 rounded-full no-bubble-ripple" data-id="${strategy.id}" title="Delete Strategy">
                                <span class="material-symbols-outlined text-base">delete</span>
                            </button>
                        </div>
                    </div>
                    <p class="text-sm text-gray-400 mb-1"><strong>Category:</strong> ${escapeHTML(strategy.category)}</p>
                    <p class="text-sm text-gray-300 whitespace-pre-wrap">${escapeHTML(strategy.description)}</p>
                    ${strategy.effectiveness ? `<p class="text-xs text-gray-500 mt-2">Effectiveness: ${strategy.effectiveness}/5</p>` : ''}
                `;
                strategiesList.appendChild(card);
                
                addRippleListener(card.querySelector('.edit-strategy-btn'));
                addRippleListener(card.querySelector('.delete-strategy-btn'));
            });
        }
    } catch (error) {
        console.error("Error rendering strategies:", error);
        showToast("Could not load strategies.", "error");
    }
}

function openStrategyModal(strategy = null) {
    const modal = document.getElementById('strategy-modal');
    const form = document.getElementById('strategy-form');
    const modalTitle = document.getElementById('strategy-modal-title');
    if (!modal || !form || !modalTitle) return;

    form.reset();
    document.getElementById('strategy-id').value = '';

    if (strategy) {
        modalTitle.textContent = 'Edit Coping Strategy';
        document.getElementById('strategy-id').value = strategy.id;
        document.getElementById('strategy-name').value = strategy.name;
        document.getElementById('strategy-description').value = strategy.description;
        document.getElementById('strategy-category').value = strategy.category;
        document.getElementById('strategy-effectiveness').value = strategy.effectiveness || 3;
    } else {
        modalTitle.textContent = 'Add New Coping Strategy';
    }
    modal.classList.remove('hidden');
    // Ripple for modal buttons is added in initializeUIElements, or ensure they are recreated with ripple here if modal is fully dynamic
}

export { showToast }; 