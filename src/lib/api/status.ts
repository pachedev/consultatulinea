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
    const res = await backendFetch("/status", { cache: "no-store" });
    if (!res.ok) return EMPTY;
    return (await res.json()) as SystemStatus;
  } catch {
    return EMPTY;
  }
}
