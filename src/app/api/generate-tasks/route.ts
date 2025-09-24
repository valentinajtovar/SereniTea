'use server';

import { NextResponse } from 'next/server';
// FIX: Replaced alias with relative path to solve module resolution issue
import { admin } from '../../../lib/firebase-admin'; 
import { JournalEntry, Task } from '@/types';

const db = admin.firestore();

// Placeholder for the actual call to the generative AI model
async function generateTasksFromAI(prompt: string): Promise<string[]> {
  console.log("----- PROMPT PARA IA -----");
  console.log(prompt);
  console.log("---------------------------");

  // Here you would call the API of a model like Gemini, GPT, etc.
  // Example: const response = await generativeModel.generateContent(prompt);
  // const tasksText = await response.text();
  // const tasksArray = tasksText.split('\n').filter(t => t.trim() !== '');
  
  // For now, we return example tasks to simulate the response.
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency
  return [
    "Escribir sobre un momento en el que te sentiste agradecido hoy.",
    "Realizar 10 minutos de meditación guiada usando una app.",
    "Salir a caminar por 15 minutos y prestar atención a los sonidos a tu alrededor."
  ];
}

export async function POST(req: Request) {
  try {
    const { userId, existingTasks } = await req.json();

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'No se proporcionó el ID del usuario.' }), { status: 400 });
    }

    // 1. Get journal entries and existing tasks to give context to the AI
    const journalEntriesSnap = await db.collection('journal_entries').where('userId', '==', userId).orderBy('createdAt', 'desc').limit(10).get();
    const journalEntries = journalEntriesSnap.docs.map(doc => doc.data() as JournalEntry);
    
    // Existing tasks are already passed from the client
    const completedTasks = existingTasks.filter((t: Task) => t.estado === 'completada' && t.feedback);
    const pendingTasks = existingTasks.filter((t: Task) => t.estado === 'pendiente');

    // 2. Build the prompt for the AI
    let prompt = `Eres un asistente de psicólogo especializado en terapia cognitivo-conductual. Tu objetivo es generar 3 nuevas tareas para un paciente basadas en su historial. Sé empático, positivo y enfócate en tareas pequeñas y manejables. No repitas tareas que ya están en la lista de pendientes.\n\nContexto del paciente:\n`;

    if (journalEntries.length > 0) {
      prompt += '\n--- Últimas entradas del diario ---\n';
      journalEntries.forEach(entry => {
        prompt += `- El ${new Date(entry.createdAt.seconds * 1000).toLocaleDateString('es-ES')} se sintió ${entry.mainEmotion} (${entry.subEmotion}) y escribió: "${entry.journal}"\n`;
      });
    }

    if (completedTasks.length > 0) {
      prompt += '\n--- Tareas completadas y su feedback ---\n';
      completedTasks.forEach((task: any) => {
        prompt += `- Tarea: "${task.descripcion}", Feedback: Utilidad (${task.feedback.utilidad}), Dificultad (${task.feedback.dificultad}), Comentario: "${task.feedback.comentario}"\n`;
      });
    }
    
    if (pendingTasks.length > 0) {
        prompt += '\n--- Tareas pendientes (NO REPETIR) ---\n';
        pendingTasks.forEach((task: any) => {
            prompt += `- ${task.descripcion}\n`;
        });
    }

    prompt += `\nGenera 3 nuevas tareas concisas y accionables en una lista separada por saltos de línea.`;

    // 3. Call the AI (using the placeholder)
    const newTasksDescriptions = await generateTasksFromAI(prompt);

    // 4. Save the new tasks in Firestore
    const batch = db.batch();
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    newTasksDescriptions.forEach(description => {
      const taskRef = db.collection('tareas').doc();
      batch.set(taskRef, {
        descripcion: description,
        pacienteId: userId,
        asignadaPor: 'IA Serenitea',
        estado: 'pendiente',
        fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
        fechaDue: admin.firestore.Timestamp.fromDate(tomorrow),
        feedback: null,
      });
    });

    await batch.commit();

    return new NextResponse(JSON.stringify({ message: 'Nuevas tareas generadas con éxito.' }), { status: 200 });

  } catch (error) {
    console.error("Error al generar tareas con IA: ", error);
    return new NextResponse(JSON.stringify({ error: 'Ocurrió un error en el servidor.' }), { status: 500 });
  }
}
