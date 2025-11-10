export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// -- Helpers ---------------------------------------------------------------

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

async function getCollection() {
  const client = await clientPromise;
  const db = client.db(); // usa MONGODB_DB de tu .env si configuraste el client con DB por defecto
  return db.collection('tareas');
}

// -- GET opcional (por si quieres inspeccionar una tarea puntual) ----------
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) return bad('Falta id en la ruta.');

    const _id = new ObjectId(id);
    const col = await getCollection();

    const task = await col.findOne({ _id });
    if (!task) return bad('Tarea no encontrada.', 404);

    return NextResponse.json(task, { status: 200 });
  } catch (err) {
    console.error('GET /api/tasks/[id] error:', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

// -- PATCH: actualizar status, feedback o aiFeedback ----------------------
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) return bad('Falta id en la ruta.');

    // body esperado (cualquiera de los 3 campos)
    const body = await req.json().catch(() => ({} as any));
    const { status, feedback, aiFeedback } = body as {
      status?: 'pendiente' | 'completada';
      feedback?: {
        utilidad?: 'muy_util' | 'util' | 'neutral' | 'no_util';
        dificultad?: 'facil' | 'media' | 'dificil';
        comentario?: string;
        repetiria?: boolean;
      } | null;
      aiFeedback?: 'liked' | 'disliked';
    };

    if (
      typeof status === 'undefined' &&
      typeof feedback === 'undefined' &&
      typeof aiFeedback === 'undefined'
    ) {
      return bad('Nada para actualizar. Envía status, feedback o aiFeedback.');
    }

    const _id = new ObjectId(id);
    const col = await getCollection();

    const $set: Record<string, any> = { updatedAt: new Date() };

    if (typeof status !== 'undefined') {
      if (status !== 'pendiente' && status !== 'completada') {
        return bad('status inválido.');
      }
      $set.estado = status;
      // opcional: marca fecha de completado
      $set.completedAt = status === 'completada' ? new Date() : null;
    }

    if (typeof feedback !== 'undefined') {
      // feedback puede ser null para borrar notas
      $set.feedback = feedback ?? null;
    }

    if (typeof aiFeedback !== 'undefined') {
      if (aiFeedback !== 'liked' && aiFeedback !== 'disliked') {
        return bad('aiFeedback inválido.');
      }
      $set.aiFeedback = aiFeedback;
    }

    const result = await col.updateOne({ _id }, { $set });
    if (result.matchedCount === 0) return bad('Tarea no encontrada.', 404);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('PATCH /api/tasks/[id] error:', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

// -- DELETE: eliminar tarea ----------------------------------------------
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) return bad('Falta id en la ruta.');

    const _id = new ObjectId(id);
    const col = await getCollection();

    const result = await col.deleteOne({ _id });
    if (result.deletedCount === 0) return bad('Tarea no encontrada.', 404);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/tasks/[id] error:', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}