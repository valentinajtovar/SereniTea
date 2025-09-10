import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-creative-activities.ts';
import '@/ai/flows/match-patient-with-psychologist.ts';
import '@/ai/flows/suggest-personalized-tasks.ts';
import '@/ai/flows/send-registration-email.ts';
import '@/ai/flows/summarize-patient-report.ts';
