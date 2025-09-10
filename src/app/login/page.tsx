import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/50 p-4">
      <div className="mb-8 text-center">
        <Logo />
      </div>
      <Tabs defaultValue="patient" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="patient">Paciente</TabsTrigger>
          <TabsTrigger value="psychologist">Psicólogo</TabsTrigger>
        </TabsList>
        <TabsContent value="patient">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Iniciar Sesión como Paciente
              </CardTitle>
              <CardDescription>
                Bienvenido de nuevo. Continúa tu viaje hacia la recuperación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-patient">Correo Electrónico</Label>
                <Input
                  id="email-patient"
                  type="email"
                  placeholder="tu@email.com"
                  defaultValue="alex.miller@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-patient">Contraseña</Label>
                <Input id="password-patient" type="password" defaultValue="password123" />
              </div>
              <Button type="submit" className="w-full" asChild>
                <Link href="/dashboard">Iniciar Sesión</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="psychologist">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Portal para Psicólogos
              </CardTitle>
              <CardDescription>
                Accede a tu panel para gestionar a tus pacientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-psychologist">
                  Correo Electrónico Profesional
                </Label>
                <Input
                  id="email-psychologist"
                  type="email"
                  placeholder="profesional@email.com"
                  defaultValue="ma.carrillo2@uniandes.edu.co"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-psychologist">Contraseña</Label>
                <Input id="password-psychologist" type="password" defaultValue="securepass456" />
              </div>
              <Button type="submit" className="w-full" asChild>
                <Link href="/dashboard/psychologist">Iniciar Sesión</Link>
              </Button>
              <div className="mt-4 text-center text-sm">
                ¿No tienes una cuenta?{" "}
                <Link href="/register-psychologist" className="underline">
                  Regístrate aquí
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
