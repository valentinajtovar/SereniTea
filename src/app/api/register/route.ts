export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { dbConnect } from '@/lib/db';
import { Paciente } from '@/models/Paciente';

/**
 * Espera body:
 * {
 *   nombreCompleto: string,
 *   correo: string,
 *   password: string,
 *   fechaNacimiento: string (ISO o yyyy-mm-dd),
 *   usuarioAnonimo?: string
 * }
 */
export async function POST(req: Request) {
  const started = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const {
      nombreCompleto,
      correo,
      password,
      fechaNacimiento,
      usuarioAnonimo,
    } = body ?? {};

    // Validación mínima
    if (!nombreCompleto || !correo || !password) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos.' },
        { status: 422 }
      );
    }

    // 1) Crear usuario en Firebase Auth (Admin)
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email: correo,
        password,
        displayName: nombreCompleto,
        emailVerified: false,
        disabled: false,
      });
    } catch (e: any) {
      // Log detallado para Vercel
      console.error('adminAuth.createUser error:', e?.errorInfo || e);

      // Mapeo de errores comunes de Firebase Auth
      const code = e?.errorInfo?.code || e?.code || '';
      const message = e?.errorInfo?.message || e?.message || 'Auth error';

      if (code.includes('email-already-exists') || message.includes('EMAIL_EXISTS')) {
        return NextResponse.json(
          { error: 'El correo ya está registrado.' },
          { status: 409 }
        );
      }
      if (code.includes('invalid-password')) {
        return NextResponse.json(
          { error: 'La contraseña no cumple los requisitos.' },
          { status: 400 }
        );
      }
      if (code.includes('invalid-email')) {
        return NextResponse.json(
          { error: 'Correo inválido.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'No se pudo crear el usuario.' },
        { status: 500 }
      );
    }

    // 2) Guardar paciente en Mongo
    await dbConnect();

    const [nombre, ...resto] = String(nombreCompleto).trim().split(/\s+/);
    const apellido = resto.join(' ') || '';

    const pacienteDoc = await Paciente.create({
      uid: userRecord.uid,                 // **OJO**: el modelo usa `uid`
      correo,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      nombre,
      apellido,
      usuario_anonimo: usuarioAnonimo || null,
      tareas: [],
      journalEntries: [],
    });

    // 3) Responder OK
    return NextResponse.json(
      {
        ok: true,
        uid: userRecord.uid,
        pacienteId: String(pacienteDoc._id),
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('REGISTER API FATAL:', err?.message || err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    console.log('[register] finished in', Date.now() - started, 'ms');
  }
}
