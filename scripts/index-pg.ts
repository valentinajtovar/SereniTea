import "dotenv/config";
import path from "path";
import { Storage } from "@google-cloud/storage";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { Pool } from "pg";
import fs from "fs/promises";
import pdf from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const BUCKET = process.env.FIREBASE_BUCKET!;
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID!;
if (!BUCKET || !PROJECT_ID) {
  throw new Error("FIREBASE_BUCKET y FIREBASE_PROJECT_ID son requeridos");
}

async function listPdfFiles(storage: Storage) {
  const [files] = await storage.bucket(BUCKET).getFiles({ prefix: "knowledge/ed_pdfs/" });
  return files.filter(f => f.name.toLowerCase().endsWith(".pdf"));
}

async function loadPdfFile(storage: Storage, name: string) {
  const tmp = path.join(process.cwd(), ".tmp-index", name.split("/").pop()!);
  await storage.bucket(BUCKET).file(name).download({ destination: tmp });
  return tmp;
}

async function parsePdfToDocs(filePath: string, sourceName: string) {
    const buf = await fs.readFile(filePath);          // <- Buffer
    const data = await pdf(buf);                      // pdf-parse recibe Buffer
  
    const text = (data.text || "").replace(/\r/g, "");
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1500, chunkOverlap: 200 });
    const chunks = await splitter.splitText(text);
    const yearMatch = text.match(/\b(20\d{2}|19\d{2})\b/);
    const year = yearMatch ? Number(yearMatch[1]) : undefined;
  
    return chunks.map((c, i) => ({
      pageContent: c,
      metadata: { source: sourceName, chunk: i, year },
    }));
  }

async function main() {
  console.log("Indexando PDFs desde Firebase Storage → PGVector");
  const storage = new Storage({
    projectId: PROJECT_ID,
    // En GitHub Actions pasaremos credenciales con GOOGLE_APPLICATION_CREDENTIALS (o key JSON inline)
  });

  const pdfs = await listPdfFiles(storage);
  console.log(`Encontrados PDFs: ${pdfs.length}`);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const store = await PGVectorStore.initialize(
    new OpenAIEmbeddings({ model: "text-embedding-3-large" }),
    { pool, tableName: "langchain_pg_embedding" }
  );

  let total = 0;
  for (const file of pdfs) {
    const local = await loadPdfFile(storage, file.name);
    const docs = await parsePdfToDocs(local, path.basename(file.name));
    total += docs.length;
    // Inserta en lotes (reduce picos de coste)
    const batchSize = 100;
    for (let i = 0; i < docs.length; i += batchSize) {
      await store.addDocuments(docs.slice(i, i + batchSize));
    }
    console.log(`Indexado: ${file.name} (chunks: ${docs.length})`);
  }
  console.log(`Total chunks indexados: ${total}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});