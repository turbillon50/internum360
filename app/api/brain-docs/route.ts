import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_URL ||
    "postgresql://neondb_owner:npg_41DvuXKWyaHJ@ep-super-glitter-aqj6d5g0-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: true,
  max: 3,
});

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  // PDF
  if (name.endsWith(".pdf")) {
    try {
      const buffer = await file.arrayBuffer();
      // @ts-ignore
      const pdfParse = (await import("pdf-parse")).default ?? await import("pdf-parse");
      const data = await pdfParse(Buffer.from(buffer));
      const text = data.text?.trim();
      if (text && text.length > 20) return text;
      return `[PDF sin texto extraíble: ${file.name}]`;
    } catch (e) {
      console.error("[pdf-parse]", e);
      return `[Error extrayendo PDF: ${file.name}]`;
    }
  }

  // TXT, CSV, MD — texto plano
  if (name.match(/\.(txt|csv|md|json)$/)) {
    return await file.text();
  }

  // DOCX — extraer XML interno
  if (name.endsWith(".docx")) {
    try {
      const buffer = await file.arrayBuffer();
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(buffer);
      const xml = await zip.file("word/document.xml")?.async("string") || "";
      const text = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return text.length > 20 ? text : `[DOCX: ${file.name}]`;
    } catch {
      return await file.text().catch(() => `[DOCX: ${file.name}]`);
    }
  }

  // Fallback
  return await file.text().catch(() => `Archivo: ${file.name}`);
}

// POST — guardar doc (texto directo o archivo)
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let content = "";
    let category = "General";
    let filename: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      // Upload de archivo
      const form = await req.formData();
      const file = form.get("file") as File | null;
      category = (form.get("category") as string) || "General";

      if (!file) return NextResponse.json({ error: "file requerido" }, { status: 400 });

      filename = file.name;
      content = await extractText(file);

    } else {
      // JSON con texto directo
      const body = await req.json();
      content  = body.content;
      category = body.category || "General";
      filename = body.filename || null;
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: "Sin contenido extraíble" }, { status: 400 });
    }

    // Partir en chunks de 2000 chars si es muy largo
    const chunks: string[] = [];
    const MAX = 2000;
    if (content.length > MAX) {
      for (let i = 0; i < content.length; i += MAX) {
        chunks.push(content.slice(i, i + MAX));
      }
    } else {
      chunks.push(content);
    }

    const client = await pool.connect();
    try {
      const ids: number[] = [];
      for (const chunk of chunks) {
        const { rows } = await client.query(
          `INSERT INTO internum_brain (tenant, content, category, filename)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          ["internum360", chunk.trim(), category, filename]
        );
        ids.push(rows[0].id);
      }
      return NextResponse.json({
        ok: true,
        ids,
        chunks: chunks.length,
        chars: content.length,
      });
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
         ORDER BY created_at DESC
         LIMIT 50`
      );
      return NextResponse.json({ docs: rows, total: rows.length });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[brain-docs GET]", err);
    return NextResponse.json({ error: "Error listando" }, { status: 500 });
  }
}
