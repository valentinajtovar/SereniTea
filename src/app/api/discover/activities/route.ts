import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

type Query = {
  city?: string | null;
  mood?: string | null;
  prefs?: string | null; // csv de tags
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q: Query = {
      city: (searchParams.get('city') || '').trim(),
      mood: (searchParams.get('mood') || '').trim(),
      prefs: (searchParams.get('prefs') || '').trim(),
    };

    const client = await clientPromise;
    const db = client.db();
    const col = db.collection('discover_activities');

    // normalizamos ciudad
    const cityNorm = q.city ? q.city.toLocaleLowerCase() : '';

    const baseFilter: any = {};
    if (cityNorm) baseFilter.cityNorm = cityNorm;

    // traemos candidatas por ciudad (o todo si no envían ciudad)
    const candidates = await col
      .find(baseFilter)
      .project({ // devolvemos sólo lo que usa el front
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

    // ranking en memoria (pocas doc; si luego crece, pasamos a $meta / Atlas Search)
    const prefsList = q.prefs
      ? q.prefs.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
      : [];

    const mood = q.mood?.toLowerCase();

    const scored = candidates
      .map((a) => {
        let score = 0;
        if (mood && a.moods?.map((m: string) => m.toLowerCase()).includes(mood)) score += 2;
        if (prefsList.length && Array.isArray(a.tags)) {
          const t = a.tags.map((t: string) => t.toLowerCase());
          score += prefsList.reduce((acc, p) => (t.includes(p) ? acc + 1 : acc), 0);
        }
        return { id: a._id?.toString(), ...a, score };
      })
      .sort((a, b) => b.score - a.score || (b.createdAt?.valueOf() ?? 0) - (a.createdAt?.valueOf() ?? 0));

    return NextResponse.json({ items: scored }, { status: 200 });
  } catch (e) {
    console.error('GET /api/discover/activities error:', e);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}