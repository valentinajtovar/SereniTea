
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import JournalEntry from '@/models/JournalEntry';
import { admin } from '@/lib/firebase-admin';
import { z } from 'zod';
import mongoose from 'mongoose';

// --- Zod Schemas ---
const postSchema = z.object({
  patientId: z.string().optional(), // patientId might not be needed if firebaseUid is the primary link
  mainEmotion: z.string(),
  subEmotion: z.string(),
  journal: z.string().min(10, "El diario debe tener al menos 10 caracteres."),
  emotionEmoji: z.string(),
});

const putSchema = z.object({
  journal: z.string().min(10, "El diario debe tener al menos 10 caracteres."),
});

// --- Helper to get UID from token ---
async function getUidFromToken(req: NextRequest): Promise<string | null> {
    const authToken = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!authToken) return null;
    try {
        const decodedToken = await admin.auth().verifyIdToken(authToken);
        return decodedToken.uid;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

// --- API Handlers ---

export async function POST(req: NextRequest) {
  const uid = await getUidFromToken(req);
  if (!uid) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const parsedData = postSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: { message: "Validation failed", details: parsedData.error.flatten() } }, { status: 400 });
    }

    const newJournalEntry = new JournalEntry({
      ...parsedData.data,
      firebaseUid: uid, // Use the secure UID from the token
      createdAt: new Date(),
    });

    const savedEntry = await newJournalEntry.save();
    return NextResponse.json(savedEntry, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: { message: 'Internal Server Error', details: error.message } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const uid = await getUidFromToken(req);
  if (!uid) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    await dbConnect();
    // Securely find entries using the UID from the token
    const entries = await JournalEntry.find({ firebaseUid: uid }).sort({ createdAt: -1 });
    return NextResponse.json(entries, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: { message: 'Internal Server Error', details: error.message } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const uid = await getUidFromToken(req);
  if (!uid) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    await dbConnect();
    const entryId = new URL(req.url).searchParams.get('id');

    if (!entryId || !mongoose.Types.ObjectId.isValid(entryId)) {
      return NextResponse.json({ error: { message: 'Valid entry ID is required' } }, { status: 400 });
    }

    const body = await req.json();
    const parsedData = putSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: { message: "Validation failed", details: parsedData.error.flatten() } }, { status: 400 });
    }

    // Find the entry and ensure it belongs to the user making the request
    const updatedEntry = await JournalEntry.findOneAndUpdate(
      { _id: entryId, firebaseUid: uid },
      { journal: parsedData.data.journal },
      { new: true }
    );

    if (!updatedEntry) {
      return NextResponse.json({ error: { message: 'Journal entry not found or you do not have permission to edit it' } }, { status: 404 });
    }

    return NextResponse.json(updatedEntry, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: { message: 'Internal Server Error', details: error.message } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const uid = await getUidFromToken(req);
  if (!uid) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  try {
    await dbConnect();
    const entryId = new URL(req.url).searchParams.get('id');

    if (!entryId || !mongoose.Types.ObjectId.isValid(entryId)) {
      return NextResponse.json({ error: { message: 'Valid entry ID is required' } }, { status: 400 });
    }

    // Find the entry and ensure it belongs to the user making the request before deleting
    const deletedEntry = await JournalEntry.findOneAndDelete({ _id: entryId, firebaseUid: uid });

    if (!deletedEntry) {
      return NextResponse.json({ error: { message: 'Journal entry not found or you do not have permission to delete it' } }, { status: 404 });
    }

    return NextResponse.json({ message: 'Journal entry deleted successfully' }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: { message: 'Internal Server Error', details: error.message } }, { status: 500 });
  }
}
