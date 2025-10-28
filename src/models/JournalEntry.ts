
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IJournalEntry extends Document {
  firebaseUid: string;
  patientId: string;
  mainEmotion: string;
  subEmotion: string;
  journal: string;
  emotionEmoji: string;
  createdAt: Date;
}

const JournalEntrySchema: Schema = new Schema({
  firebaseUid: { type: String, required: true },
  patientId: { type: String, required: true },
  mainEmotion: { type: String, required: true },
  subEmotion: { type: String, required: true },
  journal: { type: String, required: true },
  emotionEmoji: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite on hot reload
const JournalEntry = models.JournalEntry || mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);

export default JournalEntry as Model<IJournalEntry>;
