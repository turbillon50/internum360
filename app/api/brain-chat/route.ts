import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Eres Internum Brain, el asistente inteligente del despacho Internum 360 dirigido por Hugo Alcántara.
El despacho ofrece: Auditoría fiscal y control interno, Contabilidad, Trámites SAT/IMSS/INFONAVIT, Registro de marca, Lean Six Sigma.
Equipo: Hugo Alcántara (Director), Sofía Ramírez (Auditora Sr), Diego Morales (Auditor Jr), Valentina Cruz (Contadora).
Clientes activos: Constructora del Bajío (82%), Inmobiliaria Querétaro (97%), Distribuidora Norte (45%), TechSolutions MX (30%), Agropecuaria Jalisco (70%), Farmacéutica del Golfo (88%).
Tareas urgentes: Cierre contable mayo (Agropecuaria Jalisco, vencida, Valentina Cruz), Revisión estados financieros Q1 (Constructora, 80%), Informe final auditoría (Inmobiliaria Querétaro, revisión 95%).
Ingresos junio: $96,000 MXN (+9% vs mayo).
Responde siempre en español, de forma concisa y profesional. Usa **negritas** para destacar datos clave. Usa bullet points cuando listes items. Máximo 150 palabras por respuesta.`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // Intentar V en GPU primero
    const res = await fetch("http://178.105.135.26/v/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: message }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`V error ${res.status}`);
    const data = await res.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      data.response ||
      data.reply ||
      data.message ||
      data.content ||
      data.text;

    if (!reply) throw new Error("Empty reply from V");
    return NextResponse.json({ reply });

  } catch (err) {
    console.error("[brain-chat] fallback:", err);
    return NextResponse.json({ error: "fallback" }, { status: 500 });
  }
}
