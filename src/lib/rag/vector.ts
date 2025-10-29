import { OpenAIEmbeddings } from "@langchain/openai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { Pool } from "pg";

let _store: PGVectorStore | null = null;

export async function getVectorStore() {
  if (_store) return _store;

  if ((process.env.RAG_BACKEND || "pgvector") !== "pgvector") {
    throw new Error(`RAG_BACKEND debe ser 'pgvector' en producción`);
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon/Supabase
  });

  _store = await PGVectorStore.initialize(
    new OpenAIEmbeddings({ model: "text-embedding-3-large" }),
    { pool, tableName: "langchain_pg_embedding" } // usa tabla por defecto de LangChain
  );

  return _store;
}