"use client";

import { Check } from "lucide-react";
import { type ReactNode, useState } from "react";
import { CurpForm } from "@/components/home/CurpForm";
import { ResultsPanel } from "@/components/home/ResultsPanel";
import { UsageCounter } from "@/components/home/UsageCounter";
import { CURP_REGEX } from "@/lib/curp";
import { SUPPORTED_PROVIDERS } from "@/lib/data/content";
import { useCurpHistory } from "@/lib/hooks/useCurpHistory";
import { useLookup } from "@/lib/hooks/useLookup";
import { cn } from "@/lib/utils";

const FACTS = [
  `${SUPPORTED_PROVIDERS} marcas en una sola consulta: Telcel, Virgin Mobile, Weex, OXXO CEL y las de Red Altán, entre otras.`,
  "Tu CURP no se guarda. Solo ves los últimos 4 dígitos de cada línea.",
  "Gratis, sin cuenta y de código abierto.",
];

/**
 * Espacio de trabajo del inicio.
 * - Antes de consultar: a la izquierda título y texto; a la derecha el
 *   contador y el formulario.
 * - Con resultados el formulario se retira y la sección se divide en dos:
 *   lo general (resumen, acciones, avisos) y lo específico (detalle por
 *   línea). "Nueva consulta" vuelve al formulario.
 * - En móvil todo se apila.
 */
export function HomeView({ announcements }: { announcements?: ReactNode }) {
  const [curp, setCurp] = useState("");
  const [submittedCurp, setSubmittedCurp] = useState("");
  const { history, saveToHistory, clearHistory } = useCurpHistory();
  const lookup = useLookup();

  const onSubmit = (turnstileToken: string) => {
    if (!CURP_REGEX.test(curp)) return;
    saveToHistory(curp);
    setSubmittedCurp(curp);
    lookup.consultar(curp, turnstileToken);
  };

  // Elegir una búsqueda reciente solo cambiaba el input: los resultados de la
  // consulta anterior seguían montados, así que parecía que ese resultado
  // pertenecía a la CURP recién seleccionada.
  const onSelectHistory = (value: string) => {
    lookup.reset();
    setSubmittedCurp("");
    setCurp(value);
  };

  const onNuevaConsulta = () => {
    lookup.reset();
    setCurp("");
    setSubmittedCurp("");
  };

  // Reintentar desde el formulario: limpia el estado y conserva la CURP.
  const onRetry = () => {
    lookup.reset();
  };

  const results = lookup.results;
  // Un error sin ninguna fila (verificación, límite de consultas, red) se
  // muestra en el formulario; con filas parciales, dentro de los resultados.
  const failedEmpty =
    !lookup.loading &&
    (!!lookup.error || lookup.timedOut) &&
    (results?.length ?? 0) === 0;
  const showResults = results !== null && !failedEmpty;

  return (
    <section className="bg-glow">
      <div
        className={cn(
          "mx-auto w-full max-w-6xl px-4",
          showResults ? "pt-6 pb-14 lg:pt-8" : "pt-8 pb-14 lg:pt-16 lg:pb-20",
        )}
      >
        {announcements ? <div className="mb-8">{announcements}</div> : null}

        {showResults ? (
          <>
            <h1 className="sr-only">
              Resultados: líneas registradas a tu nombre
            </h1>
            <ResultsPanel
              results={results ?? []}
              curp={submittedCurp}
              loading={lookup.loading}
              scannedCount={lookup.scannedCount}
              providersDone={lookup.providersDone}
              queryTime={lookup.queryTime}
              error={lookup.error}
              timedOut={lookup.timedOut}
              onNuevaConsulta={onNuevaConsulta}
            />
          </>
        ) : (
          <div className="grid items-start gap-x-14 gap-y-6 lg:grid-cols-2 lg:[grid-template-areas:'intro_counter''intro_form''more_form']">
            <header className="lg:[grid-area:intro]">
              <h1 className="max-w-[16ch] text-[clamp(2rem,1.4rem+3.2vw,3.25rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance text-ink">
                Revisa qué líneas están registradas a tu nombre
              </h1>
              <p className="mt-4 max-w-[34ch] text-lg leading-snug text-ink-faint">
                Escribe tu CURP una vez y consultamos a las operadoras por ti.
                Si aparece una línea que no reconoces, te decimos cómo darla de
                baja.
              </p>
            </header>

            <div className="lg:self-end lg:[grid-area:counter]">
              <UsageCounter />
            </div>

            <div className="edge-card rounded-[18px] p-5 shadow-card sm:p-7 lg:[grid-area:form]">
              <CurpForm
                curp={curp}
                setCurp={setCurp}
                loading={lookup.loading}
                error={lookup.error}
                timedOut={lookup.timedOut}
                history={history}
                onSubmit={onSubmit}
                onRetry={onRetry}
                onSelectHistory={onSelectHistory}
                onClearHistory={clearHistory}
              />
            </div>

            <ul className="grid gap-3 text-sm text-ink-soft lg:mt-2 lg:[grid-area:more]">
              {FACTS.map((fact) => (
                <li key={fact} className="flex items-start gap-2.5">
                  <Check
                    className="mt-0.5 size-[18px] shrink-0 text-confirmed"
                    aria-hidden
                  />
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
