"use client";

import Script from "next/script";
import {
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          size?: "normal" | "flexible" | "compact";
          appearance?: "always" | "execute" | "interaction-only";
          execution?: "render" | "execute";
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          "timeout-callback"?: () => void;
        },
      ) => string;
      execute: (container: HTMLElement) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export type TurnstileStatus =
  | "loading"
  | "verifying"
  | "ready"
  | "expired"
  | "failed";

export type TurnstileHandle = {
  /**
   * Solo en modo "on-demand": lanza la verificación ahora. El token llega por
   * `onVerify`. Devuelve false si el widget todavía no está listo.
   */
  execute: () => boolean;
};

interface Props {
  ref?: Ref<TurnstileHandle>;
  /**
   * "auto" (por defecto) verifica en cuanto se monta. "on-demand" no hace
   * nada hasta que se llama a `execute()`: una verificación por acción, sin
   * retos de más cuando el formulario se vuelve a montar.
   */
  mode?: "auto" | "on-demand";
  siteKey: string;
  /** Debe coincidir con la acción que valida el servidor ("lookup", "report"). */
  action: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (msg: string) => void;
  onStatusChange?: (status: TurnstileStatus) => void;
  /** Cambiarlo pide un token nuevo (los tokens son de un solo uso). */
  resetKey?: number;
}

const ERROR_MESSAGE =
  "Error en la verificación anti-bot. Reintenta o recarga la página.";

/**
 * Widget de Cloudflare Turnstile.
 *
 * El script se carga aquí y no en el layout: así solo se descarga en las
 * pantallas que de verdad tienen un formulario protegido.
 */
export function Turnstile({
  ref,
  mode = "auto",
  siteKey,
  action,
  onVerify,
  onExpire,
  onError,
  onStatusChange,
  resetKey,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Callbacks en refs para que el efecto que monta el widget NO dependa de su
  // identidad. Si dependiera, cada render del padre (con callbacks inline)
  // re-montaría el widget en bucle y Cloudflare respondería 403.
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);
  const onStatusRef = useRef(onStatusChange);
  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;
  onErrorRef.current = onError;
  onStatusRef.current = onStatusChange;

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` recrea a propósito un widget que falló.
  useEffect(() => {
    const api = window.turnstile;
    if (!scriptReady || !containerRef.current || !api) return;

    const fail = () => {
      setFailed(true);
      onStatusRef.current?.("failed");
      onErrorRef.current?.(ERROR_MESSAGE);
    };

    if (mode === "auto") onStatusRef.current?.("verifying");
    let id: string;
    try {
      id = api.render(containerRef.current, {
        sitekey: siteKey,
        action,
        execution: mode === "on-demand" ? "execute" : "render",
        size: "flexible",
        // El widget solo se pinta si Cloudflare necesita que la persona haga
        // algo. En el caso normal la verificación ocurre sin mostrar nada.
        appearance: "interaction-only",
        theme: "auto",
        callback: (token) => {
          setFailed(false);
          onVerifyRef.current(token);
          onStatusRef.current?.("ready");
        },
        "expired-callback": () => {
          onExpireRef.current?.();
          onStatusRef.current?.("expired");
        },
        "timeout-callback": fail,
        "error-callback": fail,
      });
    } catch {
      fail();
      return;
    }
    widgetIdRef.current = id;

    return () => {
      widgetIdRef.current = null;
      api.remove(id);
    };
  }, [scriptReady, siteKey, action, attempt, mode]);

  useImperativeHandle(ref, () => ({
    execute: () => {
      const api = window.turnstile;
      const id = widgetIdRef.current;
      if (!api || !id || !containerRef.current) return false;
      onStatusRef.current?.("verifying");
      // reset deja el widget limpio por si ya entregó un token antes (son de
      // un solo uso); execute corre el reto.
      api.reset(id);
      api.execute(containerRef.current);
      return true;
    },
  }));

  useEffect(() => {
    if (resetKey === undefined || resetKey === 0) return;
    if (widgetIdRef.current && window.turnstile) {
      onStatusRef.current?.("verifying");
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetKey]);

  return (
    <div className="space-y-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setScriptReady(true)}
        onError={() => {
          setFailed(true);
          onStatusRef.current?.("failed");
          onErrorRef.current?.(ERROR_MESSAGE);
        }}
      />
      <div ref={containerRef} />
      {failed ? (
        <p role="alert" className="text-sm text-error">
          No se pudo completar la verificación.{" "}
          <button
            type="button"
            className="font-medium underline underline-offset-2"
            onClick={() => {
              if (!window.turnstile) {
                window.location.reload();
                return;
              }
              setFailed(false);
              onStatusRef.current?.("loading");
              setAttempt((value) => value + 1);
            }}
          >
            Reintentar verificación
          </button>
        </p>
      ) : null}
    </div>
  );
}
