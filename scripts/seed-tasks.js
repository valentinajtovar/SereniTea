'use strict';

// IMPORTANTE:
// 1. Instala las dependencias necesarias en la raíz de tu proyecto:
//    npm install firebase-admin
// 2. Descarga tu clave de servicio desde la consola de Firebase y guárdala como 'serviceAccountKey.json' en la raíz del proyecto.
//    (Firebase Console > Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada)
// 3. CAMBIA EL 'USER_ID_TO_SEED' por el ID del usuario (UID) al que quieres asignarle las tareas.
//    (Puedes encontrar el UID en Firebase Console > Authentication)

const admin = require('firebase-admin');
// Asegúrate de que la ruta al archivo serviceAccountKey.json sea correcta.
const serviceAccount = require('../serviceAccountKey.json'); 

// --- CONFIGURACIÓN --- //
const USER_ID_TO_SEED = "REEMPLAZA_ESTO_CON_UN_USER_ID_REAL";

// --- INICIALIZACIÓN DE FIREBASE --- //
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// --- TAREAS DE EJEMPLO --- //
const tasksToSeed = [
  {
    pacienteId: USER_ID_TO_SEED,
    descripcion: "Escribe tres cosas por las que te sientas agradecido/a hoy, sin importar lo pequeñas que sean.",
    estado: "pendiente",
    asignadaPor: "Sistema",
    fechaAsignacion: admin.firestore.Timestamp.fromDate(new Date()),
    fechaDue: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)), // 2 días desde hoy
  },
  {
    pacienteId: USER_ID_TO_SEED,
    descripcion: "Sal a caminar 15 minutos al aire libre. Concéntrate en los sonidos y olores a tu alrededor.",
    estado: "pendiente",
    asignadaPor: "Sistema",
    fechaAsignacion: admin.firestore.Timestamp.fromDate(new Date()),
    fechaDue: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)), // 3 días desde hoy
  },
  {
    pacienteId: USER_ID_TO_SEED,
    descripcion: "Dedica 5 minutos a una respiración profunda y consciente antes de dormir esta noche.",
    estado: "completada",
    asignadaPor: "Psicólogo",
    fechaAsignacion: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // Hace 3 días
    fechaDue: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // Hace 2 días
    feedback: {
        utilidad: "muy_util",
        dificultad: "facil",
        comentario: "Me ayudó mucho a relajarme y dormir mejor de lo que esperaba.",
        repetiria: true
    }
  }
];

// --- FUNCIÓN DE CARGA --- //
async function seedTasks() {
  if (USER_ID_TO_SEED === "REEMPLAZA_ESTO_CON_UN_USER_ID_REAL") {
    console.error("\x1b[31m%s\x1b[0m", "[ERROR] Por favor, edita el script 'scripts/seed-tasks.js' y reemplaza 'USER_ID_TO_SEED' con un ID de usuario válido de Firebase Authentication.");
    return;
  }

  const tasksCollection = db.collection('tareas');
  
  console.log(`Añadiendo ${tasksToSeed.length} tareas de ejemplo para el usuario ${USER_ID_TO_SEED}...`);
  const batch = db.batch();
  
  tasksToSeed.forEach(task => {
    const docRef = tasksCollection.doc(); // Firestore genera el ID automáticamente
    batch.set(docRef, task);
  });
  
  await batch.commit();
  console.log("\x1b[32m%s\x1b[0m", "¡Éxito! Las tareas de ejemplo han sido añadidas a la base de datos.");
}

seedTasks().catch(error => {
  console.error("\x1b[31m%s\x1b[0m", "Ocurrió un error al cargar las tareas:", error);
});
