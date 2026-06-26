import { cn } from "@/lib/utils";
import type { DisplayLine } from "@/types";

type State = "confirmed" | "possible" | "none" | "error" | "unavailable";

function stateOf(line: DisplayLine): State {
  if (line.isError) return "error";
  if (line.isUnavailable) return "unavailable";
  if (line.isNotFound) return "none";
  if (line.isPossible) return "possible";
  return "confirmed";
}

const STATE_META: Record<
  State,
  { label: string; dot: string; text: string; bar: string }
> = {
  confirmed: {
    label: "Confirmada",
    dot: "bg-confirmed",
    text: "text-confirmed",
    bar: "bg-confirmed",
  },
  possible: {
    label: "Posible",
    dot: "bg-possible",
    text: "text-possible",
    bar: "bg-possible",
  },
  none: {
    label: "Sin registro",
    dot: "bg-none",
    text: "text-none",
    bar: "bg-line-strong",
  },
  error: {
    label: "Error",
    dot: "bg-error",
    text: "text-error",
    bar: "bg-error",
  },
  unavailable: {
    label: "No disponible",
    dot: "bg-possible",
    text: "text-possible",
    bar: "bg-possible",
  },
};

export function LineCard({ line }: { line: DisplayLine }) {
  const state = stateOf(line);
  const meta = STATE_META[state];

  return (
    <div className="relative flex items-center gap-4 overflow-hidden rounded-lg border border-line bg-surface py-3 pr-4 pl-5">
      <span
        className={cn("absolute inset-y-0 left-0 w-1", meta.bar)}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{line.operadora}</p>
        {line.disclaimer ? (
          <p className="mt-0.5 truncate text-xs text-ink-faint">
            {line.disclaimer}
          </p>
        ) : null}
      </div>
      <span className="tabular shrink-0 text-sm text-ink-soft">
        {line.numero}
      </span>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 text-xs font-medium",
          meta.text,
        )}
      >
        <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
        <span className="hidden sm:inline">{meta.label}</span>
      </span>
    </div>
  );
}
