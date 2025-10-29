import fs from "node:fs/promises";
import path from "node:path";
import pdf from "pdf-parse";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { cleanText, chunkText } from "../src/lib/chunker";

type OutRow = {
  doc_id: string;
  title: string;
  section?: string;
  chunk: string;
  tags?: string[];
  source_path?: string;
};

async function readPDF(filePath: string): Promise<string> {
  const data = await fs.readFile(filePath);
  const res = await pdf(data);
  return res.text || "";
}

async function readMD(filePath: string): Promise<string> {
  const data = await fs.readFile(filePath, "utf8");
  // Convertimos MD → texto plano muy simple (manteniendo títulos y listas)
  const tree = unified().use(remarkParse).parse(data);
  // Walk naive: extrae valores de texto
  function walk(n: any, acc: string[] = []): string[] {
    if (!n) return acc;
    if (n.type === "text") acc.push(n.value);
    if (n.children) n.children.forEach((c: any) => walk(c, acc));
    return acc;
  }
  const parts = walk(tree).join(" ");
  return parts;
}

async function readTXT(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf8");
}

async function main() {
  const inDir = path.join(process.cwd(), "Literature");
  const outDir = path.join(process.cwd(), "data");
  await fs.mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, "chunks.jsonl");

  const files = await fs.readdir(inDir);
  const out: string[] = [];

  for (const file of files) {
    const p = path.join(inDir, file);
    const ext = path.extname(file).toLowerCase();
    let raw = "";

    if (ext === ".pdf") raw = await readPDF(p);
    else if (ext === ".md" || ext === ".markdown") raw = await readMD(p);
    else if (ext === ".txt") raw = await readTXT(p);
    else continue; // ignorar otros por ahora

    const cleaned = cleanText(raw);

    // (Opcional) quitar encabezados/pies repetidos de PDF:
    // Puedes detectar líneas que se repiten en > x% de páginas y filtrarlas.

    const chunks = chunkText(cleaned, {
      targetChars: 3800,
      overlapChars: 500,
      hardMaxChars: 4500,
    });

    const base: Pick<OutRow, "doc_id" | "title" | "tags" | "source_path"> = {
      doc_id: file,
      title: file.replace(ext, ""),
      tags: ["TCA", "literatura"],
      source_path: `Literature/${file}`,
    };

    chunks.forEach((chunk, i) => {
      const row: OutRow = { ...base, chunk, section: `p${i + 1}` };
      out.push(JSON.stringify(row));
    });

    console.log(`✅ ${file} → ${chunks.length} chunks`);
  }

  await fs.writeFile(outFile, out.join("\n"), "utf8");
  console.log(`\n📝 Guardado: ${outFile}`);
}

main().catch((e) => { console.error(e); process.exit(1); });