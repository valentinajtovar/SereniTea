'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { User } from 'firebase/auth';
import { Square, CheckSquare, Loader2, ArrowRight } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

type ApiTask = {
  _id: string;
  title: string;
  description: string;
  status: 'pendiente' | 'completada';
  dueDate: string;                 // ISO string desde Mongo
  assignedBy?: string;             // opcional (p.ej., 'IA Serenitea')
  aiFeedback?: 'liked' | 'disliked';
  feedback?: {
    utilidad?: 'muy_util' | 'util' | 'neutral' | 'no_util';
    dificultad?: 'facil' | 'media' | 'dificil';
    comentario?: string;
    repetiria?: boolean;
  } | null;
};

type Task = Omit<ApiTask, 'dueDate'> & { dueDate: Date };

const TaskSummary = ({ user: userProp }: { user?: User | null }) => {
  const { user: userCtx } = useAuth();
  const firebaseUid = userCtx?.uid ?? userProp?.uid ?? null;

  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!firebaseUid) {
      setIsLoading(false);
      setTasks([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/all-tasks?firebaseUid=${firebaseUid}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudieron cargar las tareas.');
      const data: ApiTask[] = await res.json();

      const formatted: Task[] = data.map(t => ({
        ...t,
        dueDate: new Date(t.dueDate),
      }));
      setTasks(formatted);
    } catch (e) {
      console.error('Error fetching tasks summary:', e);
      toast({ title: 'Error', description: 'No se pudieron cargar tus tareas.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [firebaseUid, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const now = new Date();
  const endOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const pending = tasks.filter(t => t.status === 'pendiente');
  const todayTasks = pending.filter(t => t.dueDate <= endOfToday);
  const upcomingTasks = pending.filter(t => t.dueDate > endOfToday);

  // Toggle completar/pendiente para una tarea
  const handleToggle = async (task: Task) => {
    if (!firebaseUid) return;
    const newStatus = task.status === 'pendiente' ? 'completada' : 'pendiente';
    try {
      setUpdatingId(task._id);
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar la tarea.');
      setTasks(prev => prev.map(t => (t._id === task._id ? { ...t, status: newStatus } : t)));
      toast({
        title: newStatus === 'completada' ? 'Tarea completada' : 'Tarea marcada como pendiente',
      });
    } catch (e) {
      console.error('Toggle task error:', e);
      toast({ title: 'Error', description: 'No se pudo actualizar la tarea.', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const TaskItem = ({ task, showTime }: { task: Task; showTime?: boolean }) => {
    const isAiTask = (task.assignedBy || '').toLowerCase() === 'ia serenitea';

    return (
      <div
        className={`flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors ${
          isAiTask ? 'bg-purple-50/60 border-l-4 border-purple-400 pl-3' : ''
        }`}
      >
        <button
          onClick={() => handleToggle(task)}
          className="mt-0.5"
          disabled={updatingId === task._id}
          aria-label={task.status === 'completada' ? 'Marcar pendiente' : 'Marcar completada'}
        >
          {updatingId === task._id ? (
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
          ) : task.status === 'completada' ? (
            <CheckSquare className="h-5 w-5 text-green-500" />
          ) : (
            <Square className="h-5 w-5 text-gray-400" />
          )}
        </button>

        <div className="flex-grow">
          <p className={`text-gray-800 ${task.status === 'completada' ? 'line-through text-gray-500' : ''}`}>
            {task.title || task.description}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {isAiTask && <span className="mr-2 font-semibold text-purple-700">IA Serenitea</span>}
            {showTime
              ? task.dueDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
              : task.dueDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-2xl">Tareas Pendientes</CardTitle>
          <CardDescription>Tus próximas prioridades.</CardDescription>
        </div>
        <Button asChild variant="ghost">
          <Link href="/dashboard/tasks">
            Ver todas <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        ) : pending.length === 0 ? (
          <p className="text-center text-gray-500 italic py-4">¡No tienes tareas pendientes! ¡Buen trabajo!</p>
        ) : (
          <div className="space-y-4">
            {todayTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 px-2">Hoy</h3>
                <div className="space-y-1">
                  {todayTasks.map(task => (
                    <TaskItem key={task._id} task={task} showTime />
                  ))}
                </div>
              </div>
            )}

            {upcomingTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mt-4 mb-2 px-2">Pronto</h3>
                <div className="space-y-1">
                  {upcomingTasks.map(task => (
                    <TaskItem key={task._id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskSummary;
