'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { CheckSquare, Square, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from '@/lib/firebase-client';
import { type Task } from '@/types'; // Importación centralizada

// --- Component --- //
const TaskSummary = ({ user }: { user: User | null }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const q = query(
      collection(db, "tareas"), 
      where("userId", "==", user.uid), // Corregido
      where("fechaDue", ">=", Timestamp.fromDate(startOfToday)),
      where("fechaDue", "<=", Timestamp.fromDate(endOfToday)),
      orderBy("fechaDue", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching today's tasks: ", error);
      // Este error probablemente es por el índice, el usuario debería recibir un link para crearlo.
      // Por ahora, solo mostramos un error simple.
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-2xl">Tareas para Hoy</CardTitle>
          <CardDescription>Tus prioridades para el día.</CardDescription>
        </div>
        <Button asChild variant="ghost">
            <Link href="/dashboard/tasks">Ver Todas <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-500 italic py-4">No tienes tareas para hoy. ¡Aprovecha para descansar!</p>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3">
                 {task.estado === 'completada' ? 
                    <CheckSquare className="h-6 w-6 text-green-500 flex-shrink-0" /> : 
                    <Square className="h-6 w-6 text-gray-400 flex-shrink-0" />
                  }
                <p className={`flex-grow text-gray-800 ${task.estado === 'completada' ? 'line-through text-gray-500' : ''}`}>
                  {task.descripcion}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TaskSummary;
