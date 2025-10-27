'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { auth } from '@/lib/firebase-client';
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
  email: z.string().email({ message: "Por favor, introduce una dirección de correo válida." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoginLoading(true);
    
    try {
      // Paso 1: Simplemente inicia sesión.
      await signInWithEmailAndPassword(auth, values.email, values.password);
      
      // Paso 2: Muestra un mensaje de éxito genérico.
      // El AuthProvider y el UserProvider se encargarán de cargar los datos en la siguiente página.
      toast({
        title: "¡Bienvenido/a de nuevo!",
        description: "Has iniciado sesión correctamente.",
      });

      // Paso 3: Redirige al dashboard.
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Login error:", error);
      let description = "Ocurrió un error inesperado.";
      // Maneja errores de autenticación específicos para dar mejor feedback al usuario
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        description = "Las credenciales son incorrectas. Por favor, verifica tu correo y contraseña.";
      }
      toast({ title: "Error en el inicio de sesión", description, variant: "destructive" });
    } finally {
      setIsLoginLoading(false);
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
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input placeholder="nombre@ejemplo.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" className="w-full" disabled={isLoginLoading}>
                {isLoginLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />} Iniciar Sesión
              </Button>
            </form>
          </Form>
          <p className="px-8 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta? <Link href="/register" className="underline underline-offset-4 hover:text-primary">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
