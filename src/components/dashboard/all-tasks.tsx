'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import {
  CheckSquare,
  Square,
  Pencil,
  MessageSquare,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Sparkles,
  Trash2,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/context/auth-context';

type Utilidad = 'muy_util' | 'util' | 'neutral' | 'no_util';
type Dificultad = 'facil' | 'media' | 'dificil';

type TaskFeedback = {
  utilidad?: Utilidad;
  dificultad?: Dificultad;
  comentario?: string;
  repetiria?: boolean;
};

type ApiTask = {
  _id: string;
  title: string;
  description: string;
  status: 'pendiente' | 'completada';
  dueDate: string; // ISO
  firebaseUid: string;
  assignedBy?: string; // 'IA Serenitea'
  aiFeedback?: 'liked' | 'disliked' | null;
  feedback?: TaskFeedback | null;
  createdAt?: string;
};

type Task = Omit<ApiTask, 'dueDate'> & { dueDate: Date };

const FeedbackForm = ({
  task,
  initialFeedback,
  onSubmit,
  onCancel,
}: {
  task: Task;
  initialFeedback?: TaskFeedback | null;
  onSubmit: (feedback: TaskFeedback) => void;
  onCancel: () => void;
}) => {
  const [utilidad, setUtilidad] = useState<Utilidad | undefined>(initialFeedback?.utilidad);
  const [dificultad, setDificultad] = useState<Dificultad | undefined>(initialFeedback?.dificultad);
  const [comentario, setComentario] = useState(initialFeedback?.comentario || '');
  const [repetiria, setRepetiria] = useState(initialFeedback?.repetiria ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ utilidad, dificultad, comentario, repetiria });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-6 animate-in fade-in-0 slide-in-from-top-5 duration-300"
    >
      <h4 className="font-semibold text-center text-purple-800">
        {initialFeedback ? 'Editar tu feedback' : '¿Qué te pareció esta tarea?'}
      </h4>

      {task.status === 'completada' && (
        <>
          <div className="space-y-2">
            <Label className="font-medium text-gray-700">¿Qué tan útil fue?</Label>
            <RadioGroup
              value={utilidad}
              onValueChange={(value: any) => setUtilidad(value)}
              className="flex flex-wrap justify-around gap-2"
            >
              <Label htmlFor={`${task._id}-util-1`} className="flex flex-col items-center gap-1 cursor-pointer text-xs p-1 rounded-md">
                <RadioGroupItem value="muy_util" id={`${task._id}-util-1`} className="peer sr-only" />
                <ThumbsUp className="h-5 w-5 text-gray-400 peer-aria-checked:text-green-600 peer-aria-checked:scale-110 transition-all" />
                Muy útil
              </Label>
              <Label htmlFor={`${task._id}-util-2`} className="flex flex-col items-center gap-1 cursor-pointer text-xs p-1 rounded-md">
                <RadioGroupItem value="util" id={`${task._id}-util-2`} className="peer sr-only" />
                <ThumbsUp className="h-5 w-5 text-gray-400 peer-aria-checked:text-green-500 peer-aria-checked:scale-110 transition-all" />
                Útil
              </Label>
              <Label htmlFor={`${task._id}-util-3`} className="flex flex-col items-center gap-1 cursor-pointer text-xs p-1 rounded-md">
                <RadioGroupItem value="neutral" id={`${task._id}-util-3`} className="peer sr-only" />
                <Meh className="h-5 w-5 text-gray-400 peer-aria-checked:text-yellow-500 peer-aria-checked:scale-110 transition-all" />
                Neutral
              </Label>
              <Label htmlFor={`${task._id}-util-4`} className="flex flex-col items-center gap-1 cursor-pointer text-xs p-1 rounded-md">
                <RadioGroupItem value="no_util" id={`${task._id}-util-4`} className="peer sr-only" />
                <ThumbsDown className="h-5 w-5 text-gray-400 peer-aria-checked:text-red-500 peer-aria-checked:scale-110 transition-all" />
                No útil
              </Label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-gray-700">¿Qué tan difícil fue?</Label>
            <RadioGroup
              value={dificultad}
              onValueChange={(value: any) => setDificultad(value)}
              className="flex justify-around border rounded-full p-1"
            >
              <Label htmlFor={`${task._id}-dif-1`} className="flex-1 text-center cursor-pointer rounded-full peer-aria-checked:bg-green-100 peer-aria-checked:font-semibold transition-colors px-2 py-1">
                <RadioGroupItem value="facil" id={`${task._id}-dif-1`} className="peer sr-only" />
                Fácil
              </Label>
              <Label htmlFor={`${task._id}-dif-2`} className="flex-1 text-center cursor-pointer rounded-full peer-aria-checked:bg-yellow-100 peer-aria-checked:font-semibold transition-colors px-2 py-1">
                <RadioGroupItem value="media" id={`${task._id}-dif-2`} className="peer sr-only" />
                Media
              </Label>
              <Label htmlFor={`${task._id}-dif-3`} className="flex-1 text-center cursor-pointer rounded-full peer-aria-checked:bg-red-100 peer-aria-checked:font-semibold transition-colors px-2 py-1">
                <RadioGroupItem value="dificil" id={`${task._id}-dif-3`} className="peer sr-only" />
                Difícil
              </Label>
            </RadioGroup>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor={`${task._id}-comentario`} className="font-medium text-gray-700">
          Comentarios / Notas (opcional)
        </Label>
        <Textarea
          id={`${task._id}-comentario`}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escribe tus pensamientos aquí..."
        />
      </div>

      {task.status === 'completada' && (
        <div className="flex items-center justify-between">
          <Label htmlFor={`${task._id}-repetir`} className="flex items-center gap-2 font-medium text-gray-700">
            <Switch id={`${task._id}-repetir`} checked={repetiria} onCheckedChange={setRepetiria} /> ¿La repetirías?
          </Label>
        </div>
      )}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
};

const DisplayFeedback = ({ feedback }: { feedback: TaskFeedback }) => (
  <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm text-gray-600 space-y-2">
    {feedback.utilidad && (
      <p>
        <strong>Utilidad:</strong>{' '}
        <span className="font-normal capitalize">{feedback.utilidad.replace('_', ' ')}</span>
      </p>
    )}
    {feedback.dificultad && (
      <p>
        <strong>Dificultad:</strong> <span className="font-normal capitalize">{feedback.dificultad}</span>
      </p>
    )}
    {feedback.comentario && (
      <p>
        <strong>Comentario:</strong> <span className="font-normal italic">"{feedback.comentario}"</span>
      </p>
    )}
    {typeof feedback.repetiria === 'boolean' && (
      <p>
        <strong>Repetiría:</strong> <span className="font-normal">{feedback.repetiria ? 'Sí' : 'No'}</span>
      </p>
    )}
  </div>
);

/** ⬇️ FIX: botón único; no anidamos <button> dentro de <button> */
const DeleteTaskButton = ({ onClick, loading }: { onClick: () => void; loading?: boolean }) => {
  // useFormStatus no es necesario aquí, pero lo dejamos por si este botón
  // llegara a usarse dentro de un <form> con acciones.
  const { pending } = useFormStatus();
  const disabled = loading || pending;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 flex-shrink-0"
      onClick={onClick}
      aria-label="Delete task"
      disabled={disabled}
    >
      {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-gray-500" />}
    </Button>
  );
};

const AllTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackTaskId, setFeedbackTaskId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTasks = useCallback(
    async (firebaseUid: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/all-tasks?firebaseUid=${firebaseUid}`);
        if (!response.ok) throw new Error('No se pudieron cargar las tareas.');
        const data: ApiTask[] = await response.json();
        const formatted: Task[] = data.map((t) => ({ ...t, dueDate: new Date(t.dueDate) }));
        setTasks(formatted);
      } catch (e) {
        console.error('Error al obtener las tareas:', e);
        toast({ title: 'Error', description: 'No se pudieron cargar tus tareas.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (user?.uid) fetchTasks(user.uid);
    else setIsLoading(false);
  }, [user, fetchTasks]);

  const handleToggleTask = async (task: Task) => {
    try {
      const newStatus = task.status === 'pendiente' ? 'completada' : 'pendiente';
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar la tarea.');
      setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t)));
      toast({ title: newStatus === 'completada' ? 'Tarea completada' : 'Tarea marcada como pendiente' });
      if (newStatus === 'completada' && !task.feedback) setFeedbackTaskId(task._id);
      if (newStatus === 'pendiente') setFeedbackTaskId(null);
    } catch (e) {
      console.error('Error updating task:', e);
      toast({ title: 'Error', description: 'No se pudo actualizar la tarea.', variant: 'destructive' });
    }
  };

  const handleFeedbackSubmit = async (taskId: string, feedback: TaskFeedback) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      if (!res.ok) throw new Error('No se pudo guardar el feedback.');
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, feedback } : t)));
      toast({ title: '¡Gracias!', description: 'Tu feedback ha sido guardado.' });
      setFeedbackTaskId(null);
    } catch (e) {
      console.error('Error saving feedback:', e);
      toast({ title: 'Error', description: 'No se pudo guardar tu feedback.', variant: 'destructive' });
    }
  };

  const handleAiTaskFeedback = async (taskId: string, val: 'liked' | 'disliked') => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiFeedback: val }),
      });
      if (!res.ok) throw new Error('No se pudo guardar el feedback de IA.');
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, aiFeedback: val } : t)));
      toast({ title: 'Feedback guardado', description: 'Gracias, aprenderé de tus preferencias.' });
    } catch (e) {
      console.error('Error saving AI feedback:', e);
      toast({ title: 'Error', description: 'No se pudo guardar tu feedback.', variant: 'destructive' });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      setDeletingId(taskId);
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar la tarea.');
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast({ title: 'Tarea eliminada' });
    } catch (e) {
      console.error('Error deleting task:', e);
      toast({ title: 'Error', description: 'No se pudo eliminar la tarea.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateTasks = async () => {
    if (!user) return;
    setIsGenerating(true);
    toast({ title: 'Generando tareas...', description: 'La IA está creando nuevas tareas para ti.' });
    try {
      const previous = tasks.map((t) => t.title);
      const res = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          previousTasks: previous,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `API ${res.status} not ok`);

      toast({ title: 'Nuevas tareas generadas', description: 'Se añadieron nuevas tareas a tu lista.' });
      await fetchTasks(user.uid);
    } catch (e: any) {
      console.error('Error generating tasks:', e);
      toast({
        title: 'Error',
        description: e?.message || 'No se pudieron generar nuevas tareas.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === 'pendiente');
  const completedTasks = tasks.filter((t) => t.status === 'completada');

  const TaskRow = ({ task }: { task: Task }) => {
    const isAiTask = task.assignedBy === 'IA Serenitea';
    return (
      <div
        className={`p-3 rounded-lg shadow-sm transition-all ${
          isAiTask ? 'bg-purple-50 border-l-4 border-purple-400' : 'bg-white'
        }`}
      >
        <div className="flex items-start gap-3 group">
          <button onClick={() => handleToggleTask(task)} className="mt-1 flex-shrink-0">
            {task.status === 'completada' ? (
              <CheckSquare className="h-6 w-6 text-green-500" />
            ) : (
              <Square className="h-6 w-6 text-gray-400" />
            )}
          </button>

          <div className="flex-grow">
            <p className={`text-gray-800 ${task.status === 'completada' ? 'line-through text-gray-500' : ''}`}>
              {task.description}
            </p>
            <div className="text-xs text-gray-500 mt-1">
              <span>
                Asignada por: <span className="font-semibold">{task.assignedBy || 'Profesional'}</span>
              </span>
              {task.dueDate && (
                <span className="ml-4">
                  Vence:{' '}
                  {task.dueDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* ⬇️ FIX: botón único (no anidar button dentro de button) */}
          <DeleteTaskButton onClick={() => handleDelete(task._id)} loading={deletingId === task._id} />
        </div>

        <div className="pl-9 mt-2">
        {isAiTask && task.status === 'pendiente' && task.aiFeedback == null && (
          <div className="flex items-center gap-2 mt-2 animate-in fade-in-50">
            <p className="text-sm text-purple-700">¿Te gusta esta sugerencia?</p>
            <Button size="sm" variant="outline" className="h-8" onClick={() => handleAiTaskFeedback(task._id, 'liked')}>
              <ThumbsUp className="h-4 w-4 text-green-500" />
            </Button>
            <Button size="sm" variant="outline" className="h-8" onClick={() => handleAiTaskFeedback(task._id, 'disliked')}>
              <ThumbsDown className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )}

          {feedbackTaskId === task._id ? (
            <FeedbackForm
              task={task}
              initialFeedback={task.feedback}
              onSubmit={(fb) => handleFeedbackSubmit(task._id, fb)}
              onCancel={() => setFeedbackTaskId(null)}
            />
          ) : (
            <>
              {task.feedback && (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="link" size="sm" className="p-0 h-auto text-purple-600">
                      Ver feedback
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <DisplayFeedback feedback={task.feedback} />
                  </CollapsibleContent>
                </Collapsible>
              )}

              {task.status === 'completada' && (
                <Button size="sm" variant="outline" className="mt-2" onClick={() => setFeedbackTaskId(task._id)}>
                  {task.feedback ? (
                    <>
                      <Pencil className="mr-2 h-3 w-3" /> Editar
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-3 w-3" /> Valorar
                    </>
                  )}
                </Button>
              )}

              {task.status === 'pendiente' && (
                <Button size="sm" variant="outline" className="mt-2" onClick={() => setFeedbackTaskId(task._id)}>
                  <MessageSquare className="mr-2 h-3 w-3" /> {task.feedback?.comentario ? 'Editar nota' : 'Añadir nota'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-2xl">Todas tus Tareas</CardTitle>
        </div>
        <Button onClick={handleGenerateTasks} disabled={isGenerating || isLoading || !user}>
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Generar con IA
        </Button>
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
                <div className="space-y-1">{pendingTasks.map((t) => <TaskRow key={t._id} task={t} />)}</div>
              </div>
            )}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mt-4 mb-2 px-2">Completadas</h3>
                <div className="space-y-1">{completedTasks.map((t) => <TaskRow key={t._id} task={t} />)}</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllTasks;
