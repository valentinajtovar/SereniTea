import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "serenitea";
const collName = process.env.MONGODB_COLLECTION || "tca_chunks";
const indexName = process.env.VECTOR_INDEX_NAME || "tca_index";

let client: MongoClient | null = null;
async function getCol() {
  if (!client) client = new MongoClient(uri);
  if (!client.topology?.isConnected?.()) await client.connect();
  return client.db(dbName).collection(collName);
}

async function embed(text: string): Promise<number[]> {
  const model = process.env.EMBEDDING_MODEL || "text-embedding-3-large";
  const r = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ model, input: [text] })
  });
  const j: any = await r.json();
  if (!r.ok) throw new Error(`Embedding error: ${r.status} - ${JSON.stringify(j)}`);
  return j.data[0].embedding;
}

export async function POST(req: Request) {
  const { query, tags } = await req.json();
  if (!query) return NextResponse.json({ error: "Falta 'query'" }, { status: 400 });

  const qv = await embed(query);
  const col = await getCol();

  const pipeline: any[] = [
    {
      $vectorSearch: {
        index: indexName,
        path: "embedding",
        queryVector: qv,
        numCandidates: 200,
        limit: 8,
        ...(tags?.length ? { filter: { tags: { $in: tags } } } : {})
      }
    },
    { $project: { chunk: 1, title: 1, section: 1, source_url: 1, tags: 1, score: { $meta: "vectorSearchScore" } } }
  ];

  const results = await col.aggregate(pipeline).toArray();
  return NextResponse.json({ results });
}