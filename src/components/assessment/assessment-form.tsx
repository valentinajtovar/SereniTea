"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { matchPsychologistAction } from "@/app/actions";

const formSchema = z.object({
  eatingPatterns: z.string().min(1, "Por favor, selecciona una opción."),
  bodyImageConcerns: z.string().min(1, "Por favor, selecciona una opción."),
  emotionalState: z.string().min(1, "Por favor, selecciona una opción."),
  feelingsDescription: z
    .string()
    .min(10, "Por favor, describe tus sentimientos en al menos 10 caracteres."),
  goals: z.string().min(10, "Por favor, describe tus metas en al menos 10 caracteres."),
});

type FormData = z.infer<typeof formSchema>;

export function AssessmentForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eatingPatterns: "",
      bodyImageConcerns: "",
      emotionalState: "",
      feelingsDescription: "",
      goals: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    const assessmentSummary = `
      Patrones de alimentación: ${data.eatingPatterns}.
      Preocupaciones sobre la imagen corporal: ${data.bodyImageConcerns}.
      Estado emocional: ${data.emotionalState}.
      Sentimientos: ${data.feelingsDescription}.
      Metas: ${data.goals}.
    `;

    const result = await matchPsychologistAction(assessmentSummary);
    
    setIsSubmitting(false);

    if (result.error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      toast({
        title: "¡Evaluación Enviada!",
        description: "Estamos encontrando la mejor coincidencia para ti...",
      });
      // In a real app, you would pass the result data to the matching page.
      // For this example, we'll redirect to a static matching page.
      router.push("/matching");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Tu Evaluación</CardTitle>
        <CardDescription>
          Por favor, responde las siguientes preguntas honestamente.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="eatingPatterns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cómo describirías tus patrones de alimentación recientemente?</FormLabel>
                   <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="stable" />
                        </FormControl>
                        <FormLabel className="font-normal">Estables y regulares</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="irregular" />
                        </FormControl>
                        <FormLabel className="font-normal">Irregulares o saltándome comidas</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="overeating" />
                        </FormControl>
                        <FormLabel className="font-normal">Episodios de comer en exceso</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="restrictive" />
                        </FormControl>
                        <FormLabel className="font-normal">Sintiéndome muy restrictivo</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bodyImageConcerns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Con qué frecuencia te preocupas por la forma de tu cuerpo o tu peso?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una frecuencia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="rarely">Rara vez o nunca</SelectItem>
                      <SelectItem value="sometimes">A veces</SelectItem>
                      <SelectItem value="often">A menudo</SelectItem>
                      <SelectItem value="constantly">Casi constantemente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="emotionalState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cuál de estas opciones describe mejor tu estado emocional general últimamente?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado emocional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="content">Contento y tranquilo</SelectItem>
                      <SelectItem value="anxious">Ansioso o estresado</SelectItem>
                      <SelectItem value="sad">Triste o retraído</SelectItem>
                       <SelectItem value="irritable">Irritable o enojado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feelingsDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>En tus propias palabras, describe cualquier sentimiento o desafío que estés enfrentando.</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Siento ansiedad después de las comidas..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Qué esperas lograr al buscar ayuda?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Quiero construir una relación más saludable con la comida..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando tu Coincidencia...
                </>
              ) : (
                "Enviar Evaluación y Encontrar mi Coincidencia"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
