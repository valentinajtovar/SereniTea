// es la pantalla de bienvenida a las encuestas

"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SurveyIntro() {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Perfil de Conductas Alimentarias</h1>
      <p className="mb-6 text-gray-700">
        A continuación encontrarás una serie de afirmaciones sobre tus hábitos
        alimentarios. Lee cada una con calma y selecciona con qué frecuencia se aplica a ti.
      </p>
      <Button onClick={() => router.push("/survey/questions")}>Comenzar encuesta</Button>
    </div>
  );
}
