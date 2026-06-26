"use client";

import { cn } from "@/lib/utils";
import type { FilterTab } from "@/types";

type Tab = { key: FilterTab; label: string; count: number };

export function FilterTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: FilterTab;
  onChange: (k: FilterTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "border-ink bg-ink text-paper"
                : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "tabular rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                isActive
                  ? "bg-paper/20 text-paper"
                  : "bg-surface-2 text-ink-faint",
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
