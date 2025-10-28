
'use server';

import { z } from 'zod';
import { suggestCreativeActivities } from '@/ai/flows/suggest-creative-activities';
import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';

// Esquema para validar las entradas de la acción del servidor
const suggestActivitiesSchema = z.object({
  mood: z.string().min(1, 'El estado de ánimo es obligatorio.'),
  location: z.string().min(2, 'La ubicación es obligatoria.'),
});

/**
 * Server Action para obtener sugerencias de actividades creativas.
 * Esta acción se conecta a una IA para obtener sugerencias y las guarda.
 */
export async function suggestActivitiesAction(mood: string, location: string) {
  const validationResult = suggestActivitiesSchema.safeParse({ mood, location });

  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
    return { error: `Entrada inválida: ${errorMessage}` };
  }

  const { mood: validatedMood, location: validatedLocation } = validationResult.data;

  try {
    console.log('Obteniendo sugerencias de la IA...');
    const suggestions = await suggestCreativeActivities(validatedMood, validatedLocation);

    if (!suggestions || suggestions.length === 0) {
      return { error: 'No se pudieron generar sugerencias. Inténtalo de nuevo.' };
    }

    // Conectar a MongoDB y guardar las sugerencias
    const client = await clientPromise;
    const db = client.db();
    const suggestionsCollection = db.collection('suggested_activities');

    // Podríamos añadir el ID de usuario aquí si fuera necesario
    const result = await suggestionsCollection.insertMany(
      suggestions.map(suggestion => ({ ...suggestion, mood: validatedMood, location: validatedLocation, createdAt: new Date() }))
    );
    
    console.log(`${result.insertedCount} sugerencias guardadas en la base de datos.`);

    // Revalida la ruta para que los nuevos datos se muestren si es necesario
    revalidatePath('/dashboard'); // O cualquier otra página que muestre estas sugerencias

    return { success: true, suggestions };

  } catch (error) {
    console.error('Error en la acción del servidor:', error);
    return { error: 'Ocurrió un error en el servidor al procesar tu solicitud.' };
  }
}

/**
 * Server Action para eliminar una tarea.
 */
export async function deleteTaskAction(taskId: string) {
  try {
    if (!ObjectId.isValid(taskId)) {
      return { error: 'El ID de la tarea no es válido.' };
    }

    const client = await clientPromise;
    const db = client.db();
    const tasksCollection = db.collection('tasks');

    const result = await tasksCollection.deleteOne({ _id: new ObjectId(taskId) });

    if (result.deletedCount === 0) {
      return { error: 'No se pudo encontrar la tarea para eliminar.' };
    }

    revalidatePath('/dashboard/tasks');
    return { success: true };

  } catch (error) {
    console.error('Error al eliminar la tarea:', error);
    return { error: 'Ocurrió un error en el servidor al eliminar la tarea.' };
  }
}
