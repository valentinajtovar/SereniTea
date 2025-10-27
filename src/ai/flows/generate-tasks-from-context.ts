'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTasksFromContextInput = z.object({
  context: z.string(),
});

const GenerateTasksFromContextOutput = z.object({
  tasks: z.array(z.string()),
});

export async function generateTasksFromContext(input: { context: string }) {
  const prompt = `
Eres un terapeuta cognitivo conductual. Sugiere 3 tareas pequeñas,
claras y accionables que ayuden a mejorar bienestar emocional. 

NO repitas tareas existentes. 
NO devuelvas conversación.
Solo responde como un JSON:

["tarea 1", "tarea 2", "tarea 3"]

Contexto del paciente:
${input.context}
`;

  const response = await ai.generateText({
    model: 'googleai/gemini-2.5-flash',
    prompt,
  });

  try {
    const tasks = JSON.parse(response.text());
    return { tasks };
  } catch {
    return { tasks: [] };
  }
}