'use server';

import { z } from 'zod';
import { suggestCreativeActivities } from '@/ai/flows/suggest-creative-activities';
import { db } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

// Esquema para validar las entradas de la acción del servidor
const suggestActivitiesSchema = z.object({
  mood: z.string().min(1, 'El estado de ánimo es obligatorio.'),
  location: z.string().min(2, 'La ubicación es obligatoria.'),
});

/**
 * Server Action para obtener sugerencias de actividades creativas.
 * ... (código existente)
 */
export async function suggestActivitiesAction(mood: string, location: string) {
  const validationResult = suggestActivitiesSchema.safeParse({ mood, location });

  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
    return { error: `Entrada inválida: ${errorMessage}` };
  }

  const { mood: validatedMood, location: validatedLocation } = validationResult.data;

  try {
    const suggestions = await suggestCreativeActivities({
      mood: validatedMood,
      location: validatedLocation,
    });
    return suggestions;
  } catch (error) {
    console.error('Error calling suggestCreativeActivities flow:', error);
    return { error: 'No se pudieron obtener las sugerencias. Por favor, inténtalo de nuevo más tarde.' };
  }
}

/**
 * Server Action para eliminar una tarea de Firestore.
 * @param taskId El ID del documento de la tarea a eliminar.
 * @returns Un objeto indicando el éxito o un objeto de error.
 */
export async function deleteTaskAction(taskId: string) {
  if (!taskId || typeof taskId !== 'string') {
    return { error: 'ID de tarea inválido.' };
  }

  try {
    console.log(`Intentando eliminar la tarea con ID: ${taskId}`);
    await db.collection('tareas').doc(taskId).delete();
    console.log(`Tarea con ID: ${taskId} eliminada con éxito.`);

    // Revalida la ruta raíz para refrescar la lista de tareas.
    // Si tus tareas están en otra página (ej. /dashboard), cambia '/' por esa ruta.
    revalidatePath('/');

    return { success: true };

  } catch (error) {
    console.error('Error al eliminar la tarea:', error);
    return { error: 'No se pudo eliminar la tarea. Por favor, inténtalo de nuevo.' };
  }
}
