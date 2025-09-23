'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PlusCircle, CheckCircle2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { db, auth } from '@/lib/firebase-client';
import Tasks from '@/components/dashboard/tasks';
import JournalEntries from '@/components/dashboard/journal-entries';

// --- Emotion Stickers Data ---
const emotions = {
  Alegria: {
    emoji: '😊',
    subEmotions: ['Feliz', 'Emocionado', 'Orgulloso', 'Optimista'],
  },
  Calma: {
    emoji: '😌',
    subEmotions: ['Relajado', 'Tranquilo', 'En Paz', 'Satisfecho'],
  },
  Sorpresa: {
    emoji: '😮',
    subEmotions: ['Asombrado', 'Impactado', 'Confundido', 'Curioso'],
  },
  Tristeza: {
    emoji: '😢',
    subEmotions: ['Melancólico', 'Solo', 'Decepcionado', 'Cansado'],
  },
  Enojo: {
    emoji: '😠',
    subEmotions: ['Irritado', 'Frustrado', 'Molesto', 'Furioso'],
  },
};

type Emotion = keyof typeof emotions;

// --- Form Schema ---
const dailyEntrySchema = z.object({
  mainEmotion: z.string().min(1, 'Debes elegir una emoción principal.'),
  subEmotion: z.string().min(1, 'Debes elegir una emoción específica.'),
  journal: z.string().min(10, {
    message: 'Tu entrada debe tener al menos 10 caracteres.',
  }),
});

// --- Helper to get today's date string ---
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export default function PatientDashboard() {
  const [lastEntryDate, setLastEntryDate] = useState<string | null>(null);
  const [showFullForm, setShowFullForm] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const form = useForm<z.infer<typeof dailyEntrySchema>>({
    resolver: zodResolver(dailyEntrySchema),
    defaultValues: {
      mainEmotion: '',
      subEmotion: '',
      journal: '',
    },
  });

  const selectedMainEmotion = form.watch('mainEmotion') as Emotion | '';

  useEffect(() => {
    console.log("Dashboard: Setting up auth state listener...");
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        console.log("Dashboard: Auth listener - User FOUND", user);
        setCurrentUser(user);
      } else {
        console.log("Dashboard: Auth listener - User NOT found.");
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    const storedDate = localStorage.getItem('lastDailyEntryDate');
    const today = getTodayDateString();
    if (storedDate === today) {
      setShowFullForm(false);
    }
    setLastEntryDate(storedDate);

    return () => {
      console.log("Dashboard: Cleaning up auth state listener.");
      unsubscribe();
    };
  }, []);

  const onSubmit = async (data: z.infer<typeof dailyEntrySchema>) => {
    if (isAuthLoading) {
       console.warn("Submit blocked: Auth state is still loading.");
       toast({ title: "Por favor espera", description: "Estamos verificando tu sesión...", });
       return;
    }

    if (!currentUser) {
      console.error("Submit blocked: currentUser is null.", { isAuthLoading, currentUser });
      toast({
        title: "Error de autenticación",
        description: "Tu sesión no se pudo verificar. Por favor, recarga la página.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newEntry = {
        userId: currentUser.uid,
        createdAt: new Date(),
        mainEmotion: data.mainEmotion,
        subEmotion: data.subEmotion,
        journal: data.journal,
        emotionEmoji: emotions[data.mainEmotion as Emotion]?.emoji || ''
      };
      
      await addDoc(collection(db, 'journal_entries'), newEntry);

      const today = getTodayDateString();
      localStorage.setItem('lastDailyEntryDate', today);
      setLastEntryDate(today);
      setShowFullForm(false);
      form.reset();
      toast({
        title: "¡Registro guardado!",
        description: "Tu entrada de hoy ha sido guardada con éxito en la base de datos.",
        action: <CheckCircle2 className="text-green-500" />,
      });
    } catch (error: any) {
      console.error("Error al añadir el documento: ", error);
      // Comprobar si es un error de permisos de Firestore
      if (error.code === 'permission-denied') {
         toast({
          title: "Error de Permisos",
          description: "No tienes permiso para escribir en la base de datos. Revisa tus reglas de seguridad de Firestore.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error al guardar",
          description: "No se pudo guardar tu entrada. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddNewEntry = () => {
    setShowFullForm(true);
    form.reset(); // Clear form for the new entry
  };
  
  const EmotionSticker = ({ emoji, name, isSelected, onClick }: any) => (
    <div
      onClick={onClick}
      className={`cursor-pointer p-4 m-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${isSelected ? 'bg-purple-300 shadow-lg scale-105' : 'bg-white shadow-md'}`}>
      <div className="text-5xl">{emoji}</div>
      <div className="text-center mt-2 font-semibold text-lilac-foreground">{name}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-lilac p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content: Daily Check-in & Journal */}
        <div className="md:col-span-2 space-y-8">
          <div className="p-8 bg-white rounded-2xl shadow-lg">
            <h1 className="font-headline text-4xl text-gray-800 mb-2">
              Registro Diario
            </h1>
            <p className="text-gray-600 mb-6">
              Tómate un momento para conectar contigo. ¿Cómo te sientes hoy?
            </p>

            {showFullForm ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Emotion Selection */}
                  <FormField
                    control={form.control}
                    name="mainEmotion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-700">Elige tu emoción principal</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap justify-center pt-4">
                            {Object.keys(emotions).map((key) => (
                              <EmotionSticker
                                key={key}
                                emoji={emotions[key as Emotion].emoji}
                                name={key}
                                isSelected={field.value === key}
                                onClick={() => {
                                  field.onChange(key);
                                  form.setValue('subEmotion', ''); // Reset sub-emotion
                                }}
                              />
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Sub-Emotion Selection */}
                  {selectedMainEmotion && (
                    <FormField
                      control={form.control}
                      name="subEmotion"
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel className="text-lg font-semibold text-gray-700">¿Puedes ser más específico?</FormLabel>
                           <FormControl>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {emotions[selectedMainEmotion].subEmotions.map((sub) => (
                                <Button
                                  key={sub}
                                  type="button"
                                  variant={field.value === sub ? 'default' : 'outline'}
                                  onClick={() => field.onChange(sub)}
                                  className="rounded-full"
                                >
                                  {sub}
                                </Button>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Journal Entry */}
                  <FormField
                    control={form.control}
                    name="journal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold text-gray-700">Tu Diario</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Escribe sobre tu día, tus pensamientos, tus sentimientos..."
                            className="resize-none h-48 p-4 font-cursive text-xl bg-amber-50 leading-relaxed"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Este es tu espacio seguro para expresarte.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isAuthLoading}>
                    {isAuthLoading ? 'Verificando sesión...' : 'Guardar Mi Día'}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-purple-200 rounded-xl">
                 <h2 className="font-headline text-2xl text-purple-700">¡Gracias por tu registro de hoy!</h2>
                 <p className="text-gray-600 mt-2 mb-6">Has hecho una pausa para tu bienestar. ¡Eso es genial!</p>
                 <Button onClick={handleAddNewEntry}>
                   <PlusCircle className="mr-2 h-4 w-4" /> Añadir otra entrada
                 </Button>
               </div>
            )}
          </div>

          <JournalEntries />

        </div>

        {/* Sidebar: Tasks */}
        <div className="space-y-8">
          <Tasks />
        </div>
      </div>
    </div>
  );
}
