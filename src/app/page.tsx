import Image from 'next/image';
import Link from 'next/link';
import {
  HeartHandshake,
  KeyRound,
  Leaf,
  MessageCircle,
  Stethoscope,
  Target,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/shared/logo';

export default function Home() {
  const features = [
    {
      icon: <Stethoscope className="w-8 h-8 text-primary-foreground" />,
      title: 'Evaluación Inicial',
      description: 'Completa un cuestionario para evaluar tus necesidades y tendencias.',
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-primary-foreground" />,
      title: 'Coincidencia con IA',
      description: 'Te conectamos con el psicólogo o centro más adecuado para ti.',
    },
    {
      icon: <Target className="w-8 h-8 text-primary-foreground" />,
      title: 'Tareas Personalizadas',
      description: 'Recibe tareas sugeridas por IA para apoyar tu tratamiento y recuperación.',
    },
    {
      icon: <Users className="w-8 h-8 text-primary-foreground" />,
      title: 'Foro Anónimo',
      description: 'Conéctate con otros, comparte experiencias y encuentra apoyo.',
    },
    {
      icon: <Leaf className="w-8 h-8 text-primary-foreground" />,
      title: 'Descubre Actividades',
      description: 'Encuentra nuevas actividades creativas y terapéuticas adaptadas a tu estado de ánimo.',
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-primary-foreground" />,
      title: 'Soporte en Crisis',
      description: 'Un botón de ayuda accesible para contacto inmediato con soporte.',
    },
  ];

  const registrationOptions = [
    {
      icon: <Stethoscope className="w-6 h-6 mr-2" />,
      title: 'Registrarse como Psicólogo',
      href: '/register-psychologist',
    },
    {
      icon: <Users className="w-6 h-6 mr-2" />,
      title: 'Registrarse como Paciente',
      href: '/assessment',
    },
    {
      icon: <KeyRound className="w-6 h-6 mr-2" />,
      title: 'Paciente con Código de Invitación',
      href: '/assessment',
    },
    {
      icon: <HeartHandshake className="w-6 h-6 mr-2" />,
      title: 'Un ser querido buscando ayuda',
      href: '/assessment',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/assessment">Comenzar</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-grow">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
              Tu taza de serenidad en la recuperación.
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              SereniTea es un compañero compasivo para tu viaje hacia la
              sanación de los trastornos alimenticios, conectándote con ayuda profesional y una comunidad de apoyo.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/assessment">Comienza tu Evaluación</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Aprender Más</Link>
              </Button>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="py-20 md:py-32 bg-secondary/50"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">
                Un Camino hacia la Sanación, Juntos.
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Te proporcionamos las herramientas y el apoyo que necesitas en cada paso de tu recuperación.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center">
                  <CardHeader>
                    <div className="mx-auto bg-primary/80 text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-headline">
                  ¿Listo para comenzar tu viaje?
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Elige el camino adecuado para ti. Estamos aquí para ayudarte a empezar, sin importar quién seas.
                </p>
                <div className="mt-8 space-y-4">
                  {registrationOptions.map((option) => (
                    <Button
                      key={option.title}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      asChild
                    >
                      <Link href={option.href}>
                        {option.icon}
                        {option.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="hidden md:block">
                <Image
                  src="https://picsum.photos/600/600"
                  alt="Un entorno tranquilo y de apoyo"
                  data-ai-hint="entorno tranquilo apoyo"
                  width={600}
                  height={600}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-8 bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SereniTea. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
