'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestPersonalizedTasksInputSchema = z.object({
  mood: z.string().describe('Estado emocional actual del paciente.'),
  diaryEntry: z.string().describe('Entrada de diario más reciente.'),
  treatmentPlan: z.string().describe('Contexto clínico/psicoeducativo proveniente de RAG.'),
  previousTasks: z.array(z.string()).optional().describe('Tareas ya sugeridas o pendientes (no repetir).'),
});
export type SuggestPersonalizedTasksInput = z.infer<typeof SuggestPersonalizedTasksInputSchema>;

const SuggestPersonalizedTasksOutputSchema = z.object({
  tasks: z.array(z.string()).describe('3 tareas personalizadas.'),
});
export type SuggestPersonalizedTasksOutput = z.infer<typeof SuggestPersonalizedTasksOutputSchema>;

export async function suggestPersonalizedTasks(
  input: SuggestPersonalizedTasksInput
): Promise<SuggestPersonalizedTasksOutput> {
  return suggestPersonalizedTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPersonalizedTasksPrompt',
  input: { schema: SuggestPersonalizedTasksInputSchema },
  output: { schema: SuggestPersonalizedTasksOutputSchema },
  prompt: `Eres un asistente de TCC para TCA. Devuelve EXACTAMENTE un JSON array de 3 strings (sin texto extra).

Datos del paciente:
- Estado/Mood: {{{mood}}}
- Diario: {{{diaryEntry}}}

Contexto clínico (literatura / guías) para inspirar tareas:
{{{treatmentPlan}}}

No repitas ni parafrasees tareas que ya existen:
{{#if previousTasks}}{{{previousTasks}}}{{else}}[]{{/if}}

Criterios de las 3 tareas:
- Conductuales, pequeñas, realizables hoy o esta semana.
- Específicas, medibles, y con duración o criterio de término (p.ej., “10 min respiración 4-7-8”).
- Relacionadas con TCA: regularidad alimentaria, autorregistro, exposición gradual, reestructuración cognitiva, habilidades de afrontamiento, autocompasión.
- Tono empático y neutro (sin “tú deberías”).
- Español neutro.
- Formato de salida: SOLO JSON array de strings.
`,
});

const suggestPersonalizedTasksFlow = ai.defineFlow(
  {
    name: 'suggestPersonalizedTasksFlow',
    inputSchema: SuggestPersonalizedTasksInputSchema,
    outputSchema: SuggestPersonalizedTasksOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
