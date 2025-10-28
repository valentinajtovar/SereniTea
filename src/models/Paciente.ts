import { Schema, model, models, Types } from "mongoose";

export interface IPaciente {
  _id?: Types.ObjectId;
  uid: string;
  correo: string;
  fechaNacimiento?: Date | null;
  nombre: string;
  apellido: string;
  usuario_anonimo?: string | null;
  tareas: Types.ObjectId[];         // ref: 'Task'
  journalEntries: Types.ObjectId[]; // ref: 'JournalEntry'
  createdAt?: Date;
  updatedAt?: Date;
}

const PacienteSchema = new Schema<IPaciente>({
  uid: { type: String, required: true, unique: true, index: true, trim: true },
  correo: {
    type: String, required: true, unique: true, index: true, lowercase: true, trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Correo inválido"]
  },
  fechaNacimiento: { type: Date, default: null },
  nombre: { type: String, required: true, trim: true, maxlength: 120 },
  apellido: { type: String, required: true, trim: true, maxlength: 120 },
  usuario_anonimo: { type: String, default: null },
  tareas: [{ type: Schema.Types.ObjectId, ref: "Task", index: true }],
  journalEntries: [{ type: Schema.Types.ObjectId, ref: "JournalEntry", index: true }],
}, { timestamps: true });

PacienteSchema.index({ nombre: "text", apellido: "text", correo: "text" });

export const Paciente = models.Paciente || model<IPaciente>("Paciente", PacienteSchema);
