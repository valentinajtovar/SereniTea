import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleAuth } from "google-auth-library";
import { DiscussServiceClient } from "@google-ai/generativelanguage";

admin.initializeApp();

const MODEL_NAME = "models/chat-bison-001";
const API_KEY = functions.config().google.api_key;

const client = new DiscussServiceClient({
    authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

export const generateTasks = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "La función debe ser llamada por un usuario autenticado.");
    }

    const userId = context.auth.uid;
    const db = admin.firestore();

    try {
        // 1. Obtener las últimas 3 entradas del diario del usuario
        const journalSnapshot = await db.collection("journal_entries")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .limit(3)
            .get();

        if (journalSnapshot.empty) {
            throw new functions.https.HttpsError("not-found", "No se encontraron entradas de diario para generar tareas.");
        }

        // 2. Preparar el contexto para la IA
        const journalContext = journalSnapshot.docs.map(doc => {
            const entry = doc.data();
            return `Emoción: ${entry.mainEmotion}, Detalle: ${entry.subEmotion}, Diario: ${entry.journal}`;
        }).join("\n---\n");

        const prompt = `
            Eres un asistente de bienestar mental y tu objetivo es ayudar a un usuario a sentirse mejor.
            Basado en las siguientes entradas de su diario personal, genera 3 tareas cortas, positivas y accionables.
            Las tareas deben ser diseñadas para mejorar su estado de ánimo y fomentar hábitos saludables.
            NO respondas con una introducción ni con una conclusión, solo con el JSON.

            Entradas del diario:
            ${journalContext}

            RESPONDE ÚNICAMENTE CON UN OBJETO JSON con la clave "tasks" que contenga un array de strings. Por ejemplo:
            { "tasks": ["Tarea 1", "Tarea 2", "Tarea 3"] }
        `;

        // 3. Llamar a la API de IA Generativa (Gemini)
        const [response] = await client.generateMessage({
            model: MODEL_NAME,
            prompt: {
                messages: [{ content: prompt }],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new functions.https.HttpsError("internal", "La IA no generó ninguna respuesta.");
        }

        const aiResponse = response.candidates[0].content;
        if (!aiResponse) {
            throw new functions.https.HttpsError("internal", "El contenido de la respuesta de la IA está vacío.");
        }
        
        // 4. Parsear la respuesta y guardar las tareas en Firestore
        let taskList;
        try {
            // Limpiar la respuesta para asegurar que sea un JSON válido
            const cleanedResponse = aiResponse.replace(/```json|```/g, '').trim();
            taskList = JSON.parse(cleanedResponse).tasks;
            if (!Array.isArray(taskList) || taskList.length === 0) {
                throw new Error("El JSON no tiene el formato esperado.");
            }
        } catch (e) {
            console.error("Error al parsear la respuesta de la IA:", aiResponse);
            throw new functions.https.HttpsError("internal", "La respuesta de la IA no tuvo el formato JSON esperado.", e);
        }

        const batch = db.batch();
        const tasksCollection = db.collection("tareas");
        const now = admin.firestore.Timestamp.now();

        taskList.forEach((taskDesc: string) => {
            const newTaskRef = tasksCollection.doc();
            batch.set(newTaskRef, {
                pacienteId: userId,
                descripcion: taskDesc,
                estado: "pendiente",
                asignadaPor: "IA",
                fechaAsignacion: now,
                fechaDue: admin.firestore.Timestamp.fromMillis(now.toMillis() + 2 * 24 * 60 * 60 * 1000), // 2 días desde hoy
            });
        });

        await batch.commit();

        return { success: true, message: `Se han añadido ${taskList.length} nuevas tareas.` };

    } catch (error) {
        console.error("Error en la función generateTasks:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Ocurrió un error inesperado al generar las tareas.", error);
    }
});
