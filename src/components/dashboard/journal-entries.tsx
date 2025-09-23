'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db } from '@/lib/firebase-client';

interface JournalEntry {
  id: string;
  emotionEmoji: string;
  mainEmotion: string;
  journal: string;
  createdAt: Timestamp;
}

// Función para formatear la fecha de manera relativa
const formatDate = (timestamp: Timestamp) => {
  const date = timestamp.toDate();
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Hoy";
  if (diffDays === 2) return "Ayer";
  return `Hace ${diffDays - 1} días`;
};

const JournalEntries = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const q = query(
          collection(db, 'journal_entries'), 
          where('userId', '==', user.uid), 
          orderBy('createdAt', 'desc')
        );

        const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const entriesData: JournalEntry[] = [];
          querySnapshot.forEach((doc) => {
            entriesData.push({ id: doc.id, ...doc.data() } as JournalEntry);
          });
          setEntries(entriesData);
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-gray-700">Tus Entradas Recientes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length > 0 ? (
          entries.map(entry => (
            <div key={entry.id} className="border-b border-purple-100 pb-3 last:border-b-0">
              <p className="text-sm font-semibold text-gray-800">
                {entry.emotionEmoji} {entry.mainEmotion}
              </p>
              <p className="text-xs text-gray-500 mb-1">{formatDate(entry.createdAt)}</p>
              <p className="text-gray-700 font-cursive text-lg leading-relaxed truncate">
                {entry.journal}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">Aún no tienes entradas en tu diario.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default JournalEntries;
