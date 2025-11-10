import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { firebaseUid, title, description } = await req.json();

    if (!firebaseUid || !title) {
      return NextResponse.json({ error: 'Faltan parámetros.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const patient = await db.collection('pacientes').findOne({ uid: firebaseUid });
    if (!patient) {
      return NextResponse.json({ error: 'Paciente no encontrado.' }, { status: 404 });
    }

    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + 1);

    await db.collection('tareas').insertOne({
      descripcion: description || title,
      estado: 'pendiente',
      fechaCreacion: now,
      fechaDue: due,
      paciente: patient._id,
      asignadaPor: 'Descubrir',
      source: 'discover',
      feedback: null,
      aiFeedback: null,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('add-task from discover error:', e);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}