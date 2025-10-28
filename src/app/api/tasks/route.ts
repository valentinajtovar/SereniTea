
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * GET /api/tasks
 * Obtiene las tareas de un usuario específico desde la colección 'taks' en MongoDB.
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
    const collection = db.collection('taks');

    const tasks = await collection
      .find({ firebaseUid: firebaseUid, status: 'pendiente' })
      .sort({ dueDate: 1 }) // Ordenar por fecha de vencimiento ascendente
      .toArray();

    return NextResponse.json(tasks, { status: 200 });

  } catch (error) {
    console.error('Error al obtener las tareas:', error);
    return NextResponse.json({ error: 'Error interno del servidor al obtener las tareas.' }, { status: 500 });
  }
}
