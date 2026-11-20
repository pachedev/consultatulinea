"use client";

import { type ReactNode, useState } from "react";
import { ReportModal } from "@/components/home/ReportModal";

/** Abre el formulario de reporte propio (incidentes del sitio, al backend). */
export function ReportButton({
  className = "hover:text-ink text-left",
  children = "Reportar un problema",
}: {
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <ReportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
