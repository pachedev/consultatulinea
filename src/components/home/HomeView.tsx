"use client";

import { type FormEvent, useState } from "react";
import { CoverageSection } from "@/components/home/CoverageSection";
import { CurpForm } from "@/components/home/CurpForm";
import { EmptyState } from "@/components/home/EmptyState";
import { FaqSection } from "@/components/home/FaqSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PrivacySection } from "@/components/home/PrivacySection";
import { ResultsPanel } from "@/components/home/ResultsPanel";
import { UsageCounter } from "@/components/home/UsageCounter";
import { CURP_REGEX } from "@/lib/curp";
import { SUPPORTED_PROVIDERS, TOTAL_PROVIDERS } from "@/lib/data/content";
import { useCurpHistory } from "@/lib/hooks/useCurpHistory";
import { useLookup } from "@/lib/hooks/useLookup";
import { cn } from "@/lib/utils";

export function HomeView() {
  const [curp, setCurp] = useState("");
  const [submittedCurp, setSubmittedCurp] = useState("");
  const { history, saveToHistory } = useCurpHistory();
  const lookup = useLookup();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!CURP_REGEX.test(curp)) return;
    saveToHistory(curp);
    setSubmittedCurp(curp);
    lookup.consultar(curp);
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

  const hasResults = lookup.results !== null;

  const form = (
    <CurpForm
      curp={curp}
      setCurp={setCurp}
      loading={lookup.loading}
      error={lookup.error}
      timedOut={lookup.timedOut}
      history={history}
      onSubmit={onSubmit}
      onRetry={lookup.retry}
      onSelectHistory={onSelectHistory}
    />
  );

  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-line">
        <div
          className={cn(
            "mx-auto w-full px-4 py-10 sm:py-14",
            hasResults ? "max-w-6xl" : "max-w-2xl",
          )}
        >
          <header className="mb-8">
            <p className="tabular mb-3 text-xs tracking-[0.18em] text-ink-faint uppercase">
              Registro Nacional de Usuarios de Telefonía Móvil
            </p>
            <h1 className="font-display text-3xl leading-[1.05] font-bold tracking-tight text-balance text-ink sm:text-4xl">
              Qué líneas hay registradas a tu nombre
            </h1>
            {!hasResults ? (
              <p className="mt-4 max-w-md text-pretty text-ink-soft">
                Ingresa tu CURP y consulta en un solo lugar{" "}
                <span className="tabular text-ink">{SUPPORTED_PROVIDERS}</span>{" "}
                operadores y marcas de las{" "}
                <span className="tabular text-ink">{TOTAL_PROVIDERS}</span> que
                registran líneas móviles en México.
              </p>
            ) : null}
            {!hasResults ? <UsageCounter /> : null}
          </header>

          {hasResults ? (
            <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-6">
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="lg:sticky lg:top-20">
                  <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                    {form}
                  </div>
                </div>
              </div>
              <div className="mt-6 lg:col-span-7 lg:mt-0 xl:col-span-8">
                <ResultsPanel
                  results={lookup.results ?? []}
                  curp={submittedCurp}
                  loading={lookup.loading}
                  scannedCount={lookup.scannedCount}
                  providersDone={lookup.providersDone}
                  queryTime={lookup.queryTime}
                  onNuevaConsulta={onNuevaConsulta}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
                {form}
              </div>
              <div className="mt-6">
                <EmptyState />
              </div>
            </>
          )}
        </div>
      </section>

      <HowItWorks />
      <CoverageSection />
      <PrivacySection />
      <FaqSection />
    </main>
  );
}
