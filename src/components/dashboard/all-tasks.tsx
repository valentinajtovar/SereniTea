'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Square, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

interface ApiTask {
  _id: string;
  title: string;
  description: string;
  status: 'pendiente' | 'completada';
  dueDate: string;
}

interface Task extends Omit<ApiTask, 'dueDate'> {
  dueDate: Date;
}

const AllTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async (firebaseUid: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/all-tasks?firebaseUid=${firebaseUid}`);
      if (!response.ok) {
        throw new Error('No se pudieron cargar las tareas.');
      }
      const data: ApiTask[] = await response.json();
      
      const formattedTasks = data.map(task => ({
        ...task,
        dueDate: new Date(task.dueDate),
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error al obtener las tareas:", error);
      toast({ title: "Error", description: "No se pudieron cargar tus tareas.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchTasks(user.uid);
    } else {
      setIsLoading(false);
    }
  }, [user, fetchTasks]);

  const pendingTasks = tasks.filter(task => task.status === 'pendiente');
  const completedTasks = tasks.filter(task => task.status === 'completada');

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50">
      {task.status === 'completada' ? <CheckSquare className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" /> : <Square className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />}
      <div className="flex-grow">
        <p className={`font-semibold ${task.status === 'completada' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{task.title}</p>
        <p className="text-sm text-gray-600 capitalize">
          Vence el {task.dueDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
    </div>
  );

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div>
          <CardTitle className="font-headline text-2xl">Todas tus Tareas</CardTitle>
          <CardDescription>Aquí puedes ver todas tus tareas, tanto pendientes como completadas.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-500 italic py-4">No tienes ninguna tarea asignada.</p>
        ) : (
          <div className="space-y-4">
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 px-2">Pendientes</h3>
                <div className="space-y-1">
                  {pendingTasks.map(task => <TaskItem key={task._id} task={task} />)}
                </div>
              </div>
            )}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mt-4 mb-2 px-2">Completadas</h3>
                <div className="space-y-1">
                  {completedTasks.map(task => <TaskItem key={task._id} task={task} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AllTasks;
