import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SUPPORTED_PROVIDERS, TOTAL_PROVIDERS } from "@/lib/data/content";

export function CoverageSection() {
  return (
    <section className="border-b border-line bg-surface-2">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Cobertura
            </h2>
            <p className="mt-3 text-pretty text-ink-soft">
              Telcel, AT&amp;T y {TOTAL_PROVIDERS - 2} operadores móviles
              virtuales, la mayoría sobre la Red Altán.{" "}
              <span className="text-ink">{SUPPORTED_PROVIDERS}</span> se
              consultan directo desde aquí; del resto te llevamos a su portal
              oficial. Consulta el estado de cada uno en el directorio.
            </p>
            <Link
              href="/operadores"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:gap-2.5"
            >
              Ver todos los operadores
              <ArrowRight className="size-4 transition-all" aria-hidden />
            </Link>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
            <Stat value={String(TOTAL_PROVIDERS)} label="Marcas cubiertas" />
            <Stat
              value={String(SUPPORTED_PROVIDERS)}
              label="Con consulta directa"
            />
          </dl>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col-reverse gap-1 bg-surface px-8 py-6 text-center">
      <dt className="text-xs tracking-wide text-ink-soft uppercase">{label}</dt>
      <dd className="tabular font-display text-3xl font-bold text-ink">
        {value}
      </dd>
    </div>
  );
}
