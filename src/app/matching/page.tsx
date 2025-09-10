import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Medal, Stethoscope, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const specialists = [
  {
    name: "Dra. Evelyn Reed",
    title: "Especialista en Recuperación Consciente",
    image: "https://picsum.photos/seed/1/200",
    imageHint: "retrato profesional mujer",
    justification:
      "Su enfoque en la terapia cognitivo-conductual y la autocompasión se alinea con tus objetivos. Tiene experiencia en el manejo de la ansiedad en torno a las comidas.",
    details: [
      { icon: <Stethoscope />, text: "Especialista en T.C.A." },
      { icon: <Medal />, text: "10+ Años de Experiencia" },
    ],
    location: "Centro Médico Wellness Grove",
  },
  {
    name: "Dr. Carlos Vega",
    title: "Terapeuta Familiar y Nutricional",
    image: "https://picsum.photos/seed/2/200",
    imageHint: "retrato profesional hombre",
    justification:
      "Ideal si buscas un enfoque que involucre a tu sistema de apoyo. Combina la terapia conversacional con la orientación nutricional práctica.",
    details: [
      { icon: <Users />, text: "Terapia Familiar" },
      { icon: <Medal />, text: "8 Años de Experiencia" },
    ],
    location: "Clínica Armonía y Salud",
  },
  {
    name: "Centro MenteSana",
    title: "Atención Integral Multidisciplinar",
    image: "https://picsum.photos/seed/3/200",
    imageHint: "edificio moderno clínica",
    justification:
      "Ofrecen un programa completo con psicólogos, nutricionistas y médicos trabajando en conjunto, perfecto para un cuidado holístico.",
    details: [
      { icon: <Stethoscope />, text: "Equipo Multidisciplinar" },
      { icon: <Medal />, text: "15+ Años de Trayectoria" },
    ],
    location: "Instituto MenteSana",
  },
];

export default function MatchingPage() {
  return (
    <div className="min-h-screen bg-secondary/50 flex items-center justify-center py-12">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-4xl md:text-5xl font-bold font-headline">
            ¡Hemos encontrado algunas coincidencias para ti!
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Basándonos en tu evaluación, creemos que estos profesionales son
            ideales para guiarte. Elige el que mejor se adapte a tus
            necesidades.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specialists.map((specialist, index) => (
            <Card key={index} className="overflow-hidden shadow-lg flex flex-col">
              <CardHeader className="bg-primary/20 p-6 flex flex-col items-center text-center">
                <Image
                  src={specialist.image}
                  alt={specialist.name}
                  data-ai-hint={specialist.imageHint}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white shadow-md"
                />
                <CardTitle className="mt-4 text-2xl font-headline">
                  {specialist.name}
                </CardTitle>
                <CardDescription className="text-primary-foreground font-medium">
                  {specialist.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4 flex-grow">
                <div>
                  <h3 className="font-bold font-headline text-lg mb-2">
                    Por qué es una buena coincidencia
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {specialist.justification}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  {specialist.details.map((detail, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="text-primary-foreground">{detail.icon}</div>
                      <span>{detail.text}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-bold font-headline text-lg mb-2">
                    Ubicación
                  </h3>
                  <p className="text-muted-foreground text-sm">{specialist.location}</p>
                </div>
              </CardContent>
              <CardFooter className="bg-secondary/50 p-4">
                <Button className="w-full" asChild>
                  <Link href="/dashboard">Seleccionar y Continuar</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
             <Button variant="outline">
                Solicitar Coincidencias Diferentes
              </Button>
        </div>
      </div>
    </div>
  );
}
