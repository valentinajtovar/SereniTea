"use server";

import { matchPatientWithPsychologist } from "@/ai/flows/match-patient-with-psychologist";
import { sendRegistrationEmail } from "@/ai/flows/send-registration-email";
import { suggestCreativeActivities } from "@/ai/flows/suggest-creative-activities";
import { suggestPersonalizedTasks } from "@/ai/flows/suggest-personalized-tasks";
import { summarizePatientReport, SummarizePatientReportInput } from "@/ai/flows/summarize-patient-report";

export async function matchPsychologistAction(assessmentResults: string) {
  try {
    const result = await matchPatientWithPsychologist({ assessmentResults });
    return result;
  } catch (error) {
    console.error(error);
    return { error: "Failed to find a match. Please try again." };
  }
}

export async function suggestTasksAction(
  mood: string,
  diaryEntry: string
) {
  try {
    const result = await suggestPersonalizedTasks({
      mood,
      diaryEntry,
      treatmentPlan: "Focus on mindful eating and self-compassion.",
    });
    return result;
  } catch (error) {
    console.error(error);
    return { error: "Failed to suggest tasks. Please try again." };
  }
}

export async function suggestActivitiesAction(
  mood: string,
  location: string
) {
  try {
    const result = await suggestCreativeActivities({ mood, location });
    return result;
  } catch (error) {
    console.error(error);
    return { error: "Failed to suggest activities. Please try again." };
  }
}

export async function registerPsychologistAction(formData: {
  fullName: string;
  email: string;
  specialization: string;
  bio: string;
}) {
    try {
        const result = await sendRegistrationEmail(formData);
        // This simulates sending the email. In a real app, you would handle the response.
        return { success: true, message: "Registration request sent successfully." };
    } catch (error) {
        console.error("Error sending registration email:", error);
        return { error: "Failed to send registration request. Please try again." };
    }
}

export async function summarizePatientReportAction(input: SummarizePatientReportInput) {
    try {
        const result = await summarizePatientReport(input);
        return result;
    } catch (error) {
        console.error("Error summarizing report:", error);
        return { error: "Failed to generate report. Please try again." };
    }
}
