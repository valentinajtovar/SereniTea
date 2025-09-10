import { MoodDiary } from "@/components/dashboard/mood-diary";
import { Tasks } from "@/components/dashboard/tasks";
import { Header } from "@/components/shared/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function DashboardPage() {
  return (
    <>
    <Header />
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Bienvenido de nuevo, Alex</h1>
        <p className="text-muted-foreground">
          ¿Listo para continuar tu viaje? Estamos aquí contigo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <MoodDiary />
          <Tasks />
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Lightbulb className="w-5 h-5 text-primary" />
                Consejo Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Recuerda ser amable contigo mismo hoy. Cada pequeño paso es un progreso. Prueba un ejercicio de mindfulness de 5 minutos si te sientes abrumado.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
