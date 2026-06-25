"use client";
import { useState, useRef, useEffect } from "react";
import { BRAIN_QA } from "@/lib/data";
import { IcSend, IcBrain } from "@/components/Ic";

type Msg = { role:"user"|"ai"; text:string };

const SESSION_KEY = "internum_session_id";
const MSGS_KEY    = "internum_chat_msgs";

function getSessionId(): string {
  if (typeof window === "undefined") return "internum-ssr";
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `internum-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

const MSG_INICIAL: Msg[] = [{
  role:"ai",
  text:"Hola Hugo 👋 Soy tu asistente **Internum Brain**.\nPregúntame sobre expedientes, tareas, ingresos, documentos o tu equipo."
}];

const SUGERENCIAS = [
  "Resumen del despacho",
  "Tareas vencidas",
  "Clientes +80%",
  "Ingresos junio",
  "¿Qué documentos tienes?",
];

export default function Brain() {
  const [msgs,    setMsgs]    = useState<Msg[]>(MSG_INICIAL);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sid,     setSid]     = useState("");
  const [ready,   setReady]   = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  // Cargar sesión al montar (solo client-side)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const sessionId = getSessionId();
    setSid(sessionId);
    try {
      const raw = localStorage.getItem(MSGS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Msg[];
        if (saved.length > 0) setMsgs(saved);
      }
    } catch {}
    setReady(true);
  }, []);

  // Scroll al fondo
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [msgs, loading]);

  // Guardar mensajes
  useEffect(() => {
    if (!ready || msgs.length === 0) return;
    try { localStorage.setItem(MSGS_KEY, JSON.stringify(msgs.slice(-30))); } catch {}
  }, [msgs, ready]);

  // Ajuste de viewport cuando abre teclado en iOS
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    function onResize() {
      // forzar scroll al fondo cuando teclado sube
      bottomRef.current?.scrollIntoView({ behavior:"smooth" });
    }
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  function responde(q: string): string {
    const ql = q.toLowerCase();
    for (const qa of BRAIN_QA) {
      if (ql.includes(qa.q.toLowerCase())) return qa.a;
    }
    return "Revisé tu Brain. Pregúntame sobre **expedientes**, **tareas vencidas**, **ingresos**, **documentos subidos** o el **resumen del despacho**.";
  }

  async function send(texto?: string) {
    const q = (texto ?? input).trim();
    if (!q || loading) return;
    setInput("");

    const newMsgs: Msg[] = [...msgs, { role:"user", text:q }];
    setMsgs(newMsgs);
    setLoading(true);

    let respuesta = "";
    try {
      const res = await fetch("/api/brain-chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          message:q,
          session_id: sid || getSessionId(),
          history: newMsgs.slice(-8).map(m => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
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

  function limpiarChat() {
    const inicial: Msg[] = [{ role:"ai", text:"Chat reiniciado. Hola de nuevo Hugo 👋 ¿En qué te ayudo?" }];
    setMsgs(inicial);
    const newSid = `internum-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    if (typeof window !== "undefined") localStorage.setItem(SESSION_KEY, newSid);
    setSid(newSid);
  }

  function renderText(t: string) {
    return t.split("\n").map((line, i) => {
      const html = line.replace(/\*\*(.+?)\*\*/g, (_,m) => `<strong>${m}</strong>`);
      return (
        <p key={i} style={{ margin:"2px 0", lineHeight:1.55 }}
          dangerouslySetInnerHTML={{ __html:html }}/>
      );
    });
  }

  return (
    <div style={{ display:"flex", flexDirection:"column",
      height:"100dvh", background:"#f7f7f7", overflow:"hidden" }}>

      {/* HEADER sticky */}
      <div style={{ background:"white", padding:"52px 20px 14px",
        borderBottom:"1px solid var(--border)", flexShrink:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"12px",
              background:"linear-gradient(135deg,#1e3a5f,#2a9d8f)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <IcBrain size={20} color="white"/>
            </div>
            <div>
              <h1 style={{ fontSize:"17px", fontWeight:800, color:"var(--text)" }}>
                Internum Brain
              </h1>
              <p style={{ fontSize:"12px", color:"#10b981", fontWeight:600 }}>
                ● En línea · {msgs.length > 1 ? `${msgs.length - 1} mensajes` : "Nuevo chat"}
              </p>
            </div>
          </div>
          {msgs.length > 2 && (
            <button onClick={limpiarChat} style={{
              padding:"6px 12px", borderRadius:"40px",
              border:"1.5px solid var(--border)", background:"white",
              fontSize:"11px", fontWeight:600, color:"var(--text2)", cursor:"pointer",
            }}>↺ Nuevo</button>
          )}
        </div>
      </div>

      {/* SUGERENCIAS — solo al inicio, scroll horizontal sin cortes */}
      {msgs.length <= 1 && (
        <div style={{
          display:"flex", gap:"8px",
          overflowX:"auto",
          WebkitOverflowScrolling:"touch" as any,
          touchAction:"pan-x",
          scrollbarWidth:"none",
          padding:"14px 16px 0",
          flexShrink:0,
        } as React.CSSProperties}>
          {SUGERENCIAS.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              padding:"8px 14px", borderRadius:"40px",
              border:"1.5px solid var(--border)",
              background:"white", fontSize:"13px", color:"var(--text)",
              fontWeight:600, cursor:"pointer",
              whiteSpace:"nowrap", flexShrink:0,
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* MENSAJES — scrollable, ocupa el espacio restante */}
      <div style={{
        flex:1, overflowY:"auto",
        WebkitOverflowScrolling:"touch" as any,
        padding:"16px 16px 0",
        display:"flex", flexDirection:"column", gap:"12px",
      } as React.CSSProperties}>

        {/* Skeleton mientras carga del localStorage */}
        {!ready && (
          <div className="skeleton" style={{ height:"56px", borderRadius:"14px" }}/>
        )}

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
              maxWidth:"78%", padding:"12px 14px",
              borderRadius: m.role==="user"
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              background: m.role==="user" ? "var(--primary)" : "white",
              color:       m.role==="user" ? "white" : "var(--text)",
              fontSize:"14px",
              boxShadow:"0 1px 4px rgba(0,0,0,0.07)",
              lineHeight:1.5,
            }}>
              {renderText(m.text)}
            </div>
          </div>
        ))}

        {/* Typing dots */}
        {loading && (
          <div style={{ display:"flex", alignItems:"flex-end", gap:"8px" }}>
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
        <div ref={bottomRef} style={{ height:"8px" }}/>
      </div>

      {/* INPUT — fijo arriba del bottom nav, no fixed para no conflictar con teclado iOS */}
      <div style={{
        background:"white",
        borderTop:"1px solid var(--border)",
        padding:"10px 16px",
        paddingBottom:"calc(10px + env(safe-area-inset-bottom, 0px))",
        display:"flex", gap:"10px", alignItems:"center",
        flexShrink:0,
        /* Espacio para la bottom nav */
        marginBottom:"var(--bottom-h)",
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && !e.shiftKey && send()}
          placeholder="Pregunta sobre tus docs, expedientes…"
          style={{ flex:1, background:"#f7f7f7", border:"none",
            borderRadius:"22px", padding:"12px 16px",
            fontSize:"15px", outline:"none", color:"var(--text)",
            minWidth:0,
          }}
        />
        <button onClick={() => send()} style={{
          width:"44px", height:"44px", minWidth:"44px",
          borderRadius:"50%", border:"none",
          background: input.trim() ? "var(--primary)" : "#e8e8e8",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"background .15s", cursor:"pointer",
        }}>
          <IcSend size={18} color={input.trim() ? "white" : "var(--text3)"}/>
        </button>
      </div>
    </div>
  );
}
