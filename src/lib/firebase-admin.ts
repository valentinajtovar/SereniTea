import admin from 'firebase-admin';

// This approach mirrors the one used in `scripts/seed-tasks.js` by loading the service account key directly.
// The path is relative from this file's location in `src/lib` to the project root where `serviceAccountKey.json` should be.
try {
  const serviceAccount = require('../../serviceAccountKey.json');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error(
    'Firebase Admin SDK initialization error. Please make sure your `serviceAccountKey.json` file is in the root of your project.',
    error
  );
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
