'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { CheckSquare, Square, Pencil, MessageSquare, Loader2, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase-client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { type Task, type TaskFeedback, type Utilidad, type Dificultad } from '@/types'; // Importación centralizada


// --- Helper Components --- //

const FeedbackForm = ({ task, initialFeedback, onSubmit, onCancel }: { task: Task; initialFeedback?: TaskFeedback | null; onSubmit: (feedback: TaskFeedback) => void; onCancel: () => void; }) => {
  const [utilidad, setUtilidad] = useState<Utilidad | undefined>(initialFeedback?.utilidad);
  const [dificultad, setDificultad] = useState<Dificultad | undefined>(initialFeedback?.dificultad);
  const [comentario, setComentario] = useState(initialFeedback?.comentario || '');
  const [repetiria, setRepetiria] = useState(initialFeedback?.repetiria ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ utilidad, dificultad, comentario, repetiria });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-6 animate-in fade-in-0 slide-in-from-top-5 duration-300">
      <h4 className="font-semibold text-center text-purple-800">{initialFeedback ? 'Editar tu feedback' : '¿Qué te pareció esta tarea?'}</h4>
      
      {task.estado === 'completada' && (
        <>
          <div className="space-y-2">
            <Label className="font-medium text-gray-700">¿Qué tan útil fue?</Label>
            <RadioGroup value={utilidad} onValueChange={(value: any) => setUtilidad(value)} className="flex flex-wrap justify-around gap-2">
                <Label htmlFor={`${task.id}-util-1`} className="flex flex-col items-center gap-1 cursor-pointer text-xs p-1 rounded-md"><RadioGroupItem value="muy_util" id={`${task.id}-util-1`} className="peer sr-only" /><ThumbsUp className={`h-5 w-5 text-gray-400 peer-aria-checked:text-green-600 peer-aria-checked:scale-110 transition-all`} /> Muy útil</Label>
                <Label htmlFor={`${task.id}-util-2`} className="flex flex-col items-center gap-1 cursor-pointer text-xs p-1 rounded-md"><RadioGroupItem value="util" id={`${task.id}-util-2`} className="peer sr-only" /><ThumbsUp className={`h-5 w-5 text-gray-400 peer-aria-checked:text-green-500 peer-aria-checked:scale-110 transition-all`} /> Útil</Label>
                <Label htmlFor={`${task.id}-util-3`} className="flex flex-col items-center gap-1 cursor-pointer text-xs p-1 rounded-md"><RadioGroupItem value="neutral" id={`${task.id}-util-3`} className="peer sr-only" /><Meh className={`h-5 w-5 text-gray-400 peer-aria-checked:text-yellow-500 peer-aria-checked:scale-110 transition-all`} /> Neutral</Label>
                <Label htmlFor={`${task.id}-util-4`} className="flex flex-col items-center gap-1 cursor-pointer text-xs p-1 rounded-md"><RadioGroupItem value="no_util" id={`${task.id}-util-4`} className="peer sr-only" /><ThumbsDown className={`h-5 w-5 text-gray-400 peer-aria-checked:text-red-500 peer-aria-checked:scale-110 transition-all`} /> No útil</Label>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-gray-700">¿Qué tan difícil fue?</Label>
            <RadioGroup value={dificultad} onValueChange={(value: any) => setDificultad(value)} className="flex justify-around border rounded-full p-1">
                <Label htmlFor={`${task.id}-dif-1`} className="flex-1 text-center cursor-pointer rounded-full peer-aria-checked:bg-green-100 peer-aria-checked:font-semibold transition-colors px-2 py-1"><RadioGroupItem value="facil" id={`${task.id}-dif-1`} className="peer sr-only" />Fácil</Label>
                <Label htmlFor={`${task.id}-dif-2`} className="flex-1 text-center cursor-pointer rounded-full peer-aria-checked:bg-yellow-100 peer-aria-checked:font-semibold transition-colors px-2 py-1"><RadioGroupItem value="media" id={`${task.id}-dif-2`} className="peer sr-only" />Media</Label>
                <Label htmlFor={`${task.id}-dif-3`} className="flex-1 text-center cursor-pointer rounded-full peer-aria-checked:bg-red-100 peer-aria-checked:font-semibold transition-colors px-2 py-1"><RadioGroupItem value="dificil" id={`${task.id}-dif-3`} className="peer sr-only" />Difícil</Label>
            </RadioGroup>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor={`${task.id}-comentario`} className="font-medium text-gray-700">Comentarios / Notas (opcional)</Label>
        <Textarea id={`${task.id}-comentario`} value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Escribe tus pensamientos aquí..." />
      </div>
      
      {task.estado === 'completada' && (
        <div className="flex items-center justify-between">
            <Label htmlFor={`${task.id}-repetir`} className="flex items-center gap-2 font-medium text-gray-700"><Switch id={`${task.id}-repetir`} checked={repetiria} onCheckedChange={setRepetiria} /> ¿La repetirías?</Label>
        </div>
      )}
      <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
    </form>
  );
};

const DisplayFeedback = ({ feedback }: { feedback: TaskFeedback }) => (
    <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm text-gray-600 space-y-2">
        {feedback.utilidad && <p><strong>Utilidad:</strong> <span className="font-normal capitalize">{feedback.utilidad.replace('_', ' ')}</span></p>}
        {feedback.dificultad && <p><strong>Dificultad:</strong> <span className="font-normal capitalize">{feedback.dificultad}</span></p>}
        {feedback.comentario && <p><strong>Comentario:</strong> <span className="font-normal italic">"{feedback.comentario}"</span></p>}
        {typeof feedback.repetiria === 'boolean' && <p><strong>Repetiría:</strong> <span className="font-normal">{feedback.repetiria ? 'Sí' : 'No'}</span></p>}
    </div>
);

// --- Main Component --- //
const Tasks = ({ user }: { user: User | null }) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackTaskId, setFeedbackTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
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
      if (newStatus === 'completada' && !task.feedback) {
        setFeedbackTaskId(task.id);
      }
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
        setFeedbackTaskId(null);
    } catch (error) {
        console.error("Error al guardar el feedback: ", error);
        toast({ title: "Error", description: "No se pudo guardar tu feedback.", variant: "destructive" });
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader><CardTitle>Tus Tareas</CardTitle><CardDescription>Pasos para avanzar en tu bienestar.</CardDescription></CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-purple-500" /><p className="ml-2 text-gray-500">Cargando...</p></div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-500 italic py-4">No tienes tareas asignadas.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
                <div key={task.id} className="p-3 bg-white rounded-lg shadow-sm transition-all">
                    <div className="flex items-start gap-3">
                    <button onClick={() => handleToggleTask(task)} className="mt-1 flex-shrink-0">
                        {task.estado === 'completada' ? <CheckSquare className="h-6 w-6 text-green-500" /> : <Square className="h-6 w-6 text-gray-400" />}
                    </button>
                    <div className="flex-grow">
                        <p className={`text-gray-800 ${task.estado === 'completada' ? 'line-through text-gray-500' : ''}`}>{task.descripcion}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <span>Asignada por: <span className="font-semibold">{task.asignadaPor}</span></span>
                          {task.fechaDue && 
                            <span className="ml-4">Vence: {task.fechaDue.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          }
                        </div>
                    </div>
                    </div>
                    
                    <div className="pl-9 mt-2">
                    {feedbackTaskId === task.id ? (
                        <FeedbackForm task={task} initialFeedback={task.feedback} onSubmit={(feedback) => handleFeedbackSubmit(task.id, feedback)} onCancel={() => setFeedbackTaskId(null)} />
                    ) : (
                        <>
                        {task.feedback && (
                            <Collapsible>
                            <CollapsibleTrigger asChild><Button variant="link" size="sm" className="p-0 h-auto text-purple-600">Ver feedback</Button></CollapsibleTrigger>
                            <CollapsibleContent><DisplayFeedback feedback={task.feedback} /></CollapsibleContent>
                            </Collapsible>
                        )}
                        
                        {task.estado === 'completada' && (
                            <Button size="sm" variant="outline" className="mt-2" onClick={() => setFeedbackTaskId(task.id)}>
                                {task.feedback ? <><Pencil className="mr-2 h-3 w-3" /> Editar</> : <><MessageSquare className="mr-2 h-3 w-3" /> Calificar</>}
                            </Button>
                        )}

                        {task.estado === 'pendiente' && (
                            <Button size="sm" variant="outline" className="mt-2" onClick={() => setFeedbackTaskId(task.id)}>
                                <MessageSquare className="mr-2 h-3 w-3" /> {task.feedback?.comentario ? 'Editar nota' : 'Añadir nota'}
                            </Button>
                        )}
                        </>
                    )}
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
