'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EAT26_SHORT, likert4 } from '@/lib/assessment-questions';
import type { AssessmentResult } from '@/types/assessment';
import { auth, db } from '@/lib/firebase-client';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

export default function AssessmentForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  // Auth guard (usar useEffect, no useMemo)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace('/login');
      } else {
        setUserId(u.uid);
      }
    });
    return () => unsub();
  }, [router]);

  const totalScore = useMemo(
    () => EAT26_SHORT.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0),
    [answers]
  );

  const handleChange = (qid: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const canSubmit =
    Boolean(userId) && EAT26_SHORT.every((q) => answers[q.id] !== undefined);

  const onSubmit = async () => {
    if (!userId) return;
    try {
      setSaving(true);
      const payload: AssessmentResult = {
        userId,
        createdAt: Date.now(),
        instrument: 'EAT-26',
        answers: EAT26_SHORT.map((q) => ({ questionId: q.id, value: answers[q.id] })),
        totalScore,
      };

      // Guarda en /paciente/{uid}/assessments/{autoId}
      const subcol = collection(doc(db, 'paciente', userId), 'assessments');
      await addDoc(subcol, {
        ...payload,
        createdAt: serverTimestamp(),
      });

      toast({ title: 'Assessment guardado', description: 'Tus respuestas han sido registradas.' });
      router.push('/dashboard'); // o una ruta de resultados
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message ?? 'No se pudo guardar.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Card className="rounded-2xl shadow">
        <CardHeader>
          <CardTitle>Assessment inicial (EAT-26 breve)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {EAT26_SHORT.map((q) => (
            <div key={q.id} className="space-y-2">
              <Label className="text-base">{q.text}</Label>
              <RadioGroup
                value={answers[q.id]?.toString()}
                onValueChange={(v) => handleChange(q.id, Number(v))}
                className="grid grid-cols-2 gap-2"
              >
                {likert4.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem id={`${q.id}-${opt.value}`} value={String(opt.value)} />
                    <Label htmlFor={`${q.id}-${opt.value}`}>{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm opacity-80">
              Puntaje total: <b>{totalScore}</b>
            </div>
            <Button onClick={onSubmit} disabled={!canSubmit || saving} className="min-w-32">
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
