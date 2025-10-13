
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { dbConnect } from '@/lib/db';
import { Paciente } from '@/models/Paciente';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  birthdate: z.string().refine((val) => !isNaN(Date.parse(val))),
  anonymousName: z.string().min(3),
  password: z.string().min(6), // Firebase requires a password of at least 6 characters
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = formSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: { message: "Validation failed", details: parsedData.error.errors } }, { status: 400 });
    }

    const { name, email, birthdate, anonymousName, password } = parsedData.data;

    // 1. Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
    });

    const { uid } = userRecord;

    // 2. Connect to MongoDB
    await dbConnect();

    // 3. Create patient in MongoDB using the Paciente model
    const patient = new Paciente({
      uid: uid, // Use the uid from Firebase
      nombre: name.split(' ')[0], // Extract first name
      apellido: name.split(' ').slice(1).join(' '), // Extract last name(s)
      correo: email,
      nacimiento: new Date(birthdate),
      usuario_anonimo: anonymousName,
      createdAt: new Date(),
    });

    await patient.save();

    return NextResponse.json({ message: 'Patient registered successfully', uid: uid }, { status: 201 });

  } catch (error: any) {
    // Check for specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: { message: 'The email address is already in use by another account.' } }, { status: 409 });
    }
    
    // General error handler
    return NextResponse.json({ error: { message: 'Internal Server Error', details: error.message } }, { status: 500 });
  }
}
