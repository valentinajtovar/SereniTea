
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { vectorSearch, compactContext } from '@/server/rag';

// Utilidad mínima
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
  return `Eres un asistente de TCC para TCA. Devuelve EXACTAMENTE un JSON array de 3 strings (sin texto extra).\n\nDatos del paciente:\n- Estado/Mood: ${mood}\n- Diario: ${diaryEntry}\n\nContexto clínico (literatura / guías) para inspirar tareas:\n${treatmentPlan}\n\nNo repitas ni parafrasees estas tareas ya existentes:\n${JSON.stringify(previousTasks ?? [])}\n\nCriterios de las 3 tareas:\n- Conductuales, pequeñas, realizables hoy o esta semana.\n- Específicas, medibles y con duración/criterio de término (p. ej., “10 min respiración 4-7-8”).\n- Relacionadas con TCA: regularidad alimentaria, autorregistro, exposición gradual, reestructuración cognitiva, afrontamiento, autocompasión.\n- Tono empático y neutro.\n- Español neutro.\n- Formato de salida: SOLO JSON array de strings.\n`;
}

function safeParseTasks(text: string): string[] {
  const first = text.indexOf('[');
  const last = text.lastIndexOf(']');
  const slice = first >= 0 && last >= 0 ? text.slice(first, last + 1) : text;
  try {
    const parsed = JSON.parse(slice);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string').slice(0, 3);
  } catch {}
  return [];
}

function ruleBasedFallback(mood: string): string[] {
  const base = [
    'Registrar 3 comidas y 2 colaciones hoy (hora, hambre 0–10, emociones).',
    'Practicar 10 minutos de respiración 4-7-8 o relajación muscular progresiva.',
    'Escribir 3 pensamientos automáticos y reestructurarlos con alternativas compasivas.'
  ];
  if (/ansiedad|miedo|preocup/i.test(mood)) {
    base[1] = 'Practicar 10 minutos de respiración 4-7-8 (mañana o tarde).';
  }
  return base;
}

export async function POST(req: Request) {
  try {
    // --- Chequeo de entorno
    requiredEnv('MONGODB_URI');
    requiredEnv('OPENAI_API_KEY');

    const { firebaseUid, previousTasks = [], lastMood = 'no especificado', lastDiary = '' } = await req.json();

    if (!firebaseUid) {
      return NextResponse.json({ error: 'Falta firebaseUid' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db();

    const patient = await db.collection('pacientes').findOne({ uid: firebaseUid });
    if (!patient) {
      return NextResponse.json({ error: 'Paciente no encontrado para asociar tareas.' }, { status: 404 });
    }

    // --- RAG (Vector Search sobre Mongo)
    let treatmentPlan = '';
    try {
      const ragQuery =
        `Propuestas de tareas cortas y conductuales para pacientes con TCA basadas en TCC: ` +
        `psicoeducación, autorregistro, regularidad alimentaria, prevención de recaídas, afrontamiento.`;
      const hits = await vectorSearch(ragQuery, { limit: 8, tags: ['TCA', 'literatura'] });
      treatmentPlan = compactContext(hits, 3000);
    } catch (e) {
      console.error('RAG failed:', e);
    }

    // --- LLM (OpenAI Chat)
    const prompt = buildTaskPrompt({
      mood: lastMood,
      diaryEntry: lastDiary || 'Sin entrada reciente',
      treatmentPlan,
      previousTasks,
    });

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
            { role: 'system', content: 'Devuelve SOLO un JSON array de strings con 3 tareas concretas.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
        }),
      });
      const j: any = await r.json();
      if (!r.ok) {
        console.error('Chat error', r.status, j);
        throw new Error(j?.error?.message ?? `Chat error ${r.status}`);
      }
      const content: string = j.choices?.[0]?.message?.content ?? '';
      tasks = safeParseTasks(content);
    } catch (err) {
      console.error('LLM call failed → fallback:', err);
      tasks = ruleBasedFallback(lastMood);
    }
    if (!tasks.length) tasks = ruleBasedFallback(lastMood);

    // --- Guardar en Mongo con el esquema correcto
    const tareasCollection = db.collection('tareas');

    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + 1); // vence mañana

    const docs = tasks.slice(0, 3).map((t) => ({
      descripcion: t,
      estado: 'pendiente' as const,
      fechaDue: due,
      fechaCreacion: now,
      paciente: patient._id,

      asignadaPor: 'IA Serenitea',
      source: 'AI',

      feedback: null,
      aiFeedback: null,
    }));

    if (docs.length > 0) {
      await tareasCollection.insertMany(docs);
    }

    return NextResponse.json({ inserted: docs.length }, { status: 200 });
  } catch (error) {
    console.error('ERROR /api/recommended-tasks:', error);
    const msg = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
