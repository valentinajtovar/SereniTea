import admin from 'firebase-admin';

try {
  if (!admin.apps.length) {
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // This can fail if the JSON is malformed
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
      // This will fail on Vercel, but is intended for local dev
      serviceAccount = require('../../serviceAccountKey.json');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error(
    'CRITICAL: Firebase Admin SDK initialization error. This is likely due to a malformed or missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable in Vercel, or a missing serviceAccountKey.json file locally.',
    error
  );
  // Re-throwing the error to ensure the build process fails loudly and clearly.
  // This prevents downstream errors like "The default Firebase app does not exist".
  throw error;
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
