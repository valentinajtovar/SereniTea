'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '../firebase/config';
import { Task } from '../types/task';
import toast, { Toaster } from 'react-hot-toast';

// Inicializa Firebase
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const functions = getFunctions(firebaseApp);

// Referencia a la Cloud Function
const generateTasksCallable = httpsCallable(functions, 'generateTasks');

const Tasks = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Si hay usuario, preparamos la query para sus tareas
        const tasksQuery = query(collection(db, 'tareas'), where('pacienteId', '==', user.uid));

        // Escuchamos cambios en tiempo real
        const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
          const userTasks: Task[] = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            userTasks.push({ id: doc.id, ...data } as Task);
          });
          // Ordenamos las tareas: pendientes primero, luego por fecha de creación descendente
          userTasks.sort((a, b) => {
              if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
              if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;
              return (b.fechaAsignacion?.seconds ?? 0) - (a.fechaAsignacion?.seconds ?? 0);
          });
          setTasks(userTasks);
          setLoading(false);
        }, (error) => {
          console.error("Error al obtener las tareas: ", error);
          toast.error("Error al cargar las tareas. Revisa los permisos de la base de datos.");
          setLoading(false);
        });

        return () => unsubscribeTasks();
      } else {
        setUser(null);
        setTasks([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: 'pendiente' | 'completada') => {
    const taskRef = doc(db, 'tareas', taskId);
    const newStatus = currentStatus === 'pendiente' ? 'completada' : 'pendiente';
    try {
      await updateDoc(taskRef, { estado: newStatus });
      toast.success(`Tarea marcada como ${newStatus}.`);
    } catch (error) {
      console.error("Error al actualizar la tarea: ", error);
      toast.error("No se pudo actualizar la tarea.");
    }
  };

  const handleGenerateTasks = async () => {
    if (!user) {
        toast.error("Debes iniciar sesión para generar tareas.");
        return;
    }
    setIsGenerating(true);
    const toastId = toast.loading('Llamando a la IA para generar nuevas tareas... 🧠');

    try {
        const result = await generateTasksCallable({ userId: user.uid });
        console.log("Respuesta de la Cloud Function:", result.data);
        toast.success('¡Nuevas tareas generadas por la IA! Aparecerán en tu lista.', { id: toastId });
    } catch (error) {
        console.error("Error al llamar a la Cloud Function: ", error);
        toast.error('Error al generar tareas con IA. ¿Tienes entradas de diario recientes?', { id: toastId });
    }
    setIsGenerating(false);
  }

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Has cerrado sesión. ¡Vuelve pronto!');
  };

  if (loading) {
    return <div className="text-center mt-10">Cargando tareas...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mis Tareas</h1>
        <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
            Cerrar Sesión
        </button>
      </div>

      {tasks.length > 0 ? (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className={`p-4 rounded-lg shadow-md flex items-center transition-all duration-300 ${
                task.estado === 'completada' ? 'bg-green-100 text-gray-500 line-through' : 'bg-white'
            }`}>
              <input
                type="checkbox"
                checked={task.estado === 'completada'}
                onChange={() => handleToggleTask(task.id, task.estado)}
                className="h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-4 cursor-pointer"
              />
              <div className="flex-grow">
                <p className="font-semibold text-lg">{task.descripcion}</p>
                <div className="text-sm text-gray-500 mt-1">
                    <span>Asignada por: {task.asignadaPor}</span>
                    {task.fechaDue && (
                        <span className="ml-4">Vence: {new Date(task.fechaDue.seconds * 1000).toLocaleDateString()}</span>
                    )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700">¡Todo en orden!</h2>
            <p className="mt-2 text-gray-500">No tienes tareas pendientes. ¡Buen trabajo!</p>
            <p className="mt-4 text-sm text-gray-400">Si quieres nuevos desafíos, usa el botón de IA.</p>
        </div>
      )}

        {/* Botón flotante para generar tareas con IA */}
        <button
            onClick={handleGenerateTasks}
            disabled={isGenerating}
            className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full h-16 w-16 flex items-center justify-center shadow-lg transition duration-300 ease-in-out transform hover:scale-110 disabled:bg-gray-400 disabled:cursor-not-allowed"
            title="Generar Tareas con IA"
        >
            {isGenerating ? (
                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5.7-9.3a.7.7 0 010-1.4l4-1.5a.7.7 0 01.9.9l-1.5 4a.7.7 0 01-1.4 0l-2-2zM14 11a1 1 0 01-1 1h-1.586l-1-1H14zm-4-4a1 1 0 01-1-1V4.414l-1 1V7a1 1 0 01-2 0V4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1z" />
                </svg>

            )}
        </button>
    </div>
  );
};

export default Tasks;
