
"use client";
import { useRouter } from "next/navigation";
import { CLIENTES, TAREAS, ME, KPI } from "@/lib/data";
import { IcBell, IcChevR, IcAlert, IcBarChart, IcCalendar } from "@/components/Ic";

const STATUS_COLOR: Record<string,string> = {
  "En proceso":"#0ea5e9","Por cerrar":"#10b981",
  "Pendiente":"#f59e0b","Iniciando":"#8b5cf6","Vencida":"#ef4444",
};

export default function Home() {
  const router = useRouter();
  const urgentes = TAREAS.filter(t => t.estatus === "Vencida" || t.estatus === "Revisión");
  const maxKpi   = Math.max(...KPI.map(k => k.v));

  return (
    <main className="page" style={{ background:"#fff" }}>
      {/* ── HEADER ── */}
      <div style={{ padding:"56px 20px 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ fontSize:"14px", color:"var(--text2)", marginBottom:"4px" }}>Buenos días</p>
          <h1 style={{ fontSize:"28px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.8px", lineHeight:1.1 }}>
            {ME.nombre.split(" ")[0]} 👋
          </h1>
        </div>
        <button onClick={() => router.push("/perfil")} style={{
          width:"44px", height:"44px", borderRadius:"50%",
          background:"var(--primary)", border:"none",
          color:"white", fontWeight:800, fontSize:"15px",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 12px rgba(30,58,95,0.25)",
        }}>{ME.avatar}</button>
      </div>

      {/* ── KPI STRIP ── */}
      <div style={{ padding:"24px 20px 0", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
        {[
          { label:"Clientes",     val: CLIENTES.length,                                    icon:<IcBarChart size={16} color="#2a9d8f"/> },
          { label:"En proceso",   val: TAREAS.filter(t=>t.estatus==="En proceso").length,   icon:<IcCalendar size={16} color="#f59e0b"/> },
          { label:"Urgentes",     val: urgentes.length,                                     icon:<IcAlert    size={16} color="#ef4444"/> },
        ].map(k => (
          <div key={k.label} style={{
            background:"#f7f7f7", borderRadius:"16px", padding:"14px 12px",
          }}>
            <div style={{ marginBottom:"8px" }}>{k.icon}</div>
            <div style={{ fontSize:"26px", fontWeight:"800", color:"var(--text)", letterSpacing:"-1px" }}>{k.val}</div>
            <div style={{ fontSize:"11px", color:"var(--text2)", marginTop:"2px" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── INGRESOS MINI CHART ── */}
      <div style={{ margin:"24px 20px 0", background:"#f7f7f7", borderRadius:"20px", padding:"18px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
          <div>
            <p style={{ fontSize:"12px", color:"var(--text2)" }}>Ingresos junio</p>
            <p style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.5px" }}>$96,000 <span style={{ fontSize:"13px", color:"#10b981", fontWeight:600 }}>↑9%</span></p>
          </div>
          <button onClick={() => router.push("/admin-view")} style={{
            padding:"6px 14px", borderRadius:"40px", border:"1.5px solid var(--border)",
            background:"white", color:"var(--text)", fontSize:"12px", fontWeight:600,
          }}>Ver panel</button>
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:"6px", height:"52px" }}>
          {KPI.map(k => (
            <div key={k.mes} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
              <div style={{
                width:"100%", borderRadius:"4px 4px 0 0",
                background: k.mes==="Jun" ? "#1e3a5f" : "#dde3ed",
                height:`${(k.v/maxKpi)*44}px`, minHeight:"4px",
                transition:"height .4s",
              }}/>
              <span style={{ fontSize:"9px", color:"var(--text3)" }}>{k.mes}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MIS CLIENTES ── */}
      <div style={{ padding:"28px 20px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <h2 style={{ fontSize:"18px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.3px" }}>Mis expedientes</h2>
          <button onClick={() => router.push("/clientes")} style={{ background:"none", border:"none", color:"var(--accent)", fontSize:"13px", fontWeight:600 }}>Ver todos</button>
        </div>

        {/* Scroll horizontal tipo Airbnb */}
        <div style={{ display:"flex", gap:"12px", overflowX:"auto", paddingBottom:"8px", marginRight:"-20px", paddingRight:"20px", scrollbarWidth:"none" }}>
          {CLIENTES.slice(0,4).map(c => (
            <div key={c.id} className="pressable" onClick={() => router.push(`/clientes/${c.id}`)}
              style={{ minWidth:"160px", borderRadius:"16px", overflow:"hidden", cursor:"pointer", flexShrink:0, boxShadow:"0 2px 12px rgba(0,0,0,0.08)" }}>
              <div style={{ position:"relative", height:"110px", overflow:"hidden" }}>
                <img src={c.img} alt={c.empresa} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55))" }}/>
                <div style={{
                  position:"absolute", top:"8px", right:"8px",
                  background:"rgba(255,255,255,0.92)", borderRadius:"40px",
                  padding:"2px 8px", fontSize:"11px", fontWeight:700,
                  color: STATUS_COLOR[c.estatus] ?? "#666",
                }}>{c.estatus}</div>
                <div style={{ position:"absolute", bottom:"8px", left:"10px", right:"10px" }}>
                  <p style={{ color:"white", fontSize:"12px", fontWeight:700, letterSpacing:"-0.2px" }}>{c.empresa.split(" ")[0]}</p>
                </div>
              </div>
              <div style={{ padding:"10px 12px", background:"white" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
                  <span style={{ fontSize:"11px", color:"var(--text2)" }}>Avance</span>
                  <span style={{ fontSize:"11px", fontWeight:700, color: c.color }}>{c.avance}%</span>
                </div>
                <div style={{ height:"4px", background:"#f0f0f0", borderRadius:"4px" }}>
                  <div style={{ width:`${c.avance}%`, height:"100%", background:c.color, borderRadius:"4px" }}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TAREAS URGENTES ── */}
      {urgentes.length > 0 && (
        <div style={{ padding:"28px 20px 0" }}>
          <h2 style={{ fontSize:"18px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.3px", marginBottom:"14px" }}>Atención urgente</h2>
          {urgentes.map(t => {
            const c = CLIENTES.find(x => x.id === t.clienteId);
            return (
              <div key={t.id} style={{
                display:"flex", alignItems:"center", gap:"12px",
                padding:"14px 16px", background:"#fff5f5", borderRadius:"14px",
                border:"1px solid #fecaca", marginBottom:"8px",
              }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#fee2e2",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <IcAlert size={18} color="#ef4444"/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.titulo}</p>
                  <p style={{ fontSize:"12px", color:"var(--text2)", marginTop:"2px" }}>{c?.empresa} · Vence {t.vence}</p>
                </div>
                <IcChevR size={18} color="var(--text3)"/>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
