'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Suscríbete a los cambios de estado de autenticación
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        // Si el usuario está autenticado, escucha las tareas
        const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
        const unsubscribeTasks = onSnapshot(q, (querySnapshot) => {
          const tasksData: Task[] = [];
          querySnapshot.forEach((doc) => {
            tasksData.push({ id: doc.id, ...doc.data() } as Task);
          });
          setTasks(tasksData);
        });

        // Devuelve una función de limpieza para cancelar la suscripción a las tareas
        return () => unsubscribeTasks();
      }
    });

    // Devuelve una función de limpieza para cancelar la suscripción de autenticación
    return () => unsubscribeAuth();
  }, []);

  return (
    <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-gray-700">Tus Tareas</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <ul className="space-y-3">
            {tasks.map(task => (
              <li key={task.id} className="flex items-center space-x-3">
                <Checkbox id={task.id} checked={task.completed} />
                <label
                  htmlFor={task.id}
                  className={`text-gray-800 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.text}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No tienes tareas asignadas.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Tasks;
