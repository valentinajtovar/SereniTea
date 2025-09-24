'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { CheckSquare, Square, Sparkles, Loader2, Star, MessageSquare, Repeat, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase-client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// --- Interfaces --- //
export type Utilidad = 'muy_util' | 'util' | 'neutral' | 'no_util';
export type Dificultad = 'facil' | 'media' | 'dificil';

export interface TaskFeedback {
  utilidad: Utilidad;
  dificultad: Dificultad;
  comentario?: string;
  repetiria: boolean;
}

export interface Task {
  id: string;
  descripcion: string;
  estado: 'pendiente' | 'completada';
  asignadaPor: string; 
  pacienteId: string;
  fechaAsignacion: Timestamp;
  fechaDue: Timestamp;
  feedback?: TaskFeedback;
}

// --- Helper Functions & Components --- //
const formatDate = (timestamp: Timestamp | undefined) => {
  if (!timestamp) return 'Fecha no disponible';
  return timestamp.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const FeedbackForm = ({ task, onSubmit, onCancel }: { task: Task; onSubmit: (feedback: TaskFeedback) => void; onCancel: () => void; }) => {
  const [utilidad, setUtilidad] = useState<Utilidad>('util');
  const [dificultad, setDificultad] = useState<Dificultad>('media');
  const [comentario, setComentario] = useState('');
  const [repetiria, setRepetiria] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ utilidad, dificultad, comentario, repetiria });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-6">
      <h4 className="font-semibold text-center text-purple-800">¿Qué te pareció esta tarea?</h4>
      
      <div className="space-y-2">
        <Label className="font-medium text-gray-700">¿Qué tan útil fue?</Label>
        <RadioGroup value={utilidad} onValueChange={(value: Utilidad) => setUtilidad(value)} className="flex justify-around">
          <Label htmlFor={`${task.id}-util-1`} className="flex flex-col items-center gap-1 cursor-pointer"><RadioGroupItem value="muy_util" id={`${task.id}-util-1`} className="peer sr-only" /><ThumbsUp className={`h-6 w-6 peer-aria-checked:text-green-600 peer-aria-checked:scale-125 transition-transform`} /> Muy útil</Label>
          <Label htmlFor={`${task.id}-util-2`} className="flex flex-col items-center gap-1 cursor-pointer"><RadioGroupItem value="util" id={`${task.id}-util-2`} className="peer sr-only" /><ThumbsUp className={`h-6 w-6 peer-aria-checked:text-green-500 peer-aria-checked:scale-125 transition-transform`} /> Útil</Label>
          <Label htmlFor={`${task.id}-util-3`} className="flex flex-col items-center gap-1 cursor-pointer"><RadioGroupItem value="neutral" id={`${task.id}-util-3`} className="peer sr-only" /><Meh className={`h-6 w-6 peer-aria-checked:text-yellow-500 peer-aria-checked:scale-125 transition-transform`} /> Neutral</Label>
          <Label htmlFor={`${task.id}-util-4`} className="flex flex-col items-center gap-1 cursor-pointer"><RadioGroupItem value="no_util" id={`${task.id}-util-4`} className="peer sr-only" /><ThumbsDown className={`h-6 w-6 peer-aria-checked:text-red-500 peer-aria-checked:scale-125 transition-transform`} /> No fue útil</Label>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label className="font-medium text-gray-700">¿Qué tan difícil fue?</Label>
        <RadioGroup value={dificultad} onValueChange={(value: Dificultad) => setDificultad(value)} className="flex justify-around">
          <Label htmlFor={`${task.id}-dif-1`} className="flex flex-col items-center gap-1 cursor-pointer"><RadioGroupItem value="facil" id={`${task.id}-dif-1`} className="peer sr-only" /><div className={`p-2 rounded-full peer-aria-checked:bg-green-200`}>Fácil</div></Label>
          <Label htmlFor={`${task.id}-dif-2`} className="flex flex-col items-center gap-1 cursor-pointer"><RadioGroupItem value="media" id={`${task.id}-dif-2`} className="peer sr-only" /><div className={`p-2 rounded-full peer-aria-checked:bg-yellow-200`}>Media</div></Label>
          <Label htmlFor={`${task.id}-dif-3`} className="flex flex-col items-center gap-1 cursor-pointer"><RadioGroupItem value="dificil" id={`${task.id}-dif-3`} className="peer sr-only" /><div className={`p-2 rounded-full peer-aria-checked:bg-red-200`}>Difícil</div></Label>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${task.id}-comentario`} className="font-medium text-gray-700">Comentarios adicionales (opcional)</Label>
        <Textarea id={`${task.id}-comentario`} value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Escribe tus pensamientos aquí..." />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor={`${task.id}-repetir`} className="flex items-center gap-2 font-medium text-gray-700"><Switch id={`${task.id}-repetir`} checked={repetiria} onCheckedChange={setRepetiria} /> ¿La repetirías?</Label>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Guardar Feedback</Button>
        </div>
      </div>
    </form>
  );
};

const DisplayFeedback = ({ feedback }: { feedback: TaskFeedback }) => (
    <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm text-gray-600 space-y-2">
        <p><strong>Utilidad:</strong> <span className="font-normal">{feedback.utilidad.replace('_', ' ')}</span></p>
        <p><strong>Dificultad:</strong> <span className="font-normal">{feedback.dificultad}</span></p>
        {feedback.comentario && <p><strong>Comentario:</strong> <span className="font-normal italic">"{feedback.comentario}"</span></p>}
        <p><strong>Repetiría:</strong> <span className="font-normal">{feedback.repetiria ? 'Sí' : 'No'}</span></p>
    </div>
);

// --- Main Component --- //
const Tasks = ({ user }: { user: User | null }) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackTaskId, setFeedbackTaskId] = useState<string | null>(null); // ID de la tarea para la que se muestra el feedback

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query(collection(db, "tareas"), where("pacienteId", "==", user.uid), orderBy("fechaDue", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error al obtener las tareas: ", error);
      toast({ title: "Error", description: "No se pudieron cargar las tareas.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.estado === 'pendiente' ? 'completada' : 'pendiente';
    const taskRef = doc(db, 'tareas', task.id);
    try {
      await updateDoc(taskRef, { estado: newStatus });
      toast({ title: `Tarea ${newStatus === 'completada' ? 'completada' : 'marcada como pendiente'}` });
      // Si la tarea se completa y no tiene feedback, abrir el formulario
      if (newStatus === 'completada' && !task.feedback) {
        setFeedbackTaskId(task.id);
      }
      // Si se vuelve a poner pendiente, cerrar el form por si estaba abierto
      if (newStatus === 'pendiente') {
        setFeedbackTaskId(null);
      }
    } catch (error) {
      console.error("Error al actualizar la tarea: ", error);
      toast({ title: "Error", description: "No se pudo actualizar la tarea.", variant: "destructive" });
    }
  };

  const handleFeedbackSubmit = async (taskId: string, feedback: TaskFeedback) => {
    const taskRef = doc(db, 'tareas', taskId);
    try {
        await updateDoc(taskRef, { feedback });
        toast({ title: "¡Gracias!", description: "Tu feedback ha sido guardado." });
        setFeedbackTaskId(null); // Ocultar el formulario
    } catch (error) {
        console.error("Error al guardar el feedback: ", error);
        toast({ title: "Error", description: "No se pudo guardar tu feedback.", variant: "destructive" });
    }
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  const groupedTasks = tasks.reduce((acc, task) => {
    const taskDate = task.fechaDue.toDate();
    taskDate.setHours(0,0,0,0);
    const diffDays = (taskDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    let key = 'Próximamente';
    if (diffDays < 0) key = 'Pasadas';
    else if (diffDays === 0) key = 'Hoy';
    else if (diffDays === 1) key = 'Mañana';

    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const groupOrder: (keyof typeof groupedTasks)[] = ['Hoy', 'Mañana', 'Próximamente', 'Pasadas'];

  return (
    <Card className="shadow-lg">
      <CardHeader>
          <CardTitle className="font-headline text-2xl text-gray-700">Tus Tareas</CardTitle>
          <CardDescription>Pasos para avanzar en tu bienestar.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-purple-500" /><p className="ml-2 text-gray-500">Cargando tus tareas...</p></div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-500 italic py-4">No tienes tareas asignadas.</p>
        ) : (
          <div className="space-y-6">
            {groupOrder.map(group => groupedTasks[group] && (
              <div key={group}>
                <h3 className="font-semibold text-lg text-purple-700 border-b-2 border-purple-100 pb-1 mb-3">{group}</h3>
                <div className="space-y-4">
                  {groupedTasks[group].map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm transition-all">
                      <button onClick={() => handleToggleTask(task)} className="mt-1 flex-shrink-0">
                        {task.estado === 'completada' ? <CheckSquare className="h-6 w-6 text-green-500" /> : <Square className="h-6 w-6 text-gray-400" />}
                      </button>
                      <div className="flex-grow">
                        <p className={`text-gray-800 ${task.estado === 'completada' ? 'line-through text-gray-500' : ''}`}>{task.descripcion}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <span>Asignada por: <span className="font-semibold">{task.asignadaPor}</span></span>
                        </div>
                        
                        {/* Lógica de Feedback */}
                        {task.estado === 'completada' && (
                          <div className="mt-2">
                            {task.feedback ? (
                                <Collapsible>
                                    <CollapsibleTrigger asChild><Button variant="link" size="sm" className="p-0 h-auto">Ver feedback</Button></CollapsibleTrigger>
                                    <CollapsibleContent><DisplayFeedback feedback={task.feedback} /></CollapsibleContent>
                                </Collapsible>
                            ) : feedbackTaskId === task.id ? (
                              <FeedbackForm task={task} onSubmit={(feedback) => handleFeedbackSubmit(task.id, feedback)} onCancel={() => setFeedbackTaskId(null)} />
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => setFeedbackTaskId(task.id)} className="mt-2">Calificar Tarea</Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Tasks;
