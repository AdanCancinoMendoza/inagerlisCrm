import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { PwaProvider } from "@/context/PwaContext";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Inagerlis CRM & POS",
  description: "Sistema empresarial en la nube de Punto de Venta (POS) y CRM para comercios minoristas",
  manifest: "/manifest.json",
  applicationName: "Inagerlis",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Inagerlis POS",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#D8A814",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ThemeProvider>
          <SidebarProvider>
            <PwaProvider>
              <AuthGuard>{children}</AuthGuard>
            </PwaProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
