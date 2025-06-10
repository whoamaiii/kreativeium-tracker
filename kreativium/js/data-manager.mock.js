// js/data-manager.mock.js - Mock implementation without Firebase

let currentUserId = "mock-user-id";
let mockData = {
  experiences: [],
  quests: [],
  strategies: []
};

// --- Authentication (Mocked) ---
export function connectToFirebase() {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[Mock] Firebase connection simulated');
      resolve({ uid: currentUserId });
    }, 50);
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

export async function getExperiences({ limit } = {}) {
  let experiences = [...mockData.experiences];
  if (limit) experiences = experiences.slice(0, limit);
  return experiences;
}

// --- Quest Management (Mocked) ---
export async function addQuest(title, subtasks) {
  const quest = {
    id: Date.now().toString(),
    title,
    subtasks: subtasks.map((t) => ({ text: t, completed: false })),
    completed: false,
    createdAt: new Date()
  };
  mockData.quests.unshift(quest);
}

export async function updateQuestSubtask(questId, subtaskIndex, completed) {
  const quest = mockData.quests.find((q) => q.id === questId);
  if (quest) {
    quest.subtasks[subtaskIndex].completed = completed;
    quest.completed = quest.subtasks.every((st) => st.completed);
    return { title: quest.title, completed: quest.completed };
  }
  return null;
}

export async function getQuests() {
  return [...mockData.quests];
}

export async function deleteQuest(questId) {
  const idx = mockData.quests.findIndex((q) => q.id === questId);
  if (idx > -1) mockData.quests.splice(idx, 1);
}

// --- Strategy Management (Mocked) ---
export async function saveStrategy(strategyData, strategyId = null) {
  if (strategyId) {
    const idx = mockData.strategies.findIndex((s) => s.id === strategyId);
    if (idx > -1) mockData.strategies[idx] = { ...mockData.strategies[idx], ...strategyData };
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
  const idx = mockData.strategies.findIndex((s) => s.id === strategyId);
  if (idx > -1) mockData.strategies.splice(idx, 1);
}

export function loadData() {
  console.log('[Mock] loadData called');
} 