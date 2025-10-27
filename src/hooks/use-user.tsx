'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Paciente } from '@/types';

// 1. Crear el contexto
type UserContextType = { paciente: Paciente | null, loading: boolean };
const UserContext = createContext<UserContextType>({ paciente: null, loading: true });

// 2. Crear el componente Provider con lógica mejorada
export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setPaciente(null);
      return;
    }

    async function fetchPaciente() {
      setLoading(true);
      try {
        // Corregido: Usar firebaseUid en lugar de uid
        const res = await fetch(`/api/pacientes?firebaseUid=${user.uid}`);
        
        // Si la respuesta es OK (200), procesamos los datos.
        if (res.ok) {
          const data = await res.json();
          // Corregido: La API ahora devuelve el objeto del paciente directamente
          setPaciente(data);
        } else {
          // Si la respuesta es 404, significa que el paciente no existe aún.
          // Esto es un estado válido, no un error.
          if (res.status === 404) {
            setPaciente(null);
          } else {
            // Para cualquier otro error (500, etc.), lanzamos una excepción.
            throw new Error('Failed to fetch patient data');
          }
        }
      } catch (error) {
        console.error("Error in fetchPaciente:", error);
        setPaciente(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPaciente();
  }, [user]);

  return (
    <UserContext.Provider value={{ paciente, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// 3. Crear un hook para consumir el contexto
export const useUser = () => useContext(UserContext);
