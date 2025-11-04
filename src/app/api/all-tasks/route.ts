
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Paciente } from '@/models/Paciente';
import { Task } from '@/models/Task';

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

    await dbConnect();

    // Find the patient by firebaseUid to get their _id
    const patient = await Paciente.findOne({ uid: firebaseUid }).lean();

    if (!patient) {
        return NextResponse.json({ error: 'Paciente no encontrado.' }, { status: 404 });
    }

    const tasks = await Task.find({ paciente: patient._id })
      .sort({ fechaCreacion: -1 })
      .lean();

    // The frontend expects a certain structure, let's adapt the response
    const formattedTasks = tasks.map(task => ({
      _id: task._id.toString(),
      description: task.descripcion,
      status: task.estado,
      dueDate: task.fechaDue ? task.fechaDue.toISOString() : new Date().toISOString(),
      assignedBy: task.asignadaPor,
      feedback: task.feedback || null,
      aiFeedback: task.aiFeedback,
      // The original component expects title and firebaseUid, let's add them
      title: task.descripcion, // Or some other logic for title
      firebaseUid: firebaseUid, 
    }));


    return NextResponse.json(formattedTasks, { status: 200 });

  } catch (error: any) {
    console.error('Error al obtener todas las tareas:', error);
    return NextResponse.json({ error: 'Error interno del servidor al obtener las tareas.', details: error.message }, { status: 500 });
  }
}
