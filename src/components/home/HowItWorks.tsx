import { JsonLd } from "@/components/seo/JsonLd";

const STEPS = [
  {
    n: "01",
    title: "Ingresa tu CURP",
    body: "Viaja cifrada a nuestro servidor, que la usa solo para preguntarle a los operadores. No se guarda en ninguna base de datos ni en los registros del sistema.",
  },
  {
    n: "02",
    title: "Escaneamos los portales",
    body: "Consultamos en paralelo los mecanismos públicos de verificación de cada operador y OMV.",
  },
  {
    n: "03",
    title: "Revisa y actúa",
    body: "Verás las líneas registradas a tu nombre. Si hay alguna que no reconoces, te guiamos con tus derechos ARCO.",
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Cómo consultar qué líneas telefónicas están registradas a tu nombre en México",
  description:
    "Consulta con tu CURP las líneas móviles registradas a tu nombre ante el Registro Nacional de Usuarios de Telefonía Móvil.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "CURP (18 caracteres)" }],
  step: STEPS.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.body,
  })),
};

export function HowItWorks() {
  return (
    <section className="border-b border-line">
      <JsonLd data={howToJsonLd} />
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-20">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Cómo funciona
        </h2>
        <ol className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="bg-surface p-6">
              <span className="tabular text-sm font-medium text-ink-faint">
                {step.n}
              </span>
              <h3 className="mt-3 font-medium text-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
