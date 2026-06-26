import type { Metadata } from "next";
import { OperatorsDirectory } from "@/components/operators/OperatorsDirectory";
import { getAllOperatorViews } from "@/lib/operatorPages";

export const metadata: Metadata = {
  title: "Operadores y marcas",
  description:
    "Directorio de operadores móviles y OMVs en México con su estado de consulta y enlace al portal oficial. Telcel, AT&T y más de 80 marcas sobre la Red Altán.",
  alternates: { canonical: "/operadores" },
};

export default function OperadoresPage() {
  const operators = getAllOperatorViews();

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Operadores y marcas
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-ink-soft">
            Cada operador administra su propio registro. Aquí puedes ver el
            estado de consulta de cada uno y entrar a su ficha con el portal
            oficial.
          </p>
        </header>

        <OperatorsDirectory operators={operators} />
      </div>
    </main>
  );
}
