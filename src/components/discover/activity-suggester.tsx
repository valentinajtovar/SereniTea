"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type { SuggestCreativeActivitiesOutput } from "@/ai/flows/suggest-creative-activities";
import { suggestActivitiesAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Palette, Sparkles, PlusCircle } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  mood: z.string().min(1, "Por favor, selecciona un estado de ánimo."),
  location: z.string().min(2, "Por favor, introduce una ubicación."),
});

type FormData = z.infer<typeof formSchema>;

export function ActivitySuggester() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<SuggestCreativeActivitiesOutput | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: "Estresado",
      location: "Madrid, España",
    },
  });

  async function onSubmit(data: FormData) {
    startTransition(async () => {
      const result = await suggestActivitiesAction(data.mood, data.location);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        setSuggestions(null);
      } else {
        setSuggestions(result as SuggestCreativeActivitiesOutput);
      }
    });
  }

  const handleAddTask = (activity: string) => {
    // In a real app, this would update a global state or call an API
    toast({
      title: "Tarea Añadida",
      description: `"${activity}" se ha añadido a tus tareas diarias.`,
    });
  }

  return (
    <div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Encuentra tu Chispa</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de Ánimo Actual</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="¿Cómo te sientes?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Feliz">Feliz</SelectItem>
                        <SelectItem value="Triste">Triste</SelectItem>
                        <SelectItem value="Estresado">Estresado</SelectItem>
                        <SelectItem value="Aburrido">Aburrido</SelectItem>
                        <SelectItem value="Creativo">Creativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tu Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: tu ciudad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Obtener Sugerencias
              </Button>
            </CardContent>
          </form>
        </Form>
      </Card>

      {isPending && (
         <div className="text-center p-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Buscando inspiración...</p>
         </div>
      )}

      {suggestions && (
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Palette className="w-5 h-5 text-primary-foreground" />
                Actividades Creativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                {suggestions.activitySuggestions.map((activity, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>{activity}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleAddTask(activity)}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Añadir
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <MapPin className="w-5 h-5 text-primary-foreground" />
                Recomendaciones Locales
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                     <Image
                        src="https://picsum.photos/400/200"
                        alt="Mapa del área local"
                        data-ai-hint="mapa local"
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>
              <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                {suggestions.localRecommendations.map((place, i) => (
                  <li key={i}>{place}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
