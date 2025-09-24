const admin = require("firebase-admin");
const serviceAccount = require("./serenitea-62a26-firebase-adminsdk-hwpb1-4c12ef772b.json"); // Asegúrate de que la ruta a tu clave de servicio sea correcta

// --- CONFIGURACIÓN ---
// IMPORTANTE: Reemplaza este UID con el UID de tu usuario de Firebase.
const USER_ID_TO_SEED = "hII9QpcGmaOENaF9p8nSjZaM8bE2"; // Reemplaza con el UID del usuario específico
// ---------------------

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const tasksToSeed = [
  {
    userId: USER_ID_TO_SEED,
    text: "Practica un ejercicio de alimentación consciente de 5 minutos en tu próxima comida.",
    status: "pending", // pending, completed
    source: "psychologist", // psychologist, user
    createdAt: new Date(),
    completedAt: null,
  },
  {
    userId: USER_ID_TO_SEED,
    text: "Escribe tres cosas que aprecias de tu cuerpo.",
    status: "completed",
    source: "psychologist",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ayer
    completedAt: new Date(),
  },
  {
    userId: USER_ID_TO_SEED,
    text: "Sal a caminar suavemente durante 15 minutos y concéntrate en tu entorno.",
    status: "pending",
    source: "user",
    createdAt: new Date(),
    completedAt: null,
  },
];

async function seedTasks() {
  const tasksCollection = db.collection('assigned_tasks');
  console.log(`Buscando tareas existentes para el usuario: ${USER_ID_TO_SEED}...`);

  // Prevenir duplicados: verifica si ya hay tareas para este usuario
  const snapshot = await tasksCollection.where('userId', '==', USER_ID_TO_SEED).limit(1).get();
  if (!snapshot.empty) {
    console.log("El usuario ya tiene tareas. No se añadirán nuevas tareas de ejemplo.");
    return;
  }

  console.log("No se encontraron tareas, añadiendo las de ejemplo...");
  const batch = db.batch();
  tasksToSeed.forEach(task => {
    const docRef = tasksCollection.doc(); // Firestore generará un ID único
    batch.set(docRef, task);
  });

  await batch.commit();
  console.log(`¡Éxito! Se han añadido ${tasksToSeed.length} tareas de ejemplo para el usuario ${USER_ID_TO_SEED}.`);
}

seedTasks().catch(console.error);
