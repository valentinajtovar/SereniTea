export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { dbConnect } from '@/lib/db';
import { Paciente } from '@/models/Paciente';

type ParsedBody = {
  nombreCompleto: string;
  correo: string;
  password: string;
  fechaNacimiento?: string | null;
  usuarioAnonimo?: string | null;
};

function toDateOrNull(v?: string | null): Date | null {
  if (!v) return null;
  // ISO o YYYY-MM-DD
  const iso = new Date(v);
  if (!Number.isNaN(+iso)) return iso;

  // MM/DD/YYYY
  const mdy = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (mdy) {
    const [, mm, dd, yyyy] = mdy;
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
  }
  return null;
}

async function parseBody(req: Request): Promise<ParsedBody> {
  const ct = req.headers.get('content-type') || '';
  let data: any = {};

  if (ct.includes('application/json')) {
    data = await req.json().catch(() => ({}));
  } else if (
    ct.includes('multipart/form-data') ||
    ct.includes('application/x-www-form-urlencoded')
  ) {
    const fd = await req.formData();
    data = Object.fromEntries(fd.entries());
  } else {
    // intentar json por defecto
    data = await req.json().catch(() => ({}));
  }

  // Normalización de alias
  const nombreCompleto =
    data.nombreCompleto ??
    data.nombre_completo ??
    data.nombre ??
    data.fullName ??
    '';

  const correo = data.correo ?? data.email ?? '';

  const password = data.password ?? data.pass ?? '';

  const fechaNacimiento =
    data.fechaNacimiento ?? data.nacimiento ?? data.fecha_nacimiento ?? null;

  const usuarioAnonimo =
    data.usuarioAnonimo ?? data.usuario_anonimo ?? data.nick ?? data.alias ?? null;

  return {
    nombreCompleto: String(nombreCompleto || '').trim(),
    correo: String(correo || '').trim(),
    password: String(password || ''),
    fechaNacimiento: fechaNacimiento ? String(fechaNacimiento) : null,
    usuarioAnonimo: usuarioAnonimo ? String(usuarioAnonimo) : null,
  };
}

export async function POST(req: Request) {
  const started = Date.now();
  try {
    const {
      nombreCompleto,
      correo,
      password,
      fechaNacimiento,
      usuarioAnonimo,
    } = await parseBody(req);

    const missing: string[] = [];
    if (!nombreCompleto) missing.push('nombreCompleto');
    if (!correo) missing.push('correo');
    if (!password) missing.push('password');

    if (missing.length) {
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${missing.join(', ')}` },
        { status: 422 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    // 1) Crear usuario en Firebase Auth
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
      console.error('adminAuth.createUser error:', e?.errorInfo || e);
      const code = e?.errorInfo?.code || e?.code || '';
      const message = e?.errorInfo?.message || e?.message || '';

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
        return NextResponse.json({ error: 'Correo inválido.' }, { status: 400 });
      }
      return NextResponse.json(
        { error: 'No se pudo crear el usuario.' },
        { status: 500 }
      );
    }

    // 2) Guardar paciente en Mongo
    await dbConnect();
    const [nombre, ...rest] = nombreCompleto.split(/\s+/);
    const apellido = rest.join(' ');

    const pacienteDoc = await Paciente.create({
      uid: userRecord.uid, // El modelo usa "uid"
      correo,
      fechaNacimiento: toDateOrNull(fechaNacimiento),
      nombre,
      apellido,
      usuario_anonimo: usuarioAnonimo ?? null,
      tareas: [],
      journalEntries: [],
    });

    return NextResponse.json(
      { ok: true, uid: userRecord.uid, pacienteId: String(pacienteDoc._id) },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('REGISTER API FATAL:', err?.message || err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    console.log('[register] finished in', Date.now() - started, 'ms');
  }
}