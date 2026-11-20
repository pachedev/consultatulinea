import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:py-24">
        <p className="tabular text-xs tracking-[0.18em] text-ink-faint uppercase">
          Error 404
        </p>
        <h1 className="mt-3 font-display text-3xl leading-[1.05] font-bold tracking-tight text-balance text-ink sm:text-4xl">
          Esta página no existe
        </h1>
        <p className="mt-4 max-w-md text-pretty text-ink-soft">
          El enlace puede estar mal escrito o la página cambió de lugar. Desde
          el inicio puedes consultar las líneas registradas a tu nombre.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-ink px-5 py-3 font-medium text-paper transition hover:opacity-90"
          >
            Ir al inicio
          </Link>
          <Link
            href="/operadores"
            className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-5 py-3 font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            Ver operadores
          </Link>
        </div>
      </div>
    </main>
  );
}
