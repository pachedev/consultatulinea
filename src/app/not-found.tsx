import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="bg-glow-top flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:py-24">
        <div className="max-w-[32rem]">
          <p className="tabular text-ink-faint">404</p>
          <h1 className="mt-2 text-[clamp(2rem,1.4rem+3.2vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-ink">
            Esta página no existe
          </h1>
          <p className="mt-3 text-pretty text-ink-faint">
            Puede que el enlace esté mal escrito o que la página se haya movido.
            Desde el inicio puedes consultar las líneas registradas a tu nombre.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href="/"
              className="btn-primary-glow inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-5 font-semibold text-accent-ink transition hover:brightness-105"
            >
              Ir a consultar
            </Link>
            <Link
              href="/operadores"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-surface px-5 font-semibold text-ink transition-colors hover:border-line-strong"
            >
              Ver operadoras
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
