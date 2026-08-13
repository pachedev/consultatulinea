import type { Metadata } from "next";
import { OperatorsDirectory } from "@/components/operators/OperatorsDirectory";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchStatus } from "@/lib/api/status";
import { TOTAL_PROVIDERS } from "@/lib/data/content";
import { getAllOperatorViews } from "@/lib/operatorPages";

const BASE = "https://consultatulinea.mx";

// El estado de operadores se revalida cada minuto en vez de rerenderizar en
// cada visita: así el directorio se sirve prerenderizado (crawl barato) y el
// chip de incidencias sigue estando al día.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Operadores y marcas móviles en México",
  description: `Directorio de los ${TOTAL_PROVIDERS} operadores y OMVs que registran líneas móviles en México. Estado de integración, portal oficial de vinculación y red de cada uno: Telcel, AT&T, Movistar, Bait, Oxxo Cel y más.`,
  alternates: { canonical: "/operadores" },
  keywords: [
    "operadores México telefonía móvil",
    "OMV México lista",
    "directorio operadores celular",
    "consultar vinculación CURP operador",
    "RNUTM operadores",
  ],
  openGraph: {
    title: "Operadores y marcas móviles en México — ConsultaTuLínea",
    description: `Directorio de ${TOTAL_PROVIDERS} operadores y marcas de telefonía móvil en México con estado de consulta y portal oficial.`,
  },
};

export default async function OperadoresPage() {
  const [operators, status] = await Promise.all([
    Promise.resolve(getAllOperatorViews()),
    fetchStatus(),
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Operadores de telefonía móvil en México",
    description:
      "Directorio de operadores y marcas OMV que registran líneas móviles en México",
    numberOfItems: operators.length,
    itemListElement: operators.slice(0, 50).map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: o.name,
      url: `${BASE}/operadores/${o.slug}`,
    })),
  };

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={itemListJsonLd} />
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Operadores y marcas
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-ink-soft">
            Cada operador administra su propio registro. Aquí puedes ver el
            estado de consulta de cada uno y entrar a su ficha con el portal
            oficial.
          </p>
        </header>

        <OperatorsDirectory
          operators={operators}
          statusOverrides={status.operators}
        />
      </div>
    </main>
  );
}
