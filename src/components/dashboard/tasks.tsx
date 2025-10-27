'use client';

import { useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { CheckSquare, Square, Pencil, MessageSquare, Loader2, ThumbsUp, ThumbsDown, Meh, Sparkles, Trash2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase-client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { deleteTaskAction } from '@/app/actions';
import { type Task, type TaskFeedback, type Utilidad, type Dificultad } from '@/types';

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

const DeleteTaskButton = () => {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            disabled={pending}
            aria-label="Delete task"
        >
            {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4 text-gray-500 group-hover:text-red-500 transition-colors" />
            )}
        </Button>
    );
};

const Tasks = ({ user }: { user: User | null }) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackTaskId, setFeedbackTaskId] = useState<string | null>(null);

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
      console.error("Error fetching tasks: ", error);
      toast({ title: "Error", description: "Could not load tasks.", variant: "destructive" });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user, toast]);

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.estado === 'pendiente' ? 'completada' : 'pendiente';
    const taskRef = doc(db, 'tareas', task.id);
    try {
      await updateDoc(taskRef, { estado: newStatus });
      toast({ title: `Task ${newStatus === 'completada' ? 'completed' : 'marked as pending'}` });
      if (newStatus === 'completada' && !task.feedback) {
        setFeedbackTaskId(task.id);
      }
      if (newStatus === 'pendiente') {
        setFeedbackTaskId(null);
      }
    } catch (error) {
      console.error("Error updating task: ", error);
      toast({ title: "Error", description: "Could not update task.", variant: "destructive" });
    }
  };

  const handleFeedbackSubmit = async (taskId: string, feedback: TaskFeedback) => {
    const taskRef = doc(db, 'tareas', taskId);
    try {
        await updateDoc(taskRef, { feedback });
        toast({ title: "Thank you!", description: "Your feedback has been saved." });
        setFeedbackTaskId(null);
    } catch (error) {
        console.error("Error saving feedback: ", error);
        toast({ title: "Error", description: "Could not save your feedback.", variant: "destructive" });
    }
  };

  const handleAiTaskFeedback = async (taskId: string, feedback: 'liked' | 'disliked') => {
    const taskRef = doc(db, 'tareas', taskId);
    try {
      await updateDoc(taskRef, { aiFeedback: feedback });
      toast({ title: "Feedback saved", description: "Thanks, I'll learn from your preferences." });
    } catch (error) {
      console.error("Error saving AI feedback: ", error);
      toast({ title: "Error", description: "Could not save your feedback.", variant: "destructive" });
    }
  };

  const handleGenerateTasks = async () => {
    if (!user) return;
    setIsGenerating(true);
    toast({ title: "Generating tasks...", description: "The AI is creating new tasks for you." });
    try {
      const response = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, existingTasks: tasks }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || `API ${response.status} not ok`);
      }

      toast({ title: "New tasks generated", description: "New tasks have been added to your list." });
    } catch (error) {
      console.error("Error generating tasks: ", error);
      toast({ title: "Error", description: "Could not generate new tasks.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tus Tareas</CardTitle>
          <CardDescription>Pasos para avanzar en tu bienestar.</CardDescription>
        </div>
        <Button onClick={handleGenerateTasks} disabled={isGenerating || isLoading || !user}>
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} 
          Generar con IA
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-purple-500" /><p className="ml-2 text-gray-500">Loading...</p></div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-500 italic py-4">You have no assigned tasks.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => {
              const isAiTask = task.asignadaPor === 'IA Serenitea';
              return (
                <div key={task.id} className={`p-3 rounded-lg shadow-sm transition-all ${isAiTask ? 'bg-purple-50 border-l-4 border-purple-400' : 'bg-white'}`}>
                    <div className="flex items-start gap-3 group">
                      <button onClick={() => handleToggleTask(task)} className="mt-1 flex-shrink-0">
                          {task.estado === 'completada' ? <CheckSquare className="h-6 w-6 text-green-500" /> : <Square className="h-6 w-6 text-gray-400" />}
                      </button>
                      <div className="flex-grow">
                          <p className={`text-gray-800 ${task.estado === 'completada' ? 'line-through text-gray-500' : ''}`}>{task.descripcion}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            <span>Assigned by: <span className="font-semibold">{task.asignadaPor}</span></span>
                            {task.fechaDue && 
                              <span className="ml-4">Due: {task.fechaDue.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            }
                          </div>
                      </div>
                      <form action={deleteTaskAction.bind(null, task.id)}>
                        <DeleteTaskButton />
                      </form>
                    </div>
                    
                    <div className="pl-9 mt-2">
                      {isAiTask && task.estado === 'pendiente' && task.aiFeedback === undefined && (
                        <div className="flex items-center gap-2 mt-2 animate-in fade-in-50">
                          <p className="text-sm text-purple-700">¿Te gusta esta sugerencia?</p>
                          <Button size="sm" variant="outline" className="h-8" onClick={() => handleAiTaskFeedback(task.id, 'liked')}><ThumbsUp className="h-4 w-4 text-green-500" /></Button>
                          <Button size="sm" variant="outline" className="h-8" onClick={() => handleAiTaskFeedback(task.id, 'disliked')}><ThumbsDown className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      )}

                      {feedbackTaskId === task.id ? (
                          <FeedbackForm task={task} initialFeedback={task.feedback} onSubmit={(feedback) => handleFeedbackSubmit(task.id, feedback)} onCancel={() => setFeedbackTaskId(null)} />
                      ) : (
                          <>
                          {task.feedback && (
                              <Collapsible>
                              <CollapsibleTrigger asChild><Button variant="link" size="sm" className="p-0 h-auto text-purple-600">View feedback</Button></CollapsibleTrigger>
                              <CollapsibleContent><DisplayFeedback feedback={task.feedback} /></CollapsibleContent>
                              </Collapsible>
                          )}
                          
                          {task.estado === 'completada' && (
                              <Button size="sm" variant="outline" className="mt-2" onClick={() => setFeedbackTaskId(task.id)}>
                                  {task.feedback ? <><Pencil className="mr-2 h-3 w-3" /> Edit</> : <><MessageSquare className="mr-2 h-3 w-3" /> Rate</>}
                              </Button>
                          )}

                          {task.estado === 'pendiente' && (
                              <Button size="sm" variant="outline" className="mt-2" onClick={() => setFeedbackTaskId(task.id)}>
                                  <MessageSquare className="mr-2 h-3 w-3" /> {task.feedback?.comentario ? 'Edit note' : 'Add note'}
                              </Button>
                          )}
                          </>
                      )}
                    </div>
                </div>
              )}
            )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Tasks;
