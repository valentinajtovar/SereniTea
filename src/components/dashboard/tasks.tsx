'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";

// --- Datos de Ejemplo (Simulados) ---
// Esto reemplaza la llamada a la base de datos temporalmente
const sampleTasks = [
  {
    id: 'task1',
    text: 'Practica un ejercicio de alimentación consciente de 5 minutos en tu próxima comida.',
    status: 'pending',
    source: 'psychologist',
  },
  {
    id: 'task2',
    text: 'Escribe tres cosas que aprecias de tu cuerpo.',
    status: 'completed',
    source: 'psychologist',
  },
  {
    id: 'task3',
    text: 'Sal a caminar suavemente durante 15 minutos y concéntrate en tu entorno.',
    status: 'pending',
    source: 'user',
  },
];

const TaskItem = ({ task, onToggle, onDelete }: { task: any, onToggle: (id: string) => void, onDelete: (id: string) => void }) => {
  const isCompleted = task.status === 'completed';

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <button onClick={() => onToggle(task.id)} className="flex-shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        ) : (
          <Circle className="h-6 w-6 text-gray-300" />
        )}
      </button>
      <div className="flex-grow">
        <p className={`text-gray-800 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
          {task.text}
        </p>
        {task.source === 'psychologist' ? (
          <Badge variant="outline" className="mt-2 bg-blue-100 text-blue-800 border-blue-300">Asignada por Psicólogo</Badge>
        ) : (
          <Badge variant="secondary" className="mt-2">Añadida por ti</Badge>
        )}
      </div>
      {task.source === 'user' && (
        <button onClick={() => onDelete(task.id)} className="flex-shrink-0 text-gray-400 hover:text-red-500">
          <Trash2 className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState(sampleTasks);

  const handleToggleStatus = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    // En una implementación real, aquí llamarías a la base de datos para eliminar
  };
  
  // Función placeholder para añadir tarea (no funcional aún)
  const handleAddTask = () => {
      console.log("Funcionalidad para añadir tarea no implementada.")
  };

  // Función placeholder para sugerencias de IA (no funcional aún)
  const handleAISuggestions = () => {
      console.log("Funcionalidad de IA no implementada.")
  };

  return (
    <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-gray-700">Tus Tareas Diarias</CardTitle>
        <CardDescription>Tareas asignadas por tu psicólogo y las que tú mismo te propones.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} onToggle={handleToggleStatus} onDelete={handleDeleteTask} />
          ))}
        </div>
        <div className="mt-6">
           <Button variant="ghost" className="w-full text-green-600 bg-green-100 hover:bg-green-200">
                <Wand2 className="mr-2 h-4 w-4" />
                Sugerir Nuevas Tareas con IA
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Tasks;
