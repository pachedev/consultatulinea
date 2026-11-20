import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { ARCO_RIGHTS, LFPDPPP_URL, SECURITY_BULLETS } from "@/lib/data/content";
import { SITE } from "@/lib/data/site";

export function PrivacySection() {
  return (
    <section id="seguridad" className="scroll-mt-20 border-b border-line">
      <div className="mx-auto grid w-full max-w-5xl gap-12 px-4 py-16 sm:py-20 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Privacidad por diseño
          </h2>
          <p className="mt-3 max-w-md text-pretty text-ink-soft">
            Tu CURP se usa únicamente durante la consulta y nunca se guarda. El
            proyecto no construye ninguna base de datos con tu información.
          </p>
          <ul className="mt-6 grid gap-2.5">
            {SECURITY_BULLETS.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-sm">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-confirmed"
                  aria-hidden
                />
                <span className="text-ink-soft">{bullet}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/aviso-de-privacidad"
            className="mt-6 inline-block text-sm text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
          >
            Leer el aviso de privacidad completo
          </Link>
        </div>

        <div id="arco" className="scroll-mt-20">
          <h3 className="text-sm font-medium tracking-wide text-ink-soft uppercase">
            Tus derechos ARCO
          </h3>
          <p className="mt-2 max-w-md text-sm text-ink-faint">
            Si encuentras una línea que no reconoces, puedes ejercer estos
            derechos ante el operador.
          </p>
          <dl className="mt-5 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {ARCO_RIGHTS.map((right) => (
              <div key={right.t} className="bg-surface p-5">
                <dt className="font-medium text-ink">{right.t}</dt>
                <dd className="mt-1 text-sm text-ink-soft">{right.d}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a
              href={LFPDPPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink hover:decoration-ink"
            >
              Consultar la ley
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
            <a
              href={SITE.reportFraud}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink hover:decoration-ink"
            >
              Reportar ante la CRT
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
