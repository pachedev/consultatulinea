import {
  ArrowUpRight,
  Github,
  Heart,
  LayoutGrid,
  Mail,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { Brand } from "@/components/layout/Brand";
import { SITE } from "@/lib/data/site";
import { cn } from "@/lib/utils";

type FooterLink = {
  href: string;
  name: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  external?: boolean;
  /** Color del icono: azul por defecto, rojo para fraude, ámbar para donar. */
  tone?: "accent" | "danger" | "warn";
};

// Contacto y Donar van al final, en ese orden.
const LINKS: FooterLink[] = [
  {
    href: SITE.repo,
    name: "Repositorio",
    description: "Código abierto",
    icon: Github,
    external: true,
  },
  {
    href: "/aviso-de-privacidad",
    name: "Privacidad",
    description: "Cómo usamos tus datos",
    icon: ShieldCheck,
  },
  {
    href: "/operadores",
    name: "Operadoras",
    description: "Cuáles consultamos y cuáles no",
    icon: LayoutGrid,
  },
  {
    href: SITE.reportFraud,
    name: "Reportar fraude",
    description: "Portal oficial de la CRT",
    icon: ShieldAlert,
    external: true,
    tone: "danger",
  },
  {
    href: `mailto:${SITE.contact}`,
    name: "Contacto",
    description: SITE.contact,
    icon: Mail,
  },
  {
    href: SITE.donate,
    name: "Donar",
    description: "Apoya el proyecto",
    icon: Heart,
    external: true,
    tone: "warn",
  },
];

const TONES = {
  accent: "bg-accent-soft text-accent",
  danger: "bg-error-bg text-danger",
  warn: "bg-possible-bg text-possible",
};

function FooterCard({ link }: { link: FooterLink }) {
  const Icon = link.icon;
  const body = (
    <>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
          TONES[link.tone ?? "accent"],
        )}
        aria-hidden
      >
        <Icon className="size-[18px]" />
      </span>
      <span className="grid min-w-0 flex-1">
        <span className="font-semibold text-ink">{link.name}</span>
        <span className="truncate text-xs text-ink-faint">
          {link.description}
        </span>
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-ink-faint" aria-hidden />
    </>
  );
  const cls =
    "flex min-h-16 items-center gap-3 rounded-xl border border-line bg-surface/85 px-3.5 py-3 transition hover:-translate-y-px hover:border-line-strong motion-reduce:hover:translate-y-0";

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        {body}
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </a>
    );
  }
  if (link.href.startsWith("mailto:")) {
    return (
      <a href={link.href} className={cls}>
        {body}
      </a>
    );
  }
  return (
    <Link href={link.href} className={cls}>
      {body}
    </Link>
  );
}

function ExternalInline({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 font-medium text-ink-soft underline decoration-line-strong underline-offset-2 hover:text-ink hover:decoration-ink"
    >
      {children}
      <ArrowUpRight className="size-3" aria-hidden />
      <span className="sr-only"> (se abre en otra pestaña)</span>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-[radial-gradient(50%_120%_at_100%_0%,var(--glow-a),transparent_70%),radial-gradient(40%_100%_at_0%_100%,var(--glow-b),transparent_70%)] bg-paper">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-7">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
            <Brand />
            <p className="mt-3 max-w-[36ch] text-sm text-ink-soft">
              Consulta las líneas telefónicas vinculadas a tu CURP.
            </p>
            <p className="mt-2 max-w-[36ch] text-xs text-ink-faint">
              Servicio gratuito, independiente y de código abierto. No afiliado
              al Gobierno de México ni a ninguna operadora.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-ink">
              Conoce el proyecto
            </h2>
            <p className="mt-1 max-w-[48ch] text-sm text-ink-faint">
              Revisa el código, cómo protegemos tu información o a quién acudir
              si algo no está bien.
            </p>
            <nav
              aria-label="Enlaces del sitio"
              className="mt-4 grid gap-2 sm:grid-cols-2"
            >
              {LINKS.map((link) => (
                <FooterCard key={link.name} link={link} />
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-line pt-4 text-xs text-ink-faint sm:flex-row sm:justify-between">
          <p>
            Hecho por{" "}
            <ExternalInline href={SITE.author}>Pachedev</ExternalInline>.
          </p>
          <p>
            Inspirado en{" "}
            <ExternalInline href={SITE.inspiration}>MisLíneas</ExternalInline>,
            de Jorge Mora, y publicado con la misma licencia (GPL-2.0).
          </p>
        </div>
      </div>
    </footer>
  );
}
