import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_URL || 
    "postgresql://neondb_owner:npg_41DvuXKWyaHJ@ep-super-glitter-aqj6d5g0-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: true,
  max: 3,
});

export async function POST(req: NextRequest) {
  try {
    const { content, category, filename } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "content requerido" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `INSERT INTO internum_brain (tenant, content, category, filename)
         VALUES ($1, $2, $3, $4)
         RETURNING id, created_at`,
        ["internum360", content.trim(), category || "General", filename || null]
      );
      return NextResponse.json({ 
        ok: true, 
        id: rows[0].id,
        created_at: rows[0].created_at
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[save-doc]", err);
    return NextResponse.json({ error: "Error guardando" }, { status: 500 });
  }
}

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
         ORDER BY created_at DESC
         LIMIT 50`
      );
      return NextResponse.json({ docs: rows, total: rows.length });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[list-docs]", err);
    return NextResponse.json({ error: "Error listando" }, { status: 500 });
  }
}
