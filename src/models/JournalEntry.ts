import mongoose, { Schema, Document, models, Model } from 'mongoose';

// Interface defining the document structure
export interface IJournalEntry extends Document {
  patientId: Schema.Types.ObjectId; // Reference to the Patient model's _id
  uid: string; // Standardized to use uid
  createdAt: Date;
  mainEmotion: string;
  subEmotion: string;
  journal: string;
  emotionEmoji: string;
}

// Mongoose Schema for the JournalEntry
const JournalEntrySchema: Schema<IJournalEntry> = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true,
  },
  uid: { // Standardized to use uid
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  mainEmotion: {
    type: String,
    required: [true, 'La emoción principal es obligatoria.'],
  },
  subEmotion: {
    type: String,
    required: [true, 'La sub-emoción es obligatoria.'],
  },
  journal: {
    type: String,
    required: [true, 'El contenido del diario es obligatorio.'],
  },
  emotionEmoji: {
    type: String,
    required: true,
  },
});

// Use existing model or create a new one to prevent re-compilation errors in Next.js
const JournalEntry = models.JournalEntry || mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);

export default JournalEntry as Model<IJournalEntry>;
