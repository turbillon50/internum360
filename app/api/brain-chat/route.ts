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

const BASE_SYSTEM = `Eres Internum Brain, el asistente inteligente del despacho Internum 360 de Hugo Alcántara.

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
- Informe final auditoría (Inmobiliaria Querétaro) — en revisión 95%
- Revisión estados financieros Q1 (Constructora) — 80% alta prioridad

INSTRUCCIONES CRÍTICAS:
- Responde SIEMPRE en español, conciso y profesional
- SIEMPRE usa el contexto del despacho como base
- Si hay documentos del Brain (sección DOCUMENTOS abajo), cítalos explícitamente
- Usa **negritas** para datos importantes
- Máximo 200 palabras por respuesta
- NUNCA digas que no tienes acceso a información — usa lo que tienes`;

async function searchBrain(query: string): Promise<string> {
  try {
    const client = await pool.connect();
    try {
      // Buscar con TODAS las palabras de más de 2 chars
      const words = query
        .toLowerCase()
        .replace(/[¿?¡!,.:;]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 2);

      if (words.length === 0) {
        // Sin palabras útiles: traer últimos 3 docs
        const { rows } = await client.query(
          `SELECT content, category, filename, created_at
           FROM internum_brain WHERE tenant='internum360'
           ORDER BY created_at DESC LIMIT 3`
        );
        if (rows.length === 0) return "";
        return "\n\nÚLTIMOS DOCUMENTOS EN EL BRAIN:\n" +
          rows.map((r: any) =>
            `[${r.category}${r.filename ? ` — ${r.filename}` : ""}]:\n${r.content.slice(0,500)}`
          ).join("\n\n---\n\n");
      }

      // Búsqueda OR — cualquier palabra
      const conditions = words.map((_, i) =>
        `LOWER(content) LIKE $${i + 1}`
      ).join(" OR ");

      const { rows } = await client.query(
        `SELECT content, category, filename, created_at,
                LENGTH(content) as len
         FROM internum_brain
         WHERE tenant='internum360' AND (${conditions})
         ORDER BY created_at DESC LIMIT 4`,
        words.map(w => `%${w}%`)
      );

      if (rows.length === 0) return "";

      const docs = rows.map((r: any) =>
        `[${r.category}${r.filename ? ` — ${r.filename}` : ""}]:\n${r.content.slice(0,600)}`
      ).join("\n\n---\n\n");

      return `\n\nDOCUMENTOS RELEVANTES EN EL BRAIN (${rows.length} encontrados):\n${docs}`;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[searchBrain]", err);
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, session_id, history } = await req.json();
    if (!message) return NextResponse.json({ error: "message requerido" }, { status: 400 });

    const sid = session_id || `internum-${Date.now()}`;

    // Siempre buscar en Brain
    const brainDocs = await searchBrain(message);

    // System prompt completo SIEMPRE
    const systemPrompt = BASE_SYSTEM + brainDocs;

    // Construir historial de conversación para V
    const historyMessages = (history || [])
      .slice(-6) // últimos 6 mensajes
      .map((h: any) => `${h.role === "user" ? "Usuario" : "Brain"}: ${h.content}`)
      .join("\n");

    const fullMessage = historyMessages
      ? `[CONTEXTO DEL SISTEMA]:\n${systemPrompt}\n\n[HISTORIAL RECIENTE]:\n${historyMessages}\n\n[MENSAJE ACTUAL]: ${message}`
      : `[CONTEXTO DEL SISTEMA]:\n${systemPrompt}\n\n[MENSAJE]: ${message}`;

    const res = await fetch(`${V_ENDPOINT}/v/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${V_TOKEN}`,
      },
      body: JSON.stringify({
        message: fullMessage,
        session_id: sid,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) throw new Error(`V ${res.status}`);
    const data = await res.json();
    const reply = data.reply || data.response || data.message || data.content;
    if (!reply) throw new Error("Empty reply");

    return NextResponse.json({
      reply,
      brain_docs_used: !!brainDocs,
      session_id: sid,
    });

  } catch (err) {
    console.error("[brain-chat v4]", err);
    // Fallback con datos del despacho
    return NextResponse.json({
      reply: "Revisé tu Brain pero hubo un problema de conexión con V. Intenta de nuevo en un momento — tus documentos siguen guardados.",
      brain_docs_used: false,
      session_id: "fallback",
    }, { status: 200 }); // 200 para que el front no lo trate como error
  }
}
