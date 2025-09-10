'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileUp, Info, Loader2, CheckCircle } from 'lucide-react';

import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { registerPsychologistAction } from '@/app/actions';

const formSchema = z
  .object({
    fullName: z.string().min(3, 'El nombre completo es requerido.'),
    email: z.string().email('Por favor, introduce un correo electrónico válido.'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string(),
    specialization: z.string().min(3, 'La especialización es requerida.'),
    bio: z.string().min(10, 'La biografía debe tener al menos 10 caracteres.'),
    certificate: z.any().refine((files) => files?.length === 1, 'El certificado es requerido.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof formSchema>;

export default function RegisterPsychologistPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      specialization: '',
      bio: '',
      certificate: undefined,
    },
  });

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    const result = await registerPsychologistAction({
        fullName: data.fullName,
        email: data.email,
        specialization: data.specialization,
        bio: data.bio
    });

    setIsSubmitting(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else {
      setIsSubmitted(true);
    }
  }

  if (isSubmitted) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/50 p-4">
            <div className="mb-8 text-center">
                <Logo />
            </div>
            <Card className="w-full max-w-2xl text-center">
                <CardHeader>
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                    <CardTitle className="font-headline text-2xl mt-4">
                        ¡Solicitud Enviada!
                    </CardTitle>
                    <CardDescription>
                        Hemos recibido tu información. Nuestro equipo la revisará y recibirás una notificación por correo electrónico en un plazo de 3 a 5 días hábiles una vez que tu cuenta sea aprobada.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/">Volver al Inicio</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/50 p-4 py-12">
      <div className="mb-8 text-center">
        <Logo />
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Registro para Psicólogos y Centros de Salud
          </CardTitle>
          <CardDescription>
            Únete a nuestra red de profesionales. Completa el formulario para
            comenzar el proceso de verificación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Alex Chen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico Profesional</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialización</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Terapia Cognitivo-Conductual, Trastornos Alimenticios"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografía Corta</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe tu enfoque, experiencia y filosofía..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="certificate"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Certificado Profesional / Licencia</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="certificate-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Haz clic para subir</span> o
                              arrastra y suelta
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF, PNG, JPG (MÁX. 5MB)
                            </p>
                          </div>
                          <Input
                            id="certificate-upload"
                            type="file"
                            className="hidden"
                            onChange={(e) => onChange(e.target.files)}
                            {...rest}
                          />
                        </label>
                      </div>
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
                />

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Proceso de Revisión</AlertTitle>
                <AlertDescription>
                  Después de enviar, tu solicitud será revisada manualmente por
                  nuestro equipo. Recibirás una notificación por correo electrónico
                  en un plazo de 3 a 5 días hábiles.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                 {isSubmitting ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando Solicitud...
                    </>
                ) : (
                    'Enviar Solicitud de Registro'
                )}
              </Button>
              <div className="mt-4 text-center text-sm">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="underline">
                  Inicia sesión aquí
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
