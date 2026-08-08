import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description:
    "Cómo ConsultaTuLínea protege tu información: privacidad por diseño, sin almacenamiento de CURP, números ni resultados.",
  alternates: { canonical: "/aviso-de-privacidad" },
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Responsable e independencia",
    body: [
      "ConsultaTuLínea es un proyecto independiente y de código abierto. No pertenece a la Comisión Reguladora de Telecomunicaciones (CRT) ni a ningún operador, y no sustituye los portales oficiales de consulta o registro.",
    ],
  },
  {
    title: "Qué datos tratamos",
    body: [
      "Para realizar una consulta, ingresas tu CURP. Tu CURP viaja cifrada (TLS) a nuestro servidor, que es quien consulta los mecanismos públicos de verificación de cada operador y te devuelve el resultado en pantalla.",
      "No almacenamos tu CURP, tus números telefónicos ni los resultados de la consulta en ninguna base de datos del proyecto, y la CURP se omite de los registros técnicos del sistema.",
      "Para no repetir la misma consulta contra los operadores en cuestión de minutos, el resultado puede permanecer unos minutos en memoria volátil, indexado con una huella irreversible (SHA-256) de la CURP y nunca con la CURP en claro. Esa memoria se pierde al reiniciar el servicio.",
    ],
  },
  {
    title: "Cómo salen las consultas (proxies)",
    body: [
      "Varios operadores bloquean el tráfico que proviene de centros de datos. Para que tu consulta llegue igual que la de cualquier persona, una parte de las peticiones sale a través de servicios de proxy, incluidos proxies residenciales.",
      "El proxy únicamente cambia la dirección IP desde la que sale la consulta hacia el operador. Tu dirección IP nunca se comparte con el operador ni con el proxy, y no se les envía ningún dato adicional tuyo.",
      "Lo indicamos de forma explícita porque creemos que debes saber por dónde viaja tu consulta, aunque el tratamiento de tu CURP no cambia en absoluto.",
    ],
  },
  {
    title: "Privacidad por diseño",
    body: [
      "El proyecto está diseñado bajo el enfoque de Privacy by Design: la información sensible no transita ni permanece en la infraestructura del proyecto más allá de lo estrictamente necesario para devolverte el resultado en pantalla.",
      "El historial reciente de CURP que ves en la aplicación se guarda únicamente en tu navegador (localStorage) y puedes borrarlo en cualquier momento.",
    ],
  },
  {
    title: "Uso legítimo",
    body: [
      "La herramienta está pensada para consultar tu propio CURP. Consultar el CURP de terceras personas sin su consentimiento puede ser contrario a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y otras disposiciones aplicables en México.",
    ],
  },
  {
    title: "Tus derechos ARCO",
    body: [
      "Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación y Oposición directamente ante el operador correspondiente. En la ficha de cada operador encontrarás el enlace a su portal oficial.",
    ],
  },
];

export default function AvisoPrivacidadPage() {
  return (
    <main className="flex flex-1 flex-col">
      <article className="mx-auto w-full max-w-2xl px-4 py-12 sm:py-16">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Aviso de privacidad
        </h1>
        <p className="mt-3 text-pretty text-ink-soft">
          La privacidad es un principio fundamental de ConsultaTuLínea. Este
          aviso explica, en lenguaje claro, cómo se maneja tu información.
        </p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
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
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
