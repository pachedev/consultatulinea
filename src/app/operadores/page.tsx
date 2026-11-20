import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertBanner } from "@/components/layout/AlertBanner";
import { OperatorsDirectory } from "@/components/operators/OperatorsDirectory";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchStatus } from "@/lib/api/status";
import { TOTAL_PROVIDERS } from "@/lib/data/content";
import { getOperatorNetwork } from "@/lib/operatorNetworks";
import { getAllOperatorViews } from "@/lib/operatorPages";

const BASE = "https://consultatulinea.mx";

// El estado de operadores se revalida cada minuto en vez de rerenderizar en
// cada visita: así el directorio se sirve prerenderizado (crawl barato) y el
// chip de incidencias sigue estando al día.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Operadores y marcas móviles en México",
  description: `Directorio de los ${TOTAL_PROVIDERS} operadores y OMVs que registran líneas móviles en México: cuáles se consultan desde aquí, cuáles solo en su portal oficial y la red de cada uno (Telcel, Red Altán, Oxxo Cel, AT&T, Movistar y más).`,
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

  const networks = Object.fromEntries(
    operators.map((o) => [o.slug, getOperatorNetwork(o.name)]),
  );

  return (
    <main className="bg-glow-top flex flex-1 flex-col">
      <JsonLd data={itemListJsonLd} />
      <div className="mx-auto w-full max-w-6xl px-4 pt-5 pb-16">
        <Link
          href="/"
          className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <ArrowLeft className="size-[18px]" aria-hidden />
          Volver al inicio
        </Link>

        <AlertBanner className="mt-3 mb-2" />

        <header className="pt-4 pb-6">
          <h1 className="text-[clamp(2rem,1.4rem+3.2vw,3.25rem)] font-semibold tracking-[-0.03em] text-ink">
            Operadores y marcas
          </h1>
          <p className="mt-3 max-w-[58ch] text-pretty text-ink-faint">
            Cada operador administra su propio registro. Aquí ves cuáles
            consultamos en automático, cuáles solo tienen portal oficial y
            entras a la ficha de cada uno.
          </p>
        </header>

        <OperatorsDirectory
          operators={operators}
          networks={networks}
          statusOverrides={status.operators}
        />
      </div>
    </main>
  );
}
