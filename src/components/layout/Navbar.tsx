"use client";

import { Github, Heart, Menu, ShieldAlert, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Brand } from "@/components/layout/Brand";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SITE } from "@/lib/data/site";

const NAV_LINKS = [
  { href: "/#seguridad", label: "Seguridad" },
  { href: "/#arco", label: "Derechos ARCO" },
  // Página propia, no un ancla del home como las anteriores.
  { href: "/operadores", label: "Operadores" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
        <Brand />

        {/* Desktop */}
        <div className="hidden items-center gap-5 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}

          <span className="h-5 w-px bg-line" />

          <ThemeToggle />

          <a
            href={SITE.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Código fuente en GitHub"
            title="Código fuente en GitHub"
            className="text-ink-faint transition-colors hover:text-ink"
          >
            <Github className="size-5" aria-hidden />
          </a>

          <a
            href={SITE.donate}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            <Heart className="size-4" aria-hidden />
            Donar
          </a>

          <a
            href={SITE.reportFraud}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            <ShieldAlert className="size-4" aria-hidden />
            Reportar fraude
          </a>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Menú"
            className="inline-flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface hover:text-ink"
          >
            {open ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
          </button>
        </div>
      </nav>

      {/* Panel móvil */}
      {open ? (
        <div className="border-t border-line bg-paper px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={SITE.repo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink"
            >
              <Github className="size-4" aria-hidden />
              GitHub
            </a>
            <a
              href={SITE.donate}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg border border-line py-2.5 font-medium text-ink transition-colors hover:border-line-strong"
            >
              <Heart className="size-4" aria-hidden />
              Donar
            </a>
            <a
              href={SITE.reportFraud}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink py-2.5 font-medium text-paper transition-opacity hover:opacity-90"
            >
              <ShieldAlert className="size-4" aria-hidden />
              Reportar fraude
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
