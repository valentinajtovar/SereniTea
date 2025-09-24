'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { CheckSquare, Square, Sparkles, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase-client';

// --- Interfaces --- //
export interface TaskFeedback {
  utilidad: 'muy_util' | 'util' | 'neutral' | 'no_util';
  dificultad: 'facil' | 'media' | 'dificil';
  comentario?: string;
  repetiria: boolean;
}

export interface Task {
  id: string;
  descripcion: string;
  estado: 'pendiente' | 'completada';
  asignadaPor: string; 
  pacienteId: string;
  fechaAsignacion: Timestamp;
  fechaDue: Timestamp;
  feedback?: TaskFeedback;
}

// --- Helper Functions --- //
const formatDate = (timestamp: Timestamp | undefined) => {
  if (!timestamp) return 'Fecha no disponible';
  return timestamp.toDate().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};


// --- Component --- //
const Tasks = ({ user }: { user: User | null }) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false); // Para el botón de la IA

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // Nota: Usamos 'pacienteId' para coincidir con la estructura de tu base de datos.
    const q = query(
      collection(db, "tareas"), 
      where("pacienteId", "==", user.uid),
      orderBy("fechaAsignacion", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(tasksData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error al obtener las tareas: ", error);
      toast({ title: "Error", description: "No se pudieron cargar las tareas.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.estado === 'pendiente' ? 'completada' : 'pendiente';
    const taskRef = doc(db, 'tareas', task.id);
    try {
      await updateDoc(taskRef, { estado: newStatus });
      toast({ title: `Tarea ${newStatus === 'completada' ? 'completada' : 'marcada como pendiente'}` });
    } catch (error) {
      console.error("Error al actualizar la tarea: ", error);
      toast({ title: "Error", description: "No se pudo actualizar la tarea.", variant: "destructive" });
    }
  };

  // TODO: Implementar la llamada a la Cloud Function
  const handleGenerateAiTasks = async () => {
    setIsAiLoading(true);
    toast({ title: "La IA está pensando...", description: "Generando tareas personalizadas para ti." });
    // Aquí irá la llamada a la función de Firebase
    // Por ahora, solo simulamos una carga
    setTimeout(() => {
      setIsAiLoading(false);
      toast({ title: "Función no implementada", description: "La conexión con la IA aún está en desarrollo." });
    }, 2000);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-2xl text-gray-700">Tus Tareas</CardTitle>
          <CardDescription>Pasos para avanzar en tu bienestar.</CardDescription>
        </div>
        <Button size="sm" onClick={handleGenerateAiTasks} disabled={isAiLoading}>
          {isAiLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
          )}
          Sugerir con IA
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            <p className="ml-2 text-gray-500">Cargando tus tareas...</p>
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-500 italic py-4">No tienes tareas asignadas por ahora.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <button onClick={() => handleToggleTask(task)} className="mt-1 flex-shrink-0">
                  {task.estado === 'completada' ? 
                    <CheckSquare className="h-6 w-6 text-green-500" /> : 
                    <Square className="h-6 w-6 text-gray-400" />
                  }
                </button>
                <div className="flex-grow">
                  <p className={`text-gray-800 ${task.estado === 'completada' ? 'line-through text-gray-500' : ''}`}>
                    {task.descripcion}
                  </p>
                  <div className="text-xs text-gray-500 mt-1 space-x-3">
                    <span><span className="font-semibold">Asignada:</span> {formatDate(task.fechaAsignacion)}</span>
                    <span><span className="font-semibold">Fecha Sugerida:</span> {formatDate(task.fechaDue)}</span>
                  </div>
                  {/* Aquí se podría añadir la UI para el feedback cuando la tarea está completada */}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Tasks;
