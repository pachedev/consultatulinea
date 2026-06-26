"use client";

import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const OPTIONS = [
  { value: "system", label: "Sistema", icon: Monitor },
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
] as const;

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
    localStorage.removeItem("theme");
  } else {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }
}

export function ThemeToggle() {
  // Inicia en "system" en servidor y cliente (coincide al hidratar);
  // el valor real se lee del localStorage tras montar.
  const [theme, setTheme] = useState<Theme>("system");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") setTheme(stored);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[0];
  const CurrentIcon = current.icon;

  function choose(value: Theme) {
    setTheme(value);
    apply(value);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Cambiar tema de color"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
      >
        <CurrentIcon className="size-4" aria-hidden />
        <ChevronDown className="size-3.5 text-ink-faint" aria-hidden />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-1.5 w-36 overflow-hidden rounded-lg border border-line bg-surface p-1 shadow-lg">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => choose(opt.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-surface-2 text-ink"
                    : "text-ink-soft hover:bg-surface-2 hover:text-ink",
                )}
              >
                <Icon className="size-4" aria-hidden />
                <span className="flex-1 text-left">{opt.label}</span>
                {active ? <Check className="size-3.5" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
