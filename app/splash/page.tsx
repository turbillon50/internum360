
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Splash() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace("/"), 1800);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div style={{
      minHeight:"100dvh", background:"#fff",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      animation:"fadeIn .4s ease",
    }}>
      {/* Logo */}
      <div style={{
        width:"72px", height:"72px",
        background:"linear-gradient(135deg,#1e3a5f,#2a5298)",
        borderRadius:"20px",
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 12px 32px rgba(30,58,95,0.22)",
        animation:"scaleIn .5s ease .1s both",
      }}>
        <span style={{ color:"white", fontWeight:800, fontSize:"32px", letterSpacing:"-1px" }}>I</span>
      </div>

      <div style={{ marginTop:"16px", animation:"fadeUp .4s ease .3s both" }}>
        <span style={{ fontSize:"22px", fontWeight:700, color:"#1e3a5f", letterSpacing:"-0.5px" }}>
          Internum <span style={{ color:"#2a9d8f" }}>360</span>
        </span>
      </div>

      <p style={{
        marginTop:"6px", fontSize:"13px", color:"#b0b0b0",
        animation:"fadeUp .4s ease .45s both",
      }}>
        Confianza · Eficiencia · Seguridad
      </p>

      {/* Loader dot */}
      <div style={{
        position:"absolute", bottom:"56px",
        width:"28px", height:"4px", borderRadius:"4px",
        background:"#ebebeb", overflow:"hidden",
      }}>
        <div style={{
          height:"100%", width:"40%", background:"#2a9d8f", borderRadius:"4px",
          animation:"shimmer 1s infinite",
        }}/>
      </div>
    </div>
  );
}
