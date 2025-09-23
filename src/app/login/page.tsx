'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase-client'; // Use client-side db
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, introduce una dirección de correo válida.",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres.",
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      
      const user = userCredential.user;
      
      // Correct: Verify if the user is in the 'paciente' collection
      const pacienteRef = collection(db, 'paciente');
      const q = query(pacienteRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Not a patient, sign out and show error
        await signOut(auth);
        toast({
          title: "Acceso denegado",
          description: "No tienes permiso para acceder a esta área. Solo los pacientes pueden iniciar sesión aquí.",
          variant: "destructive",
        });
      } else {
        // Is a patient, proceed to dashboard. Session is kept.
        console.log("Inicio de sesión de paciente exitoso:", user.email);
        toast({
          title: "¡Bienvenido/a de nuevo!",
          description: "Has iniciado sesión correctamente como paciente.",
        });
        router.push('/dashboard'); // Redirection to dashboard
      }

    } catch (error: any) {
      console.error("Error en el inicio de sesión:", error);
      let title = "Error en el inicio de sesión";
      let description = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";

      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          title = "Credenciales incorrectas";
          description = "El correo o la contraseña no son correctos. Por favor, verifica tus datos.";
          break;
        case 'auth/invalid-email':
          title = "Correo inválido";
          description = "El formato del correo electrónico no es válido.";
          break;
      }

      toast({
        title: title,
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function showPatients() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/get-patients');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const patientEmails = await response.json();
      
      toast({
        title: `Pacientes Registrados (${patientEmails.length})`,
        description: (
          <div className="mt-4 h-48 overflow-y-auto rounded-md border bg-secondary p-3">
            {patientEmails.length > 0 ? (
              <ul className="space-y-2">
                {patientEmails.map((email: string, index: number) => (
                  <li key={index} className="text-sm text-secondary-foreground">
                    {email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay pacientes registrados.
              </p>
            )}
          </div>
        ),
        duration: 10000,
      });

    } catch (error: any) {
      console.error("Error fetching patients: ", error);
      toast({
        title: "Error al obtener pacientes",
        description: "No se pudieron cargar los datos de los pacientes. Revisa la consola para más detalles.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container flex h-screen w-screen items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de nuevo</h1>
          <p className="text-sm text-muted-foreground">Introduce tus credenciales para acceder a tu cuenta</p>
        </div>
        <div className="grid gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="nombre@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Iniciar Sesión
              </Button>
            </form>
          </Form>
          <Button variant="outline" onClick={showPatients} className="w-full mt-4" disabled={isLoading}>
             {isLoading ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : "Mostrar Pacientes (Dev)"}
          </Button>
          <p className="px-8 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link
              href="/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
