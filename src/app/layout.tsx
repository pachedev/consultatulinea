import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { AlertBanner } from "@/components/layout/AlertBanner";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { SUPPORTED_PROVIDERS } from "@/lib/data/content";
import { SITE } from "@/lib/data/site";
import "./globals.css";

const SITE_URL = SITE.url;

// Un solo @graph en vez de nodos sueltos: así WebSite, Organization y
// WebApplication quedan enlazados por @id y los buscadores (y los motores de
// respuesta con IA) leen una sola entidad coherente en lugar de tres sitios
// distintos que casualmente comparten dominio.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE.name,
      alternateName: ["Consulta Tu Línea", "consultatulinea.mx"],
      inLanguage: "es-MX",
      description:
        "Consulta qué líneas telefónicas móviles están registradas a tu nombre (CURP) en México.",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE.name,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
        width: 512,
        height: 512,
      },
      sameAs: [SITE.repo],
      founder: { "@id": `${SITE_URL}/#creator` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#creator`,
      name: "Pachedev",
      url: SITE.author,
      sameAs: ["https://github.com/pachedev", SITE.donate],
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: SITE.name,
      url: SITE_URL,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      inLanguage: "es-MX",
      description: `Herramienta gratuita para consultar con tu CURP qué líneas móviles están registradas a tu nombre en México: ${SUPPORTED_PROVIDERS} operadores y marcas en una sola consulta.`,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "MXN" },
      publisher: { "@id": `${SITE_URL}/#organization` },
      audience: {
        "@type": "Audience",
        geographicArea: { "@type": "Country", name: "México" },
      },
    },
  ],
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

const OG_IMAGE = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "ConsultaTuLínea: consulta qué líneas telefónicas están registradas bajo tu CURP",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ConsultaTuLínea — Líneas registradas a tu nombre en México",
    template: "%s · ConsultaTuLínea",
  },
  description:
    "Consulta en un solo lugar qué líneas telefónicas móviles están registradas a tu nombre (CURP) en México. Proyecto open source, privado y sin almacenamiento de datos.",
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  authors: [{ name: "Pachedev", url: SITE.author }],
  creator: "Pachedev",
  publisher: SITE.name,
  category: "utility",
  manifest: "/manifest.webmanifest",
  keywords: [
    "consulta tu línea",
    "consultar mis líneas registradas",
    "líneas registradas a mi nombre",
    "líneas telefónicas",
    "CURP",
    "registro telefónico",
    "México",
    "RNUTM",
  ],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: SITE.name,
    title: "ConsultaTuLínea",
    description:
      "Consulta qué líneas telefónicas están registradas a tu nombre en México.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConsultaTuLínea",
    description:
      "Consulta qué líneas telefónicas están registradas a tu nombre en México.",
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    // Sin esto Google recorta el snippet y no usa la vista previa grande, que
    // es justo lo que distingue un resultado de una utilidad como esta.
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // Se define por entorno: sin token no se emite la meta en vez de emitirla
  // vacía, que Search Console rechaza.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
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
