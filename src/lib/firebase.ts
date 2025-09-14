// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Si usas Firestore
import { getAuth } from "firebase/auth"; // Si usas autenticación

const firebaseConfig = {
  apiKey: "YOUR_WEB_API_KEY", // Find this in your Firebase Console under Project settings > Your apps
  authDomain: "serenitea-4fb65.firebaseapp.com",
  projectId: "serenitea-4fb65",
  storageBucket: "serenitea-4fb65.appspot.com", // Often projectId.appspot.com or projectId.firebasestorage.app
  messagingSenderId: "410656855839",
  appId: "YOUR_WEB_APP_ID" // Find this in your Firebase Console under Project settings > Your apps
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);