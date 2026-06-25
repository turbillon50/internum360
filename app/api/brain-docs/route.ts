import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// CRÍTICO: forzar Node.js runtime, no Edge
export const runtime = "nodejs";

const pool = new Pool({
  connectionString: process.env.NEON_URL ||
    "postgresql://neondb_owner:npg_41DvuXKWyaHJ@ep-super-glitter-aqj6d5g0-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: true,
  max: 3,
});

// POST — guardar contenido (texto ya extraído por el frontend, o texto directo)
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let content = "";
    let category = "General";
    let filename: string | null = null;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      content  = body.content  || "";
      category = body.category || "General";
      filename = body.filename || null;
    } else if (contentType.includes("multipart/form-data")) {
      // Si llega como form-data, leer el campo "content" que ya viene extraído
      const form = await req.formData();
      content  = (form.get("content") as string) || "";
      category = (form.get("category") as string) || "General";
      filename = (form.get("filename") as string) || null;
    }

    content = content.trim();
    if (!content || content.length < 5) {
      return NextResponse.json({ error: "Sin contenido" }, { status: 400 });
    }

    // Partir en chunks de 2000 chars si es muy largo
    const MAX = 2000;
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += MAX) {
      const chunk = content.slice(i, i + MAX).trim();
      if (chunk.length > 10) chunks.push(chunk);
    }
    if (chunks.length === 0) chunks.push(content);

    const client = await pool.connect();
    try {
      const ids: number[] = [];
      for (const chunk of chunks) {
        const { rows } = await client.query(
          `INSERT INTO internum_brain (tenant, content, category, filename)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          ["internum360", chunk, category, filename]
        );
        ids.push(rows[0].id);
      }
      return NextResponse.json({ ok: true, ids, chunks: chunks.length, chars: content.length });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[brain-docs POST]", err);
    return NextResponse.json({ error: "Error guardando" }, { status: 500 });
  }
}

// GET — listar docs
export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT id, category, filename,
                LEFT(content, 120) as preview,
                created_at
         FROM internum_brain
         WHERE tenant = 'internum360'
         ORDER BY created_at DESC LIMIT 50`
      );
      return NextResponse.json({ docs: rows, total: rows.length });
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json({ error: "Error listando" }, { status: 500 });
  }
}

// DELETE — eliminar un doc
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
    const client = await pool.connect();
    try {
      await client.query("DELETE FROM internum_brain WHERE id=$1 AND tenant='internum360'", [id]);
      return NextResponse.json({ ok: true });
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json({ error: "Error eliminando" }, { status: 500 });
  }
}
