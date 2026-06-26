import { ShieldCheck } from "lucide-react";
import { KNOWN_PROVIDERS, TOTAL_PROVIDERS } from "@/lib/data/content";

export function EmptyState() {
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-6 sm:p-8">
      <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft">
        <ShieldCheck className="size-6" aria-hidden />
      </div>
      <div className="mt-4 text-center">
        <h3 className="font-display text-xl font-bold tracking-tight text-ink">
          Listo para revisar tus líneas
        </h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-ink-soft">
          Aquí aparecerán los resultados: líneas confirmadas, coincidencias
          posibles y operadores revisados.
        </p>
      </div>

      <dl className="mt-6 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-4 text-center">
          <dd className="tabular font-display text-2xl font-bold text-ink">
            {TOTAL_PROVIDERS}+
          </dd>
          <dt className="mt-1 text-xs text-ink-soft">Marcas monitoreadas</dt>
        </div>
        {KNOWN_PROVIDERS.slice(0, 2).map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface p-4"
          >
            <p.icon className="size-4 text-ink-faint" aria-hidden />
            <span className="text-sm font-medium text-ink-soft">{p.name}</span>
          </div>
        ))}
      </dl>
    </div>
  );
}
