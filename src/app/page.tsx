"use client";

import { ShieldCheck } from "lucide-react";
import { CurpForm } from "@/components/home/CurpForm";
import { ResultsPanel } from "@/components/home/ResultsPanel";
import { useLookup } from "@/lib/hooks/useLookup";

export default function Home() {
  const lookup = useLookup();

  return (
    <main className="flex flex-1 flex-col items-center bg-slate-50 px-4 py-12 sm:py-20">
      <div className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
            <ShieldCheck className="size-3.5" aria-hidden />
            Privado · No almacenamos tu CURP
          </span>
          <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Consulta las líneas registradas a tu nombre
          </h1>
          <p className="mx-auto mt-3 max-w-md text-pretty text-slate-600">
            Ingresa tu CURP y revisa, en un solo lugar, qué líneas telefónicas
            móviles están registradas a tu nombre en México.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <CurpForm loading={lookup.loading} onSubmit={lookup.consultar} />
        </div>

        <ResultsPanel lookup={lookup} />
      </div>
    </main>
  );
}
