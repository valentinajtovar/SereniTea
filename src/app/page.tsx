import Image from 'next/image';
import Link from 'next/link';
import Teacup from "@/images/landing_tea.png";
import Community from "@/images/community.png";
import LiquidChrome from './react-bits/LiquidChrome';
import FeatureIconsExpander from './react-bits/FeatureIconsExpander';
import SplitText from './react-bits/SplitText'
import RotatingText from './react-bits/RotatingText';
import {
  HeartHandshake,
  KeyRound,
  Leaf,
  MessageCircle,
  Stethoscope,
  Target,
  Users,
  BookHeart,
  Smile
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
    //{
      //icon: <HeartHandshake className="w-8 h-8 text-primary-foreground" />,
      //title: 'Coincidencia con IA',
      //description: 'Te conectamos con el psicólogo o centro más adecuado para ti.',
    //},
    {
      icon: <Target className="w-8 h-8 text-primary-foreground" />,
      title: 'Tareas Personalizadas',
      description: 'Recibe tareas sugeridas por IA para apoyar tu tratamiento y recuperación.',
    },
    {
      icon: <BookHeart className="w-8 h-8 text-primary-foreground" />,
      title: 'Diario Personal',
      description: 'Escribe sobre tus pensamientos y sentimientos para reflexionar y crecer.',
    },
    {
      icon: <Smile className="w-8 h-8 text-primary-foreground" />,
      title: 'Seguimiento a Estados de Ánimo',
      description: 'Evalúa y registra tus estados de ánimo a lo largo del tiempo.',
    },
    //{
      //icon: <Users className="w-8 h-8 text-primary-foreground" />,
      //title: 'Foro Anónimo',
      //description: 'Conéctate con otros, comparte experiencias y encuentra apoyo.',
    //},
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
      title: 'Regístrate como Paciente',
      href: '/register',
    },
    //{
      //icon: <KeyRound className="w-6 h-6 mr-2" />,
      //title: 'Paciente con Código de Invitación',
      //href: '/assessment',
    //},
    //{
      //icon: <HeartHandshake className="w-6 h-6 mr-2" />,
      //title: 'Un ser querido buscando ayuda',
      //href: '/assessment',
    //},
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
            <Link href="/register">Comenzar</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-grow">
            <section
      className="relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Altura: hero alto en desktop, cómodo en móvil */}
      <div className="min-h-[80vh] md:min-h-[85vh]">

        {/* Fondo líquido absoluto */}
        <LiquidChrome
          className="absolute inset-0 -z-10"
          baseColor={[0.12, 0.16, 0.18]}   // tono sereno gris-azulado
          speed={0.25}                     // más calmado
          amplitude={0.45}
          frequencyX={3}
          frequencyY={2}
          interactive={true}
        />

        {/* Overlay para contraste de texto */}
        <div className="absolute inset-0 -z-10 bg-black/30" />

        {/* Contenido */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <h1
            id="hero-title"
            className="text-white text-4xl md:text-6xl font-bold font-headline tracking-tight"
          >
            Tu taza de serenidad en la recuperación.
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-100">
            SereniTea es un compañero compasivo para tu viaje hacia la sanación de los
            trastornos alimenticios, conectándote con ayuda profesional y una comunidad
            de apoyo.
          </p>

          <div
            className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
            role="group"
            aria-label="Acciones principales"
          >
            <Button size="lg" asChild className="focus-visible:ring-2 focus-visible:ring-white/70">
              <Link href="/register" aria-label="Comenzar evaluación inicial">
                Comienza tu Evaluación
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <Link href="#features" aria-label="Aprender más sobre SereniTea">
                Aprender Más
              </Link>
            </Button>
          </div>
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
                Un Camino hacia la sanación, juntos.
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Te proporcionamos las herramientas y el apoyo que necesitas en cada paso de tu recuperación.
              </p>
            </div>
            <FeatureIconsExpander features={features} />
          </div>
        </section>

        <section
  id="users"
  className="py-20 md:py-32 bg-green-50"
>
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
    {/* Imagen (izquierda) */}
    <div className="flex-1 flex justify-center">
  <Image
    src={Community}
    alt="Comunidad SereniTea"
    width={400}
    height={400}
    className="rounded-xl shadow-lg"
  />
</div>

    {/* Texto y contador (derecha) */}
    <div className="flex-1 text-center md:text-left">
      <h2 className="text-2xl md:text-4xl font-bold font-headline text-gray-800">
        Contamos con una 
      </h2>
      <SplitText
        text="grandiosa comunidad"
        className="text-4xl font-bold text-center text-green-700"
        delay={100}
        duration={0.6}
        ease="power3.out"
        splitType="chars"
        from={{ opacity: 0, y: 40 }}
        to={{ opacity: 1, y: 0 }}
        threshold={0.1}
        rootMargin="-100px"
        textAlign="center"
      />
      <h2 className="text-2xl md:text-4xl font-bold font-headline text-gray-800">
        que cada día encuentra su serenidad con nosotros.
      </h2>
      <p className="mt-6 text-lg text-gray-700">
        ¿Qué esperas para ser parte de esta familia compasiva y transformadora?
      </p>
    </div>
  </div>
</section>

        
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-headline">
                  ¿List@ para comenzar tu
                </h2>
                <RotatingText
                    texts={['sanación?', 'bienestar?', 'aventura?', 'crecimiento?']}
                    mainClassName="text-3xl  text-green-700 md:text-4xl font-bold font-headline px-2 sm:px-2 md:px-3 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.05}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={4000}
                  />
                
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
                  src={Teacup}
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
          <p className="text-xs text-gray-500 mt-4"> SereniTea no sustituye la atención médica, psicológica o psiquiátrica profesional. La información y herramientas ofrecidas en esta aplicación tienen fines informativos, educativos y de acompañamiento emocional, y no deben considerarse como diagnóstico, tratamiento o terapia clínica.</p>
        </div>
      </footer>
    </div>
  );
}
