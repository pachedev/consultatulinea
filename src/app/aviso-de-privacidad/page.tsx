import type { Metadata } from "next";
import {
  DATA_ROWS,
  PRIVACY_CHANGELOG,
  PRIVACY_META,
  PRIVACY_SECTIONS,
} from "@/lib/data/privacy";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description:
    "Qué datos trata ConsultaTuLínea, para qué, dónde viven y cuánto tiempo: sin almacenamiento de CURP, números ni resultados.",
  alternates: { canonical: "/aviso-de-privacidad" },
};

export default function AvisoPrivacidadPage() {
  return (
    <main className="flex flex-1 flex-col">
      <article className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Aviso de privacidad
        </h1>
        <p className="mt-3 text-pretty text-ink-soft">
          Este aviso explica, en lenguaje claro, qué hace el sistema con tu
          información. Describe el funcionamiento real del sitio, no una
          intención.
        </p>
        <p className="tabular mt-3 text-xs tracking-[0.18em] text-ink-faint uppercase">
          Última actualización:{" "}
          <time dateTime={PRIVACY_META.lastUpdatedIso}>
            {PRIVACY_META.lastUpdated}
          </time>
        </p>

        {PRIVACY_META.draft ? (
          <p
            role="note"
            className="mt-6 rounded-lg border border-possible/30 bg-possible-bg px-3.5 py-3 text-sm text-possible"
          >
            Borrador en revisión. Los datos marcados como [PENDIENTE] se
            completarán antes de la publicación definitiva.
          </p>
        ) : null}

        <nav
          aria-label="En esta página"
          className="mt-8 rounded-xl border border-line bg-surface p-5"
        >
          <h2 className="text-xs font-medium tracking-wide text-ink-soft uppercase">
            En esta página
          </h2>
          <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {PRIVACY_SECTIONS.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink hover:decoration-ink"
                >
                  <span className="tabular text-ink-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>{" "}
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {PRIVACY_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                {section.title}
              </h2>
              <div className="mt-2 space-y-2">
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
                <dl className="mt-4 grid gap-px overflow-hidden rounded-xl border border-line bg-line">
                  {DATA_ROWS.map((row) => (
                    <div key={row.dato} className="bg-surface p-4">
                      <dt className="font-medium text-ink">{row.dato}</dt>
                      <dd className="mt-1.5 grid gap-1 text-sm text-ink-soft">
                        <span>
                          <span className="text-ink-faint">Para qué: </span>
                          {row.finalidad}
                        </span>
                        <span>
                          <span className="text-ink-faint">Dónde: </span>
                          {row.donde}
                        </span>
                        <span>
                          <span className="text-ink-faint">Cuánto: </span>
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
                        className="text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section id="historial" className="scroll-mt-20">
            <h2 className="text-xs font-medium tracking-wide text-ink-soft uppercase">
              Historial de cambios
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              {PRIVACY_CHANGELOG.map((entry) => (
                <li key={entry.date}>
                  <time
                    dateTime={entry.date}
                    className="tabular text-ink-faint"
                  >
                    {entry.date}
                  </time>{" "}
                  — {entry.change}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </main>
  );
}
