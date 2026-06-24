"use client";
import { useState, useRef, useEffect } from "react";
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

  // Cargar docs reales al montar
  useEffect(() => { loadDocs(); }, []);

  async function loadDocs() {
    setLoading(true);
    try {
      const res = await fetch("/api/brain-docs");
      if (res.ok) {
        const data = await res.json();
        setDocs(data.docs.map((d: any) => ({
          id: d.id,
          name: d.filename || `Fragmento #${d.id}`,
          cat: d.category,
          fecha: new Date(d.created_at).toLocaleDateString("es-MX", 
            { day:"numeric", month:"short" }),
          preview: d.preview,
        })));
      }
    } catch {}
    setLoading(false);
  }

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function guardar() {
    if (!texto.trim()) return;
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
        showToast("Error al guardar", false);
      }
    } catch {
      showToast("Error de conexión", false);
    }
    setSaving(false);
  }

  async function handleFile(file: File) {
    const ext = file.name.split(".").pop()?.toUpperCase() || "";
    const cat = ext === "PDF" ? "Auditoría" : ext === "DOCX" ? "Procesos" : catSel;
    setSaving(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("category", cat);
      const res = await fetch("/api/brain-docs", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ ${file.name} — ${data.chunks} fragmento(s) en Brain`);
        await loadDocs();
      } else {
        showToast(data.error || "Error subiendo", false);
      }
    } catch {
      showToast("Error subiendo archivo", false);
    }
    setSaving(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function eliminar(id?: number) {
    if (!id) return;
    setDocs(d => d.filter(x => x.id !== id));
  }

  const totalDocs = docs.length;
  const cats = [...new Set(docs.map(d => d.cat))];

  return (
    <main style={{ background:"#f7f7f7", minHeight:"100dvh",
      paddingBottom:"calc(var(--bottom-h) + 24px)" }}>

      {/* TOAST */}
      {toast && (
        <div style={{
          position:"fixed", top:"60px", left:"50%", transform:"translateX(-50%)",
          background: toast.ok ? "#008a05" : "#e02020",
          color:"white", padding:"10px 20px", borderRadius:"40px",
          fontSize:"14px", fontWeight:700, zIndex:999,
          boxShadow:`0 4px 20px rgba(0,0,0,0.25)`,
          animation:"fadeUp .25s ease", whiteSpace:"nowrap",
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
              ● Brain activo — {totalDocs} fragmentos
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:"20px" }}>

        {/* TEXTAREA */}
        <div style={{ background:"white", borderRadius:"20px", padding:"20px",
          marginBottom:"16px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)", marginBottom:"12px" }}>
            Agregar por texto
          </p>
          <textarea value={texto} onChange={e => setTexto(e.target.value)}
            placeholder="Pega aquí una política, proceso, metodología, definición de empresa cliente…"
            style={{ width:"100%", minHeight:"120px", background:"#f7f7f7",
              border:"none", borderRadius:"12px", padding:"14px",
              fontSize:"14px", color:"var(--text)", outline:"none",
              resize:"vertical", fontFamily:"var(--font)", lineHeight:1.6 }}/>
          <div style={{ marginTop:"12px", marginBottom:"16px",
            display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCatSel(c)} style={{
                padding:"5px 12px", borderRadius:"40px", fontSize:"12px",
                fontWeight:600, border:"none", cursor:"pointer",
                background: catSel===c ? "var(--primary)" : "#f0f0f0",
                color: catSel===c ? "white" : "var(--text2)",
              }}>{c}</button>
            ))}
          </div>
          <button onClick={guardar} disabled={!texto.trim() || saving} style={{
            width:"100%", padding:"14px", borderRadius:"14px", border:"none",
            background: texto.trim() ? "var(--primary)" : "#e8e8e8",
            color: texto.trim() ? "white" : "var(--text3)",
            fontSize:"15px", fontWeight:700, cursor: texto.trim() ? "pointer" : "default",
          }}>
            {saving ? "Guardando en Brain…" : "Guardar en Brain"}
          </button>
        </div>

        {/* UPLOAD */}
        <div style={{ background:"white", borderRadius:"20px", padding:"20px",
          marginBottom:"16px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)", marginBottom:"12px" }}>
            Subir documentos
          </p>
          <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{ border:`2px dashed ${dragging ? "var(--primary)" : "#2a9d8f"}`,
              borderRadius:"16px", padding:"32px 20px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:"10px",
              cursor:"pointer", background: dragging ? "#f0fff4" : "#f9fffe" }}>
            <IcUpload size={32} color="#2a9d8f"/>
            <p style={{ fontSize:"14px", fontWeight:600, color:"var(--text)", textAlign:"center" }}>
              Arrastra PDFs, Word o TXT
            </p>
            <p style={{ fontSize:"12px", color:"var(--text2)" }}>o toca para seleccionar</p>
          </div>
          <input ref={fileRef} type="file" style={{ display:"none" }}
            accept=".pdf,.doc,.docx,.txt,.csv"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}/>
        </div>

        {/* BIBLIOTECA REAL */}
        <div style={{ background:"white", borderRadius:"20px", padding:"20px",
          boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:"14px" }}>
            <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)" }}>
              En tu Brain
            </p>
            <span style={{ fontSize:"13px", fontWeight:700, color:"var(--accent)",
              background:"#f0fff8", padding:"3px 10px", borderRadius:"40px" }}>
              {totalDocs} fragmentos
            </span>
          </div>

          {loading ? (
            <div style={{ height:"60px", borderRadius:"12px" }} className="skeleton"/>
          ) : docs.length === 0 ? (
            <div style={{ textAlign:"center", padding:"24px", color:"var(--text2)",
              fontSize:"14px" }}>
              Aún no hay documentos. ¡Agrega el primero! 👆
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {docs.map((d, i) => (
                <div key={d.id || i} style={{ display:"flex", alignItems:"flex-start",
                  gap:"10px", padding:"10px 12px", background:"#f7f7f7",
                  borderRadius:"12px" }}>
                  <IcFile size={18} color="var(--primary)"/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {d.name}
                    </p>
                    <p style={{ fontSize:"11px", color:"var(--text2)", marginTop:"1px" }}>
                      {d.cat} · {d.fecha}
                    </p>
                    {d.preview && (
                      <p style={{ fontSize:"11px", color:"var(--text3)", marginTop:"3px",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {d.preview}…
                      </p>
                    )}
                  </div>
                  <button onClick={() => eliminar(d.id)}
                    style={{ background:"none", border:"none", cursor:"pointer", padding:"4px" }}>
                    <IcTrash size={16} color="var(--text3)"/>
                  </button>
                </div>
              ))}
            </div>
          )}

          {totalDocs > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:"8px",
              padding:"12px", background:"#f0fff8", borderRadius:"12px", marginTop:"12px" }}>
              <span>✓</span>
              <p style={{ fontSize:"12px", color:"#008a05", fontWeight:600 }}>
                Todos los documentos están indexados — Brain actualizado en tiempo real
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
