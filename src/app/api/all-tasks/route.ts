
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * GET /api/all-tasks
 * Obtiene todas las tareas de un usuario específico desde la colección 'tareas' en MongoDB.
 * Se requiere el parámetro de consulta 'firebaseUid'.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const firebaseUid = searchParams.get('firebaseUid');

    if (!firebaseUid) {
      return NextResponse.json({ error: 'El ID de usuario (firebaseUid) es obligatorio.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('tareas');

    const tasks = await collection
      .find({ firebaseUid: firebaseUid })
      .sort({ dueDate: 1 })
      .toArray();

    return NextResponse.json(tasks, { status: 200 });

  } catch (error) {
    console.error('Error al obtener todas las tareas:', error);
    return NextResponse.json({ error: 'Error interno del servidor al obtener las tareas.' }, { status: 500 });
  }
}
