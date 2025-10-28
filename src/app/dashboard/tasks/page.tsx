'use client';

import MainHeader from "@/components/dashboard/main-header";
import AllTasks from "@/components/dashboard/all-tasks";

export default function TasksPage() {

  return (
    <>
      <MainHeader />
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Todas tus Tareas</h1>
        <AllTasks />
      </main>
    </>
  );
}
