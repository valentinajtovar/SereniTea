"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Send, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";

const patients = [
  { id: "1", name: "Alex Miller" },
  { id: "2", name: "Sofía Loren" },
  { id: "3", name: "Carlos Diaz" },
];

const suggestedTasks = [
  "Escribe una carta de agradecimiento a tu cuerpo.",
  "Prueba un nuevo tipo de movimiento que disfrutes (bailar, yoga, etc.).",
  "Desafía un pensamiento negativo sobre la comida hoy.",
  "Planifica una comida con un amigo o familiar.",
  "Dedica 10 minutos a una actividad de relajación (meditación, respiración profunda).",
];

export function TaskAssignment() {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [customTask, setCustomTask] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleAssignTask = (task: string) => {
    if (!selectedPatient) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Por favor, selecciona un paciente primero.",
        });
        return;
    }
    // Logic to assign the task
    toast({
      title: "Tarea Asignada",
      description: `"${task}" ha sido asignada a ${patients.find(p => p.id === selectedPatient)?.name}.`,
    });
    setCustomTask("");
    setIsSheetOpen(false); // Close sheet after assignment
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Panel de Asignación de Tareas</CardTitle>
        <CardDescription>
          Selecciona un paciente y asígnale una tarea sugerida o crea una
          personalizada.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label
            htmlFor="patient-select"
            className="block text-sm font-medium text-muted-foreground mb-2"
          >
            1. Selecciona un Paciente
          </label>
          <Select onValueChange={setSelectedPatient}>
            <SelectTrigger id="patient-select" className="w-full md:w-1/2">
              <SelectValue placeholder="Elige un paciente..." />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
           <label
            className="block text-sm font-medium text-muted-foreground mb-2"
          >
            2. Elige una Acción
          </label>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                <Button disabled={!selectedPatient}>
                <PlusCircle className="mr-2" /> Añadir Tarea
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                <SheetTitle>Asignar Tarea a {patients.find(p => p.id === selectedPatient)?.name}</SheetTitle>
                <SheetDescription>
                    Elige una tarea de la lista de sugerencias o crea una nueva tarea personalizada a continuación.
                </SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb /> Tareas Sugeridas</h3>
                        <div className="space-y-2">
                            {suggestedTasks.map((task, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                                    <p className="text-sm">{task}</p>
                                    <Button size="sm" onClick={() => handleAssignTask(task)}>Asignar</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <h3 className="font-semibold mb-2">O crea una tarea personalizada</h3>
                        <Textarea 
                            placeholder="Describe la nueva tarea..."
                            value={customTask}
                            onChange={(e) => setCustomTask(e.target.value)}
                        />
                    </div>
                </div>
                <SheetFooter>
                    <Button onClick={() => handleAssignTask(customTask)} disabled={!customTask.trim()}>
                        <Send className="mr-2"/> Asignar Tarea Personalizada
                    </Button>
                </SheetFooter>
            </SheetContent>
            </Sheet>
        </div>
      </CardContent>
    </Card>
  );
}
