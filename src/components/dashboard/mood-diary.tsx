
"use client";

import { useState } from 'react';
import { CheckCircle, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const moodLevels = {
  '0': { label: 'Mal', emotions: ['Triste', 'Enojado', 'Frustrado', 'Cansado'] },
  '1': { label: 'Más o menos', emotions: ['Ansioso', 'Preocupado', 'Confundido', 'Melancólico'] },
  '2': { label: 'Neutral', emotions: ['Neutral', 'Calmado', 'Indiferente', 'Reflexivo'] },
  '3': { label: 'Bien', emotions: ['Contento', 'Relajado', 'Optimista', 'Agradecido'] },
  '4': { label: 'Excelente', emotions: ['Feliz', 'Eufórico', 'Inspirado', 'Orgulloso'] },
};

type MoodLevelKey = keyof typeof moodLevels;

export function MoodDiary() {
  const { toast } = useToast();
  const [moodLevel, setMoodLevel] = useState<MoodLevelKey>('2');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSliderChange = (value: number[]) => {
    const key = String(value[0]) as MoodLevelKey;
    setMoodLevel(key);
    setSelectedEmotion(null); // Reset emotion when slider changes
  };

  const handleSave = () => {
    setIsSubmitted(true);
    toast({
        title: "Entrada Guardada",
        description: "Tu estado de ánimo ha sido registrado con éxito.",
    });
  };

  const handleNewEntry = () => {
    setIsSubmitted(false);
    setMoodLevel('2');
    setSelectedEmotion(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Registro Diario</CardTitle>
        <CardDescription>
          ¿Cómo te sientes hoy? Tus pensamientos están seguros aquí.
        </CardDescription>
      </CardHeader>
      {isSubmitted ? (
        <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-headline font-semibold">Entrada Registrada con Éxito</h3>
            <p className="text-muted-foreground mt-2">Puedes añadir otra entrada si tus sentimientos cambian.</p>
             <Button onClick={handleNewEntry} className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Nueva Entrada
            </Button>
        </CardContent>
      ) : (
        <>
        <CardContent className="space-y-8">
            <div>
            <h3 className="text-sm font-medium mb-4 text-center">Desliza para seleccionar tu estado de ánimo general</h3>
            <div className="p-4 rounded-lg bg-secondary/50">
                <Slider
                    defaultValue={[2]}
                    max={4}
                    step={1}
                    onValueChange={handleSliderChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                    <span>Mal</span>
                    <span>Más o menos</span>
                    <span>Neutral</span>
                    <span>Bien</span>
                    <span>Excelente</span>
                </div>
            </div>
            </div>

            {moodLevel && (
                <div>
                    <h3 className="text-sm font-medium mb-2">¿Qué emoción describe mejor cómo te sientes?</h3>
                    <div className="flex flex-wrap gap-2">
                        {moodLevels[moodLevel].emotions.map((emotion) => (
                            <Button
                                key={emotion}
                                variant={selectedEmotion === emotion ? "default" : "outline"}
                                onClick={() => setSelectedEmotion(emotion)}
                            >
                                {emotion}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <div>
            <h3 className="text-sm font-medium mb-2">Entrada de Diario (opcional)</h3>
            <Textarea
                placeholder="Cuéntame sobre tu día, tus pensamientos o cualquier cosa que tengas en mente..."
                rows={6}
            />
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSave} disabled={!selectedEmotion}>Guardar Entrada</Button>
        </CardFooter>
        </>
      )}
    </Card>
  );
}
