
"use client";
import { useRouter, usePathname } from "next/navigation";
import { IcHome, IcBriefcase, IcBrain, IcUser } from "./Ic";

const tabs = [
  { label:"Inicio",    path:"/",         Icon:IcHome      },
  { label:"Clientes",  path:"/clientes", Icon:IcBriefcase },
  { label:"Brain",     path:"/brain",    Icon:IcBrain     },
  { label:"Perfil",    path:"/perfil",   Icon:IcUser      },
];

export default function BottomNav() {
  const router   = useRouter();
  const pathname = usePathname();

  // hide on splash
  if (pathname === "/splash") return null;

  return (
    <nav className="bottom-nav">
      {tabs.map(({ label, path, Icon }) => {
        const active = pathname === path || (path !== "/" && pathname.startsWith(path));
        return (
          <button
            key={path}
            onClick={() => router.push(path)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            <Icon
              size={24}
              color={active ? "var(--primary)" : "var(--text3)"}
              strokeWidth={active ? 2.2 : 1.8}
            />
            <span style={{
              fontSize: "10px",
              fontWeight: active ? 700 : 400,
              color: active ? "var(--primary)" : "var(--text3)",
              letterSpacing: "0.01em",
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
