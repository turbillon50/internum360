"use client";
import { CLIENTES, TAREAS, KPI } from "@/lib/data";
import { useRouter } from "next/navigation";
import { IcBarChart, IcBriefcase, IcAlert, IcCheck, IcChevL } from "@/components/Ic";

const maxKpi = Math.max(...KPI.map(k => k.v));

const AUDITORS = [
  { nombre:"Hugo Alcántara", avatar:"HA", color:"#1e3a5f", clientes:2, tareas:3, prom:89 },
  { nombre:"Sofía Ramírez",  avatar:"SR", color:"#2a9d8f", clientes:1, tareas:1, prom:45 },
  { nombre:"Diego Morales",  avatar:"DM", color:"#8b5cf6", clientes:1, tareas:1, prom:30 },
  { nombre:"Valentina Cruz", avatar:"VC", color:"#ec4899", clientes:2, tareas:2, prom:79 },
];

export default function AdminView() {
  const router      = useRouter();
  const completadas = TAREAS.filter(t => t.estatus === "Por cerrar" || t.pct===100).length;
  const vencidas    = TAREAS.filter(t => t.estatus === "Vencida").length;
  const promedio    = Math.round(CLIENTES.reduce((a,c) => a+c.avance,0)/CLIENTES.length);

  return (
    <main className="page" style={{ background:"#fff" }}>
      <div style={{ padding:"56px 20px 0" }}>
        {/* Back button */}
        <button onClick={() => router.back()} style={{
          display:"flex", alignItems:"center", gap:"4px",
          background:"none", border:"none", cursor:"pointer",
          color:"var(--text2)", fontSize:"14px", fontWeight:600,
          marginBottom:"16px", marginLeft:"-4px", padding:0,
        }}>
          <IcChevL size={20} color="var(--text2)"/> Volver
        </button>

        <p style={{ fontSize:"13px", color:"var(--text2)" }}>Panel ejecutivo</p>
        <h1 style={{ fontSize:"28px", fontWeight:800, color:"var(--text)",
          letterSpacing:"-0.8px", marginBottom:"24px" }}>Internum 360</h1>

        {/* KPI CARDS */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"24px" }}>
          {[
            { label:"Clientes activos", val:CLIENTES.length, color:"#1e3a5f", icon:<IcBriefcase size={18} color="white"/> },
            { label:"Avance promedio",  val:`${promedio}%`,   color:"#2a9d8f", icon:<IcBarChart  size={18} color="white"/> },
            { label:"Tareas vencidas",  val:vencidas,         color:"#ef4444", icon:<IcAlert     size={18} color="white"/> },
            { label:"Por cerrar",       val:completadas,      color:"#10b981", icon:<IcCheck     size={18} color="white"/> },
          ].map(k => (
            <div key={k.label} style={{ borderRadius:"16px", padding:"18px", background:k.color }}>
              <div style={{ marginBottom:"12px" }}>{k.icon}</div>
              <p style={{ fontSize:"30px", fontWeight:800, color:"white", letterSpacing:"-1px" }}>{k.val}</p>
              <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.7)", marginTop:"4px" }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* GRÁFICA */}
        <div style={{ background:"#f7f7f7", borderRadius:"20px", padding:"20px", marginBottom:"24px" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text2)", marginBottom:"4px" }}>Ingresos mensuales</p>
          <p style={{ fontSize:"24px", fontWeight:800, color:"var(--text)", letterSpacing:"-0.5px", marginBottom:"16px" }}>
            $96,000 <span style={{ fontSize:"14px", color:"#10b981", fontWeight:600 }}>↑ 9%</span>
          </p>
          <div style={{ display:"flex", alignItems:"flex-end", gap:"8px", height:"64px" }}>
            {KPI.map(k => (
              <div key={k.mes} style={{ flex:1, display:"flex", flexDirection:"column",
                alignItems:"center", gap:"6px" }}>
                <div style={{
                  width:"100%", borderRadius:"6px 6px 0 0",
                  background: k.mes==="Jun" ? "#1e3a5f" : "#dde3ed",
                  height:`${(k.v/maxKpi)*56}px`, minHeight:"4px",
                }}/>
                <span style={{ fontSize:"10px", color:"var(--text3)" }}>{k.mes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* EQUIPO */}
        <h2 style={{ fontSize:"18px", fontWeight:800, color:"var(--text)",
          letterSpacing:"-0.3px", marginBottom:"14px" }}>Rendimiento del equipo</h2>
        {AUDITORS.map(a => (
          <div key={a.nombre} style={{ display:"flex", alignItems:"center", gap:"12px",
            padding:"14px 0", borderBottom:"1px solid var(--border)" }}>
            <div style={{ width:"42px", height:"42px", borderRadius:"50%",
              background:a.color, display:"flex", alignItems:"center",
              justifyContent:"center", color:"white", fontWeight:800, fontSize:"13px", flexShrink:0 }}>
              {a.avatar}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text)" }}>{a.nombre}</p>
                <span style={{ fontSize:"13px", fontWeight:700, color:a.color }}>{a.prom}%</span>
              </div>
              <p style={{ fontSize:"12px", color:"var(--text2)", marginTop:"2px" }}>
                {a.clientes} clientes · {a.tareas} tareas activas
              </p>
              <div style={{ marginTop:"6px", height:"3px", background:"#f0f0f0", borderRadius:"4px" }}>
                <div style={{ width:`${a.prom}%`, height:"100%", background:a.color, borderRadius:"4px" }}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
