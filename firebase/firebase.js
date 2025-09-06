// Import Firebase core, auth & firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAH13KuLRYKdYzkUPnac9c61RcQ62lj-Vw",
  authDomain: "qa-checklist-85257.firebaseapp.com",
  projectId: "qa-checklist-85257",
  storageBucket: "qa-checklist-85257.firebasestorage.app",
  messagingSenderId: "691151991050",
  appId: "1:691151991050:web:6fce8ed12fffdc82eecaf3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
