"use client";
import { useState, useRef, useEffect } from "react";
import { BRAIN_QA } from "@/lib/data";
import { IcSend, IcBrain } from "@/components/Ic";

type Msg = { role:"user"|"ai"; text:string };

const SUGERENCIAS = ["Resumen del despacho","Tareas vencidas","Clientes +80%","Ingresos junio","Ver mi equipo"];

export default function Brain() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role:"ai", text:"Hola Hugo 👋 Soy tu asistente **Internum Brain**. Pregúntame sobre expedientes, tareas, ingresos o tu equipo." }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs, loading]);

  // Fallback local cuando V no está disponible
  function responde(q: string): string {
    const ql = q.toLowerCase();
    for (const qa of BRAIN_QA) {
      if (ql.includes(qa.q.toLowerCase())) return qa.a;
    }
    return `Revisé los expedientes activos. No encontré datos específicos para esa consulta, pero puedo ayudarte con **pendientes**, **avances**, **tareas vencidas**, **ingresos** o el **resumen del despacho**.`;
  }

  async function send(texto?: string) {
    const q = (texto ?? input).trim();
    if (!q || loading) return;
    setInput("");
    setMsgs(m => [...m, { role:"user", text:q }]);
    setLoading(true);

    let respuesta = "";
    try {
      const res = await fetch("/api/brain-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      if (res.ok) {
        const data = await res.json();
        respuesta = data.reply || responde(q);
      } else {
        respuesta = responde(q);
      }
    } catch {
      respuesta = responde(q);
    }

    setMsgs(m => [...m, { role:"ai", text:respuesta }]);
    setLoading(false);
  }

  function renderText(t: string) {
    return t.split("\n").map((line, i) => {
      const bold = line.replace(/\*\*(.+?)\*\*/g, (_,m) =>
        `<strong>${m}</strong>`);
      return <p key={i} style={{ margin:"2px 0", lineHeight:1.5 }}
        dangerouslySetInnerHTML={{ __html:bold }}/>;
    });
  }

  return (
    <main style={{ background:"#f7f7f7", minHeight:"100dvh",
      display:"flex", flexDirection:"column",
      paddingBottom:"calc(var(--bottom-h) + 80px)" }}>

      {/* HEADER */}
      <div style={{ background:"white", padding:"52px 20px 16px",
        borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"12px",
            background:"linear-gradient(135deg,#1e3a5f,#2a9d8f)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IcBrain size={20} color="white"/>
          </div>
          <div>
            <h1 style={{ fontSize:"17px", fontWeight:800, color:"var(--text)" }}>Internum Brain</h1>
            <p style={{ fontSize:"12px", color:"#10b981", fontWeight:600 }}>● En línea</p>
          </div>
        </div>
      </div>

      {/* SUGERENCIAS */}
      {msgs.length <= 1 && (
        <div style={{ padding:"16px 16px 0", display:"flex", gap:"8px",
          overflowX:"auto", scrollbarWidth:"none" }}>
          {SUGERENCIAS.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              padding:"8px 14px", borderRadius:"40px", border:"1.5px solid var(--border)",
              background:"white", fontSize:"13px", color:"var(--text)", fontWeight:600,
              cursor:"pointer", whiteSpace:"nowrap", flexShrink:0,
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* MENSAJES */}
      <div style={{ flex:1, padding:"16px 16px 0", display:"flex", flexDirection:"column", gap:"12px" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            display:"flex",
            justifyContent: m.role==="user" ? "flex-end" : "flex-start",
            animation:"fadeUp .25s ease",
          }}>
            {m.role === "ai" && (
              <div style={{ width:"30px", height:"30px", borderRadius:"50%",
                background:"linear-gradient(135deg,#1e3a5f,#2a9d8f)",
                display:"flex", alignItems:"center", justifyContent:"center",
                marginRight:"8px", flexShrink:0, alignSelf:"flex-end" }}>
                <IcBrain size={14} color="white"/>
              </div>
            )}
            <div style={{
              maxWidth:"78%", padding:"12px 14px", borderRadius:
                m.role==="user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role==="user" ? "var(--primary)" : "white",
              color:       m.role==="user" ? "white"          : "var(--text)",
              fontSize:"14px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)",
              lineHeight:1.5,
            }}>
              {renderText(m.text)}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display:"flex", justifyContent:"flex-start", gap:"8px", alignItems:"flex-end" }}>
            <div style={{ width:"30px", height:"30px", borderRadius:"50%",
              background:"linear-gradient(135deg,#1e3a5f,#2a9d8f)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <IcBrain size={14} color="white"/>
            </div>
            <div style={{ background:"white", borderRadius:"18px 18px 18px 4px",
              padding:"14px 18px", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ display:"flex", gap:"5px" }}>
                {[0,1,2].map(d => (
                  <div key={d} style={{ width:"7px", height:"7px", borderRadius:"50%",
                    background:"var(--text3)", animation:"pulse 1.2s ease infinite",
                    animationDelay:`${d*0.15}s` }}/>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* INPUT */}
      <div style={{
        position:"fixed", bottom:"var(--bottom-h)", left:0, right:0,
        background:"white", borderTop:"1px solid var(--border)",
        padding:"10px 16px", paddingBottom:"calc(10px + env(safe-area-inset-bottom,0px))",
        display:"flex", gap:"10px", alignItems:"flex-end",
        zIndex:50,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && send()}
          placeholder="Pregunta sobre tus expedientes…"
          style={{
            flex:1, background:"#f7f7f7", border:"none", borderRadius:"22px",
            padding:"12px 16px", fontSize:"15px", outline:"none",
            color:"var(--text)", resize:"none",
          }}
        />
        <button onClick={() => send()} style={{
          width:"44px", height:"44px", borderRadius:"50%", border:"none",
          background: input.trim() ? "var(--primary)" : "#e8e8e8",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"background .15s", cursor:"pointer", flexShrink:0,
        }}>
          <IcSend size={18} color={input.trim() ? "white" : "var(--text3)"}/>
        </button>
      </div>
    </main>
  );
}
