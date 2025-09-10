'use server';

/**
 * @fileOverview A flow to suggest personalized tasks for patients based on their mood, diary entries, and treatment plan.
 *
 * - suggestPersonalizedTasks - A function that suggests personalized tasks.
 * - SuggestPersonalizedTasksInput - The input type for the suggestPersonalizedTasks function.
 * - SuggestPersonalizedTasksOutput - The return type for the suggestPersonalizedTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPersonalizedTasksInputSchema = z.object({
  mood: z
    .string()
    .describe('The current mood of the patient (e.g., happy, sad, anxious).'),
  diaryEntry: z.string().describe('A diary entry describing the patient thoughts and feelings.'),
  treatmentPlan: z
    .string()
    .describe('The treatment plan for the patient, including goals and strategies.'),
  previousTasks: z
    .array(z.string())
    .optional()
    .describe('A list of tasks already suggested to the patient in the past.'),
});
export type SuggestPersonalizedTasksInput = z.infer<
  typeof SuggestPersonalizedTasksInputSchema
>;

const SuggestPersonalizedTasksOutputSchema = z.object({
  tasks: z
    .array(z.string())
    .describe(
      'A list of personalized tasks tailored to the patient current state and treatment plan.'
    ),
});
export type SuggestPersonalizedTasksOutput = z.infer<
  typeof SuggestPersonalizedTasksOutputSchema
>;

export async function suggestPersonalizedTasks(
  input: SuggestPersonalizedTasksInput
): Promise<SuggestPersonalizedTasksOutput> {
  return suggestPersonalizedTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPersonalizedTasksPrompt',
  input: {schema: SuggestPersonalizedTasksInputSchema},
  output: {schema: SuggestPersonalizedTasksOutputSchema},
  prompt: `You are an AI assistant designed to help patients with eating disorders by suggesting personalized tasks.

  Consider the patient's current mood, diary entry, and treatment plan to suggest tasks that will help them in their recovery.
  Avoid suggesting tasks that have already been suggested in the past.

  Patient Mood: {{{mood}}}
  Diary Entry: {{{diaryEntry}}}
  Treatment Plan: {{{treatmentPlan}}}
  Previous Tasks: {{#if previousTasks}}{{{previousTasks}}}{{else}}None{{/if}}

  Suggest 3-5 tasks that the patient can do today to support their recovery.  The tasks should be specific, actionable, and relevant to the patient's current situation and treatment plan.  Do not be conversational; return the tasks as a JSON array of strings.
  Tasks:
  `,
});

const suggestPersonalizedTasksFlow = ai.defineFlow(
  {
    name: 'suggestPersonalizedTasksFlow',
    inputSchema: SuggestPersonalizedTasksInputSchema,
    outputSchema: SuggestPersonalizedTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
