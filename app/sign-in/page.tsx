
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!email.includes("@")) return;
    setSent(true);
    setTimeout(() => router.push("/"), 2000);
  }

  return (
    <div style={{ minHeight:"100dvh", background:"white",
      display:"flex", flexDirection:"column", justifyContent:"space-between",
      padding:"64px 28px 48px" }}>

      {/* Logo */}
      <div>
        <div style={{ width:"60px", height:"60px", borderRadius:"18px",
          background:"linear-gradient(135deg,#1e3a5f,#2a5298)",
          display:"flex", alignItems:"center", justifyContent:"center",
          marginBottom:"32px", boxShadow:"0 8px 24px rgba(30,58,95,0.2)" }}>
          <span style={{ color:"white", fontWeight:800, fontSize:"26px" }}>I</span>
        </div>
        <h1 style={{ fontSize:"32px", fontWeight:800, color:"var(--text)",
          letterSpacing:"-1px", lineHeight:1.15, marginBottom:"10px" }}>
          Bienvenido a<br/>Internum 360
        </h1>
        <p style={{ fontSize:"15px", color:"var(--text2)", lineHeight:1.6 }}>
          Gestión de auditoría, control interno y contabilidad para tu despacho.
        </p>
      </div>

      {/* Form */}
      <div>
        {!sent ? (
          <>
            <label style={{ fontSize:"13px", fontWeight:700, color:"var(--text2)",
              display:"block", marginBottom:"8px", letterSpacing:"0.02em" }}>
              CORREO CORPORATIVO
            </label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="hugo@internum360.mx"
              style={{ width:"100%", padding:"16px", borderRadius:"14px",
                border:"1.5px solid var(--border)", fontSize:"16px",
                outline:"none", color:"var(--text)", marginBottom:"14px",
                transition:"border-color .15s",
                fontFamily:"var(--font)",
              }}
              onFocus={e => (e.target.style.borderColor="#1e3a5f")}
              onBlur={e  => (e.target.style.borderColor="var(--border)")}
            />
            <button onClick={handleSend} style={{
              width:"100%", padding:"18px", borderRadius:"14px", border:"none",
              background: email.includes("@") ? "#1e3a5f" : "#e8e8e8",
              color: email.includes("@") ? "white" : "var(--text3)",
              fontSize:"16px", fontWeight:700, cursor:"pointer",
              transition:"background .2s",
            }}>
              Ingresar con enlace mágico
            </button>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:"40px", marginBottom:"14px" }}>📬</div>
            <p style={{ fontSize:"18px", fontWeight:800, color:"var(--text)",
              marginBottom:"8px" }}>Enlace enviado</p>
            <p style={{ fontSize:"14px", color:"var(--text2)" }}>
              Revisa {email} y haz clic en el enlace para acceder.
            </p>
            <p style={{ fontSize:"13px", color:"var(--text3)", marginTop:"8px" }}>
              Redirigiendo a la app…
            </p>
          </div>
        )}
        <p style={{ fontSize:"12px", color:"var(--text3)", textAlign:"center", marginTop:"20px" }}>
          Al ingresar aceptas los términos de uso y la política de privacidad de Internum 360.
        </p>
      </div>
    </div>
  );
}
