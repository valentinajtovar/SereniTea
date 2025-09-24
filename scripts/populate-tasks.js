'use strict';

// Este script puebla la base de datos con tareas de ejemplo para dos usuarios específicos.
//
// INSTRUCCIONES:
// 1. Si aún no lo has hecho, instala firebase-admin:
//    npm install firebase-admin
// 2. Asegúrate de tener tu archivo 'serviceAccountKey.json' en la raíz del proyecto.
// 3. Ejecuta el script desde la raíz del proyecto:
//    node scripts/populate-tasks.js

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// --- IDs de los pacientes --- //
const PATIENT_ID_1 = "5buqezRKQDeTkX1IMPvEQRrJCJz2"; // Corresponde a 'prueba@gmail.com'
const PATIENT_ID_2 = "RxyjffvV2phka8ZKCgGw1PwT52"; // Corresponde a 'paciente@gmail.com'

// --- Inicialización de Firebase --- //
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// --- Definición de las Tareas --- //
const getTasksForPatient = (patientId) => [
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
  const allTasks = [...getTasksForPatient(PATIENT_ID_1), ...getTasksForPatient(PATIENT_ID_2)];
  
  if (!allTasks.length) {
    console.log("No hay tareas para añadir.");
    return;
  }

  const batch = db.batch();
  const tasksCollection = db.collection('tareas');

  console.log(`Preparando ${allTasks.length} tareas para añadir a la base de datos...`);

  allTasks.forEach(task => {
    const docRef = tasksCollection.doc(); // Firestore genera el ID automáticamente
    batch.set(docRef, task);
  });

  try {
    await batch.commit();
    console.log("\x1b[32m%s\x1b[0m", `¡Éxito! Se han añadido ${allTasks.length} tareas para ${getTasksForPatient(PATIENT_ID_1).length} usuarios.`);
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "Ocurrió un error al cargar las tareas:", error);
  }
}

populateTasks();
