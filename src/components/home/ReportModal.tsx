"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Turnstile } from "@/components/ui/Turnstile";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type Kind =
  | "app_problem"
  | "operator_change"
  | "outdated_adapter"
  | "wrong_info"
  | "new_operator"
  | "other";

const KIND_LABELS: Record<Kind, string> = {
  app_problem: "Problema con la aplicación",
  operator_change: "Cambio de operador",
  outdated_adapter: "Consulta desactualizada",
  wrong_info: "Información incorrecta",
  new_operator: "Operador faltante",
  other: "Otro",
};

interface Props {
  open: boolean;
  onClose: () => void;
  operator?: string;
}

type State = "idle" | "loading" | "success" | "error";

export function ReportModal({ open, onClose, operator }: Props) {
  const [kind, setKind] = useState<Kind>("other");
  const [operatorVal, setOperatorVal] = useState(operator ?? "");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [token, setToken] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    setKind("other");
    setOperatorVal(operator ?? "");
    setMessage("");
    setContact("");
    setToken("");
    setState("idle");
    setErrorMsg("");
  }, [open, operator]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      setErrorMsg("El mensaje debe tener al menos 5 caracteres.");
      return;
    }
    if (contact.trim() && !/^[^@\s]{1,64}@[^@\s]+\.[^@\s]{2,}$/.test(contact.trim())) {
      setErrorMsg("Formato de correo electrónico inválido.");
      return;
    }
    if (SITE_KEY && !token) {
      setErrorMsg("Completa la verificación anti-bot.");
      return;
    }
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          operator: operatorVal.trim() || null,
          message: message.trim(),
          contact: contact.trim() || null,
          turnstile_token: token,
        }),
      });
      if (res.status === 201) {
        setState("success");
        closeTimerRef.current = setTimeout(onClose, 2500);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { detail?: string }).detail ?? `Error ${res.status}`,
        );
      }
    } catch (err) {
      setState("error");
      setErrorMsg(
        err instanceof Error ? err.message : "No se pudo enviar el reporte.",
      );
      setToken("");
      setResetKey((k) => k + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold text-ink">Enviar reporte</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 text-ink-faint transition-colors hover:bg-surface hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        {state === "success" ? (
          <div className="px-5 py-8 text-center">
            <p className="text-lg font-semibold text-confirmed">
              ¡Reporte enviado!
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Gracias por contribuir al proyecto.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-5 py-5">
            <div>
              <label
                htmlFor="report-kind"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Tipo de reporte
              </label>
              <select
                id="report-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as Kind)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-line-strong focus:ring-2 focus:ring-ink/10"
              >
                {(Object.keys(KIND_LABELS) as Kind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="report-operator"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Operador{" "}
                <span className="font-normal text-ink-faint">(opcional)</span>
              </label>
              <input
                id="report-operator"
                type="text"
                value={operatorVal}
                onChange={(e) => setOperatorVal(e.target.value)}
                placeholder="Ej. Telcel, AT&T, Altán…"
                maxLength={120}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-line-strong focus:ring-2 focus:ring-ink/10"
              />
            </div>

            <div>
              <label
                htmlFor="report-message"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Descripción{" "}
                <span className="font-normal text-ink-faint">(requerida)</span>
              </label>
              <textarea
                id="report-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe el problema con el mayor detalle posible…"
                rows={4}
                minLength={5}
                maxLength={2000}
                required
                className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-line-strong focus:ring-2 focus:ring-ink/10"
              />
              <p className="mt-0.5 text-right text-xs text-ink-faint tabular-nums">
                {message.length}/2000
              </p>
            </div>

            <div>
              <label
                htmlFor="report-contact"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Contacto{" "}
                <span className="font-normal text-ink-faint">(opcional)</span>
              </label>
              <input
                id="report-contact"
                type="email"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="correo@ejemplo.com"
                maxLength={255}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-line-strong focus:ring-2 focus:ring-ink/10"
              />
            </div>

            {SITE_KEY ? (
              <Turnstile
                siteKey={SITE_KEY}
                onVerify={setToken}
                onExpire={() => setToken("")}
                onError={(msg) => { setToken(""); setErrorMsg(msg); }}
                resetKey={resetKey}
              />
            ) : null}

            {errorMsg ? (
              <p className="rounded-lg border border-error/30 bg-error-bg px-3 py-2 text-sm text-error">
                {errorMsg}
              </p>
            ) : null}

            <div className="flex justify-end gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={state === "loading"}
                className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/80 disabled:opacity-50"
              >
                {state === "loading" ? "Enviando…" : "Enviar reporte"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
