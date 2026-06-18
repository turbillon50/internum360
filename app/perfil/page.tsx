
"use client";
import { ME, CLIENTES, TAREAS } from "@/lib/data";
import { IcBriefcase, IcCalendar, IcBarChart, IcChevR } from "@/components/Ic";
import { useRouter } from "next/navigation";

const EQUIPO = [
  { nombre:"Hugo Alcántara",   rol:"Director",      clientes:2, avatar:"HA", color:"#1e3a5f" },
  { nombre:"Sofía Ramírez",    rol:"Auditora Sr",   clientes:1, avatar:"SR", color:"#2a9d8f" },
  { nombre:"Diego Morales",    rol:"Auditor Jr",    clientes:1, avatar:"DM", color:"#8b5cf6" },
  { nombre:"Valentina Cruz",   rol:"Contadora",     clientes:2, avatar:"VC", color:"#ec4899" },
];

export default function Perfil() {
  const router = useRouter();
  const activas = TAREAS.filter(t => t.estatus === "En proceso").length;

  return (
    <main className="page" style={{ background:"#fff" }}>
      {/* HEADER con avatar grande */}
      <div style={{ background:"linear-gradient(160deg,#1e3a5f 0%,#2a5298 100%)",
        padding:"64px 20px 32px", textAlign:"center" }}>
        <div style={{
          width:"80px", height:"80px", borderRadius:"50%",
          background:"rgba(255,255,255,0.2)", border:"3px solid rgba(255,255,255,0.5)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"28px", fontWeight:800, color:"white", margin:"0 auto 14px",
        }}>{ME.avatar}</div>
        <h1 style={{ color:"white", fontSize:"22px", fontWeight:800, letterSpacing:"-0.5px" }}>{ME.nombre}</h1>
        <p style={{ color:"rgba(255,255,255,0.7)", fontSize:"14px", marginTop:"4px" }}>{ME.rol} · {ME.despacho}</p>
        <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"12px", marginTop:"4px" }}>hugo@internum360.mx</p>
      </div>

      {/* STATS */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
        padding:"0 20px", gap:"12px", marginTop:"-1px",
        background:"white", paddingTop:"20px" }}>
        {[
          { label:"Clientes",   val:CLIENTES.length,   icon:<IcBriefcase size={16} color="#1e3a5f"/> },
          { label:"En proceso", val:activas,            icon:<IcCalendar  size={16} color="#f59e0b"/> },
          { label:"Promedio",   val:"68%",              icon:<IcBarChart  size={16} color="#10b981"/> },
        ].map(s => (
          <div key={s.label} style={{ background:"#f7f7f7", borderRadius:"14px", padding:"14px 12px", textAlign:"center" }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:"6px" }}>{s.icon}</div>
            <p style={{ fontSize:"22px", fontWeight:800, color:"var(--text)", letterSpacing:"-0.5px" }}>{s.val}</p>
            <p style={{ fontSize:"11px", color:"var(--text2)", marginTop:"2px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* EQUIPO */}
      <div style={{ padding:"28px 20px 0" }}>
        <h2 style={{ fontSize:"18px", fontWeight:800, color:"var(--text)",
          letterSpacing:"-0.3px", marginBottom:"16px" }}>Mi equipo</h2>
        {EQUIPO.map((p,i) => (
          <div key={p.nombre} className="fade-up pressable"
            style={{ animationDelay:`${i*50}ms`, opacity:0,
              display:"flex", alignItems:"center", gap:"12px",
              padding:"12px 0", borderBottom:"1px solid var(--border)" }}>
            <div style={{ width:"44px", height:"44px", borderRadius:"50%",
              background:p.color, display:"flex", alignItems:"center",
              justifyContent:"center", flexShrink:0,
              fontSize:"14px", fontWeight:800, color:"white" }}>
              {p.avatar}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:"15px", fontWeight:700, color:"var(--text)" }}>{p.nombre}</p>
              <p style={{ fontSize:"12px", color:"var(--text2)", marginTop:"2px" }}>{p.rol} · {p.clientes} clientes</p>
            </div>
            <IcChevR size={16} color="var(--text3)"/>
          </div>
        ))}
      </div>

      {/* ACCIONES */}
      <div style={{ padding:"28px 20px 0" }}>
        <h2 style={{ fontSize:"18px", fontWeight:800, color:"var(--text)",
          letterSpacing:"-0.3px", marginBottom:"16px" }}>Configuración</h2>
        {["Notificaciones","Seguridad","Facturación del despacho","Soporte"].map(item => (
          <div key={item} style={{ display:"flex", justifyContent:"space-between",
            alignItems:"center", padding:"14px 0",
            borderBottom:"1px solid var(--border)", cursor:"pointer" }}>
            <span style={{ fontSize:"15px", color:"var(--text)" }}>{item}</span>
            <IcChevR size={16} color="var(--text3)"/>
          </div>
        ))}
        <button onClick={() => router.push("/sign-in")} style={{
          width:"100%", marginTop:"24px", padding:"16px",
          borderRadius:"14px", border:"none",
          background:"#fff0f0", color:"#e02020",
          fontSize:"15px", fontWeight:700, cursor:"pointer",
        }}>Cerrar sesión</button>
      </div>
    </main>
  );
}
