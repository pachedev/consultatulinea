import { ArrowLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DATA_ROWS, PRIVACY_META, PRIVACY_SECTIONS } from "@/lib/data/privacy";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description:
    "Qué datos trata ConsultaTuLínea, para qué, dónde viven y cuánto tiempo: sin almacenamiento de CURP, números ni resultados.",
  alternates: { canonical: "/aviso-de-privacidad" },
};

export default function AvisoPrivacidadPage() {
  return (
    <main className="bg-glow-top flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl px-4 pt-5 pb-16">
        <Link
          href="/"
          className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <ArrowLeft className="size-[18px]" aria-hidden />
          Volver al inicio
        </Link>

        <header className="pt-2 pb-8">
          <span
            className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent"
            aria-hidden
          >
            <ShieldCheck className="size-6" />
          </span>
          <h1 className="text-[clamp(2rem,1.4rem+3.2vw,3.25rem)] font-semibold tracking-[-0.03em] text-ink">
            Aviso de privacidad
          </h1>
          <p className="mt-2.5 text-sm text-ink-faint">
            Última actualización:{" "}
            <time dateTime={PRIVACY_META.lastUpdatedIso}>
              {PRIVACY_META.lastUpdated}
            </time>
          </p>
          <p className="mt-3 max-w-[60ch] text-pretty text-ink-soft">
            Este aviso explica, en lenguaje claro, qué hace el sistema con tu
            información. Describe el funcionamiento real del sitio, no una
            intención.
          </p>
          {PRIVACY_META.draft ? (
            <p
              role="note"
              className="mt-4 max-w-[60ch] rounded-xl bg-possible-bg px-3.5 py-3 text-sm text-possible"
            >
              Borrador en revisión.
            </p>
          ) : null}
        </header>

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-14">
          <details
            open
            className="h-fit rounded-xl border border-line bg-surface lg:sticky lg:top-20 lg:border-0 lg:bg-transparent"
          >
            <summary className="min-h-12 px-4 py-3.5 font-semibold text-ink lg:pointer-events-none lg:list-none lg:px-2 lg:py-0 lg:pb-2.5 [&::-webkit-details-marker]:lg:hidden">
              En esta página
            </summary>
            <ol className="grid gap-0.5 px-3 pb-3 text-sm lg:px-0">
              {PRIVACY_SECTIONS.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex gap-2.5 rounded-lg px-2 py-1.5 text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    <span className="min-w-[1.4em] text-ink-faint tabular-nums">
                      {index + 1}
                    </span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <article className="max-w-[68ch]">
            {PRIVACY_SECTIONS.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-20 border-t border-line py-7 first:border-t-0 first:pt-0"
              >
                <h2 className="text-lg font-semibold tracking-tight text-ink">
                  <span className="text-ink-faint">{index + 1}.</span>{" "}
                  {section.title}
                </h2>
                <div className="mt-2.5 space-y-2.5">
                  {section.body.map((p) => (
                    <p key={p} className="text-pretty text-ink-soft">
                      {p}
                    </p>
                  ))}
                </div>

                {section.bullets ? (
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-soft">
                    {section.bullets.map((b) => (
                      <li key={b} className="text-pretty">
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {section.table ? (
                  <dl className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
                    {DATA_ROWS.map((row) => (
                      <div
                        key={row.dato}
                        className="border-line p-4 not-first:border-t"
                      >
                        <dt className="font-semibold text-ink">{row.dato}</dt>
                        <dd className="mt-1.5 grid gap-1 text-sm text-ink-soft sm:grid-cols-3 sm:gap-4">
                          <span>
                            <span className="block text-xs text-ink-faint">
                              Para qué
                            </span>
                            {row.finalidad}
                          </span>
                          <span>
                            <span className="block text-xs text-ink-faint">
                              Dónde vive
                            </span>
                            {row.donde}
                          </span>
                          <span>
                            <span className="block text-xs text-ink-faint">
                              Cuánto tiempo
                            </span>
                            {row.retencion}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {section.links ? (
                  <ul className="mt-3 space-y-1 text-sm">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                        >
                          {link.label}
                          <ArrowUpRight className="size-3.5" aria-hidden />
                          <span className="sr-only">
                            {" "}
                            (se abre en otra pestaña)
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </article>
        </div>
      </div>
    </main>
  );
}
