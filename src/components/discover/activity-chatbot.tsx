'use client';

import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus } from 'lucide-react';

type TextMsg = { role: 'user' | 'assistant'; kind: 'text'; content: string };
type ItemsMsg = { role: 'assistant'; kind: 'items'; items: any[] };
type Msg = TextMsg | ItemsMsg;

type Slots = { mood?: string; city?: string; prefs?: string[] };

/** Actividad genérica para ciudades fuera del catálogo */
const GENERIC_ACTIVITY = {
  id: 'generic-relax',
  title: 'Caminata consciente de 20 minutos',
  city: 'Tu ciudad',
  when: 'Hoy (cualquier hora)',
  description:
    'Camina a paso suave y practica 5-4-3-2-1 (lo que ves, tocas, oyes, hueles y saboreas). Cierra con 10 respiraciones profundas.',
  where: 'Parque o barrio cercano',
  tags: ['naturaleza', 'atención_plena', 'respiración'],
};

export default function ActivityChatbot() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      kind: 'text',
      content:
        '¡Hola! 👋 Soy Sereni. Este es un espacio seguro y sin juicios. Cuéntame cómo te sientes y qué te provoca; yo te propongo planes cerca de ti 💚',
    },
  ]);
  const [state, setState] = useState<Slots>({});
  const [loading, setLoading] = useState(false);
  const [askFor, setAskFor] = useState<'mood' | 'city' | 'prefs' | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  // Evitar doble init
  const didInit = useRef(false);

  // Autoscroll
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  // ⚠️ Ignorar una sola vez los items del backend (para no duplicar la actividad genérica)
  const ignoreNextItemsRef = useRef(false);

  /* ——— helpers para agregar mensajes evitando duplicados ——— */

  function appendAssistantTextOnce(reply: string) {
    if (!reply) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.kind === 'text' && last.role === 'assistant' && last.content.trim() === reply.trim()) {
        return prev;
      }
      return [...prev, { role: 'assistant', kind: 'text', content: reply }];
    });
  }

  function appendItemsOnce(items: any[]) {
    if (!items || items.length === 0) return;
    setMessages((prev) => {
      // evitar duplicar si ya existe un bloque con los mismos ids en cualquier parte
      const incomingIds = new Set(items.map((i: any) => i.id));
      const exists = prev.some(
        (m) => m.kind === 'items' && (m as ItemsMsg).items.length === items.length &&
               (m as ItemsMsg).items.every((it) => incomingIds.has(it.id))
      );
      if (exists) return prev;

      return [...prev, { role: 'assistant', kind: 'items', items }];
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

      if (j.reply) appendAssistantTextOnce(j.reply);
      setState(j.state || {});
      setAskFor(j.askFor ?? null);
      setOptions(j.options ?? []);

      // Si acabamos de inyectar el fallback genérico en el cliente, ignoramos UNA respuesta con items
      if (ignoreNextItemsRef.current) {
        ignoreNextItemsRef.current = false; // reset
      } else if (Array.isArray(j.items) && j.items.length) {
        appendItemsOnce(j.items);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    void callChat({ messages: [], state: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = async (val: string) => {
    // mostrar el mensaje del usuario
    setMessages((prev) => [...prev, { role: 'user', kind: 'text', content: val }]);

    // construir state a enviar
    const newState = { ...state };
    if (askFor === 'mood') newState.mood = val;
    if (askFor === 'city') newState.city = val;
    if (askFor === 'prefs') newState.prefs = [...new Set([...(state.prefs || []), val])];

    await callChat({ messages: [...messages, { role: 'user', kind: 'text', content: val }], state: newState });
  };

  /** “Otro” en ciudad -> mostrar inmediata actividad genérica dentro del chat y pedir prefs */
  const chooseCityOther = async () => {
    const userMsg: TextMsg = { role: 'user', kind: 'text', content: 'Otro' };
    setMessages((prev) => [...prev, userMsg]);

    setState((prev) => ({ ...prev, city: '— genérica —' }));

    appendAssistantTextOnce(
      'Como no estás en nuestras ciudades disponibles, te propongo esta actividad base pensada para cualquier ciudad 💫'
    );
    appendItemsOnce([GENERIC_ACTIVITY]);

    // Mostramos chips de preferencias (usando claves que entiende el backend)
    setAskFor('prefs');
    setOptions(['artistica', 'movida', 'tranquila', 'naturaleza', 'social', 'aprendizaje']);

    // ⚠️ evita que la siguiente respuesta del backend vuelva a añadir los mismos items
    ignoreNextItemsRef.current = true;

    // llamada no bloqueante para mantener consistencia del backend
    void callChat({ messages: [...messages, userMsg], state, cityFallback: true });
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
        description: `${it.title} — ${it.where ?? it.city} — ${it.when ?? 'próximamente'}`,
      }),
    });
    if (!res.ok) {
      toast({ title: 'Error', description: 'No se pudo añadir la tarea.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Añadido a tus tareas', description: it.title });
  };

  /* ——— UI ——— */

  const Bubble = ({ role, children }: { role: Msg['role']; children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={`flex ${role === 'assistant' ? 'justify-start' : 'justify-end'}`}
    >
      {role === 'assistant' && (
        <div className="mr-2 mt-1 h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
          <span className="text-[13px]">🌱</span>
        </div>
      )}
      <div
        className={[
          'px-3 py-2 rounded-2xl text-sm max-w-[88%] shadow-sm',
          role === 'assistant'
            ? 'bg-white border border-muted/40 text-foreground'
            : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
        ].join(' ')}
      >
        {children}
      </div>
    </motion.div>
  );

  const ItemsBubble = ({ items }: { items: any[] }) => (
    <Bubble role="assistant">
      <div className="space-y-3">
        {items.map((it: any) => (
          <motion.div
            key={it.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Card className="overflow-hidden border-muted/50 hover:shadow-md transition-shadow w-full">
              <div className="h-2 w-full bg-gradient-to-r from-emerald-400/70 via-emerald-500/70 to-emerald-400/70" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base leading-tight">{it.title}</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {it.city} • {it.when ?? 'próximamente'}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{it.description}</p>
                {it.where && (
                  <div className="text-sm">
                    <span className="font-medium">Lugar: </span>
                    {it.where}
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {(it.tags ?? []).map((t: string) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
                <Button size="sm" className="mt-1" onClick={() => addToTasks(it)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir a mis tareas
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </Bubble>
  );

  const OptionsBar = () =>
    askFor ? (
      <div className="mt-3">
        <AnimatePresence initial={false}>
          <motion.div
            key={askFor}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {options.map((opt) => (
              <Button
                key={opt}
                size="sm"
                variant="secondary"
                className="rounded-full bg-white text-foreground hover:bg-emerald-50 border border-muted/40"
                onClick={() => choose(opt)}
              >
                {opt}
              </Button>
            ))}
            {askFor === 'city' && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={chooseCityOther}
              >
                Otro
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    ) : null;

  /* ———————————————————————————————————————————————— */

  return (
    <div className="space-y-6">
      <Card className="border-muted/50">
        <CardHeader className="pb-2" />
        <CardContent>
          <div className="relative rounded-xl border bg-muted/30 p-3 md:p-4">
            {/* Timeline */}
            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {messages.map((m, i) =>
                  m.kind === 'text' ? (
                    <Bubble key={i} role={m.role}>
                      {m.content}
                    </Bubble>
                  ) : (
                    <ItemsBubble key={i} items={m.items} />
                  )
                )}
              </AnimatePresence>

              {loading && (
                <div className="text-xs text-muted-foreground flex items-center gap-2 pl-9">
                  <Loader2 className="h-4 w-4 animate-spin" /> pensando…
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Chips de opciones */}
            <OptionsBar />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}