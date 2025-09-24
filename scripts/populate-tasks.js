'use strict';

// Este script puebla la base de datos con tareas de ejemplo.
//
// INSTRUCCIONES:
// 1. Si aún no lo has hecho, instala firebase-admin:
//    npm install firebase-admin
// 2. Asegúrate de tener tu archivo 'serviceAccountKey.json' en la raíz del proyecto.
// 3. Para poblar tareas para un usuario específico, encuentra el UID de Firebase del usuario y ejecuta:
//    node scripts/populate-tasks.js TU_UID_DE_USUARIO
// 4. Para poblar las tareas de los usuarios de prueba por defecto, ejecuta sin argumentos:
//    node scripts/populate-tasks.js

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// --- IDs de los pacientes por defecto --- //
const DEFAULT_PATIENT_ID_1 = "5buqezRKQDeTkX1IMPvEQRrJCJz2"; // Corresponde a 'prueba@gmail.com'
const DEFAULT_PATIENT_ID_2 = "RxyjffvV2phka8ZKCgGw1PwT52"; // Corresponde a 'paciente@gmail.com'

// --- Inicialización de Firebase --- //
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// --- Definición de las Tareas --- //
const getTasksForPatient = (patientId) => [
  // Tareas Nuevas
  {
    pacienteId: patientId,
    descripcion: "Sal a caminar 15 minutos y presta atención a los sonidos a tu alrededor.",
    estado: "pendiente",
    asignadaPor: "Sistema",
    fechaAsignacion: admin.firestore.Timestamp.fromDate(new Date()),
    fechaDue: admin.firestore.Timestamp.fromDate(new Date()), // Hoy
  },
  {
    pacienteId: patientId,
    descripcion: "Dedica 10 minutos a un hobby que disfrutes.",
    estado: "pendiente",
    asignadaPor: "IA",
    fechaAsignacion: admin.firestore.Timestamp.fromDate(new Date()),
    fechaDue: admin.firestore.Timestamp.fromDate(new Date()), // Hoy
  },
  {
    pacienteId: patientId,
    descripcion: "Planifica algo que te haga ilusión para el fin de semana.",
    estado: "pendiente",
    asignadaPor: "Psicólogo",
    fechaAsignacion: admin.firestore.Timestamp.fromDate(new Date()),
    fechaDue: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)), // Mañana
  },
    {
    pacienteId: patientId,
    descripcion: "Prueba una receta nueva y sencilla para la cena.",
    estado: "pendiente",
    asignadaPor: "Sistema",
    fechaAsignacion: admin.firestore.Timestamp.fromDate(new Date()),
    fechaDue: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)), // Mañana
  },
  // Tareas Anteriores
  {
    pacienteId: patientId,
    descripcion: "Practica 5 minutos de meditación mindfulness. Concéntrate en tu respiración.",
    estado: "pendiente",
    asignadaPor: "Sistema",
    fechaAsignacion: admin.firestore.Timestamp.fromDate(new Date()),
    fechaDue: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)), // Mañana
  },
  {
    pacienteId: patientId,
    descripcion: "Escribe 3 cosas que te hayan salido bien hoy.",
    estado: "pendiente",
    asignadaPor: "Psicólogo",
    fechaAsignacion: admin.firestore.Timestamp.fromDate(new Date()),
    fechaDue: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)), // En 2 días
  },
  {
    pacienteId: patientId,
    descripcion: "Haz una pausa de 10 minutos para escuchar tu canción favorita sin distracciones.",
    estado: "completada",
    asignadaPor: "IA",
    fechaAsignacion: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // Hace 2 días
    fechaDue: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), // Ayer
    feedback: {
        utilidad: "muy_util",
        dificultad: "facil",
        comentario: "¡Justo lo que necesitaba! Me sentí con mucha más energía después.",
        repetiria: true
    }
  },
    {
    pacienteId: patientId,
    descripcion: "Organiza un pequeño espacio de tu casa (un cajón, una estantería).",
    estado: "completada",
    asignadaPor: "Psicólogo",
    fechaAsignacion: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)), // Hace 5 días
    fechaDue: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)), // Hace 4 días
    feedback: {
        utilidad: "util",
        dificultad: "media",
        comentario: "Me costó empezar, pero ver el resultado final me dio una sensación de logro.",
        repetiria: true
    }
  }
];

// --- Función de Carga --- //
async function populateTasks() {
  // Obtiene el UID del usuario de los argumentos de la línea de comandos
  const targetUserId = process.argv[2];
  let tasksToCreate = [];
  let userDescription = "";

  if (targetUserId) {
    console.log(`Poblando tareas para el usuario con UID: ${targetUserId}...`);
    tasksToCreate = getTasksForPatient(targetUserId);
    userDescription = `el usuario ${targetUserId}`;
  } else {
    console.log("Poblando tareas para los usuarios de prueba por defecto...");
    tasksToCreate = [...getTasksForPatient(DEFAULT_PATIENT_ID_1), ...getTasksForPatient(DEFAULT_PATIENT_ID_2)];
    userDescription = "2 usuarios de prueba";
  }

  if (!tasksToCreate.length) {
    console.log("No hay tareas para añadir.");
    return;
  }

  const batch = db.batch();
  const tasksCollection = db.collection('tareas');

  console.log(`Preparando ${tasksToCreate.length} tareas para añadir a la base de datos...`);

  tasksToCreate.forEach(task => {
    const docRef = tasksCollection.doc();
    batch.set(docRef, task);
  });

  try {
    await batch.commit();
    console.log("\x1b[32m%s\x1b[0m", `¡Éxito! Se han añadido ${tasksToCreate.length} tareas para ${userDescription}.`);
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "Ocurrió un error al cargar las tareas:", error);
  }
}

populateTasks();
