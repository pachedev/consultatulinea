"use client";

import {
  AlertCircle,
  ArrowRight,
  ClipboardPaste,
  Loader2,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import { Turnstile, type TurnstileHandle } from "@/components/ui/Turnstile";
import { CURP_REGEX, getCurpValidationError, maskCurp } from "@/lib/curp";
import { TURNSTILE_ENABLED, TURNSTILE_SITE_KEY } from "@/lib/turnstile-client";
import { cn } from "@/lib/utils";

type Props = {
  curp: string;
  setCurp: (v: string) => void;
  loading: boolean;
  error: string | null;
  timedOut: boolean;
  history: string[];
  /** `turnstileToken` va vacío cuando el widget no está configurado. */
  onSubmit: (turnstileToken: string) => void;
  onRetry: () => void;
  onSelectHistory: (v: string) => void;
  onClearHistory: () => void;
};

export function CurpForm({
  curp,
  setCurp,
  loading,
  error,
  timedOut,
  history,
  onSubmit,
  onRetry,
  onSelectHistory,
  onClearHistory,
}: Props) {
  const validationError = getCurpValidationError(curp);
  const isValid = CURP_REGEX.test(curp);

  // La verificación se lanza al pulsar "Consultar", no al cargar la página
  // ni al volver a montarse el formulario: una sola por consulta.
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const busy = loading || verifying;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (busy || !isValid) return;
    setVerifyError(null);
    if (!TURNSTILE_ENABLED) {
      onSubmit("");
      return;
    }
    if (turnstileRef.current?.execute()) {
      setVerifying(true);
    } else {
      setVerifyError(
        "La verificación de seguridad aún está cargando. Intenta de nuevo en un momento.",
      );
    }
  };

  const handleToken = (token: string) => {
    // Solo si la pidió un envío: evita consultar por un token que llegue tarde.
    if (!verifying) return;
    setVerifying(false);
    onSubmit(token);
  };

  const handleVerifyFailure = () => {
    if (!verifying) return;
    setVerifying(false);
    setVerifyError(
      "No pudimos verificar que no eres un bot. Intenta de nuevo o recarga la página.",
    );
  };

  const counterColor =
    curp.length === 18
      ? isValid
        ? "text-confirmed"
        : "text-error"
      : "text-ink-faint";

  const sanitize = (v: string) =>
    v
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 18);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const clean = sanitize(text);
      if (clean) setCurp(clean);
    } catch {}
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="curp-input"
          className="mb-2 flex items-center justify-between text-xs font-medium tracking-wide text-ink-soft uppercase"
        >
          <span>Ingresa tu CURP para comenzar</span>
        </label>

        <div className="relative">
          <input
            id="curp-input"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="Ej. ABCD000000HDFXYZ01"
            maxLength={18}
            disabled={loading}
            value={curp}
            onChange={(e) => setCurp(sanitize(e.target.value))}
            aria-invalid={!!validationError}
            aria-describedby={validationError ? "curp-error" : undefined}
            className={cn(
              "tabular w-full rounded-lg border bg-surface py-3.5 pr-28 pl-4 text-base text-ink outline-none transition placeholder:text-ink-faint",
              "focus:ring-2 focus:ring-ink/10",
              validationError
                ? "border-error focus:border-error"
                : "border-line focus:border-line-strong",
            )}
          />
          <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1">
            <span className={cn("tabular text-xs font-medium", counterColor)}>
              {curp.length}/18
            </span>
            {curp.length > 0 && !loading ? (
              <button
                type="button"
                onClick={() => setCurp("")}
                aria-label="Limpiar CURP"
                className="inline-flex size-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            ) : null}
            <button
              type="button"
              onClick={handlePaste}
              aria-label="Pegar CURP desde el portapapeles"
              title="Pegar"
              className="inline-flex size-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <ClipboardPaste className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        {validationError ? (
          <p id="curp-error" className="mt-2 text-sm text-error" role="alert">
            {validationError}
          </p>
        ) : null}
      </div>

      {/* Nota de privacidad */}
      <div className="flex items-start gap-2.5 rounded-lg border border-confirmed/30 bg-confirmed-bg px-3.5 py-3 text-sm text-confirmed">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          Tu CURP viaja cifrada, <strong>no se guarda</strong> en ninguna base
          de datos y solo se usa para la consulta en tiempo real.
        </p>
      </div>

      <p className="text-sm text-ink-soft">
        ¿No recuerdas tu CURP?{" "}
        <a
          href="https://www.gob.mx/curp"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
        >
          Consúltala en gob.mx
        </a>
      </p>

      {history.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-ink-soft">
              Búsquedas recientes
            </p>
            <span className="text-[11px] text-ink-faint">
              Solo en tu navegador ·{" "}
              <button
                type="button"
                onClick={onClearHistory}
                className="underline underline-offset-2 hover:text-ink"
              >
                Borrar
              </button>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((h) => (
              <button
                key={h}
                type="button"
                disabled={loading}
                onClick={() => onSelectHistory(h)}
                aria-label={`Usar la CURP guardada que termina en ${h.slice(-2)}`}
                className="tabular rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:opacity-40"
              >
                {maskCurp(h)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {TURNSTILE_ENABLED ? (
        <Turnstile
          ref={turnstileRef}
          mode="on-demand"
          siteKey={TURNSTILE_SITE_KEY}
          action="lookup"
          onVerify={handleToken}
          onExpire={handleVerifyFailure}
          onError={handleVerifyFailure}
        />
      ) : null}

      <button
        type="submit"
        disabled={busy || !isValid}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-3.5 font-medium text-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {verifying ? "Verificando…" : "Escaneando…"}
          </>
        ) : (
          <>
            <Search className="size-4" aria-hidden />
            Realizar consulta
            <ArrowRight className="size-4" aria-hidden />
          </>
        )}
      </button>

      {TURNSTILE_ENABLED ? (
        <p className="text-center text-[11px] text-ink-faint">
          Protegido contra bots por Cloudflare Turnstile.{" "}
          <Link
            href="/aviso-de-privacidad#verificacion"
            className="underline underline-offset-2 hover:text-ink"
          >
            Privacidad
          </Link>
        </p>
      ) : null}

      {verifyError ? (
        <p
          className="rounded-lg border border-error/40 bg-error-bg px-3.5 py-3 text-sm text-error"
          role="alert"
        >
          {verifyError}
        </p>
      ) : null}

      {error || timedOut ? (
        <div
          className="flex gap-3 rounded-lg border border-error/40 bg-error-bg p-4 text-sm text-error"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="size-5 shrink-0" aria-hidden />
          <div>
            <p>
              {timedOut
                ? "La consulta tardó demasiado. Intenta de nuevo."
                : error}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 font-medium underline underline-offset-2"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
