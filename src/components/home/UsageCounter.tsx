"use client";

import { useEffect, useRef, useState } from "react";

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

/**
 * Contador de consultas del home.
 *
 * Pide el número desde el cliente en vez de recibirlo por props: el home se
 * prerenderiza durante el build (donde el backend no existe), así que un dato
 * resuelto en el servidor se quedaría vacío u obsoleto en el HTML cacheado.
 *
 * Mientras no haya dato no se renderiza nada: nunca un cero, un esqueleto ni un
 * valor inventado.
 */
export function UsageCounter() {
  const [totalLookups, setTotalLookups] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/stats", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { total_lookups?: number } | null) => {
        if (typeof data?.total_lookups === "number" && data.total_lookups > 0) {
          setTotalLookups(data.total_lookups);
        }
      })
      .catch(() => {
        // Backend caído: el contador simplemente no aparece.
      });
    return () => controller.abort();
  }, []);

  const value = useCountUp(totalLookups ?? 0);

  if (totalLookups === null) return null;

  return (
    <p className="tabular mt-3 text-xs tracking-[0.18em] text-ink-faint uppercase">
      <span className="font-medium text-ink-soft">
        {formatter.format(value)}
      </span>{" "}
      consultas realizadas
    </p>
  );
}
