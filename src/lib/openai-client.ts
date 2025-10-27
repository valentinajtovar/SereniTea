'use server';

import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
// The 'openai' package will automatically look for the OPENAI_API_KEY variable
const openai = new OpenAI();

/**
 * Generates tasks using the OpenAI API (ChatGPT).
 * @param prompt - The detailed context and instructions for the AI.
 * @returns A promise that resolves to an array of task descriptions.
 */
export async function generateTasksWithOpenAI(prompt: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106", // This model is optimized for JSON mode
      messages: [
        {
          role: "system",
          content: "You are a helpful psychological assistant designed to output a structured JSON object."
        },
        {
          role: "user",
          content: prompt,
        }
      ],
      response_format: { type: "json_object" }, // Enable JSON mode
    });

    const content = response.choices[0].message.content;

    if (!content) {
      console.error("OpenAI API returned null or empty content.");
      return [];
    }

    // Parse the JSON string response
    const parsed = JSON.parse(content);

    // The prompt will be updated to ask for { "tasks": [...] }
    // This check ensures the response is in the expected format.
    if (parsed && Array.isArray(parsed.tasks)) {
      return parsed.tasks;
    } else {
      console.error("Parsed OpenAI response does not contain a 'tasks' array. Received:", parsed);
      return []; // Return an empty array to prevent crashes
    }

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    // Propagate a generic error to be caught by the API route's try-catch block
    throw new Error("An error occurred while communicating with the AI.");
  }
}
