import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { TOTAL_PROVIDERS } from "@/lib/data/content";
import { getOperatorDisplayStatus, OPERATORS } from "@/lib/data/operators";

const supported = OPERATORS.filter(
  (o) => getOperatorDisplayStatus(o) === "supported",
).length;

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
              Telcel, AT&amp;T y más de 80 operadores móviles virtuales sobre la
              Red Altán. Consulta el estado de cada portal en el directorio.
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
            <Stat value={`${supported}+`} label="Con consulta directa" />
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
