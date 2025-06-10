// js/data-manager.js
// --- Firebase Modular SDK Setup ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, 
    doc, updateDoc, deleteDoc, Timestamp, runTransaction, writeBatch, limit, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYDmydfFFjoy1HIoL1l4wB_foJM_72WMg",
  authDomain: "kreativeium.firebaseapp.com",
  projectId: "kreativeium",
  storageBucket: "kreativeium.firebasestorage.app",
  messagingSenderId: "512032371136",
  appId: "1:512032371136:web:ee36e00e302574bc8c1825",
  measurementId: "G-Y9ZTQ61ZSP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const fbAuth = getAuth(app);
const fbDb = getFirestore(app);
let currentUserId = null;

// Collection names
const EXPERIENCES_COLLECTION = "experiences";
const QUESTS_COLLECTION = "quests";
const STRATEGIES_COLLECTION = "strategies";

// --- Authentication ---
export function connectToFirebase() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(fbAuth, (user) => {
            if (user) {
                currentUserId = user.uid;
                console.log('Successfully signed in anonymously:', currentUserId);
                resolve(user);
            } else {
                currentUserId = null;
                signInAnonymously(fbAuth)
                    .then(resolve)
                    .catch(error => {
                        console.error("Error signing in anonymously:", error);
                        reject(new Error("Could not connect. Please check internet & refresh."));
                    });
            }
        });
    });
}

export function getCurrentUserId() {
    return currentUserId;
}

// --- Experience Management ---
export async function logExperience(data) {
    if (!currentUserId) throw new Error("User not authenticated.");
    try {
        const docRef = await addDoc(collection(fbDb, "users", currentUserId, EXPERIENCES_COLLECTION), {
            ...data,
            timestamp: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error logging experience:", error);
        throw error;
    }
}

export async function getExperiences(filters = {}) {
    if (!currentUserId) return [];
    let q = query(collection(fbDb, "users", currentUserId, EXPERIENCES_COLLECTION), orderBy("timestamp", "desc"));
    
    if (filters.limit) {
        q = query(q, limit(filters.limit));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// --- Quest Management ---
export async function addQuest(title, subtasks) {
    if (!currentUserId) throw new Error("User not authenticated.");
    try {
        const formattedSubtasks = subtasks.map(taskText => ({ text: taskText, completed: false }));
        await addDoc(collection(fbDb, "users", currentUserId, QUESTS_COLLECTION), {
            title,
            subtasks: formattedSubtasks,
            completed: false,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding quest:", error);
        throw error;
    }
}

export async function updateQuestSubtask(questId, subtaskIndex, completed) {
    if (!currentUserId) throw new Error("User not authenticated.");
    const questRef = doc(fbDb, "users", currentUserId, QUESTS_COLLECTION, questId);
    try {
        await runTransaction(fbDb, async (transaction) => {
            const questDoc = await transaction.get(questRef);
            if (!questDoc.exists()) {
                throw "Document does not exist!";
            }
            const subtasks = questDoc.data().subtasks;
            subtasks[subtaskIndex].completed = completed;
            transaction.update(questRef, { subtasks: subtasks });
        });
        // Check if all subtasks are completed and update quest status
        await checkAndUpdateQuestCompletion(questId);
    } catch (error) {
        console.error("Error updating subtask:", error);
        throw error;
    }
}

async function checkAndUpdateQuestCompletion(questId) {
    if (!currentUserId) return;
    const questRef = doc(fbDb, "users", currentUserId, QUESTS_COLLECTION, questId);
    const questSnap = await getDoc(questRef);
    if (questSnap.exists()) {
        const questData = questSnap.data();
        const allSubtasksCompleted = questData.subtasks.every(st => st.completed);
        if (allSubtasksCompleted !== questData.completed) {
            await updateDoc(questRef, { completed: allSubtasksCompleted });
            return { title: questData.title, completed: allSubtasksCompleted };
        }
    }
    return null;
}

export async function getQuests() {
    if (!currentUserId) return [];
    const q = query(collection(fbDb, "users", currentUserId, QUESTS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteQuest(questId) {
    if (!currentUserId) throw new Error("User not authenticated");
    try {
        await deleteDoc(doc(fbDb, "users", currentUserId, QUESTS_COLLECTION, questId));
    } catch (e) {
        console.error("Error deleting quest: ", e);
        throw e;
    }
}

// --- Strategy Management ---
export async function saveStrategy(strategyData, strategyId = null) {
    if (!currentUserId) throw new Error("User not authenticated.");
    const userStrategiesCol = collection(fbDb, "users", currentUserId, STRATEGIES_COLLECTION);
    try {
        if (strategyId) {
            // Update existing strategy
            const strategyRef = doc(userStrategiesCol, strategyId);
            await updateDoc(strategyRef, { ...strategyData, lastUpdatedAt: serverTimestamp() });
        } else {
            // Add new strategy
            await addDoc(userStrategiesCol, { ...strategyData, createdAt: serverTimestamp() });
        }
        return true;
    } catch (error) {
        console.error("Error saving strategy:", error);
        throw error;
    }
}

export async function getStrategies() {
    if (!currentUserId) return [];
    const q = query(collection(fbDb, "users", currentUserId, STRATEGIES_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteStrategy(strategyId) {
    if (!currentUserId) throw new Error("User not authenticated.");
    try {
        await deleteDoc(doc(fbDb, "users", currentUserId, STRATEGIES_COLLECTION, strategyId));
    } catch (e) {
        console.error("Error deleting strategy: ", e);
        throw e;
    }
}

export function loadData() {
    // Data loading logic will go here
    // console.log("data-manager.js: loadData function called");
} 