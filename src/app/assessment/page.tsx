'use client';

import AssessmentForm from '@/components/assessment/assessment-form';
import { Logo } from '@/components/shared/logo';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AssessmentPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Logo />
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Inicio
          </Link>
        </Button>
      </header>

      <main className="flex-grow flex items-center justify-center py-12">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Bienvenido a SereniTea</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Tu primer paso es una breve evaluación. Tus respuestas nos ayudarán a entender tus necesidades y a conectarte con el mejor apoyo disponible.
            </p>
          </div>
          <AssessmentForm />
        </div>
      </main>
    </div>
  );
}
