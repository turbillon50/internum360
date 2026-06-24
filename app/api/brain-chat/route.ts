import { NextRequest, NextResponse } from "next/server";

const V_ENDPOINT = "https://pastor-requiring-leaving-parties.trycloudflare.com";
const V_TOKEN    = "f1d6012090e70839621ed05f4c7a2ec133c7e9b291dd6d8b";

const SYSTEM_CONTEXT = `Eres Internum Brain, el asistente inteligente del despacho Internum 360 de Hugo Alcántara.

DATOS DEL DESPACHO:
- Director: Hugo Alcántara
- Equipo: Sofía Ramírez (Auditora Sr), Diego Morales (Auditor Jr), Valentina Cruz (Contadora)
- Servicios: Auditoría fiscal y control interno, Contabilidad, Trámites SAT/IMSS/INFONAVIT, Registro de marca, Lean Six Sigma, Diagnóstico integral empresarial (12 áreas), Código de ética y reglamento interno
- Ingresos junio 2026: $96,000 MXN (+9% vs mayo)

EXPEDIENTES ACTIVOS (6):
1. Constructora del Bajío — Auditoría Fiscal + Control Interno — 82% avance — vence 30 jun
2. Inmobiliaria Querétaro — Auditoría Fiscal — 97% avance — por cerrar — vence 22 jun
3. Distribuidora Norte — Contabilidad + Trámites SAT — 45% avance — vence 15 jul
4. TechSolutions MX — Control Interno + Auditoría Fiscal — 30% avance — vence 1 ago
5. Agropecuaria Jalisco — Contabilidad — 70% avance — vence 10 jul
6. Farmacéutica del Golfo — Control Interno + Contabilidad — 88% avance — vence 5 jul

TAREAS URGENTES:
- Cierre contable mayo (Agropecuaria Jalisco) — VENCIDA — Valentina Cruz — 60% avance
- Revisión estados financieros Q1 (Constructora del Bajío) — Alta prioridad — 80% avance — vence 20 jun
- Informe final de auditoría (Inmobiliaria Querétaro) — En revisión — 95% avance — vence 21 jun

INSTRUCCIONES DE RESPUESTA:
- Responde SIEMPRE en español
- Sé conciso y profesional
- Usa **negritas** para datos clave
- Usa bullet points para listas
- Máximo 150 palabras por respuesta
- Si no tienes el dato exacto, di lo que sabes del despacho
- Nunca digas que no tienes acceso a los datos — usa el contexto de arriba`;

// Guardamos session_ids en memoria (para la demo es suficiente)
const sessions = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const { message, session_id } = await req.json();
    if (!message) return NextResponse.json({ error: "message requerido" }, { status: 400 });

    const sid = session_id || `internum-${Date.now()}`;

    // Construir mensaje con contexto inyectado
    const fullMessage = sessions.has(sid)
      ? message  // sesión existente — V ya tiene contexto
      : `[CONTEXTO DEL SISTEMA: ${SYSTEM_CONTEXT}]\n\n[MENSAJE DEL USUARIO]: ${message}`;

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
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`V error ${res.status}`);
    const data = await res.json();

    const reply = data.reply || data.response || data.message || data.content;
    if (!reply) throw new Error("Empty reply from V");

    // Marcar sesión como iniciada
    sessions.set(sid, "active");

    return NextResponse.json({
      reply,
      tools_used: data.tools_used || [],
      session_id: sid,
    });

  } catch (err) {
    console.error("[brain-chat] V error, usando fallback:", err);
    return NextResponse.json({ error: "fallback" }, { status: 500 });
  }
}
