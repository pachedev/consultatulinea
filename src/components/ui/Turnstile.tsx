"use client";

import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface Props {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (msg: string) => void;
  resetKey?: number;
}

export function Turnstile({ siteKey, onVerify, onExpire, onError, resetKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Guardamos los callbacks en refs para que `mount` NO dependa de su identidad.
  // Si dependiera, cada render del padre (con callbacks inline) re-montaría el
  // widget en bucle, disparando 403 por rate limit de Cloudflare.
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);
  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;
  onErrorRef.current = onError;

  const mount = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;
    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "auto",
      callback: (token) => onVerifyRef.current(token),
      "expired-callback": () => onExpireRef.current?.(),
      "error-callback": () =>
        onErrorRef.current?.("Error en la verificación anti-bot. Recarga la página e intenta de nuevo."),
    });
  }, [siteKey]);

  useEffect(() => {
    if (window.turnstile) {
      mount();
    } else {
      const id = setInterval(() => {
        if (window.turnstile) {
          clearInterval(id);
          mount();
        }
      }, 100);
      return () => clearInterval(id);
    }
  }, [mount]);

  useEffect(() => {
    if (resetKey !== undefined && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetKey]);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);

  return <div ref={containerRef} />;
}
