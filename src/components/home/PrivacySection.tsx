import { Check } from "lucide-react";
import { ARCO_RIGHTS, SECURITY_BULLETS } from "@/lib/data/content";

export function PrivacySection() {
  return (
    <section id="seguridad" className="scroll-mt-20 border-b border-line">
      <div className="mx-auto grid w-full max-w-5xl gap-12 px-4 py-16 sm:py-20 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Privacidad por diseño
          </h2>
          <p className="mt-3 max-w-md text-pretty text-ink-soft">
            La consulta ocurre en tu navegador. El proyecto no almacena tu
            información en ningún momento.
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
        </div>
      </div>
    </section>
  );
}
