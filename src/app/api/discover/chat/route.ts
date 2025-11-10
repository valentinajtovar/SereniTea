export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// -------------------- Tipos --------------------
type Msg = { role: 'user' | 'assistant'; content: string };
type Slots = {
  mood?: string;     // ansiedad | estrés | triste | neutral | alegre
  city?: string;     // bogotá | medellín | cali | barranquilla | otro
  prefs?: string[];  // artistica | movida | tranquila | naturaleza | social | aprendizaje ...
  /** Marca que ya mostramos el fallback genérico para ciudades fuera de catálogo */
  fallbackShown?: boolean;
};

type DiscoverActivity = {
  _id?: any;
  title: string;
  city: string;
  cityNorm?: string;
  description: string;
  tags: string[];
  moods?: string[];
  durationMin?: number;
  where?: string;
  when?: string;
  organizer?: string;
  createdAt?: Date;
};

// -------------------- Utils --------------------
function norm(s?: string): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

function tagsFromPrefs(prefs?: string[]) {
  const set = new Set<string>();
  (prefs ?? []).forEach((p) => (PREF_TO_TAGS[p] || []).forEach((t) => set.add(norm(t))));
  return [...set];
}

// -------------------- Constantes --------------------
const CANON = [
  { norm: 'bogota',       label: 'Bogotá' },
  { norm: 'medellin',     label: 'Medellín' },
  { norm: 'cali',         label: 'Cali' },
  { norm: 'barranquilla', label: 'Barranquilla' },
];
const CANON_CITIES = CANON.map((c) => c.norm);

const MOODS = ['ansiedad', 'estrés', 'triste', 'neutral', 'alegre'];
const MOODS_NORM = MOODS.map(norm);

const PREF_TO_TAGS: Record<string, string[]> = {
  artistica:   ['arte', 'creatividad', 'museo', 'collage', 'pintura', 'escritura', 'journal'],
  movida:      ['baile', 'caminata', 'aire_libre', 'yoga', 'movimiento', 'respiración'],
  tranquila:   ['atención_plena', 'respiración', 'relajación', 'meditación', 'calma'],
  naturaleza:  ['naturaleza', 'parque', 'aire_libre', 'caminata'],
  social:      ['grupo', 'comunidad', 'guiado', 'taller'],
  aprendizaje: ['taller', 'psicoeducación', 'autoconocimiento', 'reflexión', 'charla'],
};

// -------------------- Fallback general --------------------
function generalFallback(cityLabel?: string) {
  return [
    {
      id: 'basic-walk',
      title: 'Caminata consciente de 20 minutos',
      city: cityLabel || 'Tu ciudad',
      description:
        'Camina a paso suave y practica 5-4-3-2-1 (lo que ves, tocas, oyes, hueles y saboreas). Cierra con 10 respiraciones profundas.',
      tags: ['naturaleza', 'atención_plena', 'respiración'],
      moods: ['ansiedad', 'estrés', 'neutral'],
      durationMin: 20,
      where: 'Parque o barrio cercano',
      when: 'Hoy (cualquier hora)',
      organizer: 'Serenitea Labs',
      createdAt: new Date(),
    },
  ];
}

// -------------------- Mongo helpers --------------------
async function fetchActivities(slots: Slots) {
  const client = await clientPromise;
  const db = client.db();
  const col = db.collection<DiscoverActivity>('discover_activities');

  const cityNorm = norm(slots.city);
  const canon = CANON.find(c => c.norm === cityNorm);
  const isCanon = !!canon;

  // Si la ciudad NO es de las 4 canónicas → fallback general (se filtra en el handler)
  if (!isCanon) {
    return generalFallback(slots.city);
  }

  const docs = await col
    .find({
      $or: [
        { cityNorm },               // casos nuevos seed con cityNorm
        { city: canon!.label },     // casos guardados solo con "Bogotá", "Medellín", etc.
      ],
    })
    .project({
      title: 1,
      city: 1,
      description: 1,
      tags: 1,
      moods: 1,
      durationMin: 1,
      where: 1,
      when: 1,
      organizer: 1,
      createdAt: 1,
    })
    .toArray();

  const prefTags = tagsFromPrefs(slots.prefs).map(norm);
  const moodNorm = norm(slots.mood);

  type Ranked = DiscoverActivity & { id: string; _prefHits: number; _moodMatch: 0 | 1 };

  const ranked: Ranked[] = docs.map((d) => {
    const activityTagsNorm = (d.tags || []).map(norm);
    const prefHits = prefTags.length
      ? activityTagsNorm.filter((t) => prefTags.includes(t)).length
      : 0;

    const moodMatch: 0 | 1 =
      moodNorm && d.moods?.some((m) => norm(m) === moodNorm) ? 1 : 0;

    return {
      ...d,
      id: d._id?.toString?.() ?? `${d.title}-${d.city}`,
      _prefHits: prefHits,
      _moodMatch: moodMatch,
    };
  });

  ranked.sort((a, b) => {
    if (b._prefHits !== a._prefHits) return b._prefHits - a._prefHits;        // Preferencias
    if (b._moodMatch !== a._moodMatch) return b._moodMatch - a._moodMatch;    // Ánimo
    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;             // Reciente
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bt - at;
  });

  return ranked.slice(0, 3); // Top 3
}

// -------------------- Handler --------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages = [],
      state = {},
      cityFallback,
    }: {
      messages: Msg[];
      state?: Slots;
      cityFallback?: boolean;
    } = body;

    // (A) Usuario eligió "Otro" → mostrar SOLO una vez la actividad base
    if (cityFallback) {
      const newState: Slots = { ...state, city: 'otro', fallbackShown: true };
      const items = generalFallback();
      // Puedes dejar un reply corto o null; lo importante es no volver a repetir luego.
      return NextResponse.json(
        {
          reply: 'Espero haberte ayudado 👋',
          state: newState,
          items,
        },
        { status: 200 }
      );
    }

    // 1) Pedir estado de ánimo (sin "Otro")
    if (!state.mood || !MOODS_NORM.includes(norm(state.mood))) {
      return NextResponse.json(
        {
          reply: 'Para empezar, ¿qué sientes hoy? No hay respuestas correctas: solo elige la que más se acerque 💭',
          state,
          items: [],
          askFor: 'mood',
          options: MOODS,
        },
        { status: 200 }
      );
    }

    // 2) Pedir ciudad (siempre 4 opciones visibles)
    if (!state.city) {
      return NextResponse.json(
        {
          reply: 'Gracias por compartirlo. Ahora, ¿en qué ciudad te encuentras? Puedo mostrarte actividades locales ✨',
          state,
          items: [],
          askFor: 'city',
          options: CANON.map((c) => c.label),
        },
        { status: 200 }
      );
    }

    // 3) Pedir preferencias (sin "Otro")
    if (!state.prefs || state.prefs.length === 0) {
      const prefOptions = Object.keys(PREF_TO_TAGS);
      return NextResponse.json(
        {
          reply: 'Perfecto. Para afinar las recomendaciones: ¿qué tipo de plan te provoca hoy? Puedes escoger la que más te llame 💡',
          state,
          items: [],
          askFor: 'prefs',
          options: prefOptions,
        },
        { status: 200 }
      );
    }

    // 4) Recomendar (Top 3 con prioridad Ciudad > Preferencias > Ánimo)
    const isCanonCity = CANON_CITIES.includes(norm(state.city));

    // 🔒 Fix anti-duplicado:
    // Si NO es ciudad canónica y YA mostramos el fallback (fallbackShown),
    // NO vuelvas a enviar items (evita duplicar tarjeta genérica).
    if (!isCanonCity && state.fallbackShown) {
      return NextResponse.json(
        { reply: null, state, items: [] },
        { status: 200 }
      );
    }

    // Si no es canónica y aún no mostramos fallback (ej. flujo viejo), envíalo una vez
    if (!isCanonCity) {
      const items = generalFallback();
      const newState: Slots = { ...state, fallbackShown: true };
      return NextResponse.json(
        {
          reply: 'Como no estás en nuestras ciudades disponibles, te propongo esta actividad base pensada para cualquier ciudad 👋',
          state: newState,
          items,
        },
        { status: 200 }
      );
    }

    // Ciudad canónica → buscar en BD
    const items = await fetchActivities(state);
    const canon = CANON.find((c) => c.norm === norm(state.city));
    const cityLabel = canon?.label ?? state.city ?? 'tu ciudad';

    const head = `Con lo que me contaste, estas 3 opciones en ${cityLabel} podrían gustarte 🌿:`;

    return NextResponse.json(
      { reply: head, state, items },
      { status: 200 }
    );
  } catch (e) {
    console.error('discover chat error', e);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}