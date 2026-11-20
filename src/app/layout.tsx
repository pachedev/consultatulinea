import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans } from "next/font/google";
import Script from "next/script";
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

// Una sola familia para títulos y texto (Instrument Sans); la mono solo para
// datos: CURP y números de línea enmascarados.
const sans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = Geist_Mono({
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
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {/* Aplica el tema guardado antes del primer paint (evita parpadeo). */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`}
        </Script>
        <JsonLd data={siteJsonLd} />
        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
