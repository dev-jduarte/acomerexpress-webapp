// src/firebase.js
import { initializeApp } from 'firebase/app';

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// };

const firebaseConfig = {
  apiKey: "AIzaSyCvi77iZo-dDaQptXpJdgwLeTWivuOlWzc",
  authDomain: "acomerexpress-70084.firebaseapp.com",
  projectId: "acomerexpress-70084",
  storageBucket: "acomerexpress-70084.firebasestorage.app",
  messagingSenderId: "264996801520",
  appId: "1:264996801520:web:5fe471c08e639f1382eb35"
};

export const app = initializeApp(firebaseConfig);

