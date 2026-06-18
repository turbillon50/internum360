
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CLIENTES } from "@/lib/data";
import { IcSearch, IcChevR } from "@/components/Ic";

const SECTORES = ["Todos","Construcción","Inmobiliario","Comercio","Tecnología","Agro","Salud"];

const STATUS_COLOR: Record<string,string> = {
  "En proceso":"#0ea5e9","Por cerrar":"#10b981",
  "Pendiente":"#f59e0b","Iniciando":"#8b5cf6","Vencida":"#ef4444",
};

export default function Clientes() {
  const router = useRouter();
  const [q, setQ]    = useState("");
  const [sec, setSec] = useState("Todos");

  const lista = CLIENTES.filter(c => {
    const matchQ   = c.empresa.toLowerCase().includes(q.toLowerCase());
    const matchSec = sec === "Todos" || c.sector === sec;
    return matchQ && matchSec;
  });

  return (
    <main className="page" style={{ background:"#fff" }}>
      {/* HEADER */}
      <div style={{ padding:"56px 20px 0 20px" }}>
        <h1 style={{ fontSize:"28px", fontWeight:800, color:"var(--text)", letterSpacing:"-0.8px" }}>
          Expedientes
        </h1>
        <p style={{ fontSize:"14px", color:"var(--text2)", marginTop:"4px" }}>{CLIENTES.length} clientes activos</p>
      </div>

      {/* BUSCADOR */}
      <div style={{ padding:"18px 20px 0" }}>
        <div style={{
          display:"flex", alignItems:"center", gap:"10px",
          background:"#f7f7f7", borderRadius:"14px", padding:"10px 14px",
        }}>
          <IcSearch size={18} color="var(--text3)"/>
          <input
            value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Buscar empresa…"
            style={{ flex:1, background:"none", border:"none", outline:"none",
              fontSize:"15px", color:"var(--text)" }}
          />
        </div>
      </div>

      {/* FILTROS sector */}
      <div style={{ padding:"14px 20px 0", display:"flex", gap:"8px",
        overflowX:"auto", scrollbarWidth:"none", paddingBottom:"2px" }}>
        {SECTORES.map(s => (
          <button key={s} onClick={() => setSec(s)} style={{
            padding:"6px 14px", borderRadius:"40px", border:"none",
            fontSize:"13px", fontWeight:600, whiteSpace:"nowrap", cursor:"pointer",
            background: sec===s ? "var(--primary)" : "#f0f0f0",
            color:       sec===s ? "white"          : "var(--text2)",
            flexShrink:0,
          }}>{s}</button>
        ))}
      </div>

      {/* LISTA */}
      <div style={{ padding:"20px 20px 0" }}>
        {lista.map((c,i) => (
          <div key={c.id} className="pressable fade-up"
            style={{ animationDelay:`${i*40}ms`, opacity:0,
              display:"flex", alignItems:"center", gap:"14px",
              padding:"14px 0", borderBottom:"1px solid var(--border)",
              cursor:"pointer",
            }}
            onClick={() => router.push(`/clientes/${c.id}`)}>

            {/* Foto */}
            <div style={{ width:"56px", height:"56px", borderRadius:"14px", overflow:"hidden", flexShrink:0 }}>
              <img src={c.img} alt={c.empresa} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            </div>

            {/* Info */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <p style={{ fontSize:"15px", fontWeight:700, color:"var(--text)",
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"65%" }}>
                  {c.empresa}
                </p>
                <span style={{
                  fontSize:"11px", fontWeight:700,
                  color: STATUS_COLOR[c.estatus] ?? "#666",
                  background: (STATUS_COLOR[c.estatus] ?? "#666")+"18",
                  padding:"3px 8px", borderRadius:"40px",
                }}>{c.estatus}</span>
              </div>
              <p style={{ fontSize:"12px", color:"var(--text2)", marginTop:"3px" }}>{c.sector} · Vence {c.vence}</p>
              {/* progress bar */}
              <div style={{ marginTop:"8px", display:"flex", alignItems:"center", gap:"8px" }}>
                <div style={{ flex:1, height:"3px", background:"#f0f0f0", borderRadius:"4px" }}>
                  <div style={{ width:`${c.avance}%`, height:"100%", background:c.color, borderRadius:"4px" }}/>
                </div>
                <span style={{ fontSize:"12px", fontWeight:700, color:c.color, minWidth:"32px" }}>{c.avance}%</span>
              </div>
            </div>

            <IcChevR size={16} color="var(--text3)"/>
          </div>
        ))}
      </div>
    </main>
  );
}
