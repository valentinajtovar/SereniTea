export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { JournalEntry, Task } from '@/types';
import { vectorSearch, compactContext } from '@/server/rag';

const db = admin.firestore();

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function buildTaskPrompt(params: {
  mood: string;
  diaryEntry: string;
  treatmentPlan: string;
  previousTasks: string[];
}) {
  const { mood, diaryEntry, treatmentPlan, previousTasks } = params;
  return `Eres un asistente de TCC para TCA. Devuelve EXACTAMENTE un JSON array de 3 strings (sin texto extra).

Datos del paciente:
- Estado/Mood: ${mood}
- Diario: ${diaryEntry}

Contexto clínico (literatura / guías) para inspirar tareas:
${treatmentPlan}

No repitas ni parafrasees tareas que ya existen:
${JSON.stringify(previousTasks ?? [])}

Criterios de las 3 tareas:
- Conductuales, pequeñas, realizables hoy o esta semana.
- Específicas, medibles, y con duración/criterio de término (p. ej., “10 min respiración 4-7-8”).
- Relacionadas con TCA: regularidad alimentaria, autorregistro, exposición gradual, reestructuración cognitiva, habilidades de afrontamiento, autocompasión.
- Tono empático y neutro (sin “tú deberías”).
- Español neutro.
- Formato de salida: SOLO JSON array de strings.
`;
}

function safeParseTasks(text: string): string[] {
  const first = text.indexOf('[');
  const last = text.lastIndexOf(']');
  const slice = first >= 0 && last >= 0 ? text.slice(first, last + 1) : text;
  try {
    const parsed = JSON.parse(slice);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string').slice(0, 3);
  } catch (e) {
    // noop
  }
  return [];
}

function ruleBasedFallback(mood: string): string[] {
  // Fallback ultra simple para no bloquear al usuario si el LLM falla
  const base = [
    'Registrar 3 comidas y 2 colaciones hoy en tu diario (hora, hambre 0–10, emociones).',
    'Hacer 10 minutos de respiración 4-7-8 o relajación muscular progresiva.',
    'Escribir 3 pensamientos automáticos sobre comida/cuerpo y reestructurarlos con una alternativa más compasiva.'
  ];
  if (/ansiedad|miedo|preocup/i.test(mood)) {
    base[1] = 'Practicar 10 minutos de respiración 4-7-8 (mañana o tarde).';
  }
  return base;
}

export async function POST(req: Request) {
  try {
    // ---------- 0) Chequeos de entorno mínimos ----------
    requiredEnv('MONGODB_URI');
    requiredEnv('OPENAI_API_KEY'); // lo usamos para el chat
    // EMBEDDING_MODEL ya lo usa el RAG internamente

    const { userId, existingTasks } = await req.json();
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'No se proporcionó el ID del usuario.' }), { status: 400 });
    }

    // ---------- 1) Diario y tareas previas ----------
    const journalEntriesSnap = await db
      .collection('journal_entries')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const journalEntries = journalEntriesSnap.docs.map((d) => d.data() as JournalEntry);
    const lastEntry = journalEntries[0];
    const mood = lastEntry?.mainEmotion
      ? `${lastEntry.mainEmotion}${lastEntry?.subEmotion ? ` (${lastEntry.subEmotion})` : ''}`
      : 'no especificado';
    const diaryEntry = lastEntry?.journal || 'Sin entrada reciente';

    const done = (existingTasks as Task[]).filter((t) => t.estado === 'completada' && t.feedback);
    const pend = (existingTasks as Task[]).filter((t) => t.estado === 'pendiente');
    const previousTasks: string[] = [...done, ...pend].map((t) => t.descripcion);

    // ---------- 2) RAG (Mongo Vector Search) ----------
    let treatmentPlan = '';
    try {
      const userHint = lastEntry?.subEmotion ? `Enfoque para ${lastEntry.subEmotion}.` : '';
      const ragQuery =
        `Propuestas de tareas cortas y conductuales para pacientes con TCA basadas en TCC: ` +
        `psicoeducación, autorregistro, regularidad alimentaria, prevención de recaídas, habilidades de afrontamiento. ${userHint}`;
    
      const hits = await vectorSearch(ragQuery, { limit: 8, tags: ['TCA', 'literatura'] });
      treatmentPlan = compactContext(hits, 3500);
    } catch (e) {
      console.error('RAG failed:', e);
      // sigue sin RAG (treatmentPlan = '')
    }

    // ---------- 3) LLM (OpenAI Chat) ----------
    const prompt = buildTaskPrompt({ mood, diaryEntry, treatmentPlan, previousTasks });
    const model = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

    let tasks: string[] = [];
    try {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'Eres un asistente clínico para TCA que solo devuelve JSON válido cuando se pide.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
        }),
      });

      const j: any = await r.json();
      if (!r.ok) {
        console.error('Chat error', r.status, j);
        throw new Error(`Chat error ${r.status}: ${j?.error?.message ?? 'unknown'}`);
      }
      const content: string = j.choices?.[0]?.message?.content ?? '';
      tasks = safeParseTasks(content);
    } catch (llmErr) {
      console.error('LLM call failed → usando fallback. Error:', llmErr);
      tasks = ruleBasedFallback(mood);
    }

    if (!tasks.length) {
      // si aun así no hay, forzamos fallback
      tasks = ruleBasedFallback(mood);
    }

    // ---------- 4) Guardar en Firestore ----------
    const batch = db.batch();
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    tasks.slice(0, 3).forEach((description) => {
      const ref = db.collection('tareas').doc();
      batch.set(ref, {
        descripcion: description,
        pacienteId: userId,
        asignadaPor: 'IA Serenitea',
        estado: 'pendiente',
        fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
        fechaDue: admin.firestore.Timestamp.fromDate(tomorrow),
        feedback: null,
      });
    });

    await batch.commit();
    return new NextResponse(JSON.stringify({ message: 'Nuevas tareas generadas con éxito.' }), { status: 200 });

  } catch (error) {
    console.error('ERROR /api/generate-tasks:', error);
    const msg = error instanceof Error ? error.message : 'Ocurrió un error en el servidor.';
    // devolvemos detalle para que lo veas en la pestaña Network
    return new NextResponse(JSON.stringify({ error: msg }), { status: 500 });
  }
}