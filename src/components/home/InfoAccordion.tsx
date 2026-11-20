"use client";

import { ChevronDown } from "lucide-react";
import { type ReactNode, useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

export type InfoItem = { id: string; title: string; content: ReactNode };

/**
 * Acordeón del Centro de información: un panel abierto a la vez y sincronizado
 * con el hash, así los enlaces existentes (/#seguridad, /#arco,
 * /#preguntas-frecuentes) abren directo su sección.
 */
export function InfoAccordion({ items }: { items: InfoItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const baseId = useId();

  useEffect(() => {
    const ids = items.map((i) => i.id);
    const sync = () => {
      const target = window.location.hash.slice(1);
      if (ids.includes(target)) {
        setOpenId(target);
        document.getElementById(target)?.scrollIntoView({ block: "start" });
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [items]);

  return (
    <div>
      {items.map((item) => {
        const open = openId === item.id;
        const triggerId = `${baseId}-${item.id}-trigger`;
        const panelId = `${baseId}-${item.id}-panel`;
        return (
          <div
            key={item.id}
            id={item.id}
            className="scroll-mt-20 border-t border-line last:border-b"
          >
            <h3>
              <button
                id={triggerId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
                className="group flex min-h-[72px] w-full items-center justify-between gap-5 py-4 text-left text-[clamp(1.05rem,1rem+0.5vw,1.25rem)] font-semibold tracking-tight text-ink transition-colors hover:text-accent"
              >
                <span>{item.title}</span>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-ink-faint transition-transform duration-300 motion-reduce:transition-none",
                    open && "rotate-180 text-accent",
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <section
              id={panelId}
              aria-labelledby={triggerId}
              className="ci-panel"
              data-open={open}
              inert={!open}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="pt-1 pb-8 text-ink-soft">{item.content}</div>
              </div>
            </section>
          </div>
        );
      })}
    </div>
  );
}
