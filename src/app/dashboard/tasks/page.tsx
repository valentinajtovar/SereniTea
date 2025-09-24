'use client';

import MainHeader from "@/components/dashboard/main-header";
import Tasks from "@/components/dashboard/tasks"; // Reutilizaremos el componente de tareas
import { useAuth } from "@/hooks/use-auth";

export default function TasksPage() {
  const { user } = useAuth();

  return (
    <>
      <MainHeader />
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Todas tus Tareas</h1>
        <Tasks user={user} />
      </main>
    </>
  );
}
