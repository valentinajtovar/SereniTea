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
  return `Eres un asistente de TCC para TCA. Devuelve EXACTAMENTE un JSON array de 3 strings (sin texto extra).

Datos del paciente:
- Estado/Mood: ${mood}
- Diario: ${diaryEntry}

Contexto clínico (literatura / guías) para inspirar tareas:
${treatmentPlan}

No repitas ni parafrasees estas tareas ya existentes:
${JSON.stringify(previousTasks ?? [])}

Criterios de las 3 tareas:
- Conductuales, pequeñas, realizables hoy o esta semana.
- Específicas, medibles y con duración/criterio de término (p. ej., “10 min respiración 4-7-8”).
- Relacionadas con TCA: regularidad alimentaria, autorregistro, exposición gradual, reestructuración cognitiva, afrontamiento, autocompasión.
- Tono empático y neutro.
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

    // --- Guardar en Mongo con el esquema que lee el front
    const client = await clientPromise;
    const db = client.db();
    const col = db.collection('tareas');

    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + 1);

    const docs = tasks.slice(0, 3).map((t) => ({
      title: t.length > 90 ? t.slice(0, 87) + '…' : t,
      description: t,
      status: 'pendiente' as const,
      dueDate: due,
      firebaseUid,
      assignedBy: 'IA Serenitea',
      createdAt: now,
    }));

    await col.insertMany(docs);

    return NextResponse.json({ inserted: docs.length, tasks: docs }, { status: 200 });
  } catch (error) {
    console.error('ERROR /api/generate-tasks:', error);
    const msg = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}