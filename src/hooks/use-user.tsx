'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

// 1. Definir el tipo para los datos del paciente
type Paciente = {
  // Agrega aquí los campos que esperas de la base de datos
  _id: string;
  nombre_completo: string;
  correo: string;
  // ... otros campos
} | null;

// 2. Crear el contexto
type UserContextType = { paciente: Paciente, loading: boolean };
const UserContext = createContext<UserContextType>({ paciente: null, loading: true });

// 3. Crear el componente Provider
export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // Obtiene el usuario autenticado
  const [paciente, setPaciente] = useState<Paciente>(null);
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
        const res = await fetch(`/api/pacientes?uid=${user.uid}`);
        if (!res.ok) {
          throw new Error('Failed to fetch patient data');
        }
        const data = await res.json();
        setPaciente(data.data[0] || null);
      } catch (error) {
        console.error(error);
        setPaciente(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPaciente();
  }, [user]); // Depende del usuario de useAuth

  return (
    <UserContext.Provider value={{ paciente, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// 4. Crear un hook para consumir el contexto
export const useUser = () => useContext(UserContext);
