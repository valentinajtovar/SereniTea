import { TaskAssignment } from "@/components/psychologist/task-assignment";

export default function AssignTasksPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Asignar Tareas</h1>
        <p className="text-muted-foreground">
          Crea y asigna nuevas tareas para ayudar a tus pacientes en su
          recuperación.
        </p>
      </div>
      <TaskAssignment />
    </main>
  );
}
