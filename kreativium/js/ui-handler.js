// js/ui-handler.js
import * as Data from './data-manager.js';
import * as Charts from './chart-service.js';

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

// --- Toast Notifications ---
export function showToast(message, type = "info", duration = 3000) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");

    toastMessage.textContent = message;
    toast.className = 'toast-notification fixed bottom-5 right-5 text-white py-3 px-6 rounded-lg shadow-lg opacity-0 transform translate-y-2 z-50';
    toast.classList.add(type);
    toast.classList.add("show");

    if (duration > 0) {
        setTimeout(() => {
            toast.classList.remove("show");
        }, duration);
    }
}

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
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const href = link.getAttribute("href");
            if (href && href !== '#') {
                navigateTo(href);
            }
        });
    });

    window.addEventListener("hashchange", () => navigateTo(window.location.hash));
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
        await renderQuests();
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
        button.addEventListener("click", () => {
            moodSelector.querySelectorAll(".mood-emoji-btn").forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
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
        button.addEventListener("click", () => {
            energySelector.querySelectorAll(".energy-level-btn").forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
        });
        energySelector.appendChild(button);
    });

    // Triggers selection
    const triggersSelection = document.getElementById("triggers-selection");
    Object.values(SENSORY_TRIGGERS).forEach(trigger => {
        const label = document.createElement("label");
        label.className = "trigger-checkbox-label";
        label.innerHTML = `
            <input type="checkbox" name="triggers" value="${trigger.id}" class="hidden">
            <span class="material-symbols-outlined ${trigger.color}">${trigger.icon}</span>
            <span class="text-xs font-medium">${trigger.label}</span>
        `;
        label.addEventListener('click', (e) => {
            const checkbox = label.querySelector('input[type="checkbox"]');
            setTimeout(() => {
                if (checkbox.checked) {
                    label.classList.add('selected-trigger');
                } else {
                    label.classList.remove('selected-trigger');
                }
            }, 0);
        });
        triggersSelection.appendChild(label);
    });

    // Intensity slider value display
    const intensitySlider = document.getElementById("log-intensity");
    const intensityValueDisplay = document.getElementById("intensity-value");
    intensitySlider.addEventListener("input", () => {
        intensityValueDisplay.textContent = intensitySlider.value;
    });

    // Strategies submenu toggle
    const strategiesToggle = document.getElementById('strategies-toggle');
    const strategiesSubmenu = document.getElementById('strategies-submenu');
    strategiesToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = strategiesToggle.classList.toggle('open');
        strategiesSubmenu.classList.toggle('open');
        if (isOpen) {
            strategiesSubmenu.style.maxHeight = strategiesSubmenu.scrollHeight + "px";
            if (!window.location.hash.startsWith('#strategies')) {
                navigateTo('#strategies');
            }
        } else {
            strategiesSubmenu.style.maxHeight = '0';
        }
    });
}

// --- Form Listeners ---
function setupFormListeners() {
    // Log form submission
    const logForm = document.getElementById("log-form");
    logForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const moodButton = logForm.querySelector("#mood-selector .selected");
        const energyButton = logForm.querySelector("#energy-selector .selected");
        const selectedTriggers = Array.from(logForm.querySelectorAll("#triggers-selection input:checked")).map(cb => cb.value);

        const experienceData = {
            mood: moodButton ? parseInt(moodButton.dataset.value) : null,
            energyLevel: energyButton ? parseInt(energyButton.dataset.value) : null,
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
            document.getElementById("intensity-value").textContent = "5";
            await renderDashboardCharts();
            await renderRecentActivities();
            navigateTo('#dashboard');
        } catch (error) {
            showToast("Failed to log experience.", "error");
        }
    });

    // Quest form submission
    const questForm = document.getElementById("quest-form");
    const addSubtaskBtn = document.getElementById("add-subtask-btn");
    const subtasksContainer = document.getElementById("subtasks-container");

    const createSubtaskInput = () => {
        const div = document.createElement('div');
        div.className = 'flex items-center space-x-2 mb-2';
        const input = document.createElement('input');
        input.type = 'text';
        input.name = 'subtask';
        input.placeholder = 'Sub-task description';
        input.className = 'flex-grow bg-gray-700 text-gray-100 border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm placeholder-gray-500';
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-subtask-btn text-red-400 hover:text-red-300 p-1 rounded-full';
        removeBtn.innerHTML = '<span class="material-symbols-outlined text-xl">remove_circle_outline</span>';
        removeBtn.onclick = () => div.remove();
        div.appendChild(input);
        div.appendChild(removeBtn);
        return div;
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
            <p class="text-xs text-gray-400 mb-1">${exp.timestamp ? exp.timestamp.toDate().toLocaleDateString() : 'Date unknown'}</p>
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
                <span class="text-xs text-gray-400">${exp.timestamp ? exp.timestamp.toDate().toLocaleString() : 'Date unknown'}</span>
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

async function renderQuests() {
    const questListContainer = document.getElementById("quest-list");
    questListContainer.innerHTML = '<p class="text-gray-400 italic col-span-full">Loading quests...</p>';
    const quests = await Data.getQuests();

    if (quests.length === 0) {
        questListContainer.innerHTML = '<p class="text-gray-400 italic col-span-full">No active quests. Time to embark on a new adventure!</p>';
        return;
    }

    questListContainer.innerHTML = "";
    quests.forEach(quest => {
        const card = document.createElement("div");
        card.className = "quest-card bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-purple-400/30 transition-all duration-300";
        
        const completedSubtasks = quest.subtasks.filter(st => st.completed).length;
        const totalSubtasks = quest.subtasks.length;
        const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

        let subtasksHTML = '';
        if (totalSubtasks > 0) {
            subtasksHTML = quest.subtasks.map((subtask, index) => `
                <div class="subtask-item flex items-center space-x-3 py-2 border-b border-gray-700 last:border-b-0">
                    <input type="checkbox" id="quest-${quest.id}-subtask-${index}" data-quest-id="${quest.id}" data-subtask-index="${index}" ${subtask.completed ? 'checked' : ''} class="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500">
                    <label for="quest-${quest.id}-subtask-${index}" class="text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-300'}">${subtask.text}</label>
                </div>
            `).join('');
        } else {
            subtasksHTML = '<p class="text-xs text-gray-400 italic">No milestones for this quest yet.</p>';
        }

        card.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h4 class="text-xl font-semibold ${quest.completed ? 'text-green-400 line-through' : 'text-purple-400'}">${quest.title}</h4>
                <button class="delete-quest-btn text-red-500 hover:text-red-400 transition-colors" data-quest-id="${quest.id}">
                    <span class="material-symbols-outlined">delete_forever</span>
                </button>
            </div>
            ${totalSubtasks > 0 ? `
            <div class="mb-3">
                <div class="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>${completedSubtasks}/${totalSubtasks}</span>
                </div>
                <div class="quest-progress-bar-bg w-full bg-gray-700 rounded-full h-2.5">
                    <div class="quest-progress-bar-fg bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full" style="width: ${progress}%"></div>
                </div>
            </div>
            ` : ''}
            <div class="space-y-2 mt-3">${subtasksHTML}</div>
            ${quest.completed ? '<p class="mt-3 text-sm text-green-400 font-semibold flex items-center"><span class="material-symbols-outlined mr-1">check_circle</span> Quest Completed!</p>' : ''}
        `;
        questListContainer.appendChild(card);

        // Add event listeners for subtask checkboxes
        card.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', async (e) => {
                try {
                    const result = await Data.updateQuestSubtask(
                        e.target.dataset.questId, 
                        parseInt(e.target.dataset.subtaskIndex), 
                        e.target.checked
                    );
                    if (result) {
                        showToast(`Quest "${result.title}" ${result.completed ? 'completed' : 'marked as active'}!`, "info");
                        await renderQuests();
                    }
                } catch (error) {
                    showToast("Failed to update subtask.", "error");
                }
            });
        });
        
        // Add event listener for delete button
        card.querySelector('.delete-quest-btn').addEventListener('click', async (e) => {
            if (confirm("Are you sure you want to delete this quest?")) {
                try {
                    await Data.deleteQuest(e.currentTarget.dataset.questId);
                    showToast("Quest deleted.", "success");
                    await renderQuests();
                } catch (error) {
                    showToast("Error deleting quest.", "error");
                }
            }
        });
    });
}

async function renderStrategies() {
    const strategyList = document.getElementById('strategy-list');
    const searchTerm = document.getElementById('strategy-search').value.toLowerCase();
    strategyList.innerHTML = '<p class="text-gray-400 italic col-span-full">Loading strategies...</p>';
    let strategies = await Data.getStrategies();

    if (searchTerm) {
        strategies = strategies.filter(s => 
            s.title.toLowerCase().includes(searchTerm) || 
            (s.description && s.description.toLowerCase().includes(searchTerm)) ||
            (s.tags && s.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }

    if (strategies.length === 0) {
        strategyList.innerHTML = searchTerm 
            ? '<p class="text-gray-400 italic col-span-full">No strategies found matching your search.</p>' 
            : '<p class="text-gray-400 italic col-span-full">No strategies defined yet. Add your first one!</p>';
        return;
    }

    strategyList.innerHTML = '';
    strategies.forEach(strategy => {
        const card = document.createElement('div');
        card.className = "strategy-card bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-purple-400/30 transition-all duration-300 flex flex-col justify-between";
        let tagsHTML = '';
        if (strategy.tags && strategy.tags.length > 0) {
            tagsHTML = strategy.tags.map(tag => `<span class="tag bg-purple-600 text-xs text-white px-2 py-1 rounded-full">${tag}</span>`).join(' ');
        }

        card.innerHTML = `
            <div>
                <h4 class="text-xl font-semibold text-purple-300 mb-2">${strategy.title}</h4>
                <p class="text-sm text-gray-400 mb-3 min-h-[40px]">${strategy.description || 'No description.'}</p>
                ${tagsHTML ? `<div class="mb-3 flex flex-wrap gap-1">${tagsHTML}</div>` : ''}
            </div>
            <div class="flex justify-end space-x-2 pt-3 border-t border-gray-700 mt-auto">
                <button class="edit-strategy-btn text-yellow-400 hover:text-yellow-300 p-1" data-id="${strategy.id}">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="remove-strategy-btn text-red-500 hover:text-red-400 p-1" data-id="${strategy.id}">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `;
        strategyList.appendChild(card);

        card.querySelector('.edit-strategy-btn').addEventListener('click', () => openStrategyModal(strategy));
        card.querySelector('.remove-strategy-btn').addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this strategy?')) {
                try {
                    await Data.deleteStrategy(strategy.id);
                    showToast("Strategy deleted.", "success");
                    await renderStrategies();
                } catch (error) {
                    showToast("Error deleting strategy.", "error");
                }
            }
        });
    });
}

function openStrategyModal(strategy = null) {
    const strategyModal = document.getElementById('strategy-modal');
    const modalTitle = document.getElementById('modal-title');
    const strategyForm = document.getElementById('strategy-form');
    
    strategyForm.reset();
    if (strategy) {
        modalTitle.textContent = 'Edit Strategy';
        document.getElementById('strategy-id').value = strategy.id;
        document.getElementById('strategy-title').value = strategy.title;
        document.getElementById('strategy-description').value = strategy.description || '';
        document.getElementById('strategy-tags').value = strategy.tags ? strategy.tags.join(', ') : '';
    } else {
        modalTitle.textContent = 'Add New Strategy';
        document.getElementById('strategy-id').value = '';
    }
    strategyModal.classList.remove('hidden');
} 