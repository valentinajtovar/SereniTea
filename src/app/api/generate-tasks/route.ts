'use server';

import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { JournalEntry, Task } from '@/types';
// Corrected import to the appropriate AI flow
import { suggestPersonalizedTasks } from '@/ai/flows/suggest-personalized-tasks';

const db = admin.firestore();

export async function POST(req: Request) {
  try {
    const { userId, existingTasks } = await req.json();

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'No se proporcionó el ID del usuario.' }), { status: 400 });
    }

    // Fetch the last 10 journal entries
    const journalEntriesSnap = await db.collection('journal_entries').where('userId', '==', userId).orderBy('createdAt', 'desc').limit(10).get();
    const journalEntries = journalEntriesSnap.docs.map(doc => doc.data() as JournalEntry);
    
    // Separate completed and pending tasks from the input
    const completedTasks = existingTasks.filter((t: Task) => t.estado === 'completada' && t.feedback);
    const pendingTasks = existingTasks.filter((t: Task) => t.estado === 'pendiente');

    // Construct the detailed prompt for the AI
    let prompt = `Eres un asistente de psicólogo especializado en terapia cognitivo-conductual. Tu objetivo es generar 3 nuevas tareas para un paciente basadas en su historial. Sé empático, positivo y enfócate en tareas pequeñas y manejables. No repitas tareas que ya están en la lista de pendientes.\n\nContexto del paciente:\n`;

    if (journalEntries.length > 0) {
      prompt += '\n--- Últimas entradas del diario ---\n';
      journalEntries.forEach(entry => {
        // Ensure createdAt exists and is a timestamp before converting
        const entryDate = entry.createdAt?.seconds ? new Date(entry.createdAt.seconds * 1000).toLocaleDateString('es-ES') : 'una fecha reciente';
        prompt += `- El ${entryDate} se sintió ${entry.mainEmotion} (${entry.subEmotion}) y escribió: "${entry.journal}"\n`;
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

    prompt += `\nGenera 3 nuevas tareas concisas y accionables en formato de array de strings JSON.`;

    // Corrected the call to use the right AI flow and input structure
    const suggestions = await suggestPersonalizedTasks({ patientContext: prompt });

    // Access the correct property from the response
    const newTasksDescriptions = suggestions.tasks;

    if (!Array.isArray(newTasksDescriptions) || newTasksDescriptions.length === 0) {
      console.error("La IA no devolvió un array de tareas válido. Respuesta recibida:", suggestions);
      throw new Error('La IA no devolvió tareas válidas.');
    }

    const batch = db.batch();
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    // Create a batch write to add all new tasks at once
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
        aiFeedback: undefined, // Explicitly set for new tasks
      });
    });

    await batch.commit();

    return new NextResponse(JSON.stringify({ message: 'Nuevas tareas generadas con éxito.' }), { status: 200 });

  } catch (error) {
    console.error("Error al generar tareas con IA: ", error);
    // Provide a more specific error message to the client
    const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error en el servidor.';
    return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
