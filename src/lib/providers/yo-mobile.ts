import type { LineResult } from "@/types";

export async function lookupCURPINYoMobile(_curp: string): Promise<LineResult> {
  return {
    company: "Yo Mobile",
    lines: [],
    error:
      "Yo Mobile no está disponible temporalmente debido a restricciones de seguridad en su sitio web.",
  };
}
