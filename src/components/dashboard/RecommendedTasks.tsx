
'use client';

import { useState, useEffect } from 'react';
import { type JournalEntry } from '@/types';
import { Lightbulb, PlusCircle, CheckCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import { addTaskAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface RecommendedTask {
    _id: string;
    mainEmotion: string;
    title: string;
    description: string;
}

// El componente ahora acepta el usuario de Firebase
const RecommendedTasks = ({ entries, user }: { entries: JournalEntry[]; user: User | null }) => {
    const [tasks, setTasks] = useState<RecommendedTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set()); // Para rastrear tareas añadidas
    const { toast } = useToast();

    useEffect(() => {
        if (entries.length === 0) {
            setIsLoading(false);
            return;
        }

        const latestEntry = entries.reduce((latest, current) => 
            new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
        );
        const latestEmotion = latestEntry.mainEmotion;

        const fetchRecommendedTasks = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/recommended-tasks?emotion=${latestEmotion}`);
                if (!response.ok) throw new Error('No se pudieron cargar las tareas recomendadas.');
                const data = await response.json();
                setTasks(data);
                setError(null);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendedTasks();
    }, [entries]);

    // Función para manejar la adición de una tarea
    const handleAddTask = async (task: RecommendedTask) => {
        if (!user) {
            toast({ title: 'Error', description: 'Debes iniciar sesión para añadir tareas.', variant: 'destructive' });
            return;
        }

        const taskData = {
            title: task.title,
            description: task.description,
            firebaseUid: user.uid,
        };

        const result = await addTaskAction(taskData);

        if (result.success) {
            toast({ title: '¡Tarea añadida!', description: `"${task.title}" ha sido añadida a tu lista.` });
            setAddedTasks(prev => new Set(prev).add(task._id)); // Marcar como añadida
        } else {
            toast({ title: 'Error al añadir tarea', description: result.error, variant: 'destructive' });
        }
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center mb-4">
                <Lightbulb className="h-8 w-8 text-yellow-400 mr-3" />
                <h3 className="font-headline text-2xl text-gray-800">Sugerencias para ti</h3>
            </div>

            {isLoading && <p className="text-gray-500">Buscando sugerencias...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!isLoading && !error && tasks.length > 0 && (
                <ul className="space-y-3">
                    {tasks.map((task) => (
                        <li key={task._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-800">{task.title}</p>
                                <p className="text-sm text-gray-600">{task.description}</p>
                            </div>
                            <Button 
                                size="sm"
                                onClick={() => handleAddTask(task)}
                                disabled={addedTasks.has(task._id)} // Deshabilitar si ya se añadió
                                className="ml-4"
                            >
                                {addedTasks.has(task._id) ? <CheckCircle className="h-4 w-4 mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                                {addedTasks.has(task._id) ? 'Añadida' : 'Añadir'}
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
            {/* ... otros estados ... */}
        </div>
    );
};

export default RecommendedTasks;
