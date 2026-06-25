"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { IcUpload, IcFile, IcTrash, IcDatabase } from "@/components/Ic";

const CATS = ["Políticas","Procesos","Auditoría","Lean Six Sigma","Contabilidad","SAT/IMSS","General"];

type Doc = { id?: number; name: string; cat: string; fecha: string; preview?: string };

export default function Conocimiento() {
  const [texto,    setTexto]    = useState("");
  const [catSel,   setCatSel]   = useState("General");
  const [docs,     setDocs]     = useState<Doc[]>([]);
  const [toast,    setToast]    = useState<{msg:string;ok:boolean}|null>(null);
  const [saving,   setSaving]   = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadDocs(); }, []);

  async function loadDocs() {
    setLoading(true);
    try {
      const res = await fetch("/api/brain-docs");
      if (res.ok) {
        const data = await res.json();
        setDocs((data.docs || []).map((d: any) => ({
          id: d.id,
          name: d.filename || `Fragmento #${d.id}`,
          cat: d.category,
          fecha: new Date(d.created_at).toLocaleDateString("es-MX", { day:"numeric", month:"short" }),
          preview: d.preview,
        })));
      }
    } catch {}
    setLoading(false);
  }

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  // Extraer texto de PDF en el browser con pdfjs-dist
  async function extractPdfText(file: File): Promise<string> {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      // Worker inline para Next.js
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        if (pageText) fullText += pageText + "\n\n";
      }
      return fullText.trim();
    } catch (e) {
      console.error("PDF extract error:", e);
      return "";
    }
  }

  async function handleFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const cat = ext === "pdf" ? "Auditoría" : ext === "docx" ? "Procesos" : catSel;

    setSaving(true);
    showToast(`Extrayendo "${file.name}"…`, true);

    let content = "";
    
    if (ext === "pdf") {
      content = await extractPdfText(file);
      if (!content || content.length < 20) {
        showToast(`⚠️ "${file.name}" — PDF escaneado o sin texto. Pega el contenido manualmente.`, false);
        setSaving(false);
        return;
      }
    } else if (ext === "txt" || ext === "csv" || ext === "md") {
      content = await file.text();
    } else if (ext === "docx") {
      // DOCX: intentar leer como texto
      try {
        content = await file.text();
        if (content.includes("PK")) content = `[DOCX: ${file.name}] — Pega el contenido como texto para mejor indexado.`;
      } catch {
        content = `Documento: ${file.name}`;
      }
    } else {
      content = await file.text().catch(() => `Archivo: ${file.name}`);
    }

    if (!content.trim()) {
      showToast("Sin contenido extraíble", false);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/brain-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, category: cat, filename: file.name }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ "${file.name}" — ${data.chunks} fragmento(s) en Brain`);
        await loadDocs();
      } else {
        showToast(data.error || "Error guardando", false);
      }
    } catch {
      showToast("Error de conexión", false);
    }
    setSaving(false);
  }

  async function guardar() {
    if (!texto.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/brain-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: texto, category: catSel }),
      });
      if (res.ok) {
        setTexto("");
        showToast("✓ Guardado en Internum Brain");
        await loadDocs();
      } else {
        showToast("Error guardando", false);
      }
    } catch {
      showToast("Error de conexión", false);
    }
    setSaving(false);
  }

  async function eliminar(id?: number) {
    if (!id) return;
    try {
      await fetch("/api/brain-docs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setDocs(d => d.filter(x => x.id !== id));
    } catch {}
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  const totalDocs = docs.length;

  return (
    <main style={{ background:"#f7f7f7", minHeight:"100dvh",
      paddingBottom:"calc(var(--bottom-h) + 24px)" }}>

      {/* TOAST */}
      {toast && (
        <div style={{
          position:"fixed", top:"56px", left:"50%",
          transform:"translateX(-50%)", zIndex:1000,
          background: toast.ok ? "#008a05" : "#c47d00",
          color:"white", padding:"10px 18px", borderRadius:"40px",
          fontSize:"13px", fontWeight:700,
          boxShadow:"0 4px 20px rgba(0,0,0,0.25)",
          animation:"fadeUp .25s ease",
          maxWidth:"85vw", textAlign:"center", whiteSpace:"nowrap",
          overflow:"hidden", textOverflow:"ellipsis",
        }}>{toast.msg}</div>
      )}

      {/* HEADER */}
      <div style={{ background:"white", padding:"52px 20px 16px",
        borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"12px",
            background:"linear-gradient(135deg,#1e3a5f,#2a9d8f)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IcDatabase size={20} color="white"/>
          </div>
          <div>
            <h1 style={{ fontSize:"17px", fontWeight:800, color:"var(--text)" }}>
              Base de conocimiento
            </h1>
            <p style={{ fontSize:"12px", color:"#10b981", fontWeight:600 }}>
              ● Brain activo — {totalDocs} fragmento{totalDocs !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:"20px" }}>

        {/* TEXTO DIRECTO */}
        <div style={{ background:"white", borderRadius:"20px", padding:"20px",
          marginBottom:"16px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)", marginBottom:"12px" }}>
            Agregar por texto
          </p>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Pega aquí una política, proceso, metodología, contrato o cualquier información del despacho…"
            style={{ width:"100%", minHeight:"110px", background:"#f7f7f7",
              border:"none", borderRadius:"12px", padding:"14px",
              fontSize:"14px", color:"var(--text)", outline:"none",
              resize:"vertical", fontFamily:"var(--font)", lineHeight:1.6 }}
          />
          <div style={{ marginTop:"12px", marginBottom:"14px",
            display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCatSel(c)} style={{
                padding:"5px 12px", borderRadius:"40px", fontSize:"12px",
                fontWeight:600, border:"none", cursor:"pointer", transition:"all .15s",
                background: catSel===c ? "var(--primary)" : "#f0f0f0",
                color: catSel===c ? "white" : "var(--text2)",
              }}>{c}</button>
            ))}
          </div>
          <button onClick={guardar} disabled={!texto.trim() || saving} style={{
            width:"100%", padding:"13px", borderRadius:"14px", border:"none",
            background: texto.trim() && !saving ? "var(--primary)" : "#e8e8e8",
            color: texto.trim() && !saving ? "white" : "var(--text3)",
            fontSize:"15px", fontWeight:700,
            cursor: texto.trim() && !saving ? "pointer" : "default",
          }}>
            {saving ? "Guardando…" : "Guardar en Brain"}
          </button>
        </div>

        {/* UPLOAD PDF */}
        <div style={{ background:"white", borderRadius:"20px", padding:"20px",
          marginBottom:"16px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)", marginBottom:"4px" }}>
            Subir documento
          </p>
          <p style={{ fontSize:"11px", color:"var(--text2)", marginBottom:"12px" }}>
            PDF con texto seleccionable · TXT · Word · CSV
          </p>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !saving && fileRef.current?.click()}
            style={{ border:`2px dashed ${dragging ? "var(--primary)" : "#2a9d8f"}`,
              borderRadius:"16px", padding:"28px 20px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:"10px",
              cursor: saving ? "wait" : "pointer",
              background: dragging ? "#f0fff4" : "#f9fffe",
              opacity: saving ? 0.6 : 1, transition:"all .15s" }}>
            <IcUpload size={28} color="#2a9d8f"/>
            <p style={{ fontSize:"14px", fontWeight:600, color:"var(--text)", textAlign:"center" }}>
              {saving ? "Procesando…" : "Arrastra o toca para seleccionar"}
            </p>
            <p style={{ fontSize:"11px", color:"var(--text2)" }}>
              El texto se extrae automáticamente del PDF
            </p>
          </div>
          <input
            ref={fileRef} type="file" style={{ display:"none" }}
            accept=".pdf,.txt,.csv,.md,.docx"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value=""; }}
          />
        </div>

        {/* DOCS EN BRAIN */}
        <div style={{ background:"white", borderRadius:"20px", padding:"20px",
          boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:"14px" }}>
            <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)" }}>
              En tu Brain
            </p>
            <span style={{ fontSize:"13px", fontWeight:700, color:"var(--accent)",
              background:"#f0fff8", padding:"3px 10px", borderRadius:"40px" }}>
              {totalDocs} fragmento{totalDocs !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div style={{ height:"56px", borderRadius:"12px" }} className="skeleton"/>
          ) : docs.length === 0 ? (
            <div style={{ textAlign:"center", padding:"20px", color:"var(--text2)", fontSize:"13px" }}>
              Aún no hay documentos en el Brain.<br/>
              <span style={{ fontSize:"12px", color:"var(--text3)" }}>Sube un PDF o agrega texto arriba 👆</span>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {docs.map((d, i) => (
                <div key={d.id || i} style={{ display:"flex", alignItems:"flex-start",
                  gap:"10px", padding:"10px 12px", background:"#f7f7f7", borderRadius:"12px" }}>
                  <IcFile size={18} color="var(--primary)"/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {d.name}
                    </p>
                    <p style={{ fontSize:"11px", color:"var(--text2)", marginTop:"1px" }}>
                      {d.cat} · {d.fecha}
                    </p>
                    {d.preview && !d.preview.includes("Error") && (
                      <p style={{ fontSize:"10px", color:"var(--text3)", marginTop:"2px",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {d.preview}…
                      </p>
                    )}
                  </div>
                  <button onClick={() => eliminar(d.id)}
                    style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", flexShrink:0 }}>
                    <IcTrash size={16} color="var(--text3)"/>
                  </button>
                </div>
              ))}
            </div>
          )}

          {totalDocs > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:"8px",
              padding:"10px 12px", background:"#f0fff8", borderRadius:"12px", marginTop:"12px" }}>
              <span style={{ color:"#008a05", fontSize:"14px" }}>✓</span>
              <p style={{ fontSize:"12px", color:"#008a05", fontWeight:600 }}>
                Brain actualizado en tiempo real
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
