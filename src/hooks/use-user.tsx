import { useAuth } from "@/src/hooks/use-auth";
import { useEffect, useState } from "react";

export function useUser() {
  const { user } = useAuth();
  const [paciente, setPaciente] = useState<any>(null);

  useEffect(() => {
    if (!user?.uid) return;
    async function fetchPaciente() {
      const res = await fetch(`/api/pacientes?uid=${user.uid}`);
      const data = await res.json();
      setPaciente(data.data[0] || null);
    }
    fetchPaciente();
  }, [user]);

  return paciente;
}
