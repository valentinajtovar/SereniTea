import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  UserPlus,
  BarChart2,
  XCircle,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";

const matchRequests = [
  {
    patient: "Usuario Anónimo #345",
    summary:
      "Luchando con la restricción alimentaria y la ansiedad social relacionada con la comida...",
    status: "Pendiente",
  },
  {
    patient: "Usuario Anónimo #621",
    summary:
      "Reporta episodios de atracones y sentimientos de culpa, buscando estrategias...",
    status: "Pendiente",
  },
];

export default function PsychologistDashboardPage() {
  return (
    <>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline">
            Panel del Psicólogo
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus pacientes y solicitudes aquí.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <UserPlus />
                  Nuevas Solicitudes de Match
                </CardTitle>
                <CardDescription>
                  Revisa los perfiles de los pacientes y decide si son una buena
                  coincidencia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {matchRequests.map((request, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border bg-secondary/50"
                    >
                      <div className="mb-4 sm:mb-0">
                        <h3 className="font-semibold">{request.patient}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.summary}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <Button size="sm" variant="outline">
                          Ver Perfil
                        </Button>
                        <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aceptar
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <ClipboardList />
                  Asignar Tareas
                </CardTitle>
                <CardDescription>
                  Selecciona un paciente para asignarle nuevas tareas y ver su
                  progreso.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <Button asChild>
                    <Link href="/dashboard/psychologist/tasks">Ir a Asignar Tareas</Link>
                 </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <BarChart2 />
                  Tus Pacientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="mt-4 w-full" asChild>
                    <Link href="/dashboard/psychologist/patients">Ver Todos los Pacientes</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
