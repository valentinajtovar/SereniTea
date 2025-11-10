'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { EAT26_SHORT, likert4 } from '@/lib/assessment-questions';
import type { AssessmentResult } from '@/types/assessment';
import { auth } from '@/lib/firebase-client';
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

  // Effect to ensure the user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // If not authenticated, redirect to login
        toast({ title: 'Acceso denegado', description: 'Debes iniciar sesión para continuar.', variant: 'destructive' });
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);

  const totalScore = useMemo(
    () => EAT26_SHORT.reduce((acc, q) => acc + (answers[q.id] ?? 0), 0),
    [answers]
  );

  const handleChange = (qid: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const canSubmit = EAT26_SHORT.every((q) => answers[q.id] !== undefined);

  const onSubmit = async () => {
    const user = auth.currentUser;
    if (!user || !userId) {
      toast({ title: 'Error de autenticación', description: 'Tu sesión no es válida. Por favor, inicia sesión de nuevo.', variant: 'destructive' });
      router.push('/login');
      return;
    }

    try {
      setSaving(true);
      const idToken = await user.getIdToken();

      const assessmentPayload: AssessmentResult = {
        userId,
        createdAt: Date.now(),
        instrument: 'EAT-26',
        answers: EAT26_SHORT.map((q) => ({ questionId: q.id, value: answers[q.id] })),
        totalScore,
      };

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(assessmentPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'No se pudo guardar la evaluación.');
      }

      toast({ title: 'Evaluación completada', description: 'Tus respuestas han sido guardadas.' });
      router.push('/dashboard');

    } catch (err: any) {
      toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };
  
  if (!userId) {
    // Render a loading state or nothing while checking auth
    return <p>Cargando...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Card className="rounded-2xl shadow">
        <CardHeader>
          <CardTitle>Evaluación Inicial (EAT-26 Breve)</CardTitle>
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
            <Button onClick={onSubmit} disabled={!canSubmit || saving} className="min-w-32">
              {saving ? 'Guardando…' : 'Finalizar y ver Dashboard'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
