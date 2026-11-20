export const CURP_REGEX = /^[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d$/;

export function getCurpValidationError(curp: string): string | null {
  if (curp.length === 0) return null;
  if (curp.length < 18) return null;
  if (!/^[A-Z]{4}/.test(curp))
    return "Los primeros 4 caracteres deben ser letras.";
  if (!/^[A-Z]{4}\d{6}/.test(curp))
    return "Los caracteres 5–10 deben ser la fecha de nacimiento (AAMMDD).";
  if (!/^[A-Z]{4}\d{6}[HMX]/.test(curp))
    return "El carácter 11 debe ser H (hombre), M (mujer) o X.";
  if (!CURP_REGEX.test(curp))
    return "Formato de CURP inválido. Verifica que los 18 caracteres sean correctos.";
  return null;
}

/**
 * CURP para mostrar en pantalla sin exponerla completa: primeras 4 letras y
 * los 2 últimos caracteres (`PABG••••••••••••00`). Alcanza para que su dueño
 * la reconozca y no para que alguien que mira la pantalla la copie.
 */
export function maskCurp(curp: string): string {
  if (curp.length <= 6) return "•".repeat(curp.length);
  return `${curp.slice(0, 4)}${"•".repeat(curp.length - 6)}${curp.slice(-2)}`;
}
