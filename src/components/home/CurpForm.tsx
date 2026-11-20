"use client";

import {
  AlertCircle,
  ArrowUpRight,
  ClipboardPaste,
  Loader2,
  Lock,
  Search,
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

  const isComplete = curp.length === 18;
  const statusText = validationError
    ? validationError
    : isComplete && isValid
      ? "CURP completa."
      : curp.length > 0
        ? "Sigue escribiendo."
        : "Puedes pegarla completa.";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <label htmlFor="curp-input" className="font-semibold text-ink">
            Tu CURP
          </label>
          <a
            href="https://www.gob.mx/curp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium whitespace-nowrap text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
          >
            No la sé
            <ArrowUpRight className="size-3" aria-hidden />
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        </div>

        <div className="relative">
          <input
            id="curp-input"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="18 letras y números"
            maxLength={18}
            disabled={loading}
            value={curp}
            onChange={(e) => setCurp(sanitize(e.target.value))}
            aria-invalid={!!validationError}
            aria-describedby="curp-status"
            className={cn(
              "tabular h-14 w-full rounded-xl border bg-surface pr-24 pl-4 text-lg tracking-[0.06em] text-ink uppercase outline-none transition placeholder:font-sans placeholder:text-base placeholder:tracking-normal placeholder:normal-case placeholder:text-ink-faint",
              "focus:border-accent focus:ring-4 focus:ring-accent-soft",
              validationError
                ? "border-error focus:border-error focus:ring-error-bg"
                : isComplete && isValid
                  ? "border-confirmed"
                  : "border-line-strong",
            )}
          />
          <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center">
            {curp.length > 0 && !loading ? (
              <button
                type="button"
                onClick={() => setCurp("")}
                aria-label="Borrar CURP"
                className="inline-flex size-11 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <X className="size-[18px]" aria-hidden />
              </button>
            ) : null}
            <button
              type="button"
              onClick={handlePaste}
              aria-label="Pegar CURP desde el portapapeles"
              title="Pegar"
              className="inline-flex size-11 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <ClipboardPaste className="size-[18px]" aria-hidden />
            </button>
          </div>
        </div>

        <p
          id="curp-status"
          aria-live="polite"
          className="mt-2 flex justify-between gap-3 text-sm"
          role={validationError ? "alert" : undefined}
        >
          <span
            className={cn(
              validationError
                ? "text-error"
                : isComplete && isValid
                  ? "text-confirmed"
                  : "text-ink-faint",
            )}
          >
            {statusText}
          </span>
          <span className={cn("shrink-0 tabular-nums", counterColor)}>
            {curp.length}/18
          </span>
        </p>
      </div>

      {history.length > 0 ? (
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <p className="text-xs font-semibold text-ink-soft">
              Búsquedas recientes
            </p>
            <span className="text-[11px] text-ink-faint">
              Solo en tu navegador ·{" "}
              <button
                type="button"
                onClick={onClearHistory}
                className="font-medium underline underline-offset-2 hover:text-ink"
              >
                Borrar
              </button>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {history.map((h) => (
              <button
                key={h}
                type="button"
                disabled={loading}
                onClick={() => onSelectHistory(h)}
                aria-label={`Usar la CURP guardada que termina en ${h.slice(-2)}`}
                className="tabular min-h-9 rounded-lg border border-line bg-surface px-2.5 text-xs text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:opacity-40"
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
        className="btn-primary-glow inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-accent-ink transition hover:brightness-105 active:translate-y-px disabled:border disabled:border-line disabled:bg-surface-2 disabled:text-ink-faint"
      >
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {verifying ? "Verificando…" : "Consultando…"}
          </>
        ) : (
          <>
            <Search className="size-4" aria-hidden />
            Consultar mis líneas
          </>
        )}
      </button>

      {verifyError ? (
        <p
          className="rounded-xl bg-error-bg px-3.5 py-3 text-sm text-error"
          role="alert"
        >
          {verifyError}
        </p>
      ) : null}

      {error || timedOut ? (
        <div
          className="flex gap-3 rounded-xl bg-error-bg p-3.5 text-sm text-error"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="mt-0.5 size-[18px] shrink-0" aria-hidden />
          <div>
            <p>
              {timedOut
                ? "La consulta tardó demasiado. Intenta de nuevo."
                : error}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 font-semibold underline underline-offset-2"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : null}

      <p className="flex items-start gap-2 text-xs text-ink-faint">
        <Lock className="mt-px size-3.5 shrink-0" aria-hidden />
        <span>
          Consulta solo tu propia CURP. No la guardamos.{" "}
          {TURNSTILE_ENABLED ? "Protegido por Cloudflare Turnstile. " : ""}
          <Link
            href="/aviso-de-privacidad"
            className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
          >
            Aviso de privacidad
          </Link>
        </span>
      </p>
    </form>
  );
}
