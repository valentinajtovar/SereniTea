'use server';
/**
 * @fileOverview Matches a patient with the best psychologist or medical center based on their assessment results.
 *
 * - matchPatientWithPsychologist - A function that handles the patient matching process.
 * - MatchPatientInput - The input type for the matchPatientWithPsychologist function.
 * - MatchPatientOutput - The return type for the matchPatientWithPsychologist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchPatientInputSchema = z.object({
  assessmentResults: z
    .string()
    .describe(
      'The results of the patient assessment, including behavior, feelings, and other relevant information related to eating disorders.'
    ),
  patientPreferences: z
    .string()
    .optional()
    .describe(
      'Optional patient preferences for a psychologist or medical center, such as location, gender, or specialization.'
    ),
});
export type MatchPatientInput = z.infer<typeof MatchPatientInputSchema>;

const MatchPatientOutputSchema = z.object({
  match: z.object({
    psychologistName: z.string().describe('The name of the matched psychologist.'),
    medicalCenterName: z
      .string()
      .optional()
      .describe('The name of the matched medical center, if applicable.'),
    justification: z
      .string()
      .describe(
        'The reasoning behind the match, explaining why this psychologist or medical center is the best fit for the patient based on their assessment results and preferences.'
      ),
  }),
});
export type MatchPatientOutput = z.infer<typeof MatchPatientOutputSchema>;

export async function matchPatientWithPsychologist(
  input: MatchPatientInput
): Promise<MatchPatientOutput> {
  return matchPatientFlow(input);
}

const matchPatientPrompt = ai.definePrompt({
  name: 'matchPatientPrompt',
  input: {schema: MatchPatientInputSchema},
  output: {schema: MatchPatientOutputSchema},
  prompt: `You are an AI assistant designed to match patients with the most suitable psychologist or medical center based on their assessment results and preferences.

  Given the following patient assessment results and preferences, analyze the information and determine the best match.

  Assessment Results: {{{assessmentResults}}}
  Patient Preferences: {{{patientPreferences}}}

  Consider factors such as specialization, availability, and patient preferences when making the match. Provide a justification for your choice.

  Return your answer as a JSON object.
  `,
});

const matchPatientFlow = ai.defineFlow(
  {
    name: 'matchPatientFlow',
    inputSchema: MatchPatientInputSchema,
    outputSchema: MatchPatientOutputSchema,
  },
  async input => {
    const {output} = await matchPatientPrompt(input);
    return output!;
  }
);
