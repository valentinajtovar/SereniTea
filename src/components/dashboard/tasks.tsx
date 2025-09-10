"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Wand2, User, Bot, Trash2, PlusCircle, Circle } from "lucide-react";

import { suggestTasksAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { SuggestPersonalizedTasksOutput } from "@/ai/flows/suggest-personalized-tasks";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface Task {
  text: string;
  source: 'psychologist' | 'ai' | 'user';
  completed: boolean;
}

export function Tasks() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [tasks, setTasks] = useState<Task[]>([
    { text: "Practica un ejercicio de alimentación consciente de 5 minutos en tu próxima comida.", source: 'psychologist', completed: false },
    { text: "Escribe tres cosas que aprecias de tu cuerpo.", source: 'psychologist', completed: true },
    { text: "Sal a caminar suavemente durante 15 minutos y concéntrate en tu entorno.", source: 'user', completed: false },
  ]);

  const handleSuggestTasks = () => {
    startTransition(async () => {
      // In a real app, you would get mood and diary from state
      const result = await suggestTasksAction(
        "Ansioso",
        "Sintiéndome estresado por un próximo evento y está afectando mi apetito."
      );
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        const newTasks = (result as SuggestPersonalizedTasksOutput).tasks;
        setTasks(prevTasks => [
            ...prevTasks,
            ...newTasks.map(task => ({ text: task, source: 'ai' as 'ai', completed: false }))
        ]);
        toast({
          title: "¡Nuevas Tareas Sugeridas!",
          description: "Hemos añadido algunas nuevas tareas personalizadas para ti.",
        });
      }
    });
  };

  const removeTask = (indexToRemove: number) => {
    setTasks(tasks.filter((_, index) => index !== indexToRemove));
  };
  
  const toggleTaskCompletion = (indexToToggle: number) => {
    setTasks(
      tasks.map((task, index) =>
        index === indexToToggle ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getSourceInfo = (source: Task['source']) => {
    switch(source) {
      case 'psychologist':
        return { icon: <User className="w-4 h-4" />, label: "Asignada por Psicólogo", color: "bg-blue-100 text-blue-800" };
      case 'ai':
        return { icon: <Bot className="w-4 h-4" />, label: "Sugerencia de IA", color: "bg-purple-100 text-purple-800" };
      case 'user':
        return { icon: <PlusCircle className="w-4 h-4" />, label: "Añadida por ti", color: "bg-gray-100 text-gray-800" };
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Tus Tareas Diarias</CardTitle>
        <CardDescription>
          Tareas asignadas por tu psicólogo y las que tú mismo te propones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {tasks.map((task, index) => {
            const sourceInfo = getSourceInfo(task.source);
            return (
              <li
                key={index}
                className="flex items-start p-4 rounded-lg bg-secondary/50 justify-between"
              >
                <div className="flex items-start flex-grow">
                    <button onClick={() => toggleTaskCompletion(index)} className="flex items-center justify-center w-8 h-8 mr-4 bg-primary/20 rounded-full text-primary-foreground shrink-0 hover:bg-primary/40 transition-colors">
                        {task.completed ? <Check className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div className="flex-grow">
                        <p className={cn("flex-1", task.completed && "line-through text-muted-foreground")}>{task.text}</p>
                        <Badge variant="outline" className={`mt-2 text-xs ${sourceInfo.color}`}>
                            {sourceInfo.icon}
                            <span className="ml-1">{sourceInfo.label}</span>
                        </Badge>
                    </div>
                </div>
                {task.source !== 'psychologist' && (
                  <Button variant="ghost" size="icon" className="shrink-0 ml-2" onClick={() => removeTask(index)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSuggestTasks} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Sugerir Nuevas Tareas con IA
        </Button>
      </CardFooter>
    </Card>
  );
}
