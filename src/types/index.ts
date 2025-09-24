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

// Describe la estructura de una entrada del diario en Firestore
export interface JournalEntry {
  id: string;
  userId: string;
  createdAt: Timestamp;
  mainEmotion: string;
  subEmotion: string;
  journal: string;
  emotionEmoji: string;
}

// --- Tipos para Paciente ---
export interface Patient {
    id: string;
    nombre_completo: string;
}
