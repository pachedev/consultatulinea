import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";
import { SUPPORTED_PROVIDERS } from "@/lib/data/content";

// El home no depende de ningún dato del backend: el contador lo pide el cliente
// a /api/stats. Se revalida por los avisos del layout, no por el home mismo.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "ConsultaTuLínea — Líneas registradas a tu nombre en México",
  description: `Consulta gratis qué líneas telefónicas móviles están registradas a tu CURP en México. ${SUPPORTED_PROVIDERS} operadores y marcas en un solo lugar: Telcel, AT&T, Movistar, Bait, Oxxo Cel y más. Sin registro y sin guardar tus datos.`,
  alternates: { canonical: "/" },
  openGraph: {
    title: "ConsultaTuLínea — Líneas registradas a tu nombre en México",
    description: `¿Cuántas líneas móviles están a tu nombre? Ingresa tu CURP y consulta en segundos ${SUPPORTED_PROVIDERS} operadores en México.`,
    url: "https://consultatulinea.mx/",
  },
  keywords: [
    "consultar mis líneas registradas",
    "líneas registradas a mi nombre",
    "cuántos celulares están a mi nombre",
    "consultar líneas telefónicas México",
    "líneas registradas con mi CURP",
    "CURP registro telefónico",
    "RNUTM consulta",
    "registro nacional usuarios telefonía móvil",
    "Telcel AT&T Movistar líneas registradas",
    "verificar líneas celular México",
  ],
};

export default function HomePage() {
  return <HomeView />;
}
