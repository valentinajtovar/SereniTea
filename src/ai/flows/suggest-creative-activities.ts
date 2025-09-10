'use server';

/**
 * @fileOverview Provides suggestions for creative and therapeutic activities, and recommends local places for recreation.
 *
 * @function suggestCreativeActivities - The main function to generate activity suggestions and local recommendations.
 * @type {SuggestCreativeActivitiesInput} - Input type for suggestCreativeActivities, including mood and location.
 * @type {SuggestCreativeActivitiesOutput} - Output type for suggestCreativeActivities, including activity suggestions and local recommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCreativeActivitiesInputSchema = z.object({
  mood: z.string().describe('The current mood of the user (e.g., happy, sad, stressed).'),
  location: z.string().describe('The user\u2019s current city or general location.'),
});
export type SuggestCreativeActivitiesInput = z.infer<typeof SuggestCreativeActivitiesInputSchema>;

const SuggestCreativeActivitiesOutputSchema = z.object({
  activitySuggestions: z
    .array(z.string())
    .describe('A list of creative and therapeutic activity suggestions (e.g., digital mandalas, stories, puzzles).'),
  localRecommendations: z
    .array(z.string())
    .describe('A list of recommended local places for recreation based on the user\u2019s location (e.g., shopping malls, ceramics studios).'),
});
export type SuggestCreativeActivitiesOutput = z.infer<typeof SuggestCreativeActivitiesOutputSchema>;

export async function suggestCreativeActivities(
  input: SuggestCreativeActivitiesInput
): Promise<SuggestCreativeActivitiesOutput> {
  return suggestCreativeActivitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCreativeActivitiesPrompt',
  input: {schema: SuggestCreativeActivitiesInputSchema},
  output: {schema: SuggestCreativeActivitiesOutputSchema},
  prompt: `Based on the user's current mood: {{{mood}}} and location: {{{location}}}, suggest creative and therapeutic activities, and recommend local places for recreation.

Activity Suggestions:
- Provide a list of activities like digital mandalas, telling stories, making puzzles, etc.
Local Recommendations:
- Suggest local places for fun like shopping malls, ceramics studios, parks, etc.

Ensure the suggestions are relevant to the user's mood and location. Format the output as a JSON object with 'activitySuggestions' and 'localRecommendations' arrays.`,
});

const suggestCreativeActivitiesFlow = ai.defineFlow(
  {
    name: 'suggestCreativeActivitiesFlow',
    inputSchema: SuggestCreativeActivitiesInputSchema,
    outputSchema: SuggestCreativeActivitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
