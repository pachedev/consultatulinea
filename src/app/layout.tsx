import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
