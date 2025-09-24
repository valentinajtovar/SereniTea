'use server';

import { z } from 'zod';
import { suggestCreativeActivities } from '@/ai/flows/suggest-creative-activities';

// Esquema para validar las entradas de la acción del servidor
const suggestActivitiesSchema = z.object({
  mood: z.string().min(1, 'El estado de ánimo es obligatorio.'),
  location: z.string().min(2, 'La ubicación es obligatoria.'),
});

/**
 * Server Action para obtener sugerencias de actividades creativas.
 * Actúa como un puente seguro entre el cliente y el flujo de IA de Genkit.
 * @param mood El estado de ánimo actual del usuario.
 * @param location La ubicación actual del usuario.
 * @returns Un objeto con las sugerencias o un objeto de error.
 */
export async function suggestActivitiesAction(mood: string, location: string) {
  // 1. Validar las entradas
  const validationResult = suggestActivitiesSchema.safeParse({ mood, location });

  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
    console.error('Validation failed:', errorMessage);
    return { error: `Entrada inválida: ${errorMessage}` };
  }

  const { mood: validatedMood, location: validatedLocation } = validationResult.data;

  try {
    // 2. Llamar al flujo de IA con los datos validados
    console.log(`Requesting suggestions for mood: ${validatedMood}, location: ${validatedLocation}`);
    const suggestions = await suggestCreativeActivities({
      mood: validatedMood,
      location: validatedLocation,
    });
    
    // 3. Devolver el resultado exitoso
    return suggestions;

  } catch (error) {
    // 4. Capturar y devolver cualquier error del flujo de IA
    console.error('Error calling suggestCreativeActivities flow:', error);
    return { error: 'No se pudieron obtener las sugerencias. Por favor, inténtalo de nuevo más tarde.' };
  }
}
