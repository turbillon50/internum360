
"use client";
import { useParams, useRouter } from "next/navigation";
import { CLIENTES, TAREAS } from "@/lib/data";
import { IcChevL, IcCheck, IcAlert, IcCalendar, IcDots } from "@/components/Ic";

const STATUS_COLOR: Record<string,string> = {
  "En proceso":"#0ea5e9","Por cerrar":"#10b981","Pendiente":"#f59e0b",
  "Revisión":"#8b5cf6","Vencida":"#ef4444","Iniciando":"#8b5cf6",
};
const PRIORIDAD_COLOR: Record<string,string> = {
  "Alta":"#ef4444","Media":"#f59e0b","Baja":"#10b981"
};

export default function ClienteDetalle() {
  const { id }  = useParams<{id:string}>();
  const router  = useRouter();
  const c       = CLIENTES.find(x => x.id === id);
  const tareas  = TAREAS.filter(t => t.clienteId === id);

  if (!c) return (
    <main className="page" style={{ background:"#fff", padding:"100px 20px", textAlign:"center" }}>
      <p style={{ color:"var(--text2)" }}>Cliente no encontrado</p>
      <button onClick={() => router.back()} style={{ marginTop:"12px", color:"var(--accent)", fontWeight:600, background:"none", border:"none", fontSize:"15px" }}>← Volver</button>
    </main>
  );

  return (
    <main className="page" style={{ background:"#fff" }}>
      {/* FOTO HERO */}
      <div style={{ position:"relative", height:"220px", overflow:"hidden" }}>
        <img src={c.img} alt={c.empresa} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(0,0,0,0.25) 0%,rgba(0,0,0,0.55) 100%)" }}/>

        {/* Back button */}
        <button onClick={() => router.back()} style={{
          position:"absolute", top:"52px", left:"16px",
          width:"36px", height:"36px", borderRadius:"50%",
          background:"rgba(255,255,255,0.92)", border:"none",
          display:"flex", alignItems:"center", justifyContent:"center",
          backdropFilter:"blur(4px)",
        }}>
          <IcChevL size={20} color="var(--text)"/>
        </button>

        {/* More button */}
        <button style={{
          position:"absolute", top:"52px", right:"16px",
          width:"36px", height:"36px", borderRadius:"50%",
          background:"rgba(255,255,255,0.92)", border:"none",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <IcDots size={20} color="var(--text)"/>
        </button>

        {/* Empresa nombre */}
        <div style={{ position:"absolute", bottom:"18px", left:"20px", right:"20px" }}>
          <span style={{
            display:"inline-block", padding:"3px 10px", borderRadius:"40px",
            background: c.color, color:"white", fontSize:"11px", fontWeight:700,
            marginBottom:"6px",
          }}>{c.sector}</span>
          <h1 style={{ color:"white", fontSize:"22px", fontWeight:800, letterSpacing:"-0.5px", lineHeight:1.2 }}>
            {c.empresa}
          </h1>
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding:"20px" }}>

        {/* Estatus pill */}
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"20px" }}>
          <span style={{
            padding:"5px 14px", borderRadius:"40px", fontSize:"13px", fontWeight:700,
            background: (STATUS_COLOR[c.estatus]??'#666')+"18",
            color: STATUS_COLOR[c.estatus]??'#666',
          }}>{c.estatus}</span>
          <span style={{ padding:"5px 14px", borderRadius:"40px", fontSize:"13px",
            background:"#f7f7f7", color:"var(--text2)", fontWeight:600 }}>
            <IcCalendar size={12} color="var(--text3)"/> Vence {c.vence}
          </span>
          <span style={{ padding:"5px 14px", borderRadius:"40px", fontSize:"13px",
            background:"#f7f7f7", color:"var(--text2)", fontWeight:600 }}>
            RFC: {c.rfc}
          </span>
        </div>

        {/* AVANCE */}
        <div style={{ background:"#f7f7f7", borderRadius:"16px", padding:"18px", marginBottom:"20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
            <span style={{ fontSize:"14px", fontWeight:700, color:"var(--text)" }}>Avance del expediente</span>
            <span style={{ fontSize:"22px", fontWeight:800, color:c.color }}>{c.avance}%</span>
          </div>
          <div style={{ height:"8px", background:"#e5e5e5", borderRadius:"8px", overflow:"hidden" }}>
            <div style={{
              width:`${c.avance}%`, height:"100%", background:c.color,
              borderRadius:"8px", transition:"width .6s ease",
            }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"8px" }}>
            <span style={{ fontSize:"12px", color:"var(--text2)" }}>Servicios: {c.servicios.join(" · ")}</span>
            <span style={{ fontSize:"12px", color:"var(--text2)" }}>Auditor: {c.auditor.split(" ")[0]}</span>
          </div>
        </div>

        {/* TAREAS */}
        <h2 style={{ fontSize:"18px", fontWeight:800, color:"var(--text)", marginBottom:"14px", letterSpacing:"-0.3px" }}>
          Tareas ({tareas.length})
        </h2>

        {tareas.length === 0 && (
          <p style={{ color:"var(--text2)", fontSize:"14px" }}>Sin tareas registradas.</p>
        )}

        {tareas.map(t => (
          <div key={t.id} style={{
            border:"1px solid var(--border)", borderRadius:"14px",
            padding:"14px", marginBottom:"10px",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px" }}>
              <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text)", flex:1 }}>{t.titulo}</p>
              <span style={{
                padding:"3px 8px", borderRadius:"40px", fontSize:"11px", fontWeight:700, flexShrink:0,
                background:(PRIORIDAD_COLOR[t.prioridad]??'#666')+"18",
                color: PRIORIDAD_COLOR[t.prioridad]??'#666',
              }}>{t.prioridad}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"10px" }}>
              <span style={{
                fontSize:"12px", fontWeight:600,
                color: STATUS_COLOR[t.estatus]??'#666',
              }}>
                {t.estatus === "Vencida" ? <IcAlert size={12} color="#ef4444"/> : <IcCheck size={12} color={STATUS_COLOR[t.estatus]}/>}
                {" "}{t.estatus}
              </span>
              <span style={{ fontSize:"12px", color:"var(--text2)" }}>Vence {t.vence}</span>
            </div>
            {t.pct > 0 && (
              <div style={{ marginTop:"8px", height:"3px", background:"#f0f0f0", borderRadius:"4px" }}>
                <div style={{ width:`${t.pct}%`, height:"100%", background: c.color, borderRadius:"4px" }}/>
              </div>
            )}
          </div>
        ))}

        {/* DOCS DEMO */}
        <h2 style={{ fontSize:"18px", fontWeight:800, color:"var(--text)", marginBottom:"14px", marginTop:"8px", letterSpacing:"-0.3px" }}>
          Documentos
        </h2>
        {["Estado de cuenta mayo.pdf","Contrato de servicio 2026.pdf","Declaración ISR 2025.pdf"].map(d => (
          <div key={d} style={{
            display:"flex", alignItems:"center", gap:"12px",
            padding:"12px 14px", border:"1px solid var(--border)",
            borderRadius:"12px", marginBottom:"8px",
          }}>
            <div style={{ width:"36px", height:"36px", borderRadius:"10px",
              background:c.color+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:"16px" }}>📄</span>
            </div>
            <p style={{ flex:1, fontSize:"13px", fontWeight:600, color:"var(--text)" }}>{d}</p>
            <span style={{ fontSize:"12px", color:"var(--text3)" }}>PDF</span>
          </div>
        ))}
      </div>
    </main>
  );
}
