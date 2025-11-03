export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    console.log('[GET /api/pacientes] uid=', firebaseUid);
    const paciente = await Paciente.findOne({ firebaseUid });

    if (!paciente) {
      console.warn('[GET /api/pacientes] not-found uid=', firebaseUid);
      return NextResponse.json({ error: { message: 'Paciente no encontrado' } }, { status: 404 });
    }

    return NextResponse.json(paciente, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/pacientes] error:', error);
    return NextResponse.json(
      { error: { message: 'Internal Server Error', details: error.message } },
      { status: 500 }
    );
  }
}
