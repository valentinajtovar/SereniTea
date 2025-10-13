import 'regenerator-runtime/runtime';
import { NextRequest, NextResponse } from 'next/server';

import { dbConnect } from '@/lib/db'; // Corrected import from @/lib/db
import { Paciente } from '@/models/Paciente';
import JournalEntry from '@/models/JournalEntry';
import { admin } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'No authorization token provided.' }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;
    
    await dbConnect(); // This should now work correctly

    const entries = await JournalEntry.find({ uid: firebaseUid }).sort({ createdAt: -1 });
    
    return NextResponse.json(entries, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching journal entries:", error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Token expired. Please re-authenticate.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'No authorization token provided.' }, { status: 401 });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid: firebaseUid, email } = decodedToken;
    const body = await req.json();

    await dbConnect(); // This should now work correctly

    // Find the patient or create them if they don't exist (upsert)
    const patient = await Paciente.findOneAndUpdate(
      { uid: firebaseUid },
      {
        $setOnInsert: {
          uid: firebaseUid,
          correo: email, // Assuming email is available in the token
          nombre: email?.split('@')[0] || 'Nuevo', // Default name from email
          apellido: 'Usuario', // Default last name
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const newEntry = new JournalEntry({
      ...body,
      patientId: patient._id,
      uid: firebaseUid,
    });

    await newEntry.save();

    return NextResponse.json(newEntry, { status: 201 });

  } catch (error: any) {
    console.error("Error creating journal entry:", error);
    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json({ error: 'Token expired. Please re-authenticate.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
