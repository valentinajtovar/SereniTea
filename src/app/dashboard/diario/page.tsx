'use client';

import MainHeader from "@/components/dashboard/main-header";
import AllJournalEntries from "@/components/dashboard/all-journal-entries";

export default function DiarioPage() {

  return (
    <>
      <MainHeader />
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Todas tus Entradas del Diario</h1>
        <AllJournalEntries />
      </main>
    </>
  );
}
