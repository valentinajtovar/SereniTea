"use client";

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MoreVertical, Info, FileText, Loader2, Bot } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { summarizePatientReportAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SummarizePatientReportOutput } from '@/ai/flows/summarize-patient-report';


const patients = [
  {
    id: "1",
    name: "Alex Miller",
    image: "https://picsum.photos/seed/alex/200",
    imageHint: "retrato persona joven",
    lastReport: "Hace 2 días",
    progress: 75,
    moodData: [
        { date: '2024-07-15', mood: 'Ansioso' },
        { date: '2024-07-16', mood: 'Neutral' },
        { date: '2024-07-17', mood: 'Contento' },
    ],
    diaryData: [
        { date: '2024-07-15', entry: 'Me sentí abrumado en el supermercado.' },
        { date: '2024-07-17', entry: 'Tuve una comida agradable con un amigo.' },
    ]
  },
  {
    id: "2",
    name: "Sofía Loren",
    image: "https://picsum.photos/seed/sofia/200",
    imageHint: "retrato mujer sonriendo",
    lastReport: "Hace 5 días",
    progress: 40,
    moodData: [{ date: '2024-07-15', mood: 'Triste' }],
    diaryData: [{ date: '2024-07-15', entry: 'No tuve un buen día hoy.' }],
  },
  {
    id: "3",
    name: "Carlos Diaz",
    image: "https://picsum.photos/seed/carlos/200",
    imageHint: "retrato hombre serio",
    lastReport: "Hace 1 semana",
    progress: 60,
    moodData: [{ date: '2024-07-15', mood: 'Relajado' }],
    diaryData: [],
  },
];

export function PatientList() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [report, setReport] = useState<SummarizePatientReportOutput | null>(null);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<(typeof patients)[0] | null>(null);

    const handleGenerateReport = (patient: (typeof patients)[0]) => {
        startTransition(async () => {
            setSelectedPatient(patient);
            const result = await summarizePatientReportAction({
                patientName: patient.name,
                moodEntries: patient.moodData,
                diaryEntries: patient.diaryData,
            });

            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error al generar reporte',
                    description: result.error,
                });
            } else {
                setReport(result as SummarizePatientReportOutput);
                setIsReportDialogOpen(true);
            }
        });
    }


  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {patients.map((patient) => (
        <Card key={patient.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={patient.image}
                  alt={patient.name}
                  data-ai-hint={patient.imageHint}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <CardTitle className="font-headline">{patient.name}</CardTitle>
                </div>
              </div>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                     <Link href={`/dashboard/psychologist/patients/${patient.id}`}>
                        <Info className="mr-2"/> Más Información
                     </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleGenerateReport(patient)}>
                    {isPending && selectedPatient?.id === patient.id ? (
                        <Loader2 className="mr-2 animate-spin" />
                    ) : (
                        <FileText className="mr-2" />
                    )}
                    Ver Reporte Semanal (IA)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Progreso de Tareas
                </span>
                <span className="text-sm font-bold text-primary-foreground">{patient.progress}%</span>
              </div>
              <Progress value={patient.progress} />
            </div>
            <p className="text-sm text-muted-foreground">
              Último reporte: <span className="font-medium">{patient.lastReport}</span>
            </p>
          </CardContent>
          <CardFooter className="flex gap-2">
             <Button className="w-full" asChild>
                <Link href={`/dashboard/psychologist/patients/${patient.id}`}>
                    <Info className="mr-2"/> Más Información
                </Link>
             </Button>
              <Button variant="outline" className="w-full" onClick={() => handleGenerateReport(patient)} disabled={isPending && selectedPatient?.id === patient.id}>
                 {isPending && selectedPatient?.id === patient.id ? (
                    <Loader2 className="mr-2 animate-spin" />
                ) : (
                    <FileText className="mr-2" />
                )}
                Reporte IA
              </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
    
    <AlertDialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-headline text-2xl">
                <Bot /> Reporte Semanal para {selectedPatient?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
                Este es un resumen generado por IA basado en las entradas de ánimo y diario del paciente.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4">
                <div>
                    <h3 className="font-bold">Resumen General</h3>
                    <p className="text-sm text-muted-foreground">{report?.summary}</p>
                </div>
                 <div>
                    <h3 className="font-bold">Observaciones Clave</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                        {report?.keyObservations.map((obs, i) => <li key={i}>{obs}</li>)}
                    </ul>
                </div>
                 <div>
                    <h3 className="font-bold">Enfoque Sugerido para la Próxima Sesión</h3>
                    <p className="text-sm text-muted-foreground">{report?.suggestedFocus}</p>
                </div>
            </div>
            <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsReportDialogOpen(false)}>Cerrar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
