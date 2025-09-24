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
import MainHeader from '@/components/dashboard/main-header';
import QuickTip from '@/components/dashboard/quick-tip';

const emotions = {
  Alegria: { emoji: '😊', subEmotions: ['Feliz', 'Emocionado', 'Orgulloso', 'Optimista'] },
  Calma: { emoji: '😌', subEmotions: ['Relajado', 'Tranquilo', 'En Paz', 'Satisfecho'] },
  Sorpresa: { emoji: '😮', subEmotions: ['Asombrado', 'Impactado', 'Confundido', 'Curioso'] },
  Tristeza: { emoji: '😢', subEmotions: ['Melancólico', 'Solo', 'Decepcionado', 'Cansado'] },
  Enojo: { emoji: '😠', subEmotions: ['Irritado', 'Frustrado', 'Molesto', 'Furioso'] },
};
type Emotion = keyof typeof emotions;

const dailyEntrySchema = z.object({
  mainEmotion: z.string().min(1, 'Debes elegir una emoción principal.'),
  subEmotion: z.string().min(1, 'Debes elegir una emoción específica.'),
  journal: z.string().min(10, { message: 'Tu entrada debe tener al menos 10 caracteres.' }),
});

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export default function PatientDashboard() {
  const [lastEntryDate, setLastEntryDate] = useState<string | null>(null);
  const [showFullForm, setShowFullForm] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const form = useForm<z.infer<typeof dailyEntrySchema>>({
    resolver: zodResolver(dailyEntrySchema),
    defaultValues: { mainEmotion: '', subEmotion: '', journal: '' },
  });

  const selectedMainEmotion = form.watch('mainEmotion') as Emotion | '';

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });

    const storedDate = localStorage.getItem('lastDailyEntryDate');
    const today = getTodayDateString();
    if (storedDate === today) {
      setShowFullForm(false);
    }
    setLastEntryDate(storedDate);

    return () => unsubscribe();
  }, []);

  const onSubmit = async (data: z.infer<typeof dailyEntrySchema>) => {
    if (!currentUser) {
      toast({ title: "Error", description: "Sesión no encontrada. Recarga la página.", variant: "destructive" });
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
      toast({ title: "¡Registro guardado!", description: "Tu entrada ha sido guardada.", action: <CheckCircle2 className="text-green-500" /> });
    } catch (error: any) {
      console.error("Error al añadir el documento: ", error);
      toast({ title: "Error al guardar", description: "No se pudo guardar tu entrada.", variant: "destructive" });
    }
  };

  const handleAddNewEntry = () => {
    setShowFullForm(true);
    form.reset();
  };
  
  const EmotionSticker = ({ emoji, name, isSelected, onClick }: any) => (
    <div onClick={onClick} className={`cursor-pointer p-4 m-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${isSelected ? 'bg-purple-300 shadow-lg scale-105' : 'bg-white shadow-md'}`}>
      <div className="text-5xl">{emoji}</div>
      <div className="text-center mt-2 font-semibold text-lilac-foreground">{name}</div>
    </div>
  );

  const greetingName = currentUser?.displayName || 'de nuevo';

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      <main className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {greetingName}</h1>
            <p className="text-gray-600">¿Listo para continuar tu viaje? Estamos aquí contigo.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- COLUMNA IZQUIERDA (PRINCIPAL) --- */}
            <div className="lg:col-span-2 space-y-8">
              <div className="p-8 bg-white rounded-2xl shadow-lg">
                <h2 className="font-headline text-3xl text-gray-800 mb-2">Registro Diario</h2>
                <p className="text-gray-600 mb-6">Tómate un momento para conectar contigo. ¿Cómo te sientes hoy?</p>

                {showFullForm ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      {/* ... (campos del formulario) ... */}
                      <FormField control={form.control} name="mainEmotion" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold text-gray-700">Elige tu emoción principal</FormLabel>
                            <FormControl>
                              <div className="flex flex-wrap justify-center pt-4">
                                {Object.keys(emotions).map((key) => (
                                  <EmotionSticker key={key} emoji={emotions[key as Emotion].emoji} name={key} isSelected={field.value === key} onClick={() => { field.onChange(key); form.setValue('subEmotion', ''); }} />
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                      {selectedMainEmotion && (
                        <FormField control={form.control} name="subEmotion" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg font-semibold text-gray-700">¿Puedes ser más específico?</FormLabel>
                              <FormControl>
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {emotions[selectedMainEmotion].subEmotions.map((sub) => (<Button key={sub} type="button" variant={field.value === sub ? 'default' : 'outline'} onClick={() => field.onChange(sub)} className="rounded-full">{sub}</Button>))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                      )}

                      <FormField control={form.control} name="journal" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold text-gray-700">Tu Diario</FormLabel>
                            <FormControl><Textarea placeholder="Escribe sobre tu día..." className="resize-none h-48 p-4 text-xl bg-amber-50 leading-relaxed" {...field} /></FormControl>
                            <FormDescription>Este es tu espacio seguro.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                      <Button type="submit" size="lg" className="w-full font-bold text-lg" disabled={isAuthLoading}>{isAuthLoading ? 'Verificando...' : 'Guardar Mi Día'}</Button>
                    </form>
                  </Form>
                ) : (
                  <div className="text-center p-8 border-2 border-dashed border-purple-200 rounded-xl">
                    <h2 className="font-headline text-2xl text-purple-700">¡Gracias por tu registro de hoy!</h2>
                    <p className="text-gray-600 mt-2 mb-6">¡Has hecho una pausa para tu bienestar!</p>
                    <Button onClick={handleAddNewEntry}><PlusCircle className="mr-2 h-4 w-4" /> Añadir otra entrada</Button>
                  </div>
                )}
              </div>

              {/* --- ENTRADAS RECIENTES MOVIDAS AQUÍ --- */}
              <JournalEntries user={currentUser} />

            </div>

            {/* --- COLUMNA DERECHA (LATERAL) --- */}
            <div className="space-y-8">
              <QuickTip />
              <Tasks />
              {/* El componente MoodTracker (los cuadrados de colores) se mantiene aquí */}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
