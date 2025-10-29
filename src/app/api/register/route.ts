
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Paciente } from '@/models/Paciente';
import { z } from 'zod';

// Updated schema: expects UID from the client, removes password.
const formSchema = z.object({
  uid: z.string().min(1, "Firebase UID is required."),
  name: z.string().min(3),
  email: z.string().email(),
  birthdate: z.string().refine((val) => !isNaN(Date.parse(val))),
  anonymousName: z.string().min(3),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = formSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: { message: "Validation failed", details: parsedData.error.errors } }, { status: 400 });
    }

    const { uid, name, email, birthdate, anonymousName } = parsedData.data;

    // Connect to MongoDB
    await dbConnect();

    // Check if a patient with this UID already exists
    const existingPatient = await Paciente.findOne({ uid: uid });
    if (existingPatient) {
        return NextResponse.json({ error: { message: 'A patient with this UID already exists.' } }, { status: 409 });
    }

    // Create a new patient in MongoDB
    const patient = new Paciente({
      uid: uid, // Use the uid from the client-side Firebase Auth
      nombre: name.split(' ')[0],
      apellido: name.split(' ').slice(1).join(' '),
      correo: email,
      nacimiento: new Date(birthdate),
      usuario_anonimo: anonymousName,
      createdAt: new Date(),
    });

    await patient.save();

    return NextResponse.json({ message: 'Patient registered successfully', uid: uid }, { status: 201 });

  } catch (error: any) {
    // Handle potential errors, e.g., database connection issues
    console.error("Error during patient registration:", error);
    return NextResponse.json({ error: { message: 'Internal Server Error', details: error.message } }, { status: 500 });
  }
}
