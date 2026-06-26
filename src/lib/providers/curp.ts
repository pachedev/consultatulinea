import z from "zod";

const CURP_REGEX = /^[A-Z0-9]{4}\d{6}[A-Z0-9]{6}[A-Z0-9]\d$/;

export const curpSchema = z
  .string()
  .length(18, "La CURP debe tener 18 caracteres")
  .regex(CURP_REGEX, "Formato de CURP inválido");

export function validateCURP(curp: string): boolean {
  try {
    curpSchema.parse(curp);
    return true;
  } catch {
    return false;
  }
}
