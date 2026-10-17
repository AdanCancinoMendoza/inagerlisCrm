import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { PwaProvider } from "@/context/PwaContext";
import { SocketProvider } from "@/context/SocketContext";
import AuthGuard from "@/components/auth/AuthGuard";
import SystemHeartbeat from "@/components/common/SystemHeartbeat";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://inagerlis-pv-crm.onrender.com"
  ),
  title: {
    default: "Inagerlis® POS & CRM | Sistema Punto de Venta en la Nube y Offline",
    template: "%s | Inagerlis® POS",
  },
  description:
    "Sistema empresarial de Punto de Venta (POS) y CRM con arquitectura Offline-First e Inteligencia Artificial. Control total de inventarios, ventas, clientes, cortes de caja X/Z y facturación continua sin interrupciones por corte de internet.",
  keywords: [
    "inagerlis",
    "inagerlis pos",
    "inagerlis crm",
    "punto de venta",
    "punto de venta pos",
    "sistema punto de venta",
    "software punto de venta mexico",
    "pos offline",
    "punto de venta offline",
    "pos sin internet",
    "pos en la nube",
    "crm para negocios",
    "crm para tiendas",
    "sistema de inventarios y ventas",
    "control de stock",
    "corte de caja x y z",
    "arqueo de caja",
    "tickets de venta",
    "pos pwa",
    "punto de venta con inteligencia artificial",
    "asistente ia gemini para comercios",
    "software para tiendas de ropa",
    "punto de venta para abarrotes",
    "sistema para ferreterias",
    "pos multi sucursal",
    "sistema administrativo para comercios",
    "gestion de ventas y credito a clientes",
    "software retail mexico",
  ],
  authors: [
    { name: "Adán Cancino Mendoza", url: "https://inagerlis-pv-crm.onrender.com" },
    { name: "Inagerlis Software" },
  ],
  creator: "Adán Cancino Mendoza",
  publisher: "Inagerlis Technologies",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  applicationName: "Inagerlis",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Inagerlis POS",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://inagerlis-pv-crm.onrender.com",
    title: "Inagerlis® POS & CRM | Sistema Punto de Venta en la Nube y Offline",
    description:
      "Plataforma empresarial de Punto de Venta (POS) y CRM con arquitectura Offline-First e Inteligencia Artificial para comercios minoristas.",
    siteName: "Inagerlis POS & CRM",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Inagerlis POS & CRM - Terminal Punto de Venta en la Nube",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inagerlis® POS & CRM | Sistema Punto de Venta",
    description:
      "Sistema Punto de Venta con arquitectura Offline-First e Inteligencia Artificial para retail y comercios.",
    images: ["/icon-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Business Software",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Inagerlis POS & CRM",
  operatingSystem: "Web, Android, iOS, Windows, macOS, Linux (PWA)",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "MXN",
    availability: "https://schema.org/InStock",
  },
  description:
    "Sistema empresarial de Punto de Venta (POS) y CRM con arquitectura Offline-First e Inteligencia Artificial para comercios minoristas y mayoristas.",
  featureList: [
    "Venta y facturación Offline sin interrupción por falta de internet",
    "Asistente conversacional con Inteligencia Artificial (Gemini)",
    "Control de inventario, stock y múltiples almacenes",
    "Cortes de turno, arqueo de caja X y Z",
    "CRM de clientes, límites de crédito y cobranza",
    "Plataforma multi-sucursal en la nube",
  ],
  author: {
    "@type": "Person",
    name: "Adán Cancino Mendoza",
  },
  publisher: {
    "@type": "Organization",
    name: "Inagerlis Technologies",
    url: "https://inagerlis-pv-crm.onrender.com",
    logo: "https://inagerlis-pv-crm.onrender.com/icon-192x192.png",
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>
          <SidebarProvider>
            <PwaProvider>
              <SocketProvider>
                <SystemHeartbeat />
                <AuthGuard>{children}</AuthGuard>
              </SocketProvider>
            </PwaProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
