'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/firebase/auth/auth_context';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase/firestore/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// --- Interfaces --- //
interface Task {
  id: string;
  descripcion: string;
  estado: 'pendiente' | 'completada';
  asignadaPor: string;
  fechaAsignacion: any;
  fechaDue: any;
}

// --- Componente Principal --- //
const Tasks: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!user) {
      setLoading(false);
      setError("Por favor, inicia sesión para ver tus tareas.");
      return;
    }

    setLoading(true);
    const tasksCollection = collection(db, 'tareas');
    const q = query(tasksCollection, where('pacienteId', '==', user.uid));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
        setTasks(tasksData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error al obtener las tareas: ", err);
        setError("Error al obtener las tareas: " + (err as any).message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const functions = getFunctions();
      const generateTasksFunction = httpsCallable(functions, 'generateTasks');
      
      console.log("Llamando a la función generateTasks...");
      const result = await generateTasksFunction();
      console.log("Función ejecutada con éxito:", result.data);
      alert("¡Nuevas tareas generadas por la IA han sido añadidas!");

    } catch (err) {
      console.error("Error al generar tareas con IA: ", err);
      const httpsError = err as any; // Definir explícitamente el tipo
      let errorMessage = "Ocurrió un error inesperado.";
      if (httpsError.code && httpsError.message) {
          errorMessage = `Error (${httpsisError.code}): ${httpsError.message}`;
      }
      setError(errorMessage);
      alert(`Error al generar tareas: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading || loading) {
    return <p>Cargando tareas...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1>Mis Tareas</h1>
      <button onClick={handleGenerateTasks} disabled={isGenerating}>
        {isGenerating ? 'Generando Tareas con IA...' : '✨ Generar Tareas con IA'}
      </button>
      {tasks.length > 0 ? (
        <ul>
          {tasks.map(task => (
            <li key={task.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <p><strong>Descripción:</strong> {task.descripcion}</p>
              <p><strong>Estado:</strong> {task.estado}</p>
              <p><strong>Asignada por:</strong> {task.asignadaPor}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes tareas pendientes. ¡Felicidades!</p>
      )}
    </div>
  );
};

export default Tasks;
