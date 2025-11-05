import { Schema, model, models } from "mongoose";

const PsychologistSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    specializations: [{ type: String }],
    bio: { type: String },
    license: {
      number: String,
      issuer: String,
      fileName: String,
      mimeType: String,
      size: Number,
    },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default models.Psychologist || model("Psychologist", PsychologistSchema);
