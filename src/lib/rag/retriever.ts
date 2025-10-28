import { getVectorStore } from "./vector";

export async function retrieveContext(queries: string[], {
  kPerQuery = 4,
  minYear = 2000,
  topN = 8,
} = {}) {
  const store = await getVectorStore();
  const all: any[] = [];
  for (const q of queries) {
    const docs = await store.similaritySearch(q, kPerQuery);
    all.push(...docs);
  }
  const candidates = all.filter(d => (d.metadata?.year ?? 0) >= minYear);
  const pool = candidates.length ? candidates : all;

  const seen = new Set<string>();
  const out: any[] = [];
  for (const d of pool) {
    const key = `${d.metadata?.source}-${(d.pageContent || "").slice(0, 90)}`;
    if (!seen.has(key)) { seen.add(key); out.push(d); }
    if (out.length >= topN) break;
  }

  const context = out.map(d =>
    `### ${d.metadata?.source ?? "source"} (${d.metadata?.year ?? "s/f"})\n${d.pageContent}`
  ).join("\n\n");
  const citas = out.map(d => ({ source: d.metadata?.source, year: d.metadata?.year }));

  return { context, citas };
}