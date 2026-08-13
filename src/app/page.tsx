import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";
import { fetchUsageStats } from "@/lib/api/stats";

// El contador de consultas se revalida cada minuto: no necesita ser exacto al
// segundo y así el home se sigue sirviendo aunque el backend tarde o no esté.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "ConsultaTuLínea — Líneas registradas a tu nombre en México",
  description:
    "Consulta qué líneas telefónicas móviles están registradas a tu CURP en México. Escanea más de 80 operadores y marcas en un solo lugar: Telcel, AT&T, Movistar, Bait y más.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ConsultaTuLínea — Líneas registradas a tu nombre en México",
    description:
      "¿Cuántas líneas móviles están a tu nombre? Ingresa tu CURP y consulta en segundos más de 80 operadores en México.",
    url: "https://consultatulinea.mx/",
  },
  keywords: [
    "consultar líneas telefónicas México",
    "CURP registro telefónico",
    "RNUTM consulta",
    "líneas a mi nombre",
    "consulta telefónica CURP",
    "registro nacional usuarios telefonía móvil",
    "Telcel AT&T Movistar líneas registradas",
    "verificar líneas celular México",
  ],
};

export default async function HomePage() {
  // null = el API no respondió → HomeView no monta el contador y el resto del
  // home funciona igual.
  const stats = await fetchUsageStats();

  return <HomeView totalLookups={stats?.total_lookups ?? null} />;
}
