'use client';

import { useState, useEffect, useMemo } from 'react';
import { type JournalEntry } from '@/types';
import { Lightbulb, PlusCircle, CheckCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import { addTaskAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RecommendedTask {
  _id: string;
  mainEmotion: string;
  title: string;
  description: string;
}

type Props = {
  entries: JournalEntry[];
  user: User | null;
};

const RecommendedTasks = ({ entries, user }: Props) => {
  const { toast } = useToast();

  const [tasks, setTasks] = useState<RecommendedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ocultar localmente las ya añadidas
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  const latestEmotion = useMemo(() => {
    if (!entries || entries.length === 0) return null;
    const latest = entries.reduce((acc, cur) =>
      new Date(cur.createdAt) > new Date(acc.createdAt) ? cur : acc
    );
    return latest.mainEmotion;
  }, [entries]);

  useEffect(() => {
    const fetchRecommendedTasks = async () => {
      if (!latestEmotion) {
        setTasks([]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await fetch(`/api/recommended-tasks?emotion=${encodeURIComponent(latestEmotion)}`);
        if (!res.ok) throw new Error('No se pudieron cargar las tareas recomendadas.');
        const data: RecommendedTask[] = await res.json();
        setTasks(Array.isArray(data) ? data : []);
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'Error inesperado cargando sugerencias.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendedTasks();
  }, [latestEmotion]);

  const handleAddTask = async (task: RecommendedTask) => {
    if (!user) {
      toast({
        title: 'Debes iniciar sesión',
        description: 'Inicia sesión para añadir tareas a tu lista.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAddingId(task._id);
      const payload = {
        title: task.description,
        description: task.description, // guardamos la descripción (que se muestra como “título” visual)
        firebaseUid: user.uid,
      };

      const result = await addTaskAction(payload);

      if (result?.success) {
        toast({
          title: '¡Tarea añadida!',
          description: `"${task.title}" ha sido añadida a tu lista.`,
        });
        setAdded(prev => {
          const s = new Set(prev);
          s.add(task._id);
          return s;
        });
      } else {
        throw new Error(result?.error || 'No se pudo añadir la tarea.');
      }
    } catch (e: any) {
      toast({
        title: 'Error al añadir tarea',
        description: e?.message || 'Ocurrió un error al añadir esta tarea.',
        variant: 'destructive',
      });
    } finally {
      setAddingId(null);
    }
  };

  const visibleTasks = useMemo(
    () => tasks.filter(t => !added.has(t._id)),
    [tasks, added]
  );

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center mb-4">
        <Lightbulb className="h-8 w-8 text-yellow-400 mr-3" />
        <h3 className="font-headline text-2xl text-gray-800">Sugerencias para ti</h3>
      </div>

      {!latestEmotion && (
        <p className="text-gray-500">Escribe una entrada reciente para obtener sugerencias.</p>
      )}

      {isLoading && <p className="text-gray-500">Buscando sugerencias…</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && latestEmotion && visibleTasks.length === 0 && (
        <p className="text-gray-500 italic">
          No hay más sugerencias por ahora. ¡Buen trabajo!
        </p>
      )}

      {!isLoading && !error && visibleTasks.length > 0 && (
        <ul className="space-y-3">
          {visibleTasks.slice(0, 3).map((task) => { // <-- mostrar solo 3
            const isAdding = addingId === task._id;

            return (
              <li
                key={task._id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {/* La DESCRIPCIÓN es la línea principal */}
                    <p className="font-semibold text-gray-800 break-words">
                      {task.description}
                    </p>
                    {/* El title original como subtítulo/metadata */}
                    {task.title && (
                      <p className="text-xs text-gray-500 mt-1 break-words">
                        {task.title}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    className={cn('ml-4 shrink-0', isAdding && 'opacity-70')}
                    onClick={() => handleAddTask(task)}
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 animate-pulse" />
                        Añadiendo…
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Añadir
                      </>
                    )}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecommendedTasks;
