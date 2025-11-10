'use client';

import * as React from 'react';
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };
type Slots = { mood?: string; city?: string; prefs?: string[] };

/* === Actividad genérica inmediata para usuarios fuera de las ciudades === */
const GENERIC_ACTIVITY = {
  id: 'generic-relax',
  title: 'Rutina personal de calma (en cualquier ciudad)',
  city: 'Cualquier ciudad',
  when: 'cuando puedas',
  description:
    'Tómate 10–15 minutos para respirar (técnica 4-7-8), escribir 5 líneas sobre cómo te sientes y dar una caminata corta en un lugar tranquilo. Es una propuesta simple y efectiva para reconectar contigo, sin importar dónde estés.',
  where: 'Tu lugar favorito cerca de casa',
  tags: ['genérica', 'respiración', 'journaling', 'caminata', 'autocuidado'],
};

export default function ActivityChatbot() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        '`¡Hola! 👋 Soy Sereni. Este es un espacio seguro y sin juicios. Cuéntame cómo te sientes y qué te provoca, yo te propongo planes cerca de ti 💚',
    },
  ]);
  const [state, setState] = useState<Slots>({});
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [askFor, setAskFor] = useState<'mood' | 'city' | 'prefs' | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  // --- Evitar doble llamada y duplicados de mensaje ---
  const didInit = useRef(false);

  // para descartar respuestas idénticas consecutivas (p. ej. doble render)
  function appendAssistantOnce(reply: string) {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === 'assistant' && last.content.trim() === reply.trim()) {
        return prev; // ya está
      }
      return [...prev, { role: 'assistant', content: reply }];
    });
  }

  async function callChat(payload: any) {
    setLoading(true);
    try {
      const r = await fetch('/api/discover/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'Fallo chat');

      appendAssistantOnce(j.reply);
      setState(j.state || {});
      setItems(j.items || []);
      setAskFor(j.askFor ?? null);
      setOptions(j.options ?? []);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    // primera llamada: no pasamos ningún input del usuario
    void callChat({ messages: [], state: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = async (val: string) => {
    const next = [...messages, { role: 'user', content: val } as Msg];
    setMessages(next);

    const newState = { ...state };
    if (askFor === 'mood') newState.mood = val;
    if (askFor === 'city') newState.city = val;
    if (askFor === 'prefs')
      newState.prefs = [...new Set([...(state.prefs || []), val])];

    await callChat({ messages: next, state: newState });
  };

  // “Otro” en ciudad → mostrar de inmediato la actividad genérica local
  const chooseCityOther = async () => {
    const next = [...messages, { role: 'user', content: 'Otro' } as Msg];
    setMessages(next);

    // 1) Reflejar estado en UI al instante
    setState((prev) => ({ ...prev, city: '— genérica —' }));
    appendAssistantOnce(
      'Como no estás en nuestras ciudades disponibles, te propongo esta actividad base pensada para cualquier ciudad 💫'
    );
    setItems([GENERIC_ACTIVITY]);
    // invita a elegir preferencia para refinar luego
    setAskFor('prefs');
    setOptions(['artística', 'naturaleza', 'movimiento', 'aprendizaje', 'relajación']);

    // 2) En segundo plano, notifica al backend (no bloquea la UI)
    void callChat({ messages: next, state, cityFallback: true });
  };

  const addToTasks = async (it: any) => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Necesitas iniciar sesión para añadir tareas.',
        variant: 'destructive',
      });
      return;
    }
    const res = await fetch('/api/discover/add-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: user.uid,
        title: it.title,
        description: `${it.title} — ${it.where ?? it.city} — ${
          it.when ?? 'próximamente'
        }`,
      }),
    });
    if (!res.ok) {
      toast({
        title: 'Error',
        description: 'No se pudo añadir la tarea.',
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'Añadido a tus tareas', description: it.title });
  };

  const OptionsBar = () =>
    askFor ? (
      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <Button key={opt} size="sm" variant="outline" onClick={() => choose(opt)}>
              {opt}
            </Button>
          ))}

          {/* “Otro” solo para ciudad */}
          {askFor === 'city' && (
            <Button size="sm" variant="secondary" onClick={chooseCityOther}>
              Otro
            </Button>
          )}
        </div>
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Descubre actividades seleccionadas especialmente para ti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[340px] overflow-y-auto p-2 border rounded-md bg-muted/20">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-xl text-sm ${
                    m.role === 'assistant'
                      ? 'bg-white'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> pensando…
              </div>
            )}
          </div>

          <OptionsBar />

        </CardContent>
      </Card>

      {/* Resultados */}
      {items.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <Card key={it.id}>
              <CardHeader>
                <CardTitle className="text-base">{it.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {it.city} • {it.when ?? 'próximamente'}
                </div>
                <p className="text-sm">{it.description}</p>
                {it.where && (
                  <div className="text-sm">
                    <span className="font-medium">Lugar:</span> {it.where}
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {(it.tags ?? []).map((t: string) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
                <Button size="sm" className="mt-2" onClick={() => addToTasks(it)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir a mis tareas
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// (opcional) export default también: