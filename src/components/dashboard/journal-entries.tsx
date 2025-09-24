'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from '@/lib/firebase-client';
import MoodTracker from './mood-tracker';

export interface JournalEntry {
  id: string;
  emotionEmoji: string;
  mainEmotion: string;
  journal: string;
  createdAt: Timestamp;
}

const formatDetailedDate = (timestamp: Timestamp) => {
  const date = timestamp.toDate();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const timeString = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  if (date >= today) {
    return `Hoy a las ${timeString}`;
  } else if (date >= yesterday) {
    return `Ayer a las ${timeString}`;
  } else {
    return `${date.toLocaleDateString('es-ES')} a las ${timeString}`;
  }
};


const JournalEntries = ({ user }: { user: User | null }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
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
    } else {
      setEntries([]);
    }
  }, [user]);

  return (
    <>
      <MoodTracker entries={entries} />

      <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-gray-700">Tus Entradas Recientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {entries.length > 0 ? (
            entries.map(entry => (
              <div key={entry.id} className="border-b border-purple-100 pb-3 last:border-b-0">
                <div className="flex justify-between items-start">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">
                            {entry.emotionEmoji} {entry.mainEmotion}
                        </p>
                        <p className="text-gray-700 text-lg leading-relaxed break-words">
                            {entry.journal}
                        </p>
                    </div>
                    <p className="text-xs text-gray-500 text-right flex-shrink-0 ml-4">{formatDetailedDate(entry.createdAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Aún no tienes entradas en tu diario.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default JournalEntries;
