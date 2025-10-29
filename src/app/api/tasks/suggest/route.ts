export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Paciente } from "@/models/Paciente";
import { JournalEntry } from "@/types";
import { Task } from "@/models/Task";
import { suggestPersonalizedTasks } from "@/ai/flows/suggest-personalized-tasks";

type IncomingTask = {
  descripcion: string;
  estado: "pendiente" | "completada";
  feedback?: { utilidad?: number; dificultad?: number; comentario?: string };
};

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { userId, existingTasks } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "No se proporcionó el ID del usuario." }, { status: 400 });
    }

    // 1) Resolver el paciente por su UID (el front te envía userId = uid)
    const paciente = await Paciente.findOne({ uid: userId }).select("_id");
    if (!paciente) {
      return NextResponse.json({ error: "Paciente no encontrado para ese uid." }, { status: 404 });
    }

    // 2) Últimas 10 entradas de diario del paciente (más recientes primero)
    const journalEntries = await JournalEntry.find({ user: paciente._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // 3) Separar completadas/pendientes del input
    const completedTasks: IncomingTask[] = (existingTasks || []).filter(
      (t: IncomingTask) => t.estado === "completada" && t.feedback
    );
    const pendingTasks: IncomingTask[] = (existingTasks || []).filter(
      (t: IncomingTask) => t.estado === "pendiente"
    );

    // 4) Construir prompt para la IA
    let prompt = `Eres un asistente de psicólogo especializado en terapia cognitivo-conductual. Tu objetivo es generar 3 nuevas tareas para un paciente basadas en su historial. Sé empático, positivo y enfócate en tareas pequeñas y manejables. No repitas tareas que ya están en la lista de pendientes.\n\nContexto del paciente:\n`;

    if (journalEntries.length > 0) {
      prompt += `\n--- Últimas entradas del diario ---\n`;
      for (const entry of journalEntries) {
        const entryDate = entry.createdAt
          ? new Date(entry.createdAt).toLocaleDateString("es-ES")
          : "una fecha reciente";
        const main = entry.mainEmotion || "emociones";
        const sub = entry.subEmotion || "—";
        const text = entry.journal?.slice(0, 260) || "";
        prompt += `- El ${entryDate} se sintió ${main} (${sub}) y escribió: \"${text}\"\n`;
      }
    }

    if (completedTasks.length > 0) {
      prompt += `\n--- Tareas completadas y su feedback ---\n`;
      for (const task of completedTasks) {
        prompt += `- Tarea: \"${task.descripcion}\", Feedback: Utilidad (${task.feedback?.utilidad ?? "-"}), Dificultad (${task.feedback?.dificultad ?? "-"}), Comentario: \"${task.feedback?.comentario ?? "-"}\"\n`;
      }
    }

    if (pendingTasks.length > 0) {
      prompt += `\n--- Tareas pendientes (NO REPETIR) ---\n`;
      for (const task of pendingTasks) {
        prompt += `- ${task.descripcion}\n`;
      }
    }

    prompt += `\nGenera 3 nuevas tareas concisas y accionables en formato de array de strings JSON.`;

    // 5) Llamar al flujo de IA
    const suggestions = await suggestPersonalizedTasks({ patientContext: prompt });
    const newTasksDescriptions: string[] = suggestions.tasks;

    if (!Array.isArray(newTasksDescriptions) || newTasksDescriptions.length === 0) {
      console.error("La IA no devolvió un array de tareas válido. Respuesta recibida:", suggestions);
      throw new Error("La IA no devolvió tareas válidas.");
    }

    // 6) Guardar nuevas tareas en Mongo (insertMany)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const docs = newTasksDescriptions.map((descripcion) => ({
      descripcion,
      paciente: paciente._id,
      asignadaPor: "IA Serenitea",
      estado: "pendiente",
      fechaCreacion: now,
      fechaDue: tomorrow,
      feedback: null,
      aiFeedback: undefined,
    }));

    await Task.insertMany(docs);

    return NextResponse.json({ message: "Nuevas tareas generadas con éxito." }, { status: 200 });
  } catch (error: any) {
    console.error("Error al generar tareas con IA: ", error);
    return NextResponse.json(
      { error: error?.message || "Ocurrió un error en el servidor." },
      { status: 500 }
    );
  }
}
