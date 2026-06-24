"use client";
import { useState } from "react";
import { IcLink, IcCopy, IcWA } from "@/components/Ic";

const ENDPOINT = "https://internum360.click/api/mcp";

const PASOS = [
  {
    n: 1,
    titulo: "Abre tu IA → Configuración → Conectores",
    desc: "Ve a Configuración → Conectores → Agregar servidor MCP",
    screen: (
      <div style={{ background:"#f0f4f8", borderRadius:"12px", padding:"16px",
        fontFamily:"monospace", fontSize:"12px", color:"#555" }}>
        <div style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
          {["●","●","●"].map((d,i)=>
            <div key={i} style={{ width:"10px", height:"10px", borderRadius:"50%",
              background:i===0?"#ff5f57":i===1?"#febc2e":"#28c840" }}/>)}
        </div>
        <div style={{ color:"#888", marginBottom:"6px" }}>⚙ Settings</div>
        <div style={{ paddingLeft:"12px", color:"#888", marginBottom:"4px" }}>› General</div>
        <div style={{ paddingLeft:"12px", color:"#888", marginBottom:"4px" }}>› Privacy</div>
        <div style={{ paddingLeft:"12px", background:"#dbeafe", borderRadius:"6px",
          padding:"4px 8px", color:"#1e3a5f", fontWeight:700 }}>
          › Connectors / MCP <span style={{ float:"right" }}>›</span>
        </div>
      </div>
    ),
  },
  {
    n: 2,
    titulo: "Pega la URL de tu Brain",
    desc: "Ingresa la URL del servidor MCP de Internum y haz clic en Conectar",
    screen: (
      <div style={{ background:"#f0f4f8", borderRadius:"12px", padding:"16px" }}>
        <p style={{ fontSize:"11px", color:"#888", marginBottom:"6px" }}>URL del servidor MCP</p>
        <div style={{ background:"white", borderRadius:"8px", padding:"10px 12px",
          fontSize:"12px", fontFamily:"monospace", color:"#1e3a5f",
          border:"1.5px solid #2a9d8f", marginBottom:"10px" }}>
          https://internum360.click/api/mcp
        </div>
        <div style={{ background:"#1e3a5f", borderRadius:"8px", padding:"8px",
          textAlign:"center", fontSize:"13px", fontWeight:700, color:"white" }}>
          Conectar
        </div>
      </div>
    ),
  },
  {
    n: 3,
    titulo: "Ingresa tu API Key",
    desc: "Encuentra tu API Key en tu Perfil → Seguridad → API Key de Brain",
    screen: (
      <div style={{ background:"#f0f4f8", borderRadius:"12px", padding:"16px" }}>
        <p style={{ fontSize:"11px", color:"#888", marginBottom:"6px" }}>API Key de Internum Brain</p>
        <div style={{ background:"white", borderRadius:"8px", padding:"10px 12px",
          fontSize:"12px", fontFamily:"monospace", color:"#999",
          border:"1.5px solid #ebebeb", marginBottom:"10px" }}>
          ib_••••••••••••••••••••••
        </div>
        <div style={{ background:"#2a9d8f", borderRadius:"8px", padding:"8px",
          textAlign:"center", fontSize:"13px", fontWeight:700, color:"white" }}>
          Verificar y guardar
        </div>
      </div>
    ),
  },
  {
    n: 4,
    titulo: "¡Tu IA ahora conoce tu despacho!",
    desc: "Pregúntale sobre expedientes, tareas, vencimientos o resúmenes en tiempo real",
    screen: (
      <div style={{ background:"#f0f4f8", borderRadius:"12px", padding:"14px",
        display:"flex", flexDirection:"column", gap:"8px" }}>
        <div style={{ alignSelf:"flex-end", background:"#1e3a5f", color:"white",
          borderRadius:"14px 14px 4px 14px", padding:"8px 12px",
          fontSize:"12px", maxWidth:"80%" }}>
          ¿Cuántos expedientes activos tengo?
        </div>
        <div style={{ alignSelf:"flex-start", background:"white",
          borderRadius:"14px 14px 14px 4px", padding:"8px 12px",
          fontSize:"12px", color:"#222", maxWidth:"85%",
          boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
          Tienes <strong>6 expedientes activos</strong> en Internum 360. El más avanzado es Inmobiliaria Querétaro con 97% ✅
        </div>
      </div>
    ),
  },
];

const COMPAT = [
  { nombre:"ChatGPT", color:"#10a37f", letra:"G", status:"Compatible" },
  { nombre:"Claude",  color:"#d97706", letra:"C", status:"Compatible" },
  { nombre:"Copilot", color:"#0078d4", letra:"M", status:"Próximamente" },
];

export default function McpPage() {
  const [copied, setCopied] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(ENDPOINT).catch(()=>{});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main style={{ background:"#f7f7f7", minHeight:"100dvh",
      paddingBottom:"calc(var(--bottom-h) + 24px)" }}>

      {/* HEADER */}
      <div style={{ background:"white", padding:"52px 20px 16px",
        borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"12px",
            background:"linear-gradient(135deg,#1e3a5f,#2a9d8f)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IcLink size={20} color="white"/>
          </div>
          <div>
            <h1 style={{ fontSize:"17px", fontWeight:800, color:"var(--text)" }}>
              Conecta tu Brain
            </h1>
            <p style={{ fontSize:"12px", color:"var(--text2)" }}>
              Integra con ChatGPT, Claude o cualquier IA compatible
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:"20px" }}>

        {/* QUE ES MCP */}
        <div style={{
          background:"#f0f7ff", borderRadius:"16px", padding:"16px",
          borderLeft:"4px solid #1e3a5f", marginBottom:"16px",
        }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"#1e3a5f", marginBottom:"6px" }}>
            ¿Qué es el MCP?
          </p>
          <p style={{ fontSize:"13px", color:"var(--text2)", lineHeight:1.6 }}>
            El <strong style={{ color:"var(--text)" }}>Model Context Protocol</strong> permite
            que tu IA consulte en tiempo real los datos de tu despacho: expedientes, tareas,
            políticas y más — sin copiar ni pegar nada.
          </p>
        </div>

        {/* ENDPOINT */}
        <div style={{ background:"white", borderRadius:"20px", padding:"20px",
          marginBottom:"16px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)", marginBottom:"10px" }}>
            Tu endpoint MCP
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{
              flex:1, background:"#f7f7f7", borderRadius:"10px", padding:"10px 12px",
              fontFamily:"monospace", fontSize:"12px", color:"#1e3a5f", fontWeight:600,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            }}>{ENDPOINT}</div>
            <button onClick={copiar} style={{
              padding:"10px 14px", borderRadius:"10px", border:"none",
              background: copied ? "#008a05" : "var(--primary)",
              color:"white", fontSize:"12px", fontWeight:700,
              cursor:"pointer", transition:"all .15s", flexShrink:0,
              display:"flex", alignItems:"center", gap:"6px",
            }}>
              <IcCopy size={14} color="white"/>
              {copied ? "Copiado ✓" : "Copiar"}
            </button>
          </div>
        </div>

        {/* PASOS */}
        <div style={{ background:"white", borderRadius:"20px", padding:"20px",
          marginBottom:"16px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)", marginBottom:"16px" }}>
            Cómo conectar — paso a paso
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
            {PASOS.map((p, i) => (
              <div key={i}>
                <div style={{ display:"flex", gap:"12px", marginBottom:"10px" }}>
                  <div style={{ width:"28px", height:"28px", borderRadius:"50%",
                    background:"var(--primary)", color:"white",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"13px", fontWeight:800, flexShrink:0 }}>
                    {p.n}
                  </div>
                  <div>
                    <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text)",
                      marginBottom:"2px" }}>{p.titulo}</p>
                    <p style={{ fontSize:"12px", color:"var(--text2)", lineHeight:1.5 }}>
                      {p.desc}
                    </p>
                  </div>
                </div>
                {p.screen}
                {i < PASOS.length - 1 && (
                  <div style={{ width:"2px", height:"16px", background:"#ebebeb",
                    marginLeft:"13px", marginTop:"8px" }}/>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* COMPATIBILIDAD */}
        <div style={{ background:"white", borderRadius:"20px", padding:"20px",
          marginBottom:"16px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)", marginBottom:"14px" }}>
            Compatibilidad
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
            {COMPAT.map(c => (
              <div key={c.nombre} style={{ textAlign:"center", padding:"14px 8px",
                background:"#f7f7f7", borderRadius:"14px" }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"50%",
                  background:c.color, color:"white",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"16px", fontWeight:800, margin:"0 auto 8px" }}>
                  {c.letra}
                </div>
                <p style={{ fontSize:"12px", fontWeight:700, color:"var(--text)",
                  marginBottom:"4px" }}>{c.nombre}</p>
                <span style={{
                  fontSize:"10px", fontWeight:700, padding:"2px 8px",
                  borderRadius:"40px",
                  background: c.status==="Compatible" ? "#e8fdf0" : "#fff8e8",
                  color:       c.status==="Compatible" ? "#008a05" : "#c47d00",
                }}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA SOPORTE */}
        <div style={{ background:"linear-gradient(135deg,#1e3a5f,#2a9d8f)",
          borderRadius:"20px", padding:"20px", textAlign:"center" }}>
          <p style={{ fontSize:"15px", fontWeight:800, color:"white", marginBottom:"6px" }}>
            ¿Necesitas ayuda con la integración?
          </p>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.75)", marginBottom:"16px" }}>
            Nuestro equipo te guía paso a paso
          </p>
          <a href="https://wa.me/529984292748?text=Hola%2C%20necesito%20ayuda%20para%20conectar%20Internum%20Brain%20a%20mi%20IA"
            target="_blank" rel="noreferrer"
            style={{ display:"inline-flex", alignItems:"center", gap:"8px",
              background:"#25D366", color:"white", padding:"12px 24px",
              borderRadius:"14px", fontSize:"14px", fontWeight:700,
              textDecoration:"none" }}>
            <IcWA size={18} color="white"/>
            Escribir al soporte
          </a>
        </div>
      </div>
    </main>
  );
}
