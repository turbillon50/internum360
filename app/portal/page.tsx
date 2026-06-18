
"use client";
import { CLIENTES, TAREAS } from "@/lib/data";
import { IcCheck, IcAlert, IcCalendar, IcBell } from "@/components/Ic";

const c = CLIENTES[0]; // Constructora del Bajío como demo

const STATUS_ICON: Record<string,React.ReactNode> = {
  "En proceso": <IcCalendar size={14} color="#0ea5e9"/>,
  "Revisión":   <IcBell    size={14} color="#8b5cf6"/>,
  "Pendiente":  <IcAlert   size={14} color="#f59e0b"/>,
  "Vencida":    <IcAlert   size={14} color="#ef4444"/>,
  "Por cerrar": <IcCheck   size={14} color="#10b981"/>,
  "Iniciando":  <IcCalendar size={14} color="#8b5cf6"/>,
};

export default function Portal() {
  const tareas = TAREAS.filter(t => t.clienteId === c.id);

  return (
    <main className="page" style={{ background:"#fff" }}>
      {/* HERO */}
      <div style={{ background:"linear-gradient(160deg,#0f172a,#1e3a5f)", padding:"56px 20px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"20px" }}>
          <div style={{ width:"52px", height:"52px", borderRadius:"14px",
            overflow:"hidden", flexShrink:0, background:"#2a9d8f",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <img src={c.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          </div>
          <div>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"12px", marginBottom:"2px" }}>Portal del cliente</p>
            <h1 style={{ color:"white", fontSize:"20px", fontWeight:800, letterSpacing:"-0.4px" }}>{c.empresa}</h1>
          </div>
        </div>

        {/* avance grande */}
        <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:"16px", padding:"18px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
            <span style={{ color:"rgba(255,255,255,0.7)", fontSize:"14px" }}>Avance del servicio</span>
            <span style={{ color:"white", fontSize:"26px", fontWeight:800, letterSpacing:"-0.5px" }}>{c.avance}%</span>
          </div>
          <div style={{ height:"8px", background:"rgba(255,255,255,0.15)", borderRadius:"8px" }}>
            <div style={{ width:`${c.avance}%`, height:"100%",
              background:"linear-gradient(90deg,#2a9d8f,#34d399)", borderRadius:"8px" }}/>
          </div>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"12px", marginTop:"8px" }}>
            Servicios: {c.servicios.join(" · ")} · Vence {c.vence}
          </p>
        </div>
      </div>

      {/* ACTIVIDAD */}
      <div style={{ padding:"24px 20px 0" }}>
        <h2 style={{ fontSize:"18px", fontWeight:800, color:"var(--text)",
          letterSpacing:"-0.3px", marginBottom:"16px" }}>Actividad reciente</h2>

        {tareas.map(t => (
          <div key={t.id} style={{ display:"flex", gap:"12px",
            padding:"14px 0", borderBottom:"1px solid var(--border)" }}>
            <div style={{ width:"32px", height:"32px", borderRadius:"50%",
              background:"#f7f7f7", display:"flex", alignItems:"center",
              justifyContent:"center", flexShrink:0, marginTop:"2px" }}>
              {STATUS_ICON[t.estatus] ?? <IcCheck size={14} color="#10b981"/>}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text)" }}>{t.titulo}</p>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:"4px" }}>
                <span style={{ fontSize:"12px", color:"var(--text2)" }}>{t.estatus}</span>
                <span style={{ fontSize:"12px", color:"var(--text3)" }}>Vence {t.vence}</span>
              </div>
              {t.pct > 0 && (
                <div style={{ marginTop:"8px", height:"3px", background:"#f0f0f0", borderRadius:"4px" }}>
                  <div style={{ width:`${t.pct}%`, height:"100%", background:c.color, borderRadius:"4px" }}/>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Mensaje del auditor */}
        <div style={{ marginTop:"20px", background:"#f0fdf4", borderRadius:"16px",
          padding:"18px", border:"1px solid #bbf7d0" }}>
          <p style={{ fontSize:"13px", fontWeight:700, color:"#166534", marginBottom:"6px" }}>
            💬 Mensaje de tu auditor
          </p>
          <p style={{ fontSize:"14px", color:"#166534", lineHeight:1.6 }}>
            Hola, tu expediente avanza a buen ritmo. La próxima semana enviamos el borrador del informe final para tu revisión. Cualquier duda, estamos disponibles.
          </p>
          <p style={{ fontSize:"12px", color:"#4ade80", marginTop:"8px", fontWeight:600 }}>
            Hugo Alcántara — hace 2 horas
          </p>
        </div>
      </div>
    </main>
  );
}
