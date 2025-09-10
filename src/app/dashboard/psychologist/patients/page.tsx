import { PatientList } from "@/components/psychologist/patient-list";

export default function PatientsPage() {
    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">
                    Gestión de Pacientes
                </h1>
                <p className="text-muted-foreground">
                    Supervisa el progreso, asigna tareas y revisa los reportes de tus pacientes.
                </p>
            </div>
            <PatientList />
        </main>
    );
}
