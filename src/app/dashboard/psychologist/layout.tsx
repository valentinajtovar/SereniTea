import { PsychologistHeader } from "@/components/shared/psychologist-header";

export default function PsychologistDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PsychologistHeader />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
