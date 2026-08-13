import { backendFetch } from "./backend";

export type OperatorState = "available" | "unavailable" | "paused";

export interface OperatorStatusOverride {
  operator_name: string;
  state: OperatorState;
  note: string | null;
}

export interface SystemStatus {
  system: string;
  operators: OperatorStatusOverride[];
}

const EMPTY: SystemStatus = { system: "ok", operators: [] };

export async function fetchStatus(): Promise<SystemStatus> {
  try {
    // Igual que /news: `no-store` volvía dinámicas las 108 fichas de operador.
    // 60s de desfase en un chip de estado no justifica perder el prerender.
    const res = await backendFetch("/status", { next: { revalidate: 60 } });
    if (!res.ok) return EMPTY;
    return (await res.json()) as SystemStatus;
  } catch {
    return EMPTY;
  }
}
