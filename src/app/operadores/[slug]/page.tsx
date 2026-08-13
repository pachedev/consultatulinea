import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusChip } from "@/components/operators/StatusChip";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchStatus } from "@/lib/api/status";
import {
  getOperatorProfile,
  type OperatorProfile,
} from "@/lib/data/operatorProfiles";
import {
  getOperatorBySlug,
  getOperatorSlugs,
  type OperatorView,
} from "@/lib/operatorPages";
import { cn } from "@/lib/utils";

// Con `force-dynamic` el generateStaticParams de abajo no servía de nada y las
// 108 fichas se rendereaban una por una en cada rastreo.
export const revalidate = 60;

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getOperatorSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const operator = getOperatorBySlug(slug);
  if (!operator) return { title: "Operador no encontrado" };
  const profile = getOperatorProfile(slug);

  return {
    title: `${operator.name} — consulta de líneas`,
    description:
      profile?.intro ??
      `Cómo consultar las líneas telefónicas registradas con ${operator.name} en México. Estado de la integración, portal oficial de vinculación y guía paso a paso.`,
    alternates: { canonical: `/operadores/${operator.slug}` },
    // Sin perfil propio la ficha es el mismo molde que las otras 100+: se sirve
    // para el usuario pero fuera del índice, y `follow` deja que la autoridad
    // siga fluyendo al directorio.
    robots: profile
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: `${operator.name} — ConsultaTuLínea`,
      description: `Verifica qué líneas tienes registradas con ${operator.name} en México usando tu CURP.`,
    },
  };
}

const BASE = "https://consultatulinea.mx";

function makeBreadcrumbJsonLd(operator: OperatorView) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: `${BASE}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Operadores",
        item: `${BASE}/operadores`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: operator.name,
        item: `${BASE}/operadores/${operator.slug}`,
      },
    ],
  };
}

function makeOrganizationJsonLd(operator: OperatorView) {
  const obj: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: operator.name,
    url: operator.website ?? undefined,
    description: `Operador de telefonía móvil en México. ${operator.status === "supported" ? "Consulta directa disponible en ConsultaTuLínea." : "Consulta a través del portal oficial del operador."}`,
  };
  if (!obj.url) delete obj.url;
  return obj;
}

function makeFaqJsonLd(profile: OperatorProfile) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: profile.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function makeHowToJsonLd(operator: OperatorView, profile: OperatorProfile) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `Cómo consultar las líneas registradas con ${operator.name}`,
    description: profile.intro,
    step: profile.steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  };
}

function guidance(operator: OperatorView): string {
  if (operator.status === "supported") {
    return "Puedes consultar las líneas de este operador directamente desde ConsultaTuLínea ingresando tu CURP en la página principal.";
  }
  if (operator.status === "unsupported") {
    return (
      operator.reason ??
      "Este operador requiere realizar la consulta en su propio portal oficial."
    );
  }
  return "Aún no integramos la consulta automática de este operador. Por ahora, usa su portal oficial.";
}

function findOverride(
  overrides: { operator_name: string; state: string; note: string | null }[],
  operatorName: string,
) {
  const n = operatorName.toLowerCase();
  return overrides.find((o) => {
    const k = o.operator_name.toLowerCase();
    return n.includes(k) || k.includes(n);
  });
}

export default async function OperatorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const operator = getOperatorBySlug(slug);
  if (!operator) notFound();

  const profile = getOperatorProfile(slug);
  const status = await fetchStatus();
  const override = findOverride(status.operators, operator.name);
  const isDown = override && override.state !== "available";

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={makeBreadcrumbJsonLd(operator)} />
      <JsonLd data={makeOrganizationJsonLd(operator)} />
      {profile ? <JsonLd data={makeHowToJsonLd(operator, profile)} /> : null}
      {profile?.faq.length ? <JsonLd data={makeFaqJsonLd(profile)} /> : null}

      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
        <Link
          href="/operadores"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Operadores
        </Link>

        <header className="mt-6">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {operator.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusChip status={operator.status} />
            {isDown ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-possible/30 bg-possible-bg px-2.5 py-0.5 text-xs font-medium text-possible">
                <AlertTriangle className="size-3" aria-hidden />
                {override.state === "paused" ? "Pausado" : "No disponible"}
              </span>
            ) : null}
            {profile?.network ? (
              <span className="inline-flex items-center rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs text-ink-soft">
                {profile.network}
              </span>
            ) : null}
          </div>
          {profile ? (
            <p className="mt-5 text-pretty text-ink-soft">{profile.intro}</p>
          ) : null}
        </header>

        {isDown ? (
          <div className="mt-6 flex gap-3 rounded-xl border border-possible/30 bg-possible-bg p-4 text-sm text-possible">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="font-medium">
                {override.state === "paused"
                  ? "Consulta pausada temporalmente"
                  : "Operador no disponible"}
              </p>
              {override.note ? (
                <p className="mt-1 text-xs">{override.note}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        <section className="mt-8 rounded-xl border border-line bg-surface p-6">
          <h2 className="text-sm font-medium tracking-wide text-ink-soft uppercase">
            Cómo consultar
          </h2>
          <p className="mt-2 text-pretty text-ink">{guidance(operator)}</p>

          {profile ? (
            <ol className="mt-5 space-y-2.5 border-l border-line pl-5">
              {profile.steps.map((step, i) => (
                <li key={step} className="text-sm text-ink-soft">
                  <span className="tabular mr-2 font-medium text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {operator.status === "supported" && !isDown ? (
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-2.5 font-medium text-paper transition hover:opacity-90"
              >
                <ShieldCheck className="size-4" aria-hidden />
                Consultar con mi CURP
              </Link>
            ) : null}
            {operator.consultaUrl ? (
              <a
                href={operator.consultaUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-medium transition",
                  operator.status === "supported" && !isDown
                    ? "border border-line text-ink hover:border-line-strong"
                    : "bg-ink text-paper hover:opacity-90",
                )}
              >
                <ExternalLink className="size-4" aria-hidden />
                Plataforma oficial de consulta
              </a>
            ) : operator.website ? (
              <a
                href={operator.website}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-line px-5 py-2.5 font-medium text-ink transition hover:border-line-strong"
              >
                <ExternalLink className="size-4" aria-hidden />
                Sitio del operador
              </a>
            ) : null}
          </div>
        </section>

        {operator.reason ? (
          <p className="mt-4 rounded-lg border border-line bg-surface-2 p-4 text-sm text-ink-soft">
            <span className="font-medium text-ink">Nota: </span>
            {operator.reason}
          </p>
        ) : null}

        {profile?.notes?.length ? (
          <ul className="mt-4 space-y-3">
            {profile.notes.map((note) => (
              <li
                key={note}
                className="rounded-lg border border-line bg-surface-2 p-4 text-sm text-ink-soft"
              >
                {note}
              </li>
            ))}
          </ul>
        ) : null}

        {profile?.faq.length ? (
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              Preguntas sobre {operator.name}
            </h2>
            <div className="mt-4 divide-y divide-line border-y border-line">
              {profile.faq.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="cursor-pointer list-none font-medium text-ink">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-pretty text-sm text-ink-soft">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-8 text-sm text-ink-faint">
          El registro oficial de líneas móviles lo administra cada operador ante
          la Comisión Reguladora de Telecomunicaciones (CRT). ConsultaTuLínea es
          un proyecto independiente y no sustituye los portales oficiales.
        </p>
      </div>
    </main>
  );
}
