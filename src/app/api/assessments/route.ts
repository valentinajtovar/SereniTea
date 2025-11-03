
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';

// --- Mongoose Schema and Model ---
const AssessmentSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    instrument: { type: String, required: true },
    answers: [{
        questionId: { type: String, required: true },
        value: { type: Number, required: true },
        _id: false
    }],
    totalScore: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);

/**
 * Handles the POST request to save a new assessment.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify Firebase Auth Token
    const authToken = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!authToken) {
      return NextResponse.json({ error: { message: 'Unauthorized: No token provided' } }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(authToken);
    const uid = decodedToken.uid;

    // 2. Parse and validate the request body
    const body = await req.json();

    if (uid !== body.userId) {
        return NextResponse.json({ error: { message: 'Forbidden: User ID in token does not match payload' } }, { status: 403 });
    }
    
    // 3. Connect to MongoDB
    await dbConnect();

    // 4. Create and save the assessment
    const assessment = new Assessment(body);
    await assessment.save();

    return NextResponse.json({ message: 'Assessment saved successfully' }, { status: 201 });

  } catch (error: any) {
    console.error('Error saving assessment:', error);

    if (error.code?.startsWith('auth/')) {
        return NextResponse.json({ error: { message: `Authentication error: ${error.message}` } }, { status: 401 });
    }

    return NextResponse.json({ error: { message: 'Internal Server Error', details: error.message } }, { status: 500 });
  }
}
