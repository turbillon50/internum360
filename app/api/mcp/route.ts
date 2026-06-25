import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pool = new Pool({
  connectionString: process.env.NEON_URL ||
    "postgresql://neondb_owner:npg_41DvuXKWyaHJ@ep-super-glitter-aqj6d5g0-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: true,
  max: 3,
});

const TENANT = "internum360";
const SERVER_NAME = "Internum Brain";
const PROTOCOL_VERSION = "2025-06-18";

// ── CORS / headers comunes ──
function cors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id, mcp-protocol-version");
  return res;
}

// ── Búsqueda en el Brain (palabras clave ILIKE) ──
async function buscarBrain(query: string, limit = 8) {
  const palabras = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 8);

  const client = await pool.connect();
  try {
    if (palabras.length === 0) {
      const { rows } = await client.query(
        `SELECT id, content, category, filename, created_at
         FROM internum_brain WHERE tenant=$1
         ORDER BY created_at DESC LIMIT $2`,
        [TENANT, limit]
      );
      return rows;
    }
    const conds = palabras.map((_, i) => `content ILIKE $${i + 2}`).join(" OR ");
    const params = [TENANT, ...palabras.map(p => `%${p}%`), limit];
    const { rows } = await client.query(
      `SELECT id, content, category, filename, created_at
       FROM internum_brain
       WHERE tenant=$1 AND (${conds})
       ORDER BY created_at DESC LIMIT $${palabras.length + 2}`,
      params
    );
    return rows;
  } finally {
    client.release();
  }
}

async function fetchPorId(id: string) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, content, category, filename, created_at
       FROM internum_brain WHERE tenant=$1 AND id=$2 LIMIT 1`,
      [TENANT, parseInt(id, 10)]
    );
    return rows[0] || null;
  } finally {
    client.release();
  }
}

// ── Definición de tools ──
const TOOLS = [
  {
    name: "search",
    description:
      "Busca en la base de conocimiento (Brain) del despacho Internum 360: políticas, procesos, auditorías, metodologías, contabilidad y documentos cargados. Devuelve fragmentos relevantes con su id.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Términos de búsqueda en español" },
      },
      required: ["query"],
    },
  },
  {
    name: "fetch",
    description:
      "Obtiene el contenido completo de un fragmento del Brain de Internum 360 a partir de su id (devuelto por search).",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID del fragmento a recuperar" },
      },
      required: ["id"],
    },
  },
  {
    name: "consultar_brain",
    description:
      "Consulta en lenguaje natural la base de conocimiento del despacho Internum 360 y devuelve los fragmentos más relevantes ya formateados para leer.",
    inputSchema: {
      type: "object",
      properties: {
        pregunta: { type: "string", description: "Pregunta o tema a consultar" },
      },
      required: ["pregunta"],
    },
  },
];

// ── Ejecutar tool ──
async function ejecutarTool(name: string, args: any) {
  if (name === "search") {
    const rows = await buscarBrain(args.query || "", 8);
    const results = rows.map((r: any) => ({
      id: String(r.id),
      title: r.filename || `${r.category} #${r.id}`,
      url: `https://internum360.click/conocimiento#${r.id}`,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify({ results }) }],
    };
  }

  if (name === "fetch") {
    const row = await fetchPorId(args.id || "");
    if (!row) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: "Fragmento no encontrado" }) }],
        isError: true,
      };
    }
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          id: String(row.id),
          title: row.filename || `${row.category} #${row.id}`,
          text: row.content,
          url: `https://internum360.click/conocimiento#${row.id}`,
          metadata: { categoria: row.category, fecha: row.created_at },
        }),
      }],
    };
  }

  if (name === "consultar_brain") {
    const rows = await buscarBrain(args.pregunta || "", 6);
    if (rows.length === 0) {
      return {
        content: [{
          type: "text",
          text: "No encontré documentos relacionados en el Brain de Internum 360. Puede que aún no se haya cargado información sobre ese tema.",
        }],
      };
    }
    const texto = rows
      .map((r: any, i: number) => {
        const fuente = r.filename ? ` (${r.filename})` : "";
        return `[${i + 1}] ${r.category}${fuente}:\n${r.content}`;
      })
      .join("\n\n---\n\n");
    return {
      content: [{
        type: "text",
        text: `Resultados del Brain de Internum 360:\n\n${texto}`,
      }],
    };
  }

  return {
    content: [{ type: "text", text: `Tool desconocida: ${name}` }],
    isError: true,
  };
}

// ── Manejar un mensaje JSON-RPC ──
async function manejarRPC(msg: any): Promise<any | null> {
  const { method, params, id } = msg;

  // Notifications (sin id) → no responder
  if (id === undefined || id === null) {
    return null;
  }

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: SERVER_NAME, version: "1.0.0" },
        instructions:
          "Brain del despacho de auditoría Internum 360. Usa search/fetch o consultar_brain para responder sobre documentos, políticas y procesos del despacho.",
      },
    };
  }

  if (method === "tools/list") {
    return { jsonrpc: "2.0", id, result: { tools: TOOLS } };
  }

  if (method === "tools/call") {
    try {
      const result = await ejecutarTool(params?.name, params?.arguments || {});
      return { jsonrpc: "2.0", id, result };
    } catch (e: any) {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: `Error: ${e?.message || "interno"}` }],
          isError: true,
        },
      };
    }
  }

  if (method === "ping") {
    return { jsonrpc: "2.0", id, result: {} };
  }

  // Método no soportado
  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Método no encontrado: ${method}` },
  };
}

// ── POST: endpoint principal MCP ──
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return cors(NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
      { status: 400 }
    ));
  }

  // Batch o mensaje único
  if (Array.isArray(body)) {
    const respuestas = [];
    for (const msg of body) {
      const r = await manejarRPC(msg);
      if (r) respuestas.push(r);
    }
    return cors(NextResponse.json(respuestas.length ? respuestas : null));
  }

  const respuesta = await manejarRPC(body);
  // Notification → 202 sin body
  if (respuesta === null) {
    return cors(new NextResponse(null, { status: 202 }));
  }
  return cors(NextResponse.json(respuesta));
}

// ── GET: descubrimiento / health ──
export async function GET() {
  return cors(NextResponse.json({
    name: SERVER_NAME,
    protocol: "mcp",
    protocolVersion: PROTOCOL_VERSION,
    transport: "streamable-http",
    tools: TOOLS.map(t => t.name),
    status: "ready",
  }));
}

// ── OPTIONS: preflight CORS ──
export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}
