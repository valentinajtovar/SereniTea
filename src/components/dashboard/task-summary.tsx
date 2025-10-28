
'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Square, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';

// Definimos un tipo local para las tareas que vienen de nuestra API
interface ApiTask {
  _id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string; // La fecha vendrá como un string ISO
}

// Adaptamos la interfaz del componente para que use un objeto Date
interface Task extends Omit<ApiTask, 'dueDate'> {
  dueDate: Date;
}

const TaskSummary = ({ user }: { user: User | null }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async (firebaseUid: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks?firebaseUid=${firebaseUid}`);
      if (!response.ok) {
        throw new Error('No se pudieron cargar las tareas.');
      }
      const data: ApiTask[] = await response.json();
      
      // Mapeamos los datos de la API, convirtiendo el string de la fecha a un objeto Date
      const formattedTasks = data.map(task => ({
        ...task,
        dueDate: new Date(task.dueDate),
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error al obtener las tareas:", error);
      toast({ title: "Error", description: "No se pudieron cargar tus tareas pendientes.", variant: "destructive" });
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

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todayTasks = tasks.filter(task => task.dueDate <= endOfToday);
  const upcomingTasks = tasks.filter(task => task.dueDate > endOfToday);

  const TaskItem = ({ task, showTime }: { task: Task; showTime?: boolean }) => (
    <div className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50">
      <Square className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
      <div className="flex-grow">
        <p className="font-semibold text-gray-800">{task.title}</p>
        <p className="text-sm text-gray-600 capitalize">
          {showTime
            ? task.dueDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            : task.dueDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
    </div>
  );

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-2xl">Tareas Pendientes</CardTitle>
          <CardDescription>Tus próximas prioridades.</CardDescription>
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
          <p className="text-center text-gray-500 italic py-4">¡No tienes tareas pendientes! ¡Buen trabajo!</p>
        ) : (
          <div className="space-y-4">
            {todayTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 px-2">Hoy</h3>
                <div className="space-y-1">
                  {todayTasks.map(task => <TaskItem key={task._id} task={task} showTime />)}
                </div>
              </div>
            )}
            {upcomingTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mt-4 mb-2 px-2">Pronto</h3>
                <div className="space-y-1">
                  {upcomingTasks.map(task => <TaskItem key={task._id} task={task} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TaskSummary;
