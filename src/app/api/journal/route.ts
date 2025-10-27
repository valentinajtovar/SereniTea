
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import JournalEntry from '@/models/JournalEntry';
import { z } from 'zod';

const formSchema = z.object({
  firebaseUid: z.string(),
  patientId: z.string(),
  mainEmotion: z.string(),
  subEmotion: z.string(),
  journal: z.string().min(10),
  emotionEmoji: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const parsedData = formSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: { message: "Validation failed", details: parsedData.error.errors } }, { status: 400 });
    }

    const { firebaseUid, patientId, mainEmotion, subEmotion, journal, emotionEmoji } = parsedData.data;

    const newJournalEntry = new JournalEntry({
      firebaseUid,
      patientId,
      mainEmotion,
      subEmotion,
      journal,
      emotionEmoji,
      createdAt: new Date(),
    });

    const savedEntry = await newJournalEntry.save();

    return NextResponse.json(savedEntry, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: { message: 'Internal Server Error', details: error.message } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const firebaseUid = searchParams.get('firebaseUid');

    if (!firebaseUid) {
      return NextResponse.json({ error: { message: 'firebaseUid is required' } }, { status: 400 });
    }

    const entries = await JournalEntry.find({ firebaseUid }).sort({ createdAt: -1 });

    return NextResponse.json(entries, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: { message: 'Internal Server Error', details: error.message } }, { status: 500 });
  }
}
