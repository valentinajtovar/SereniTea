'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Square, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from '@/lib/firebase-client';
import { type Task } from '@/types';

const TaskSummary = ({ user }: { user: User | null }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "tareas"),
      where("pacienteId", "==", user.uid),
      where("estado", "==", "pendiente"),
      where("fechaDue", ">=", Timestamp.fromDate(startOfToday)),
      orderBy("fechaDue", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching pending tasks: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todayTasks = tasks.filter(task => task.fechaDue.toDate() <= endOfToday);
  const upcomingTasks = tasks.filter(task => task.fechaDue.toDate() > endOfToday);

  const TaskItem = ({ task, showTime }: { task: Task; showTime?: boolean }) => (
    <div className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50">
      <Square className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
      <div className="flex-grow">
        <p className="text-gray-800">{task.descripcion}</p>
        <p className="text-sm text-gray-500 capitalize">
          {showTime
            ? task.fechaDue.toDate().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            : task.fechaDue.toDate().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
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
                  {todayTasks.map(task => <TaskItem key={task.id} task={task} showTime />)}
                </div>
              </div>
            )}
            {upcomingTasks.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mt-4 mb-2 px-2">Pronto</h3>
                <div className="space-y-1">
                  {upcomingTasks.map(task => <TaskItem key={task.id} task={task} />)}
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
