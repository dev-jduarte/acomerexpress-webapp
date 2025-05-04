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
  apiKey: "AIzaSyBA5aSMnx7-OgeYllpVSLRTTlPmdCmWQvQ",
  authDomain: "acomerexpresstesting.firebaseapp.com",
  projectId: "acomerexpresstesting",
  storageBucket: "acomerexpresstesting.firebasestorage.app",
  messagingSenderId: "983807315528",
  appId: "1:983807315528:web:3ebed6b77882e66eb0927d"
};

export const app = initializeApp(firebaseConfig);
// const db = getFirestore();
//connectFirestoreEmulator(db, '127.0.0.1', 8080);

