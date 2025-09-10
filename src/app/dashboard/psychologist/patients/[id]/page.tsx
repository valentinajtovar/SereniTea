import { PatientDetail } from "@/components/psychologist/patient-detail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data for a single patient
const patientData = {
  id: "1",
  name: "Alex Miller",
  image: "https://picsum.photos/seed/alex/200",
  imageHint: "retrato persona joven",
  lastReport: "Hace 2 días",
  progress: 75,
  details: {
    age: 24,
    gender: "No binario",
    joined: "01 de Marzo, 2024",
    treatmentFocus: "Terapia Cognitivo-Conductual (TCC) para la ansiedad alimentaria.",
  },
};


export default function PatientDetailPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch patient data based on params.id
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
                <Link href="/dashboard/psychologist/patients">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a la Lista de Pacientes
                </Link>
            </Button>
            <h1 className="text-3xl font-bold font-headline">
                Perfil del Paciente
            </h1>
        </div>
        <PatientDetail patient={patientData} />
    </main>
  );
}
