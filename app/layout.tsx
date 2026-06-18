
import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import DemoChip  from "@/components/DemoChip";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Internum 360",
  description: "Confianza, eficiencia y seguridad para tu despacho",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Internum 360" },
  icons: {
    icon: [{ url:"/icon-192.png", sizes:"192x192" }],
    apple: [{ url:"/apple-touch-icon.png", sizes:"180x180" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
        <link rel="manifest" href="/manifest.json"/>
      </head>
      <body>
        {children}
        <BottomNav/>
        <DemoChip/>
      </body>
    </html>
  );
}
