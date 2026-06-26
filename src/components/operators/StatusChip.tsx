import type { OperatorDisplayStatus } from "@/lib/data/operators";
import { cn } from "@/lib/utils";

const META: Record<
  OperatorDisplayStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  supported: {
    label: "Consulta directa",
    dot: "bg-confirmed",
    text: "text-confirmed",
    bg: "bg-confirmed-bg",
  },
  unsupported: {
    label: "Solo portal oficial",
    dot: "bg-error",
    text: "text-error",
    bg: "bg-error-bg",
  },
  pending: {
    label: "Pendiente",
    dot: "bg-possible",
    text: "text-possible",
    bg: "bg-possible-bg",
  },
};

export function StatusChip({
  status,
  className,
}: {
  status: OperatorDisplayStatus;
  className?: string;
}) {
  const meta = META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        meta.bg,
        meta.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}
