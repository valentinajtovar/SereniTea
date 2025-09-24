import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { app } from "./firebase"; // Assuming 'app' is exported from firebase.ts

const auth = getAuth(app);
const db = getFirestore(app); // Add this line

if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("Error setting auth persistence: ", error);
    });
}

export { auth, db }; // Export db as well
