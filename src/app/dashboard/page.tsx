
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'; // Assuming you have a useAuth hook

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';

// Types
import type { JournalEntry as JournalEntryType } from '@/types/journal';

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth(); // Using the custom auth hook
  const [hasJournaledToday, setHasJournaledToday] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return; // Wait until user auth state is resolved
    if (!user) {
      router.replace('/login'); // Redirect if not logged in
      return;
    }

    const fetchJournalStatus = async () => {
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/journal', { // No firebaseUid in query
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch journal entries');
        }

        const entries: JournalEntryType[] = await response.json();
        const hasJournaled = entries.some(entry => isToday(new Date(entry.createdAt)));
        setHasJournaledToday(hasJournaled);

      } catch (error) {
        console.error("Error fetching journal status:", error);
        setHasJournaledToday(false); // Assume no journal if fetch fails
      }
    };

    fetchJournalStatus();
  }, [user, loading, router]);


  // --- Render logic ---

  if (loading || hasJournaledToday === null) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="p-6">
        <h1 className="text-3xl font-bold">Bienvenido a tu Dashboard</h1>
        <p className="text-muted-foreground">Tu espacio para el autoconocimiento y el bienestar.</p>
      </header>

      <main className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
        {/* -- Daily Journal Card -- */}
        <Card className="col-span-1 md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Registro Diario</CardTitle>
            <CardDescription>
              {hasJournaledToday ? 
                "¡Buen trabajo! Ya completaste tu registro de hoy." : 
                "Tómate un momento para registrar tus emociones y pensamientos."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasJournaledToday ? (
                <div className='text-center p-4 bg-green-100 rounded-lg'>
                    <p className='text-green-800 font-semibold'>Vuelve mañana para un nuevo registro.</p>
                </div>
            ) : (
                <Button onClick={() => router.push('/journal/new')}>
                    <Icons.plus className="mr-2 h-4 w-4" /> Iniciar Registro
                </Button>
            )}
          </CardContent>
        </Card>

        {/* -- Other cards remain unchanged -- */}

        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Mi Progreso</CardTitle>
                <CardDescription>Visualiza tu avance semanal.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Registros</span>
                            <span className="text-sm font-medium">3 de 7</span>
                        </div>
                        <Progress value={(3/7)*100} />
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Tareas</span>
                            <span className="text-sm font-medium">1 de 5</span>
                        </div>
                        <Progress value={(1/5)*100} />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full">Ver detalles</Button>
            </CardFooter>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Tareas Pendientes</CardTitle>
            <CardDescription>Actividades recomendadas para ti.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><Icons.checkCircle className="h-5 w-5 text-green-500"/> Técnica de respiración</li>
              <li className="flex items-center gap-2"><Icons.circle className="h-5 w-5 text-gray-300"/> Ejercicio de gratitud</li>
              <li className="flex items-center gap-2"><Icons.circle className="h-5 w-5 text-gray-300"/> Meditación guiada</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Ver todas las tareas</Button>
          </CardFooter>
        </Card>

      </main>
    </div>
  );
}
