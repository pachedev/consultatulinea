import {
  ArrowUpRight,
  Database,
  Github,
  Globe,
  History,
  ListChecks,
  Lock,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { InfoAccordion } from "@/components/home/InfoAccordion";
import { ReportButton } from "@/components/layout/ReportButton";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  ACTIVE_LOOKUP_PROVIDERS,
  LFPDPPP_URL,
  SUPPORTED_PROVIDERS,
} from "@/lib/data/content";
import { FAQ } from "@/lib/data/faq";
import { SITE } from "@/lib/data/site";

const STEPS = [
  {
    icon: Search,
    title: "Escribes tu CURP",
    body: "Una sola vez, en un solo formulario, tras una verificación anti-bots.",
  },
  {
    icon: Database,
    title: "Consultamos a cada operadora",
    body: `Nuestro servidor pregunta a ${ACTIVE_LOOKUP_PROVIDERS} servicios que cubren ${SUPPORTED_PROVIDERS} marcas. Ves cada respuesta conforme llega.`,
  },
  {
    icon: ListChecks,
    title: "Revisas los resultados",
    body: "Distingue líneas registradas, posibles y operadoras sin registro. Solo ves los últimos 4 dígitos.",
  },
];

const FACTS = [
  {
    icon: ShieldCheck,
    title: "No la guardamos",
    body: "Se usa durante la consulta y se descarta.",
  },
  {
    icon: Globe,
    title: "Tu IP no llega a la operadora",
    body: "Las consultas salen desde nuestro servidor.",
  },
  { icon: Lock, title: "Conexión cifrada", body: "HTTPS de punta a punta." },
  {
    icon: History,
    title: "Historial local",
    body: "Vive solo en tu navegador y puedes borrarlo.",
  },
];

// Enlaces de ayuda dentro de algunas respuestas, por posición en FAQ.
const FAQ_LINKS: Record<number, { href: string; label: string }> = {
  0: { href: "/#seguridad", label: "Ver cómo protegemos tu información" },
  3: {
    href: "/operadores",
    label: "Ver qué operadoras requieren consulta manual",
  },
  4: { href: "/#arco", label: "Conocer tus derechos ARCO" },
};

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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const linkCls =
  "inline-flex items-center gap-1 text-sm text-ink-soft underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent hover:decoration-current";

function IconBadge({
  icon: Icon,
  size = "md",
}: {
  icon: typeof Search;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={
        size === "lg"
          ? "relative z-10 flex size-14 shrink-0 items-center justify-center rounded-[18px] border border-line bg-surface text-accent shadow-card"
          : "flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"
      }
      aria-hidden
    >
      <Icon
        className={size === "lg" ? "size-[23px]" : "size-5"}
        strokeWidth={1.8}
      />
    </span>
  );
}

function HowItWorks() {
  return (
    <>
      <ol
        aria-label="Pasos de la consulta"
        className="relative mx-auto grid max-w-[900px] gap-6 pt-2 before:absolute before:top-9 before:bottom-7 before:left-[27px] before:w-px before:bg-line-strong md:grid-cols-3 md:gap-8 md:before:top-[35px] md:before:right-[17%] md:before:bottom-auto md:before:left-[17%] md:before:h-px md:before:w-auto"
      >
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="relative grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-[18px] md:flex md:flex-col md:items-center md:text-center"
          >
            <span className="row-span-2">
              <IconBadge icon={step.icon} size="lg" />
            </span>
            <h4 className="self-end font-semibold text-ink md:mt-[18px] md:self-auto">
              <span className="text-ink-faint tabular-nums">{i + 1}.</span>{" "}
              {step.title}
            </h4>
            <p className="mt-0.5 self-start text-sm leading-relaxed text-ink-faint md:mt-2 md:max-w-60 md:self-auto">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-6 flex flex-wrap items-center gap-1.5 text-sm text-ink-faint md:mt-8 md:justify-center">
        ¿Tienes dudas?
        <a
          href={SITE.repo}
          target="_blank"
          rel="noopener noreferrer"
          className={linkCls}
        >
          El código es abierto y puedes auditarlo.
          <Github className="size-[15px]" aria-hidden />
          <ArrowUpRight className="size-3.5" aria-hidden />
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </a>
      </p>
    </>
  );
}

function Questions() {
  return (
    <>
      <p className="mb-5 max-w-[62ch] text-ink-faint">
        Antes de consultar, esto es lo más importante que debes saber.
      </p>
      <dl className="border-y border-line">
        {FAQ.map((item, i) => {
          const link = FAQ_LINKS[i];
          return (
            <div
              key={item.q}
              className="grid gap-1.5 py-4 not-first:border-t not-first:border-line md:grid-cols-[minmax(220px,0.7fr)_minmax(0,1fr)] md:gap-7"
            >
              <dt className="font-semibold text-ink">{item.q}</dt>
              <dd>
                <p className="max-w-[62ch] text-sm leading-relaxed text-ink-faint">
                  {item.a}
                </p>
                {link ? (
                  <Link href={link.href} className={`${linkCls} mt-2.5`}>
                    {link.label}
                  </Link>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </>
  );
}

function Security() {
  return (
    <>
      <p className="text-lg font-semibold text-ink">
        Tu CURP se usa solo para consultar.
      </p>
      <p className="mt-1 mb-5 max-w-[62ch] text-ink-faint">
        No la guardamos en base de datos ni en registros, y del operador solo
        llega a tu navegador la marca y los últimos 4 dígitos.
      </p>
      <dl className="grid gap-3 md:grid-cols-2">
        {FACTS.map((f) => (
          <div
            key={f.title}
            className="grid grid-cols-[40px_1fr] gap-x-3.5 rounded-xl border border-line bg-surface p-3.5"
          >
            <span className="row-span-2">
              <IconBadge icon={f.icon} />
            </span>
            <dt className="font-semibold text-ink">{f.title}</dt>
            <dd className="mt-0.5 text-sm text-ink-faint">{f.body}</dd>
          </div>
        ))}
      </dl>
      <Link href="/aviso-de-privacidad" className={`${linkCls} mt-4`}>
        Leer el aviso de privacidad
      </Link>
    </>
  );
}

function Arco() {
  return (
    <div className="grid gap-5">
      <div>
        <h4 className="text-lg font-semibold text-ink">
          Sobre tus datos, tú decides.
        </h4>
        <p className="mt-1.5 max-w-[62ch] text-sm text-ink-faint">
          Acceso, Rectificación, Cancelación y Oposición se ejercen ante la
          operadora que tiene tus datos, conforme a la{" "}
          <a
            href={LFPDPPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkCls}
          >
            LFPDPPP
            <ArrowUpRight className="size-3" aria-hidden />
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
          .
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid content-start gap-2 rounded-xl border border-danger/25 bg-error-bg p-[18px]">
          <h4 className="font-semibold text-ink">¿No reconoces una línea?</h4>
          <p className="text-sm text-ink-soft">
            Pide la baja a la operadora y repórtala como uso indebido ante la
            autoridad.
          </p>
          <a
            href={SITE.reportFraud}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex min-h-11 items-center gap-1.5 justify-self-start rounded-xl bg-danger px-4 text-sm font-semibold text-danger-ink transition hover:brightness-105"
          >
            Reportar fraude en la CRT
            <ArrowUpRight className="size-4" aria-hidden />
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        </div>
        <div className="grid content-start gap-2 rounded-xl border border-line bg-surface p-[18px]">
          <h4 className="font-semibold text-ink">
            ¿Falló el sitio o un resultado?
          </h4>
          <p className="text-sm text-ink-faint">
            Eso es un incidente nuestro: repórtalo aquí y lo revisamos. No va a
            la operadora ni a la CRT.
          </p>
          <ReportButton className="mt-1 inline-flex min-h-11 items-center justify-self-start rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-line-strong">
            Reportar un problema del sitio
          </ReportButton>
        </div>
      </div>
    </div>
  );
}

/**
 * Centro de información: reúne Cómo funciona, Preguntas frecuentes,
 * Privacidad y seguridad, y Derechos ARCO y reportes (patrón de la
 * referencia). Los ids conservan las anclas que ya existían.
 */
export function InformationCenter() {
  return (
    <section
      aria-labelledby="centro-heading"
      className="border-t border-line bg-[radial-gradient(60%_80%_at_100%_0%,var(--glow-c),transparent_70%),radial-gradient(50%_70%_at_0%_100%,var(--glow-b),transparent_70%)] bg-paper"
    >
      <JsonLd data={howToJsonLd} />
      <JsonLd data={faqJsonLd} />
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-16">
        <h2
          id="centro-heading"
          className="mb-5 text-[clamp(1.75rem,1.4rem+1.6vw,2.25rem)] font-semibold tracking-[-0.035em] text-ink"
        >
          Centro de información
        </h2>
        <InfoAccordion
          items={[
            {
              id: "como-funciona",
              title: "Cómo funciona",
              content: <HowItWorks />,
            },
            {
              id: "preguntas-frecuentes",
              title: "Preguntas frecuentes",
              content: <Questions />,
            },
            {
              id: "seguridad",
              title: "Privacidad y seguridad",
              content: <Security />,
            },
            {
              id: "arco",
              title: "Derechos ARCO y reportes",
              content: <Arco />,
            },
          ]}
        />
      </div>
    </section>
  );
}
