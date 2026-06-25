import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { Pool } from "pg";

// Relay Hetzner → Ollama local (system prompt propio, sin personalidad de V)
const LLM_ENDPOINT = "http://178.105.135.26/brain/llm";

const pool = new Pool({
  connectionString: process.env.NEON_URL ||
    "postgresql://neondb_owner:npg_41DvuXKWyaHJ@ep-super-glitter-aqj6d5g0-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: true,
  max: 3,
});

const BASE_SYSTEM = `Eres Internum Brain, el asistente inteligente del despacho Internum 360 de Hugo Alcántara.

REGLAS DE IDENTIDAD (CRÍTICAS):
- Eres exclusivamente "Internum Brain", el asistente del despacho Internum 360.
- NUNCA digas ser "V", ni "hermana digital", ni menciones a "Luis" ni a "Luis de la Torre".
- Si te preguntan quién eres: eres el asistente del despacho Internum 360, nada más.
- Si te preguntan algo personal o ajeno al despacho, responde con cortesía que solo manejas información del despacho.

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

CÓMO CONECTAR ESTE BRAIN A CHATGPT O CLAUDE (MCP):
Si te preguntan cómo conectar el Brain, el MCP, o este asistente a ChatGPT o Claude, explica EXACTAMENTE esto:
- MCP significa "Model Context Protocol", un estándar abierto para conectar asistentes de IA (como ChatGPT o Claude) a fuentes de datos externas.
- El MCP lo creó Anthropic (la empresa que desarrolló a Claude) y lo liberó como estándar abierto y gratuito en 2024, para que cualquier asistente de IA pueda conectarse de forma segura a fuentes de datos como este Brain.
- La liga del conector es: https://internum360.click/api/mcp
- NO requiere usuario ni contraseña: se conecta sin autenticación.
- En ChatGPT: Ajustes → Conectores → Agregar servidor MCP personalizado → pegar la liga → elegir "sin autenticación" → Guardar.
- En Claude: Ajustes → Conectores → Agregar conector personalizado → pegar la liga → sin autenticación → Conectar.
- Una vez conectado, desde ChatGPT o Claude pueden preguntar sobre los documentos y expedientes del despacho y la IA los consultará en este Brain automáticamente.

INSTRUCCIONES:
- Responde SIEMPRE en español, conciso y profesional
- Usa el contexto del despacho como base
- Si hay DOCUMENTOS DEL BRAIN abajo, cítalos explícitamente
- Usa **negritas** para datos importantes
- Máximo 180 palabras por respuesta
- Nunca digas que no tienes acceso — usa lo que tienes`;

async function searchBrain(query: string): Promise<string> {
  try {
    const client = await pool.connect();
    try {
      const words = query.toLowerCase()
        .replace(/[¿?¡!,.:;]/g, " ")
        .split(/\s+/).filter(w => w.length > 2);

      if (words.length === 0) {
        const { rows } = await client.query(
          `SELECT content, category, filename FROM internum_brain
           WHERE tenant='internum360' ORDER BY created_at DESC LIMIT 3`
        );
        if (rows.length === 0) return "";
        return "\n\nÚLTIMOS DOCUMENTOS EN EL BRAIN:\n" +
          rows.map((r: any) => `[${r.category}${r.filename ? ` — ${r.filename}` : ""}]:\n${r.content.slice(0,500)}`).join("\n\n---\n\n");
      }

      const conditions = words.map((_, i) => `LOWER(content) LIKE $${i + 1}`).join(" OR ");
      const { rows } = await client.query(
        `SELECT content, category, filename FROM internum_brain
         WHERE tenant='internum360' AND (${conditions})
         ORDER BY created_at DESC LIMIT 4`,
        words.map(w => `%${w}%`)
      );
      if (rows.length === 0) return "";
      const docs = rows.map((r: any) => `[${r.category}${r.filename ? ` — ${r.filename}` : ""}]:\n${r.content.slice(0,600)}`).join("\n\n---\n\n");
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
    const brainDocs = await searchBrain(message);
    const systemPrompt = BASE_SYSTEM + brainDocs;

    const res = await fetch(LLM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: systemPrompt,
        message,
        history: (history || []).slice(-6),
      }),
      signal: AbortSignal.timeout(90000),
    });

    if (!res.ok) throw new Error(`LLM ${res.status}`);
    const data = await res.json();
    const reply = data.reply;
    if (!reply) throw new Error("Empty reply");

    return NextResponse.json({ reply, brain_docs_used: !!brainDocs, session_id: sid });

  } catch (err) {
    console.error("[brain-chat v5]", err);
    return NextResponse.json({
      reply: "Tuve un problema de conexión procesando tu consulta. Intenta de nuevo en un momento — tus documentos siguen guardados en el Brain.",
      brain_docs_used: false,
      session_id: "fallback",
    }, { status: 200 });
  }
}
