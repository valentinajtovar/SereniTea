import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || 'serenitea';
const collName = process.env.MONGODB_COLLECTION || 'tca_chunks';
const indexName = process.env.VECTOR_INDEX_NAME || 'tca_index';
const EMB_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';

let client: MongoClient | null = null;

async function getCol() {
  if (!client) client = new MongoClient(uri);
  // @ts-ignore (topology optional en tipado)
  if (!client.topology?.isConnected?.()) await client.connect();
  return client.db(dbName).collection(collName);
}

export async function embed(text: string): Promise<number[]> {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMB_MODEL, input: [text] }),
  });
  const j: any = await r.json();
  if (!r.ok) throw new Error(`Embedding error: ${r.status} - ${JSON.stringify(j)}`);
  return j.data[0].embedding;
}

export type RAGHit = { title?: string; section?: string; chunk: string; score?: number; source_url?: string };

export async function vectorSearch(query: string, { limit = 8, tags }: { limit?: number; tags?: string[] } = {}) {
  const qv = await embed(query);
  const col = await getCol();

  const pipeline: any[] = [
    {
      $vectorSearch: {
        index: indexName,
        path: 'embedding',
        queryVector: qv,
        numCandidates: Math.max(150, limit * 20),
        limit,
        ...(tags?.length ? { filter: { tags: { $in: tags } } } : {}),
      },
    },
    { $project: { chunk: 1, title: 1, section: 1, source_url: 1, score: { $meta: 'vectorSearchScore' } } },
  ];

  const docs = (await col.aggregate(pipeline).toArray()) as RAGHit[];
  return docs;
}

export function compactContext(hits: RAGHit[], maxChars = 3500) {
  // Une texto de los chunks, limpiando cortes de palabras comunes de PDF OCR
  const normalize = (s: string) =>
    s
      .replace(/\n+/g, ' ')
      .replace(/(\w)-\s+(\w)/g, '$1$2') // une guiones de final de línea
      .replace(/\s{2,}/g, ' ')
      .trim();

  let out: string[] = [];
  let total = 0;
  for (const [i, h] of hits.entries()) {
    const head = `[${i + 1}] ${h.title ?? 'Fuente'} (${h.section ?? 's/n'})`;
    const body = normalize(h.chunk);
    const add = `\n${head}\n${body}\n`;
    if (total + add.length > maxChars) break;
    out.push(add);
    total += add.length;
  }
  return out.join('').trim();
}