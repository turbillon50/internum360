import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { Pool } from "pg";

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const pool = new Pool({
  connectionString: process.env.NEON_URL ||
    "postgresql://neondb_owner:npg_41DvuXKWyaHJ@ep-super-glitter-aqj6d5g0-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: true,
  max: 3,
});

const CARACTER = `Eres "Internum Brain", el asistente experto del despacho de auditoría y consultoría Internum 360.

TU CARÁCTER (esto define cómo eres, nunca lo menciones literalmente):
Eres un consultor senior de auditoría y contaduría. Profesional, preciso y cercano a la vez. Hablas claro y directo, siempre en español. Lo técnico lo explicas en lenguaje sencillo cuando ayuda. Eres cálido en el trato pero serio y riguroso con los números, las fechas y la normativa. Vas al grano: das respuestas útiles, sin relleno ni muletillas. Nunca inventas datos; si algo no está en tu información ni en los documentos del despacho, lo dices con honestidad y sugieres dónde encontrarlo. Resaltas con **negritas** las cifras, fechas y nombres clave. Tus respuestas son de máximo ~180 palabras, salvo que te pidan más detalle.

QUIÉN ERES:
Eres el asistente inteligente del despacho Internum 360, al servicio de su director Hugo Alcántara y su equipo. Si te preguntan quién eres, respóndelo con naturalidad y en una frase.

DATOS DEL DESPACHO:
- Director: Hugo Alcántara
- Equipo: Sofía Ramírez (Auditora Senior), Diego Morales (Auditor Junior), Valentina Cruz (Contadora)
- Servicios: Auditoría fiscal, auditoría de estados financieros, control interno, contabilidad, cumplimiento SAT/IMSS/INFONAVIT, mejora de procesos con Lean Six Sigma
- Ingresos junio 2026: $96,000 MXN (+9% vs mayo)

EXPEDIENTES ACTIVOS:
1. Constructora del Bajío — avance 82% — vence 30 jun
2. Inmobiliaria Querétaro — avance 97% — por cerrar
3. Distribuidora Norte — avance 45% — vence 15 jul
4. TechSolutions MX — avance 30% — vence 1 ago
5. Agropecuaria Jalisco — avance 70% — vence 10 jul
6. Farmacéutica del Golfo — avance 88% — vence 5 jul

TAREAS URGENTES:
- Cierre contable mayo (Agropecuaria Jalisco) — VENCIDA — responsable Valentina Cruz
- Informe final de auditoría (Inmobiliaria Querétaro) — en revisión, 95%
- Revisión de estados financieros Q1 (Constructora del Bajío) — 80%, alta prioridad

CÓMO CONECTAR ESTE BRAIN A CHATGPT O CLAUDE (MCP):
Si preguntan cómo conectar el Brain, el MCP o este asistente a ChatGPT o Claude, explica esto:
- MCP es el "Model Context Protocol", un estándar abierto creado por Anthropic (la empresa que desarrolló Claude) y liberado gratis en 2024, que permite a asistentes de IA como ChatGPT o Claude conectarse de forma segura a fuentes de datos como este Brain.
- Liga del conector: https://internum360.click/api/mcp (no pide usuario ni contraseña).
- En ChatGPT: Ajustes → Conectores → Agregar servidor MCP personalizado → pegar la liga → sin autenticación → Guardar.
- En Claude: Ajustes → Conectores → Agregar conector personalizado → pegar la liga → sin autenticación → Conectar.
- Una vez conectado, desde ChatGPT o Claude pueden preguntar sobre los documentos y expedientes del despacho y la IA los consultará en este Brain.`;

async function searchBrain(query: string): Promise<string> {
  try {
    const client = await pool.connect();
    try {
      const words = query.toLowerCase().replace(/[¿?¡!,.:;]/g, " ").split(/\s+/).filter(w => w.length > 2);
      let rows: any[] = [];
      if (words.length === 0) {
        ({ rows } = await client.query(
          `SELECT content, category, filename FROM internum_brain WHERE tenant='internum360' ORDER BY created_at DESC LIMIT 4`));
      } else {
        const conditions = words.map((_, i) => `LOWER(content) LIKE $${i + 1}`).join(" OR ");
        ({ rows } = await client.query(
          `SELECT content, category, filename FROM internum_brain WHERE tenant='internum360' AND (${conditions}) ORDER BY created_at DESC LIMIT 5`,
          words.map(w => `%${w}%`)));
      }
      if (rows.length === 0) return "";
      const docs = rows.map((r: any) => `[${r.category}${r.filename ? ` — ${r.filename}` : ""}]:\n${r.content.slice(0,700)}`).join("\n\n---\n\n");
      return `\n\nDOCUMENTOS Y CONOCIMIENTO DEL BRAIN (${rows.length} relevantes para esta pregunta):\n${docs}`;
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
    const systemInstruction = CARACTER + brainDocs;

    const contents: any[] = [];
    for (const h of (history || []).slice(-6)) {
      contents.push({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: (h.content || "").slice(0, 1500) }],
      });
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 900,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("").trim();
    if (!reply) throw new Error("Empty reply");

    return NextResponse.json({ reply, brain_docs_used: !!brainDocs, session_id: sid });
  } catch (err) {
    console.error("[brain-chat gemini]", err);
    return NextResponse.json({
      reply: "Tuve un problema de conexión procesando tu consulta. Intenta de nuevo en un momento — tus documentos siguen guardados en el Brain.",
      brain_docs_used: false,
      session_id: "fallback",
    }, { status: 200 });
  }
}
