import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Paciente } from '@/models/Paciente';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    // El cliente envía ?firebaseUid=... desde el dashboard.
    const firebaseUid = searchParams.get('firebaseUid') || searchParams.get('uid');

    if (!firebaseUid) {
      return NextResponse.json(
        { error: { message: 'firebaseUid is required' } },
        { status: 400 }
      );
    }

    // En la colección Paciente el campo se llama "uid"
    const paciente = await Paciente.findOne({ uid: firebaseUid }).lean();

    if (!paciente) {
      return NextResponse.json(
        { error: { message: 'Paciente no encontrado' } },
        { status: 404 }
      );
    }

    // Asegura que _id sea string
    const { _id, ...rest } = paciente as any;
    return NextResponse.json({ _id: String(_id), ...rest }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: 'Internal Server Error', details: error.message } },
      { status: 500 }
    );
  }
}
