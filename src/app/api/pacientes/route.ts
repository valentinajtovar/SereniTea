
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Paciente } from '@/models/Paciente';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const firebaseUid = searchParams.get('firebaseUid');

    if (!firebaseUid) {
      return NextResponse.json({ error: { message: 'firebaseUid is required' } }, { status: 400 });
    }

    // Usamos findOne para obtener un único paciente
    const paciente = await Paciente.findOne({ firebaseUid });

    // Si no se encuentra el paciente, devolvemos un 404
    if (!paciente) {
      return NextResponse.json({ error: { message: 'Paciente no encontrado' } }, { status: 404 });
    }

    // Devolvemos el objeto del paciente
    return NextResponse.json(paciente, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: { message: 'Internal Server Error', details: error.message } }, { status: 500 });
  }
}
