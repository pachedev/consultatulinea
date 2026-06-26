import {
  AlertTriangle,
  CircleHelp,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DisplayLine } from "@/types";

type Variant = {
  icon: typeof Phone;
  badge: string;
  badgeText: string;
  ring: string;
};

function variantFor(line: DisplayLine): Variant {
  if (line.isError)
    return {
      icon: XCircle,
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      badgeText: "Error",
      ring: "border-rose-200",
    };
  if (line.isUnavailable)
    return {
      icon: AlertTriangle,
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      badgeText: "No disponible",
      ring: "border-amber-200",
    };
  if (line.isNotFound)
    return {
      icon: ShieldCheck,
      badge: "bg-slate-50 text-slate-600 border-slate-200",
      badgeText: "Sin registro",
      ring: "border-slate-200",
    };
  if (line.isPossible)
    return {
      icon: CircleHelp,
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      badgeText: "Posible",
      ring: "border-amber-200",
    };
  return {
    icon: Phone,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeText: "Confirmada",
    ring: "border-emerald-200",
  };
}

export function LineCard({ line }: { line: DisplayLine }) {
  const v = variantFor(line);
  const Icon = v.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm",
        v.ring,
      )}
    >
      <Icon className="size-5 shrink-0 text-slate-500" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{line.operadora}</p>
        <p className="truncate text-sm text-slate-600">{line.numero}</p>
        {line.disclaimer ? (
          <p className="mt-1 text-xs text-slate-400">{line.disclaimer}</p>
        ) : null}
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
          v.badge,
        )}
      >
        {v.badgeText}
      </span>
    </div>
  );
}
