// js/data-manager.js - TEMPORARY VERSION WITHOUT FIREBASE
// This is a mock version to test the app without Firebase dependencies

// Mock Firebase setup - remove this when Firebase is properly configured
let currentUserId = "mock-user-id";
let mockData = {
    experiences: [],
    quests: [],
    strategies: []
};

// --- Authentication (Mocked) ---
export function connectToFirebase() {
    return new Promise((resolve) => {
        // Simulate successful connection
        setTimeout(() => {
            console.log('Mock Firebase connection successful');
            resolve({ uid: currentUserId });
        }, 100);
    });
}

export function getCurrentUserId() {
    return currentUserId;
}

// --- Experience Management (Mocked) ---
export async function logExperience(data) {
    const experience = {
        id: Date.now().toString(),
        ...data,
        timestamp: new Date()
    };
    mockData.experiences.unshift(experience);
    return experience.id;
}

export async function getExperiences(filters = {}) {
    let experiences = [...mockData.experiences];
    if (filters.limit) {
        experiences = experiences.slice(0, filters.limit);
    }
    return experiences;
}

// --- Quest Management (Mocked) ---
export async function addQuest(title, subtasks) {
    const quest = {
        id: Date.now().toString(),
        title,
        subtasks: subtasks.map(taskText => ({ text: taskText, completed: false })),
        completed: false,
        createdAt: new Date()
    };
    mockData.quests.unshift(quest);
}

export async function updateQuestSubtask(questId, subtaskIndex, completed) {
    const quest = mockData.quests.find(q => q.id === questId);
    if (quest) {
        quest.subtasks[subtaskIndex].completed = completed;
        quest.completed = quest.subtasks.every(st => st.completed);
        return { title: quest.title, completed: quest.completed };
    }
    return null;
}

export async function getQuests() {
    return [...mockData.quests];
}

export async function deleteQuest(questId) {
    const index = mockData.quests.findIndex(q => q.id === questId);
    if (index > -1) {
        mockData.quests.splice(index, 1);
    }
}

// --- Strategy Management (Mocked) ---
export async function saveStrategy(strategyData, strategyId = null) {
    if (strategyId) {
        const index = mockData.strategies.findIndex(s => s.id === strategyId);
        if (index > -1) {
            mockData.strategies[index] = { ...mockData.strategies[index], ...strategyData };
        }
    } else {
        const strategy = {
            id: Date.now().toString(),
            ...strategyData,
            createdAt: new Date()
        };
        mockData.strategies.unshift(strategy);
    }
    return true;
}

export async function getStrategies() {
    return [...mockData.strategies];
}

export async function deleteStrategy(strategyId) {
    const index = mockData.strategies.findIndex(s => s.id === strategyId);
    if (index > -1) {
        mockData.strategies.splice(index, 1);
    }
}

export function loadData() {
    // Mock data loading
    console.log("Mock data manager loaded");
} 