"use client";

import { useEffect, useRef, useState } from "react";
import type { UsageStats } from "@/lib/api/stats";

const DURATION_MS = 1400;
const formatter = new Intl.NumberFormat("es-MX");

// easeOutCubic: arranca rápido y frena al final, para que el número no parezca
// un contador de gasolinera.
const easeOut = (t: number) => 1 - (1 - t) ** 3;

function useCountUp(target: number): number {
  const [value, setValue] = useState(target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || target <= 0) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION_MS);
      setValue(Math.round(target * easeOut(progress)));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    setValue(0);
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target]);

  return value;
}

type State =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "ready"; stats: UsageStats };

/**
 * Contador de consultas del home.
 *
 * Pide el número desde el cliente en vez de recibirlo por props: el home se
 * prerenderiza durante el build (donde el backend no existe), así que un dato
 * resuelto en el servidor se quedaría vacío u obsoleto en el HTML cacheado.
 *
 * Nunca muestra un cero, un esqueleto ni un valor inventado. Si el backend no
 * responde no se renderiza nada: la consulta de líneas no depende de él.
 */
export function UsageCounter() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/stats", { signal: controller.signal, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: (UsageStats & { available?: boolean }) | null) => {
        if (data?.available && typeof data.consultas === "number") {
          setState({ status: "ready", stats: data });
        } else {
          setState({ status: "unavailable" });
        }
      })
      .catch((err: unknown) => {
        if ((err as Error)?.name === "AbortError") return;
        setState({ status: "unavailable" });
      });
    return () => controller.abort();
  }, []);

  // Cifra principal: consultas a operadores, histórico incluido. Es la misma
  // magnitud que el contador mostró siempre (cada búsqueda suma una por
  // operador consultado), así que el número no da un salto hacia abajo. Las
  // filas anteriores al registro desde el servidor entran con su valor
  // original; ver `verificaciones_operadores` en el backend.
  const total =
    state.status === "ready" ? state.stats.verificacionesOperadores : 0;
  const value = useCountUp(total);

  // El contador es un adorno independiente de la consulta: si el backend no
  // existe o falla, simplemente no se muestra. Ni mensaje ni hueco.
  if (state.status !== "ready") return null;

  // Sin consultas todavía: mejor nada que un "0 consultas".
  if (total <= 0) return null;

  return (
    <div className="relative mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
      <p className="tabular text-xs tracking-[0.18em] text-ink-faint uppercase">
        <span className="font-medium text-ink-soft">
          {formatter.format(value)}
        </span>{" "}
        consultas a operadores
      </p>
      <CounterInfo />
    </div>
  );
}

/** Explicación corta del contador, en un popover que no ocupa espacio. */
function CounterInfo() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="contador-info"
        aria-label="Qué significa este número"
        className="inline-flex size-5 items-center justify-center rounded-full border border-line-strong text-[11px] font-medium text-ink-faint transition-colors hover:border-ink hover:text-ink"
      >
        ?
      </button>
      {open ? (
        <span
          id="contador-info"
          className="absolute top-full left-0 z-20 mt-2 block w-64 rounded-lg border border-line bg-surface p-3 text-xs leading-relaxed text-ink-soft shadow-lg"
        >
          Cada búsqueda consulta a varios operadores a la vez. Este número suma
          todas esas consultas. Solo contamos; no guardamos tu CURP ni tus
          números.
        </span>
      ) : null}
    </span>
  );
}
