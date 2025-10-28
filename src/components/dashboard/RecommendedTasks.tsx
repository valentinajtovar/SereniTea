
'use client';

import { useState, useEffect } from 'react';
import { type JournalEntry } from '@/types';
import { Lightbulb } from 'lucide-react';

interface RecommendedTask {
    _id: string;
    mainEmotion: string;
    title: string;
    description: string;
}

const RecommendedTasks = ({ entries }: { entries: JournalEntry[] }) => {
    const [tasks, setTasks] = useState<RecommendedTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (entries.length === 0) {
            setIsLoading(false);
            return;
        }

        // 1. Encuentra la emoción de la entrada más reciente
        const latestEntry = entries.reduce((latest, current) => 
            new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
        );
        const latestEmotion = latestEntry.mainEmotion;

        // 2. Llama a la API para obtener las tareas recomendadas
        const fetchRecommendedTasks = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/recommended-tasks?emotion=${latestEmotion}`);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'No se pudieron cargar las tareas recomendadas.');
                }

                const data = await response.json();
                setTasks(data);
                setError(null);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendedTasks();

    }, [entries]); // El efecto se vuelve a ejecutar si las entradas cambian

    return (
        <div className="p-6 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center mb-4">
                <Lightbulb className="h-8 w-8 text-yellow-400 mr-3" />
                <h3 className="font-headline text-2xl text-gray-800">Sugerencias para ti</h3>
            </div>

            {entries.length > 0 && (
                <p className="text-gray-600 mb-4">
                    Basado en tu estado de ánimo más reciente ({entries.reduce((l, c) => new Date(c.createdAt) > new Date(l.createdAt) ? c : l).mainEmotion}), te recomendamos estas actividades:
                </p>
            )}

            {isLoading && <p className="text-gray-500">Buscando sugerencias...</p>}

            {error && <p className="text-red-500">Error: {error}</p>}

            {!isLoading && !error && tasks.length > 0 && (
                <ul className="space-y-3">
                    {tasks.map((task) => (
                        <li key={task._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <p className="font-semibold text-gray-800">{task.title}</p>
                            <p className="text-sm text-gray-600">{task.description}</p>
                        </li>
                    ))}
                </ul>
            )}

            {!isLoading && !error && tasks.length === 0 && entries.length > 0 && (
                <p className="text-gray-500">No hay sugerencias disponibles para tu estado de ánimo actual.</p>
            )}

            {!isLoading && entries.length === 0 && (
                <p className="text-gray-500">Cuando escribas tu primera entrada en el diario, te daremos algunas sugerencias.</p>
            )}
        </div>
    );
};

export default RecommendedTasks;
