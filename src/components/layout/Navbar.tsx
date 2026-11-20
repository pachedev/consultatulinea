"use client";

import { ArrowUpRight, Heart, Menu, ShieldAlert, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Brand } from "@/components/layout/Brand";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SITE } from "@/lib/data/site";

const NAV_LINKS = [
  { href: "/", label: "Consultar" },
  { href: "/operadores", label: "Operadoras" },
  { href: "/aviso-de-privacidad", label: "Privacidad" },
  // Abre el panel de preguntas del Centro de información del inicio.
  { href: "/#preguntas-frecuentes", label: "Preguntas" },
];

const pill =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors";
// Donar en ámbar, fraude en rojo: dos acciones distintas que no deben confundirse.
const donateCls = `${pill} border-possible/30 bg-possible-bg text-possible hover:border-possible`;
const fraudCls = `${pill} border-danger/35 bg-error-bg text-danger hover:border-danger`;

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md backdrop-saturate-150">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <Brand className="mr-auto" />

        {/* Escritorio */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <a
            href={SITE.donate}
            target="_blank"
            rel="noopener noreferrer"
            className={donateCls}
          >
            <Heart className="size-4" aria-hidden />
            Donar
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
          <a
            href={SITE.reportFraud}
            target="_blank"
            rel="noopener noreferrer"
            className={fraudCls}
          >
            <ShieldAlert className="size-4" aria-hidden />
            Reportar fraude
            <ArrowUpRight className="size-3.5" aria-hidden />
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="menu-movil"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="inline-flex size-11 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink lg:hidden"
        >
          {open ? (
            <X className="size-5" aria-hidden />
          ) : (
            <Menu className="size-5" aria-hidden />
          )}
        </button>
      </nav>

      {/* Menú móvil: en pantallas chicas Donar y Reportar fraude viven aquí */}
      {open ? (
        <div
          id="menu-movil"
          className="border-t border-line bg-surface px-4 pt-2 pb-4 shadow-card lg:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center border-b border-line font-medium text-ink"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex flex-wrap items-center gap-2 pt-4 sm:hidden">
              <a
                href={SITE.donate}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={`${donateCls} min-h-11 px-4`}
              >
                <Heart className="size-4" aria-hidden />
                Donar
              </a>
              <a
                href={SITE.reportFraud}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={`${fraudCls} min-h-11 px-4`}
              >
                <ShieldAlert className="size-4" aria-hidden />
                Reportar fraude
                <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
