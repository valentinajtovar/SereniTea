import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Paciente } from '@/models/Paciente';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const firebaseUid = searchParams.get('firebaseUid') || searchParams.get('uid');

    if (!firebaseUid) {
      return NextResponse.json(
        { error: { message: 'firebaseUid is required' } },
        { status: 400 }
      );
    }

    // Busca por ambos campos, por si tu data histórica usó `firebaseUid` en lugar de `uid`
    const paciente = await Paciente.findOne({
      $or: [{ uid: firebaseUid }, { firebaseUid }]
    }).lean();

    if (!paciente) {
      return NextResponse.json(
        { error: { message: 'Paciente no encontrado' } },
        { status: 404 }
      );
    }

    const { _id, ...rest } = paciente as any;
    return NextResponse.json({ _id: String(_id), ...rest }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: 'Internal Server Error', details: error.message } },
      { status: 500 }
    );
  }
}