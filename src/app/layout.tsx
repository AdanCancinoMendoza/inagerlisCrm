import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "CRM + POS System",
  description: "Sistema Adaptable CRM y Punto de Venta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>
          <SidebarProvider>
            <AuthGuard>{children}</AuthGuard>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
