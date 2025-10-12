import { Schema, model, models, Types } from "mongoose";

export interface IJournalEntry {
  _id?: Types.ObjectId;
  user: Types.ObjectId;                // ref al Paciente
  journal: string;                     // texto del diario
  mainEmotion?: string;
  subEmotion?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>({
  user: { type: Schema.Types.ObjectId, ref: "Paciente", required: true, index: true },
  journal: { type: String, required: true },
  mainEmotion: { type: String },
  subEmotion: { type: String },
}, { timestamps: true });

JournalEntrySchema.index({ user: 1, createdAt: -1 });

export const JournalEntry = models.JournalEntry || model<IJournalEntry>("JournalEntry", JournalEntrySchema);
