import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { AlertBanner } from "@/components/layout/AlertBanner";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ConsultaTuLínea",
  url: "https://consultatulinea.mx",
  inLanguage: "es-MX",
  description:
    "Consulta qué líneas telefónicas móviles están registradas a tu nombre (CURP) en México.",
};

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const sans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://consultatulinea.mx"),
  title: {
    default: "ConsultaTuLínea — Líneas registradas a tu nombre en México",
    template: "%s · ConsultaTuLínea",
  },
  description:
    "Consulta en un solo lugar qué líneas telefónicas móviles están registradas a tu nombre (CURP) en México. Proyecto open source, privado y sin almacenamiento de datos.",
  applicationName: "ConsultaTuLínea",
  keywords: [
    "consulta tu línea",
    "líneas telefónicas",
    "CURP",
    "registro telefónico",
    "México",
    "RNUTM",
  ],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "ConsultaTuLínea",
    title: "ConsultaTuLínea",
    description:
      "Consulta qué líneas telefónicas están registradas a tu nombre en México.",
    images: [
      { url: "/banner.png", width: 1983, height: 793, alt: "ConsultaTuLínea" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConsultaTuLínea",
    description:
      "Consulta qué líneas telefónicas están registradas a tu nombre en México.",
    images: ["/banner.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {/* Aplica el tema guardado antes del primer paint (evita parpadeo). */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`}
        </Script>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />
        <JsonLd data={siteJsonLd} />
        <Navbar />
        <AlertBanner />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
