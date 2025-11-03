import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Paciente } from '@/models/Paciente';
import { admin } from '@/lib/firebase-admin'; // usa FIREBASE_SERVICE_ACCOUNT_JSON

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/paciente-info?firebaseUid=<uid>
 * 1) Busca en Mongo por uid | firebaseUid
 * 2) Si no existe, intenta leer Firestore (admin) y upsert en Mongo
 * 3) Devuelve el paciente normalizado
 */
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

    // 1) Intento en Mongo (aceptando ambos campos por compatibilidad)
    let paciente: any = await Paciente.findOne({
      $or: [{ uid: firebaseUid }, { firebaseUid }]
    }).lean();

    // 2) Si no está en Mongo, intento leer de Firestore y hacer upsert
    if (!paciente) {
      const fsDoc = await admin.firestore().collection('paciente').doc(firebaseUid).get();

      if (fsDoc.exists) {
        const data = fsDoc.data() || {};

        // Adaptación de campos Firestore -> IPaciente (modelo Mongo)
        // En tu Firestore tienes: correo, nacimiento, nombre_completo, usuario_anonimo
        const nombreCompleto: string = data.nombre_completo || '';
        // Si quieres separar nombre/apellido puedes hacerlo, por ahora guardamos nombre completo en "nombre"
        const payload = {
          uid: firebaseUid,
          correo: data.correo || '',
          fechaNacimiento: data.nacimiento ? new Date(data.nacimiento) : null,
          nombre: nombreCompleto,
          apellido: '', // no disponible en firestore
          usuario_anonimo: data.usuario_anonimo ?? null,
        };

        // upsert en Mongo
        await Paciente.updateOne(
          { uid: firebaseUid },
          {
            $setOnInsert: { tareas: [], journalEntries: [] },
            $set: payload,
          },
          { upsert: true }
        );

        paciente = await Paciente.findOne({ uid: firebaseUid }).lean();
      }
    }

    if (!paciente) {
      // No está en Mongo ni en Firestore
      return NextResponse.json(
        { error: { message: 'Paciente no encontrado' } },
        { status: 404 }
      );
    }

    const { _id, ...rest } = paciente;
    return NextResponse.json({ _id: String(_id), ...rest }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: { message: 'Internal Server Error', details: error?.message } },
      { status: 500 }
    );
  }
}