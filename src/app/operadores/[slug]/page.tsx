import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusChip } from "@/components/operators/StatusChip";
import {
  getOperatorBySlug,
  getOperatorSlugs,
  type OperatorView,
} from "@/lib/operatorPages";
import { cn } from "@/lib/utils";

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

  return {
    title: `${operator.name} — consulta de líneas`,
    description: `Cómo consultar las líneas registradas con ${operator.name} en México: estado de la consulta, portal oficial y guía.`,
    alternates: { canonical: `/operadores/${operator.slug}` },
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

export default async function OperatorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const operator = getOperatorBySlug(slug);
  if (!operator) notFound();

  return (
    <main className="flex flex-1 flex-col">
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
          <div className="mt-3">
            <StatusChip status={operator.status} />
          </div>
        </header>

        <section className="mt-8 rounded-xl border border-line bg-surface p-6">
          <h2 className="text-sm font-medium tracking-wide text-ink-soft uppercase">
            Cómo consultar
          </h2>
          <p className="mt-2 text-pretty text-ink">{guidance(operator)}</p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {operator.status === "supported" ? (
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
                  operator.status === "supported"
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

        <p className="mt-8 text-sm text-ink-faint">
          El registro oficial de líneas móviles lo administra cada operador ante
          la Comisión Reguladora de Telecomunicaciones (CRT). ConsultaTuLínea es
          un proyecto independiente y no sustituye los portales oficiales.
        </p>
      </div>
    </main>
  );
}
