import { Heart } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/layout/Brand";
import { ReportButton } from "@/components/layout/ReportButton";
import { SITE } from "@/lib/data/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Brand />
          <p className="mt-3 max-w-xs text-sm text-ink-soft">
            Consulta qué líneas telefónicas están registradas a tu nombre en
            México. Proyecto independiente y de código abierto.
          </p>
        </div>

        <nav className="text-sm">
          <p className="mb-3 font-medium text-ink">Navegación</p>
          <ul className="space-y-2 text-ink-soft">
            <li>
              <Link href="/" className="hover:text-ink">
                Consulta
              </Link>
            </li>
            <li>
              <Link href="/operadores" className="hover:text-ink">
                Operadores
              </Link>
            </li>
            <li>
              <Link href="/aviso-de-privacidad" className="hover:text-ink">
                Aviso de privacidad
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-sm">
          <p className="mb-3 font-medium text-ink">Proyecto</p>
          <ul className="space-y-2 text-ink-soft">
            <li>
              <a
                href={SITE.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink"
              >
                Código fuente
              </a>
            </li>
            <li>
              <a
                href={SITE.donate}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-ink"
              >
                <Heart className="size-3.5" aria-hidden />
                Apoyar el proyecto
              </a>
            </li>
            <li>
              <ReportButton />
            </li>
            <li>Licencia GPL-2.0</li>
            <li>
              Inspirado en{" "}
              <a
                href={SITE.inspiration}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-line-strong underline-offset-2 hover:text-ink"
              >
                MisLíneas
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line bg-surface-2">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-4 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>
            No almacenamos CURP, números ni resultados. Las consultas se
            ejecutan desde tu navegador.
          </p>
          <p className="shrink-0">
            Hecho por{" "}
            <a
              href="https://pachedev.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink-soft underline decoration-line-strong underline-offset-2 transition-colors hover:text-ink"
            >
              Pachedev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
