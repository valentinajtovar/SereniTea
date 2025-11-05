import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongo } from "@/lib/mongoose";
import Psychologist from "@/models/Psychologist";

export async function POST(req: NextRequest) {
  try {
    await connectMongo();
    const data = await req.json();

    const { fullName, email, password, specializations, bio, license } = data;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const psychologist = await Psychologist.create({
      fullName,
      email,
      passwordHash,
      specializations,
      bio,
      license,
    });

    return NextResponse.json(
      { message: "Psicólogo registrado", id: psychologist._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
