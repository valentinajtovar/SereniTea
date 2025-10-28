import { Schema, model, models, Types } from "mongoose";

export interface ITaskFeedback {
  utilidad?: number;   // 1..5
  dificultad?: number; // 1..5
  comentario?: string;
}

export interface ITask {
  _id?: Types.ObjectId;
  paciente: Types.ObjectId;           // ref al Paciente
  descripcion: string;
  asignadaPor?: string;               // "IA Serenitea"
  estado: "pendiente" | "completada";
  fechaCreacion?: Date;
  fechaDue?: Date | null;
  feedback?: ITaskFeedback | null;
  aiFeedback?: any;                   // opcional
  createdAt?: Date;
  updatedAt?: Date;
}

const TaskSchema = new Schema<ITask>({
  paciente: { type: Schema.Types.ObjectId, ref: "Paciente", required: true, index: true },
  descripcion: { type: String, required: true, trim: true },
  asignadaPor: { type: String, default: "IA Serenitea" },
  estado: { type: String, enum: ["pendiente", "completada"], default: "pendiente", index: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaDue: { type: Date, default: null },
  feedback: {
    utilidad: Number,
    dificultad: Number,
    comentario: String
  },
  aiFeedback: Schema.Types.Mixed
}, { timestamps: true });

TaskSchema.index({ paciente: 1, createdAt: -1 });

export const Task = models.Task || model<ITask>("Task", TaskSchema);
