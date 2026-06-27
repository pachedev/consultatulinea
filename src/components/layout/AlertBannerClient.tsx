"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { NewsItem, NewsLevel } from "@/lib/api/news";

const STYLES: Record<NewsLevel, { bar: string; wrapper: string; btn: string }> =
  {
    info: {
      wrapper: "bg-info-bg border-info/30 text-info",
      bar: "bg-info",
      btn: "hover:text-info-strong",
    },
    warning: {
      wrapper: "bg-possible-bg border-possible/30 text-possible",
      bar: "bg-possible",
      btn: "hover:text-possible-strong",
    },
    critical: {
      wrapper: "bg-error-bg border-error/30 text-error",
      bar: "bg-error",
      btn: "hover:text-error-strong",
    },
  };

export function AlertBannerClient({ items }: { items: NewsItem[] }) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const visible = items.filter((i) => !dismissed.has(i.id));
  if (!visible.length) return null;

  return (
    <div aria-live="polite" aria-label="Avisos del sistema">
      {visible.map((item) => {
        const s = STYLES[item.level];
        return (
          <div
            key={item.id}
            role="alert"
            className={`relative border-b px-4 py-2.5 text-sm ${s.wrapper}`}
          >
            <div
              className={`absolute inset-y-0 left-0 w-1 ${s.bar}`}
              aria-hidden
            />
            <div className="mx-auto flex max-w-3xl items-start gap-3 pl-3">
              <p className="flex-1 pt-0.5">
                <strong className="font-semibold">{item.title}:</strong>{" "}
                {item.body}
              </p>
              <button
                type="button"
                onClick={() =>
                  setDismissed((prev) => new Set([...prev, item.id]))
                }
                aria-label={`Cerrar aviso: ${item.title}`}
                className={`mt-0.5 shrink-0 opacity-50 transition-opacity ${s.btn} hover:opacity-100`}
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
