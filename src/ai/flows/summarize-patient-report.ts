'use server';
/**
 * @fileOverview Summarizes a patient's weekly mood and diary entries for their psychologist.
 *
 * - summarizePatientReport - A function that handles the report summarization process.
 * - SummarizePatientReportInput - The input type for the summarizePatientReport function.
 * - SummarizePatientReportOutput - The return type for the summarizePatientReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePatientReportInputSchema = z.object({
  patientName: z.string().describe("The name of the patient."),
  moodEntries: z.array(z.object({
    date: z.string().describe("The date of the entry."),
    mood: z.string().describe("The mood reported by the patient."),
  })).describe("A list of mood entries for the past week."),
  diaryEntries: z.array(z.object({
    date: z.string().describe("The date of the entry."),
    entry: z.string().describe("The diary entry written by the patient."),
  })).describe("A list of diary entries for the past week."),
});
export type SummarizePatientReportInput = z.infer<typeof SummarizePatientReportInputSchema>;

const SummarizePatientReportOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the patient's week, highlighting key themes, emotional patterns, and potential areas of concern."),
  keyObservations: z.array(z.string()).describe("A list of bullet points with the most important observations."),
  suggestedFocus: z.string().describe("A recommendation for what the psychologist might focus on in the next session."),
});
export type SummarizePatientReportOutput = z.infer<typeof SummarizePatientReportOutputSchema>;

export async function summarizePatientReport(
  input: SummarizePatientReportInput
): Promise<SummarizePatientReportOutput> {
  return summarizePatientReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePatientReportPrompt',
  input: {schema: SummarizePatientReportInputSchema},
  output: {schema: SummarizePatientReportOutputSchema},
  prompt: `You are an expert AI assistant for psychologists specializing in eating disorders. Your task is to analyze a patient's mood and diary entries from the past week and provide a clear, concise summary for their psychologist.

  Patient Name: {{{patientName}}}

  Weekly Mood Entries:
  {{#each moodEntries}}
  - {{date}}: {{mood}}
  {{/each}}

  Weekly Diary Entries:
  {{#each diaryEntries}}
  - {{date}}: "{{entry}}"
  {{/each}}

  Based on this data, generate a report that includes:
  1.  A brief overall summary of the patient's week.
  2.  A list of key observations (e.g., recurring themes, emotional shifts, specific challenges mentioned).
  3.  A suggested focus for the upcoming therapy session.

  The tone should be professional, objective, and helpful. Focus on identifying patterns that can aid the psychologist in their work.
  `,
});

const summarizePatientReportFlow = ai.defineFlow(
  {
    name: 'summarizePatientReportFlow',
    inputSchema: SummarizePatientReportInputSchema,
    outputSchema: SummarizePatientReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
