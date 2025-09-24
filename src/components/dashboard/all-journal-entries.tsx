'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase-client';
import { type JournalEntry } from '@/types';

const formatDetailedDate = (timestamp: Timestamp) => {
  const date = timestamp.toDate();
  const timeString = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return `${date.toLocaleDateString('es-ES')} a las ${timeString}`;
};

const AllJournalEntries = ({ user }: { user: User | null }) => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    setIsLoading(true);
    const q = query(collection(db, "journal_entries"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData: JournalEntry[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
      setEntries(entriesData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error al obtener las entradas del diario: ", error);
      toast({ title: "Error", description: "No se pudieron cargar las entradas del diario.", variant: "destructive" });
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user, toast]);

  return (
    <Card className="shadow-lg">
      <CardHeader><CardTitle>Tu Diario</CardTitle><CardDescription>Un espacio para todas tus reflexiones.</CardDescription></CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-purple-500" /><p className="ml-2 text-gray-500">Cargando...</p></div>
        ) : entries.length === 0 ? (
          <p className="text-center text-gray-500 italic py-4">No tienes entradas en tu diario.</p>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
                <div key={entry.id} className="p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-2xl">{entry.emotionEmoji}</div>
                        <div className="flex-grow">
                            <p className="text-gray-800 font-semibold">{entry.mainEmotion} - {entry.subEmotion}</p>
                            <p className="text-gray-600 break-words mt-1">{entry.journal}</p>
                            <p className="text-xs text-gray-500 mt-2">{formatDetailedDate(entry.createdAt)}</p>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AllJournalEntries;
