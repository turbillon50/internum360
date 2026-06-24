import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const V_ENDPOINT = "https://pastor-requiring-leaving-parties.trycloudflare.com";
const V_TOKEN    = "f1d6012090e70839621ed05f4c7a2ec133c7e9b291dd6d8b";

const pool = new Pool({
  connectionString: process.env.NEON_URL ||
    "postgresql://neondb_owner:npg_41DvuXKWyaHJ@ep-super-glitter-aqj6d5g0-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: true,
  max: 3,
});

const BASE_CONTEXT = `Eres Internum Brain, el asistente inteligente del despacho Internum 360 de Hugo Alcántara.

DATOS DEL DESPACHO:
- Director: Hugo Alcántara
- Equipo: Sofía Ramírez (Auditora Sr), Diego Morales (Auditor Jr), Valentina Cruz (Contadora)
- Servicios: Auditoría fiscal, control interno, Contabilidad, SAT/IMSS/INFONAVIT, Lean Six Sigma
- Ingresos junio 2026: $96,000 MXN (+9% vs mayo)

EXPEDIENTES ACTIVOS:
1. Constructora del Bajío — 82% — vence 30 jun
2. Inmobiliaria Querétaro — 97% — por cerrar
3. Distribuidora Norte — 45% — vence 15 jul
4. TechSolutions MX — 30% — vence 1 ago
5. Agropecuaria Jalisco — 70% — vence 10 jul
6. Farmacéutica del Golfo — 88% — vence 5 jul

TAREAS URGENTES:
- Cierre contable mayo (Agropecuaria) — VENCIDA — Valentina Cruz
- Informe final auditoría (Inmobiliaria Querétaro) — revisión 95%
- Revisión estados financieros Q1 (Constructora) — alta prioridad 80%`;

async function searchBrain(query: string): Promise<string> {
  try {
    const client = await pool.connect();
    try {
      // Búsqueda por palabras clave en el contenido
      const keywords = query
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3)
        .map(w => `%${w}%`);

      if (keywords.length === 0) return "";

      const conditions = keywords.map((_, i) => 
        `LOWER(content) LIKE $${i + 1}`
      ).join(" OR ");

      const { rows } = await client.query(
        `SELECT content, category, filename, created_at
         FROM internum_brain
         WHERE tenant = 'internum360'
           AND (${conditions})
         ORDER BY created_at DESC
         LIMIT 5`,
        keywords
      );

      if (rows.length === 0) return "";

      const docs = rows.map((r: any) => 
        `[${r.category}${r.filename ? ` — ${r.filename}` : ""}]:\n${r.content}`
      ).join("\n\n---\n\n");

      return `\n\nDOCUMENTOS RELEVANTES ENCONTRADOS EN EL BRAIN:\n${docs}`;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[searchBrain]", err);
    return "";
  }
}

const sessions = new Map<string, boolean>();

export async function POST(req: NextRequest) {
  try {
    const { message, session_id } = await req.json();
    if (!message) return NextResponse.json({ error: "message requerido" }, { status: 400 });

    const sid = session_id || `internum-${Date.now()}`;

    // Buscar en Brain primero
    const brainDocs = await searchBrain(message);
    const isNew = !sessions.has(sid);

    // Construir prompt completo
    const systemFull = BASE_CONTEXT + brainDocs + `

INSTRUCCIONES:
- Responde SIEMPRE en español, conciso y profesional
- Usa **negritas** para datos clave
- Si hay documentos del Brain arriba, úsalos como fuente principal de tu respuesta
- Cita el nombre del documento cuando lo uses
- Máximo 200 palabras`;

    const fullMessage = isNew
      ? `[CONTEXTO]: ${systemFull}\n\n[USUARIO]: ${message}`
      : message;

    const res = await fetch(`${V_ENDPOINT}/v/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${V_TOKEN}`,
      },
      body: JSON.stringify({ message: fullMessage, session_id: sid }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`V error ${res.status}`);
    const data = await res.json();
    const reply = data.reply || data.response || data.message || data.content;
    if (!reply) throw new Error("Empty reply");

    sessions.set(sid, true);

    return NextResponse.json({
      reply,
      brain_docs_used: brainDocs ? true : false,
      tools_used: data.tools_used || [],
      session_id: sid,
    });

  } catch (err) {
    console.error("[brain-chat]", err);
    return NextResponse.json({ error: "fallback" }, { status: 500 });
  }
}
