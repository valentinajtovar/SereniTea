
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Inicializa Firebase Admin SDK (solo si no está ya inicializado)
// Esto es necesario para verificar los tokens de autenticación de los usuarios
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON as string))
  });
}

export async function GET(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
      return NextResponse.json({ error: 'No se proporcionó token de autorización.' }, { status: 401 });
    }

    // Verificar el token de ID de Firebase para obtener el UID
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    // Conectar a MongoDB y buscar al paciente usando el UID
    const client = await clientPromise;
    const db = client.db();
    const paciente = await db.collection('pacientes').findOne({ firebaseUid });

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente no encontrado en la base de datos.' }, { status: 404 });
    }

    // Devolver los datos del paciente si se encuentra
    return NextResponse.json(paciente, { status: 200 });

  } catch (error: any) {
    console.error("Error en la ruta de sesión:", error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'El token de sesión ha expirado.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error interno del servidor al procesar la sesión.' }, { status: 500 });
  }
}
