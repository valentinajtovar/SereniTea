"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    ChartContainer,
    ChartTooltip as ChartTooltipPrimitive,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Check, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface Patient {
  id: string;
  name: string;
  image: string;
  imageHint: string;
  lastReport: string;
  progress: number;
  details: {
    age: number;
    gender: string;
    joined: string;
    treatmentFocus: string;
  };
}

const weeklyData = [
  { name: 'Lun', mood: 3 },
  { name: 'Mar', mood: 2 },
  { name: 'Mié', mood: 4 },
  { name: 'Jue', mood: 3 },
  { name: 'Vie', mood: 5 },
  { name: 'Sáb', mood: 4 },
  { name: 'Dom', mood: 3 },
];

const monthlyData = [
  { name: 'Sem 1', mood: 3.5 },
  { name: 'Sem 2', mood: 4.1 },
  { name: 'Sem 3', mood: 3.8 },
  { name: 'Sem 4', mood: 4.5 },
];

const yearlyData = [
  { name: 'Ene', mood: 3.2 },
  { name: 'Feb', mood: 3.5 },
  { name: 'Mar', mood: 4.0 },
  { name: 'Abr', mood: 4.2 },
  { name: 'May', mood: 3.9 },
  // ... more months
];

const tasksData = [
    { task: "Practica un ejercicio de alimentación consciente.", completed: true },
    { task: "Escribe tres cosas que aprecias de tu cuerpo.", completed: true },
    { task: "Sal a caminar suavemente durante 15 minutos.", completed: false },
    { task: "Llama a un amigo para charlar.", completed: true },
    { task: "Prueba una nueva receta saludable.", completed: false },
]

const chartConfig = {
    mood: {
        label: "Nivel de Ánimo",
        color: "hsl(var(--primary))",
    },
}

export function PatientDetail({ patient }: { patient: Patient }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1 space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={patient.image} alt={patient.name} data-ai-hint={patient.imageHint} />
              <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-headline">{patient.name}</CardTitle>
              <CardDescription>Último reporte: {patient.lastReport}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Edad</h3>
                <p>{patient.details.age}</p>
            </div>
            <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Género</h3>
                <p>{patient.details.gender}</p>
            </div>
             <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Miembro Desde</h3>
                <p>{patient.details.joined}</p>
            </div>
            <Separator />
            <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Enfoque del Tratamiento</h3>
                <p>{patient.details.treatmentFocus}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Tareas Completadas</CardTitle>
                <CardDescription>Progreso reciente de las tareas asignadas.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tarea</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasksData.map((t, i) => (
                        <TableRow key={i}>
                            <TableCell>{t.task}</TableCell>
                            <TableCell>
                                {t.completed ? <Check className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-yellow-500" />}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Registro de Emociones</CardTitle>
            <CardDescription>Visualización del estado de ánimo del paciente a lo largo del tiempo.</CardDescription>
          </CardHeader>
          <CardContent>
             <Tabs defaultValue="weekly">
                <TabsList>
                    <TabsTrigger value="weekly">Semanal</TabsTrigger>
                    <TabsTrigger value="monthly">Mensual</TabsTrigger>
                    <TabsTrigger value="yearly">Anual</TabsTrigger>
                </TabsList>
                <TabsContent value="weekly">
                    <ChartContainer config={chartConfig} className="w-full h-[300px]">
                        <BarChart data={weeklyData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis domain={[1, 5]} />
                            <ChartTooltipPrimitive content={<ChartTooltipContent />} />
                            <Bar dataKey="mood" fill="var(--color-mood)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </TabsContent>
                 <TabsContent value="monthly">
                    <ChartContainer config={chartConfig} className="w-full h-[300px]">
                        <LineChart data={monthlyData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis domain={[1, 5]} />
                             <ChartTooltipPrimitive content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="mood" stroke="var(--color-mood)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                </TabsContent>
                 <TabsContent value="yearly">
                    <ChartContainer config={chartConfig} className="w-full h-[300px]">
                        <LineChart data={yearlyData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis domain={[1, 5]} />
                             <ChartTooltipPrimitive content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="mood" stroke="var(--color-mood)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
