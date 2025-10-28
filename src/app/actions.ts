
'use server';

import { z } from 'zod';
import { suggestCreativeActivities } from '@/ai/flows/suggest-creative-activities';
import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';

// Esquema para la nueva tarea
const taskSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio.'),
  description: z.string().optional(),
  firebaseUid: z.string().min(1, 'El ID de usuario de Firebase es obligatorio.')
});

/**
 * Server Action para añadir una nueva tarea desde las sugerencias.
 * Esta acción guarda la tarea en la colección 'taks'.
 */
export async function addTaskAction(taskData: { title: string; description?: string; firebaseUid: string; }) {
  const validationResult = taskSchema.safeParse(taskData);

  if (!validationResult.success) {
    return { error: `Entrada inválida: ${validationResult.error.errors.map(e => e.message).join(', ')}` };
  }

  const { title, description, firebaseUid } = validationResult.data;

  try {
    const client = await clientPromise;
    const db = client.db();

    const patient = await db.collection('pacientes').findOne({ firebaseUid });
    if (!patient) {
      return { error: 'Paciente no encontrado.' };
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const newTask = {
      title,
      description: description || '',
      patientId: patient._id,
      firebaseUid,
      status: 'pendiente',
      createdAt: new Date(),
      dueDate,
    };

    // Guardar en la colección 'taks'
    const result = await db.collection('taks').insertOne(newTask);

    revalidatePath('/dashboard/tasks');
    revalidatePath('/dashboard');

    // Convertir el ObjectId a string antes de devolverlo
    return { success: true, insertedId: result.insertedId.toString() };

  } catch (error) {
    console.error('Error al añadir la tarea:', error);
    return { error: 'Ocurrió un error en el servidor al añadir la tarea.' };
  }
}

/**
 * Server Action para eliminar una tarea de la colección 'taks'.
 */
export async function deleteTaskAction(taskId: string) {
  try {
    if (!ObjectId.isValid(taskId)) {
      return { error: 'El ID de la tarea no es válido.' };
    }

    const client = await clientPromise;
    const db = client.db();
    // Eliminar de la colección 'taks'
    const result = await db.collection('taks').deleteOne({ _id: new ObjectId(taskId) });

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


// --- OTRAS ACCIONES (SIN CAMBIOS) ---

const suggestActivitiesSchema = z.object({
  mood: z.string().min(1, 'El estado de ánimo es obligatorio.'),
  location: z.string().min(2, 'La ubicación es obligatoria.'),
});

export async function suggestActivitiesAction(mood: string, location: string) {
  const validationResult = suggestActivitiesSchema.safeParse({ mood, location });

  if (!validationResult.success) {
    return { error: `Entrada inválida: ${validationResult.error.errors.map(e => e.message).join(', ')}` };
  }

  const { mood: validatedMood, location: validatedLocation } = validationResult.data;

  try {
    const suggestions = await suggestCreativeActivities(validatedMood, validatedLocation);

    if (!suggestions || suggestions.length === 0) {
      return { error: 'No se pudieron generar sugerencias.' };
    }

    const client = await clientPromise;
    const db = client.db();
    await db.collection('suggested_activities').insertMany(
      suggestions.map(suggestion => ({ ...suggestion, mood: validatedMood, location: validatedLocation, createdAt: new Date() }))
    );
    
    revalidatePath('/dashboard');
    return { success: true, suggestions };

  } catch (error) {
    console.error('Error en la acción del servidor:', error);
    return { error: 'Ocurrió un error en el servidor.' };
  }
}
