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

type Props = {
  /** Consultas a operadores acumuladas (dato real del API). */
  totalLookups: number;
};

/**
 * Contador de consultas del home. Solo se monta si el API devolvió datos: la
 * decisión de ocultarlo vive en el componente padre, aquí asumimos un número
 * válido. Nunca muestra un valor inventado ni un placeholder.
 */
export function UsageCounter({ totalLookups }: Props) {
  const value = useCountUp(totalLookups);

  return (
    <p className="tabular mt-3 text-xs tracking-[0.18em] text-ink-faint uppercase">
      <span className="font-medium text-ink-soft">
        {formatter.format(value)}
      </span>{" "}
      consultas realizadas
    </p>
  );
}
