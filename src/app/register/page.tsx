
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase-client';
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
  name: z.string().min(3, { message: "Por favor, introduce tu nombre completo." }),
  email: z.string().email({ message: "Por favor, introduce una dirección de correo válida." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  birthdate: z.string()
    .refine((val) => val && !isNaN(Date.parse(val)), {
      message: 'Por favor, introduce una fecha de nacimiento válida.',
    })
    .refine((val) => {
      const birthDate = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }, { message: 'Debes ser mayor de 18 años para registrarte.' }),
  anonymousName: z.string().min(3, { message: 'El nombre de usuario anónimo debe tener al menos 3 caracteres.' }),
});

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isRegisterLoading, setIsRegisterLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", birthdate: "", anonymousName: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsRegisterLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.name });

      const patientDocRef = doc(db, 'paciente', user.uid);

      await setDoc(patientDocRef, {
        nombre_completo: values.name,
        correo: values.email,
        nacimiento: Timestamp.fromDate(new Date(values.birthdate)),
        usuario_anonimo: values.anonymousName,
      });

      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada y tu perfil guardado.",
      });

      /*router.push('/login');*/
      router.push('/survey');
      
    } catch (error: any) {
      console.error("Registration error:", error);
      let description = "Ocurrió un error inesperado.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Este correo electrónico ya está en uso. Por favor, intenta con otro.";
      }
      toast({ title: "Error en el registro", description, variant: "destructive" });
    } finally {
      setIsRegisterLoading(false);
    }
  }

  return (
    <div className="container flex h-screen w-screen items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Crea una cuenta</h1>
          <p className="text-sm text-muted-foreground">Introduce tus datos para registrarte</p>
        </div>
        <div className="grid gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input placeholder="Tu nombre" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input placeholder="nombre@ejemplo.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="birthdate" render={({ field }) => (<FormItem><FormLabel>Fecha de Nacimiento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="anonymousName" render={({ field }) => (<FormItem><FormLabel>Nombre de Usuario Anónimo</FormLabel><FormControl><Input placeholder="ej. lago_azul" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                {isRegisterLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />} Registrarse
              </Button>
            </form>
          </Form>
          <p className="px-8 text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta? <Link href="/login" className="underline underline-offset-4 hover:text-primary">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
