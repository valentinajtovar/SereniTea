'use server';
/**
 * @fileOverview Generates and sends a registration approval email.
 *
 * - sendRegistrationEmail - A function that handles generating the approval email content.
 * - SendRegistrationEmailInput - The input type for the sendRegistrationEmail function.
 * - SendRegistrationEmailOutput - The return type for the sendRegistrationEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SendRegistrationEmailInputSchema = z.object({
  fullName: z.string().describe('The full name of the professional registering.'),
  email: z.string().email().describe('The email address of the professional.'),
  specialization: z.string().describe('The specialization of the professional.'),
  bio: z.string().describe('A short biography of the professional.'),
});
export type SendRegistrationEmailInput = z.infer<typeof SendRegistrationEmailInputSchema>;

const SendRegistrationEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line for the approval email.'),
  body: z.string().describe('The HTML body of the approval email.'),
});
export type SendRegistrationEmailOutput = z.infer<typeof SendRegistrationEmailOutputSchema>;

export async function sendRegistrationEmail(
  input: SendRegistrationEmailInput
): Promise<SendRegistrationEmailOutput> {
  return sendRegistrationEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sendRegistrationEmailPrompt',
  input: {schema: SendRegistrationEmailInputSchema},
  output: {schema: SendRegistrationEmailOutputSchema},
  prompt: `You are an administrative assistant. A new psychologist has registered on the platform. Generate an email to the administrator (ma.carrillo2@uniandes.edu.co) to review and approve the application.

  The email should have a clear subject line and a body containing all the professional's details. The body must include two buttons (as HTML links): one to "Approve" and one to "Reject".

  Professional's Details:
  - Name: {{{fullName}}}
  - Email: {{{email}}}
  - Specialization: {{{specialization}}}
  - Bio: {{{bio}}}

  Generate the response as a JSON object with "subject" and "body" fields. The body should be in HTML format.
  `,
});

const sendRegistrationEmailFlow = ai.defineFlow(
  {
    name: 'sendRegistrationEmailFlow',
    inputSchema: SendRegistrationEmailInputSchema,
    outputSchema: SendRegistrationEmailOutputSchema,
  },
  async input => {
    console.log('Simulating sending email for:', input);
    // In a real application, you would integrate an email service like SendGrid or Nodemailer here.
    // For now, we just log to the console and generate the content.
    const {output} = await prompt(input);
    console.log('Email Subject:', output?.subject);
    console.log('Email Body:', output?.body);
    return output!;
  }
);
