type SplitOptions = {
    targetChars?: number;     // aprox 1000 tokens ~ 3500-4000 chars
    overlapChars?: number;    // solape para mantener contexto
    hardMaxChars?: number;    // nunca exceder (corte de seguridad)
  };
  
  const DEFAULTS: Required<SplitOptions> = {
    targetChars: 3800,
    overlapChars: 500,
    hardMaxChars: 4500,
  };
  
  export function cleanText(raw: string): string {
    // Limpieza básica: normalizar saltos de línea, colapsar espacios
    let t = raw.replace(/\r/g, "\n");
    t = t.replace(/\n{3,}/g, "\n\n");     // no más de 2 saltos seguidos
    t = t.replace(/[ \t]+/g, " ");        // espacios múltiples → 1
    t = t.trim();
    return t;
  }
  
  // Segmentación en oraciones (ES/EN) usando Intl.Segmenter si está disponible.
  function splitSentences(text: string): string[] {
    // fallback simple si Intl.Segmenter no existe
    // preferimos dividir por doble salto (párrafos) y luego por punto.
    if (typeof (Intl as any).Segmenter !== "function") {
      const paras = text.split(/\n{2,}/);
      const sentences: string[] = [];
      for (const p of paras) {
        const parts = p.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/g);
        for (const s of parts) {
          const s2 = s.trim();
          if (s2) sentences.push(s2);
        }
        sentences.push("\n"); // marca de párrafo
      }
      return sentences;
    }
  
    // Si hay Segmenter, segmentamos por oraciones y preservamos saltos dobles como párrafos
    const withMarks = text.replace(/\n{2,}/g, " ¶¶ ");
    const seg = new (Intl as any).Segmenter("es", { granularity: "sentence" });
    const iter = seg.segment(withMarks);
    const sentences: string[] = [];
    for (const s of iter) {
      const piece = text.slice(s.index, s.index + s.segment.length).trim();
      if (piece) sentences.push(piece);
    }
    // Re-expandir párrafos
    const final: string[] = [];
    for (const s of sentences) {
      if (s.includes("¶¶")) {
        const parts = s.split("¶¶");
        parts.forEach((p, i) => {
          const p2 = p.trim();
          if (p2) final.push(p2);
          if (i < parts.length - 1) final.push("\n"); // marca párrafo
        });
      } else {
        final.push(s);
      }
    }
    return final;
  }
  
  export function chunkText(
    text: string,
    opts: SplitOptions = {}
  ): string[] {
    const { targetChars, overlapChars, hardMaxChars } = { ...DEFAULTS, ...opts };
    const sentences = splitSentences(text);
  
    const chunks: string[] = [];
    let buf: string[] = [];
    let bufLen = 0;
  
    function flushChunk(force = false) {
      if (!buf.length) return;
      const joined = buf.join(" ");
      // corte de seguridad
      if (joined.length > hardMaxChars && !force) {
        // dividir por mitad aproximada si se nos fue
        const mid = Math.floor(buf.length / 2);
        const left = buf.slice(0, mid).join(" ");
        const right = buf.slice(mid).join(" ");
        if (left.trim()) chunks.push(left.trim());
        if (right.trim()) chunks.push(right.trim());
      } else {
        chunks.push(joined.trim());
      }
      buf = [];
      bufLen = 0;
    }
  
    for (const s of sentences) {
      const seg = s === "\n" ? "\n\n" : s; // restaurar párrafo
      const extra = (bufLen === 0 ? 0 : 1) + seg.length; // +1 por espacio
      if (bufLen + extra <= targetChars) {
        buf.push(seg);
        bufLen += extra;
        continue;
      }
      // cerrar chunk actual
      flushChunk();
  
      // comenzar siguiente con solape: recortar del final del chunk anterior
      if (chunks.length) {
        const prev = chunks[chunks.length - 1];
        const overlap = prev.slice(Math.max(0, prev.length - overlapChars));
        buf.push(overlap.trimStart());
        bufLen = overlap.length;
      }
  
      // y añadir la oración actual (si cabe directo, si no, se guardará en el siguiente ciclo)
      if (seg.length > hardMaxChars) {
        // oración/párrafo gigantesco: troceo duro
        for (let i = 0; i < seg.length; i += hardMaxChars) {
          const slice = seg.slice(i, i + hardMaxChars);
          chunks.push(slice.trim());
        }
        buf = [];
        bufLen = 0;
      } else {
        buf.push(seg);
        bufLen += seg.length;
      }
    }
    flushChunk(true);
    return chunks.filter(Boolean);
  }