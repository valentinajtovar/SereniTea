import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCTCOoz7Nw0cEf90l2j0TGgylSNh1XqmX8",
    authDomain: "serenitea-4fb65.firebaseapp.com",
    projectId: "serenitea-4fb65",
    storageBucket: "serenitea-4fb65.firebasestorage.app",
    messagingSenderId: "410656855839",
    appId: "1:410656855839:web:e98481c60b4c85ca1fc22a",
    measurementId: "G-5X1TTN43EY"
  };

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
