// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // Solo frontend
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTCOoz7Nw0cEf90l2j0TGgylSNh1XqmX8",
  authDomain: "serenitea-4fb65.firebaseapp.com",
  projectId: "serenitea-4fb65",
  storageBucket: "serenitea-4fb65.firebasestorage.app",
  messagingSenderId: "410656855839",
  appId: "1:410656855839:web:e98481c60b4c85ca1fc22a",
  measurementId: "G-5X1TTN43EY"
};

// Initialize Firebase
import { getFirestore } from "firebase/firestore";
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// const analytics = getAnalytics(app); // Solo frontend