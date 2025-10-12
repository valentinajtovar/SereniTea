export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { admin } from "@/src/lib/firebase-admin";
import { dbConnect } from "@/src/lib/db";
import { Paciente } from "@/src/models/Paciente";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const idToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!idToken) return NextResponse.json({ user: null }, { status: 200 });

    // Verificar token de Firebase (mixto)
    const decoded = await admin.auth().verifyIdToken(idToken, true);
    const { uid, email } = decoded;

    await dbConnect();
    // Busca o crea el Paciente con ese uid/email
    let paciente = await Paciente.findOne({ uid });
    if (!paciente) {
      paciente = await Paciente.create({
        uid,
        correo: email ?? `${uid}@no-email.local`,
        nombre: "Paciente",
        apellido: "SereniTea",
        usuario_anonimo: null,
        tareas: [],
        journalEntries: [],
      });
    }

    return NextResponse.json({
      user: {
        uid,
        email: paciente.correo,
        pacienteId: paciente._id,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
      }
    });
  } catch (e: any) {
    return NextResponse.json({ user: null, error: e.message }, { status: 200 });
  }
}
