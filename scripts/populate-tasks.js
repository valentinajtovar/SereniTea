
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
const tasksData = require('../tasks_seed.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const importTasks = async () => {
  const tasksCollection = db.collection('tareas');

  for (const task of tasksData) {
    try {
        const fechaDue = new admin.firestore.Timestamp(task.fechaDue._seconds, task.fechaDue._nanoseconds);

        await tasksCollection.add({
            ...task,
            fechaDue
        });

      console.log(`Successfully imported task: ${task.descripcion}`);
    } catch (error) {
      console.error(`Error importing task: ${task.descripcion}`, error);
    }
  }
};

importTasks().then(() => {
  console.log('Finished importing all tasks.');
  process.exit(0);
});
