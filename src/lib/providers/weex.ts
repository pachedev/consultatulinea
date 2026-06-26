import type { LineResult } from "@/types";

export async function loookupCURPINWeeex(_curp: string): Promise<LineResult> {
  return {
    company: "Weex",
    lines: [],
    error:
      "Weex no está disponible temporalmente debido a múltiples fallos en su servidor.",
  };
}
