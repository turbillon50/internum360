"use client";
import { useState, useRef } from "react";
import { IcUpload, IcFile, IcTrash, IcDatabase } from "@/components/Ic";

const CATS = ["Políticas","Procesos","Auditoría","Lean Six Sigma","Contabilidad","SAT/IMSS","General"];

type Doc = { name: string; cat: string; fecha: string };

const DOCS_INIT: Doc[] = [
  { name:"Políticas_Internas_v2.pdf",        cat:"Políticas",      fecha:"24 jun" },
  { name:"Proceso_Auditoria_Fiscal.docx",    cat:"Procesos",       fecha:"22 jun" },
  { name:"Lean_Six_Sigma_Manual.pdf",        cat:"Lean Six Sigma", fecha:"20 jun" },
];

const FRAGMENTS = [
  { cat:"Procesos",      n:12 },
  { cat:"Políticas",     n:8  },
  { cat:"Auditoría",     n:15 },
  { cat:"Lean Six Sigma",n:7  },
  { cat:"Otros",         n:5  },
];

export default function Conocimiento() {
  const [texto,    setTexto]    = useState("");
  const [catSel,   setCatSel]   = useState("General");
  const [docs,     setDocs]     = useState<Doc[]>(DOCS_INIT);
  const [toast,    setToast]    = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function guardar() {
    if (!texto.trim()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setTexto("");
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    }, 1200);
  }

  function handleFile(file: File) {
    const ext = file.name.split(".").pop()?.toUpperCase() || "PDF";
    const cat = ext === "PDF" ? "Auditoría" : ext === "DOCX" ? "Procesos" : "General";
    setDocs(d => [{ name: file.name, cat, fecha: "hoy" }, ...d]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  return (
    <main style={{ background:"#f7f7f7", minHeight:"100dvh",
      paddingBottom:"calc(var(--bottom-h) + 24px)" }}>

      {/* TOAST */}
      {toast && (
        <div style={{
          position:"fixed", top:"60px", left:"50%", transform:"translateX(-50%)",
          background:"#008a05", color:"white", padding:"10px 20px",
          borderRadius:"40px", fontSize:"14px", fontWeight:700,
          boxShadow:"0 4px 20px rgba(0,138,5,0.35)", zIndex:999,
          animation:"fadeUp .25s ease",
        }}>✓ Guardado en Internum Brain</div>
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
            <p style={{ fontSize:"12px", color:"var(--text2)" }}>
              Alimenta tu Internum Brain
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:"20px" }}>

        {/* TEXTO */}
        <div style={{ background:"white", borderRadius:"20px",
          padding:"20px", marginBottom:"16px",
          boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)",
            marginBottom:"12px" }}>Agregar por texto</p>

          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Pega aquí una política, proceso, metodología, definición…"
            style={{
              width:"100%", minHeight:"120px", background:"#f7f7f7",
              border:"none", borderRadius:"12px", padding:"14px",
              fontSize:"14px", color:"var(--text)", outline:"none",
              resize:"vertical", fontFamily:"var(--font)", lineHeight:1.6,
            }}
          />

          {/* CATEGORÍAS */}
          <div style={{ marginTop:"12px", marginBottom:"16px",
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
            width:"100%", padding:"14px", borderRadius:"14px", border:"none",
            background: texto.trim() ? "var(--primary)" : "#e8e8e8",
            color: texto.trim() ? "white" : "var(--text3)",
            fontSize:"15px", fontWeight:700, cursor: texto.trim() ? "pointer" : "default",
            transition:"all .15s",
          }}>
            {saving ? "Guardando…" : "Guardar en Brain"}
          </button>
        </div>

        {/* UPLOAD */}
        <div style={{ background:"white", borderRadius:"20px",
          padding:"20px", marginBottom:"16px",
          boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)",
            marginBottom:"12px" }}>Subir documentos</p>

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border:`2px dashed ${dragging ? "var(--primary)" : "#2a9d8f"}`,
              borderRadius:"16px", padding:"32px 20px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:"10px",
              cursor:"pointer", transition:"all .15s",
              background: dragging ? "#f0fff4" : "#f9fffe",
            }}>
            <IcUpload size={32} color="#2a9d8f"/>
            <p style={{ fontSize:"14px", fontWeight:600, color:"var(--text)", textAlign:"center" }}>
              Arrastra PDFs, Word o Excel
            </p>
            <p style={{ fontSize:"12px", color:"var(--text2)" }}>o toca para seleccionar</p>
          </div>
          <input ref={fileRef} type="file" style={{ display:"none" }}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />

          {/* LISTA DE DOCS */}
          {docs.length > 0 && (
            <div style={{ marginTop:"16px", display:"flex", flexDirection:"column", gap:"8px" }}>
              {docs.map((d, i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:"10px",
                  padding:"10px 12px", background:"#f7f7f7", borderRadius:"12px",
                }}>
                  <IcFile size={18} color="var(--primary)"/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:"13px", fontWeight:600, color:"var(--text)",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {d.name}
                    </p>
                    <p style={{ fontSize:"11px", color:"var(--text2)", marginTop:"1px" }}>
                      {d.cat} · {d.fecha}
                    </p>
                  </div>
                  <button onClick={() => setDocs(ds => ds.filter((_,j) => j!==i))}
                    style={{ background:"none", border:"none", cursor:"pointer", padding:"4px" }}>
                    <IcTrash size={16} color="var(--text3)"/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BIBLIOTECA */}
        <div style={{ background:"white", borderRadius:"20px",
          padding:"20px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:"14px" }}>
            <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)" }}>
              En tu Brain
            </p>
            <span style={{ fontSize:"13px", fontWeight:700,
              color:"var(--accent)", background:"#f0fff8",
              padding:"3px 10px", borderRadius:"40px" }}>47 fragmentos</span>
          </div>

          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"16px" }}>
            {FRAGMENTS.map(f => (
              <div key={f.cat} style={{
                padding:"5px 12px", borderRadius:"40px", fontSize:"12px",
                fontWeight:600, background:"#f0f0f0", color:"var(--text2)",
              }}>{f.cat} <span style={{ color:"var(--primary)", fontWeight:800 }}>({f.n})</span></div>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"8px",
            padding:"12px", background:"#f0fff8", borderRadius:"12px" }}>
            <span style={{ fontSize:"18px" }}>✓</span>
            <p style={{ fontSize:"12px", color:"#008a05", fontWeight:600 }}>
              Todos los documentos están indexados y disponibles en Internum Brain
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
