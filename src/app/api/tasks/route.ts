import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Paciente } from '@/models/Paciente';
import { Task } from '@/models/Task';
import { admin } from '@/lib/firebase-admin';
import { z } from 'zod';

// Zod schemas for validation
const taskSchema = z.object({
  description: z.string(),
  isCompleted: z.boolean().default(false), // Note: This is from the frontend, but not in our DB model
});

const aiTasksSchema = z.object({
  tasks: z.array(taskSchema),
});

// Helper to get UID from Firebase token
async function getUidFromToken(req: NextRequest): Promise<string | null> {
    const authToken = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!authToken) return null;
    try {
        const decodedToken = await admin.auth().verifyIdToken(authToken);
        return decodedToken.uid;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

// GET handler to fetch tasks for a user
export async function GET(req: NextRequest) {
  const uid = await getUidFromToken(req);
  if (!uid) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    await dbConnect();
    const patient = await Paciente.findOne({ uid }).select('_id');
    if (!patient) {
      return NextResponse.json({ error: { message: 'Patient not found' } }, { status: 404 });
    }

    const tasks = await Task.find({ paciente: patient._id }).sort({ fechaCreacion: -1 });
    
    return NextResponse.json(tasks, { status: 200 });

  } catch (error: any) {
    console.error("Error in /api/tasks GET:", error);
    return NextResponse.json({ error: { message: 'Internal Server Error', details: error.message } }, { status: 500 });
  }
}


// POST handler to create new tasks
export async function POST(req: NextRequest) {
  const uid = await getUidFromToken(req);
  if (!uid) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const parsedData = aiTasksSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: { message: "Validation failed", details: parsedData.error.flatten() } }, { status: 400 });
    }

    const patient = await Paciente.findOne({ uid });
    if (!patient) {
      return NextResponse.json({ error: { message: 'Patient not found' } }, { status: 404 });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasksToCreate = parsedData.data.tasks.map(task => ({
      descripcion: task.description,
      estado: 'pendiente',
      fechaCreacion: new Date(),
      fechaDue: tomorrow,
      paciente: patient._id,
    
      // ✅ MARCAS DE USUARIO
      asignadaPor: 'Paciente',
      source: 'user',
    
      feedback: null,
      aiFeedback: null,
    }));

    if (tasksToCreate.length === 0) {
        return NextResponse.json({ error: { message: 'No tasks to create' }}, { status: 400 });
    }

    const newTasks = await Task.insertMany(tasksToCreate);
    const newTaskIds = newTasks.map(task => task._id);

    await Paciente.updateOne({ _id: patient._id }, { $push: { tareas: { $each: newTaskIds } } });

    return NextResponse.json(newTasks, { status: 201 });

  } catch (error: any) {
    console.error("Error in /api/tasks POST:", error);
    if (error.name === 'ValidationError') {
        return NextResponse.json({ error: { message: 'Task validation failed', details: error.errors } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: 'Internal Server Error', details: error.message } }, { status: 500 });
  }
}
