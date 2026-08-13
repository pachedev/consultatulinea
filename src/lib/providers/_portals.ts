/**
 * Portales oficiales por provider. Cuando la consulta automática falla
 * (temporaryUnavailable), adjuntamos esta URL para que el usuario pueda
 * consultar manualmente en el sitio del operador.
 *
 * La clave debe coincidir con el `provider` declarado en la ruta de lookup.
 */
export const PROVIDER_PORTALS: Record<string, string> = {
  "AT&T": "https://www.att.com.mx/controlpersonal/",
  Telcel: "https://registro.telcel.com/vinculatulinea/",
  "Mega Móvil": "https://consultavinculacion.megamovil.mx/",
  Freedompop: "https://vinculatulinea.com/",
  // URLs verificadas contra el portal del CRT el 2026-08-13. Las anteriores
  // (miespacio.weex.mx, yomobile.mx) ya no tienen consulta de líneas.
  Weex: "https://weex.mx/consultalineas.html",
  "Yo Mobile": "https://mx.yomobile.com/consulta",
  "Virgin Mobile": "https://mi.virginmobile.mx/v1/consultatulinea",
};

export function getPortalUrl(provider: string): string | undefined {
  return PROVIDER_PORTALS[provider];
}
