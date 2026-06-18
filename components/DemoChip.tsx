
"use client";
import { useRouter, usePathname } from "next/navigation";

const modes = [
  { label:"Admin",   path:"/admin-view" },
  { label:"Auditor", path:"/"           },
  { label:"Cliente", path:"/portal"     },
];

export default function DemoChip() {
  const router   = useRouter();
  const pathname = usePathname();
  if (pathname === "/splash") return null;
  return (
    <div style={{
      position:"fixed", top:"10px", right:"12px", zIndex:999,
      background:"rgba(0,0,0,0.72)", backdropFilter:"blur(10px)",
      borderRadius:"40px", display:"flex", gap:"2px", padding:"3px",
    }}>
      <span style={{ color:"rgba(255,255,255,0.45)", fontSize:"9px", fontWeight:700,
        letterSpacing:"0.08em", alignSelf:"center", paddingLeft:"8px", paddingRight:"4px",
        textTransform:"uppercase" }}>DEMO</span>
      {modes.map(m => {
        const active = pathname === m.path || (m.path==="/" && pathname==="/");
        return (
          <button key={m.path} onClick={()=>router.push(m.path)} style={{
            padding:"4px 10px", borderRadius:"40px", border:"none", fontSize:"11px",
            fontWeight:600, cursor:"pointer", transition:"all 0.15s",
            background: active ? "#2a9d8f" : "transparent",
            color: active ? "white" : "rgba(255,255,255,0.5)",
          }}>{m.label}</button>
        );
      })}
    </div>
  );
}
