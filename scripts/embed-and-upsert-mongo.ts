import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from "node:fs";
import readline from "node:readline";
import { getDb } from "../src/lib/mongo";

type Row = {
  doc_id: string;
  title: string;
  section?: string;
  chunk: string;
  tags?: string[];
  source_path?: string;
  source_url?: string;
};

async function embedBatch(texts: string[]): Promise<number[][]> {
  const model = process.env.EMBEDDING_MODEL || "text-embedding-3-large";
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ model, input: texts })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding error: ${res.status} - ${err}`);
  }
  const json: any = await res.json();
  return json.data.map((d: any) => d.embedding);
}

async function main() {
  const path = "data/chunks.jsonl";
  if (!fs.existsSync(path)) throw new Error("No existe data/chunks.jsonl");

  const db = await getDb();
  const col = db.collection("tca_chunks");

  const stream = fs.createReadStream(path, "utf8");
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  const BATCH = 64;
  let batchDocs: Row[] = [];
  let total = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    const row: Row = JSON.parse(line);
    batchDocs.push(row);
    if (batchDocs.length >= BATCH) {
      await flush(batchDocs, col);
      total += batchDocs.length;
      console.log(`Upsert: ${total}`);
      batchDocs = [];
    }
  }
  if (batchDocs.length) {
    await flush(batchDocs, col);
    total += batchDocs.length;
  }
  console.log(`✅ Listo. Total upserts: ${total}`);
}

async function flush(batch: Row[], col: any) {
  const texts = batch.map(b => b.chunk);
  const embeddings = await embedBatch(texts);
  const docs = batch.map((b, i) => ({
    ...b,
    embedding: embeddings[i],
    createdAt: new Date()
  }));
  const ops = docs.map((d) => ({
    updateOne: {
      filter: { doc_id: d.doc_id, section: d.section },
      update: { $set: d },
      upsert: true
    }
  }));
  await col.bulkWrite(ops, { ordered: false });
}

main().catch((e) => { console.error(e); process.exit(1); });