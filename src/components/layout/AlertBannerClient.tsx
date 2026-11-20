"use client";

import { AlertTriangle, Info, OctagonAlert, X } from "lucide-react";
import { useState } from "react";
import type { NewsItem, NewsLevel } from "@/lib/api/news";
import { cn } from "@/lib/utils";

const STYLES: Record<
  NewsLevel,
  { box: string; icon: typeof Info; tone: string }
> = {
  info: {
    box: "bg-info-bg border-info/25",
    icon: Info,
    tone: "text-info",
  },
  warning: {
    box: "bg-possible-bg border-possible/25",
    icon: AlertTriangle,
    tone: "text-possible",
  },
  critical: {
    box: "bg-error-bg border-danger/30",
    icon: OctagonAlert,
    tone: "text-danger",
  },
};

/**
 * Avisos del sistema. Vienen de /news del backend y se publican desde el panel
 * admin; aquí solo se muestran. Cada página decide dónde van (inicio y
 * operadoras).
 */
export function AlertBannerClient({
  items,
  className,
}: {
  items: NewsItem[];
  className?: string;
}) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const visible = items.filter((i) => !dismissed.has(i.id));
  if (!visible.length) return null;

  return (
    <section
      aria-live="polite"
      aria-label="Avisos del sistema"
      className={cn("grid gap-2", className)}
    >
      {visible.map((item) => {
        const s = STYLES[item.level];
        const Icon = s.icon;
        return (
          <div
            key={item.id}
            role="alert"
            className={cn(
              "relative flex items-start gap-3 overflow-hidden rounded-xl border py-3 pr-3 pl-[18px] text-sm",
              s.box,
            )}
          >
            <span
              className={cn("absolute inset-y-0 left-0 w-1 bg-current", s.tone)}
              aria-hidden
            />
            <Icon
              className={cn("mt-0.5 size-[18px] shrink-0", s.tone)}
              aria-hidden
            />
            <p className="flex-1 text-pretty text-ink-soft">
              <strong className="font-semibold text-ink">{item.title}:</strong>{" "}
              {item.body}
            </p>
            <button
              type="button"
              onClick={() =>
                setDismissed((prev) => new Set([...prev, item.id]))
              }
              aria-label={`Cerrar aviso: ${item.title}`}
              className="-my-1.5 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface/60 hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </section>
  );
}
