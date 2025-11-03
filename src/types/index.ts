import { Timestamp } from 'firebase/firestore';

// --- Tipos para Tareas ---

export type Utilidad = 'muy_util' | 'util' | 'neutral' | 'no_util';
export type Dificultad = 'facil' | 'media' | 'dificil';

export interface TaskFeedback {
  utilidad?: Utilidad;
  dificultad?: Dificultad;
  comentario?: string;
  repetiria?: boolean;
}

// Describe la estructura de un documento de Tarea en Firestore
export interface Task {
  id: string;
  descripcion: string;
  estado: 'pendiente' | 'completada';
  asignadaPor: string; 
  pacienteId: string;
  fechaAsignacion: Timestamp;
  fechaDue: Timestamp;
  feedback?: TaskFeedback;
  aiFeedback?: 'liked' | 'disliked' | null; // <-- Added this line
}

// --- Tipos para Diario ---

// Describe la estructura de una entrada del diario en MongoDB
export interface JournalEntry {
  _id: string; // Changed from id
  firebaseUid: string; // Changed from userId
  patientId: string; // Added patientId reference
  createdAt: string; // Changed from Timestamp to string (ISO date)
  mainEmotion: string;
  subEmotion: string;
  journal: string;
  emotionEmoji: string;
}

// --- Tipos para Paciente ---
export interface Paciente {
  _id: string;                // ObjectId serializado a string en la API
  uid: string;                // mismo que firebaseUid
  correo: string;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string | null;
  usuario_anonimo?: string | null;
  // Si luego necesitas las relaciones:
  // tareas?: string[];
  // journalEntries?: string[];
}
