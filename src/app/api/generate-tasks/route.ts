'use server';

import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { JournalEntry, Task } from '@/types';
import { suggestCreativeActivities } from '@/ai/flows/suggest-creative-activities';

const db = admin.firestore();

export async function POST(req: Request) {
  try {
    const { userId, existingTasks } = await req.json();

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'No se proporcionó el ID del usuario.' }), { status: 400 });
    }

    const journalEntriesSnap = await db.collection('journal_entries').where('userId', '==', userId).orderBy('createdAt', 'desc').limit(10).get();
    const journalEntries = journalEntriesSnap.docs.map(doc => doc.data() as JournalEntry);
    
    const completedTasks = existingTasks.filter((t: Task) => t.estado === 'completada' && t.feedback);
    const pendingTasks = existingTasks.filter((t: Task) => t.estado === 'pendiente');

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

    prompt += `\nGenera 3 nuevas tareas concisas y accionables en formato de array de strings JSON.`;

    // Llamada corregida al flow de IA
    const suggestions = await suggestCreativeActivities({ mood: prompt, location: 'user profile' });

    // Acceso correcto a la propiedad de la respuesta
    const newTasksDescriptions = suggestions.activitySuggestions;

    if (!Array.isArray(newTasksDescriptions) || newTasksDescriptions.length === 0) {
      console.error("La IA no devolvió un array de tareas válido. Respuesta recibida:", suggestions);
      throw new Error('La IA no devolvió tareas válidas.');
    }

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
