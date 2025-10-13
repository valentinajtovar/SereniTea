
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Paciente } from '@/models/Paciente';

export async function GET(req: NextRequest) {
  try {
    const uid = req.nextUrl.searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ success: false, error: 'UID de usuario no proporcionado' }, { status: 400 });
    }

    await dbConnect();

    const paciente = await Paciente.findOne({ uid: uid });

    if (!paciente) {
      return NextResponse.json({ success: false, error: 'Paciente no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: paciente }, { status: 200 });
  } catch (error) {
    console.error('Error al buscar paciente:', error);
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 });
  }
}
