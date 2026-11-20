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
              "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
              isActive
                ? "border-ink bg-ink text-paper"
                : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums",
                isActive
                  ? "bg-paper/25 text-paper"
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
