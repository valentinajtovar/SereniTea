
require('dotenv').config({ path: './.env.local' });
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

const tasks = [
    {
      "title": "Escribe en tu diario",
      "description": "Dedica 15 minutos a escribir tus pensamientos y sentimientos.",
      "category": "Autocuidado",
      "type": "recurring",
      "frequency": "daily",
      "isCompleted": false,
      "daysOfWeek": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    },
    {
      "title": "Meditación de 5 minutos",
      "description": "Practica la atención plena con una breve meditación guiada.",
      "category": "Mindfulness",
      "type": "recurring",
      "frequency": "daily",
      "isCompleted": false,
      "daysOfWeek": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    },
    {
      "title": "Sal a caminar",
      "description": "Da un paseo de 30 minutos al aire libre para despejar tu mente.",
      "category": "Actividad Física",
      "type": "recurring",
      "frequency": "weekly",
      "isCompleted": false,
      "daysOfWeek": ["Lunes", "Miércoles", "Viernes"]
    },
    {
      "title": "Establece una intención para el día",
      "description": "Define una intención positiva para tu día al despertar.",
      "category": "Mindfulness",
      "type": "one-time",
      "isCompleted": false
    },
    {
      "title": "Practica la gratitud",
      "description": "Escribe tres cosas por las que te sientas agradecido hoy.",
      "category": "Autocuidado",
      "type": "recurring",
      "frequency": "daily",
      "isCompleted": false,
      "daysOfWeek": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    },
    {
      "title": "Técnica de respiración 4-7-8",
      "description": "Realiza tres ciclos de esta técnica para calmar la ansiedad.",
      "category": "Técnicas de Relajación",
      "type": "one-time",
      "isCompleted": false
    },
    {
      "title": "Organiza tu espacio",
      "description": "Dedica 20 minutos a ordenar tu habitación o escritorio.",
      "category": "Bienestar",
      "type": "weekly",
      "isCompleted": false,
      "daysOfWeek": ["Sábado"]
    }\n];


async function seedTasks() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Error: MONGODB_URI no está definido en .env.local");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Conectado a MongoDB Atlas");

    const database = client.db();
    const tasksCollection = database.collection('tasks');

    // Eliminar tareas existentes para evitar duplicados
    await tasksCollection.deleteMany({});
    console.log("Tareas existentes eliminadas.");

    // Insertar nuevas tareas
    const result = await tasksCollection.insertMany(tasks);
    console.log(`${result.insertedCount} tareas han sido añadidas a la colección 'tasks'.`);

  } catch (error) {
    console.error("Error al cargar las tareas en la base de datos:", error);
  } finally {
    await client.close();
    console.log("Conexión cerrada.");
  }
}

seedTasks();

