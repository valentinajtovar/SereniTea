
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const { searchParams } = new URL(request.url);
    const emotion = searchParams.get('emotion');

    if (!emotion) {
      return NextResponse.json({ error: 'El parámetro de consulta "emotion" es obligatorio.' }, { status: 400 });
    }

    // Busca las tareas recomendadas que coincidan con la emoción
    const recommendedTasks = await db
      .collection('recommendedtasks')
      .find({ mainEmotion: emotion })
      .limit(5) // Asegura que solo se devuelvan 5 tareas
      .toArray();

    if (recommendedTasks.length === 0) {
        return NextResponse.json({ error: 'No se encontraron tareas para la emoción especificada.' }, { status: 404 });
    }

    return NextResponse.json(recommendedTasks, { status: 200 });

  } catch (error) {
    console.error("Error al obtener las tareas recomendadas:", error);
    return NextResponse.json({ error: 'Error interno del servidor al obtener las tareas recomendadas.' }, { status: 500 });
  }
}
