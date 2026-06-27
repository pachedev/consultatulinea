"use client";

import { useState } from "react";
import { ReportModal } from "@/components/home/ReportModal";

export function ReportButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hover:text-ink text-left"
      >
        Reportar un problema
      </button>
      <ReportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
