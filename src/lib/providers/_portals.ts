import { CONSULTA_URLS } from "@/lib/data/consultaUrls";

/**
 * Portales oficiales por provider. Cuando la consulta automática falla
 * (temporaryUnavailable), adjuntamos esta URL para que el usuario pueda
 * consultar manualmente en el sitio del operador.
 *
 * La clave debe coincidir con el `provider` declarado en la ruta de lookup.
 * Los valores salen de CONSULTA_URLS (keyed por marca) para no mantener dos
 * listas de URLs que se desincronizan.
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
  Viasat: "https://viasatprepago.com.mx/vinculatulinea/",
  // Reactivados vía proxy residencial (2026-08-31). Si el proxy no alcanza a
  // pasar, el provider devuelve temporaryUnavailable y la tarjeta enlaza aquí.
  Sorcel: CONSULTA_URLS.Sorcel,
  "Nextor Movil": CONSULTA_URLS["Nextor Movil"],
  // Una sola consulta cubre las tres marcas; enlazamos la de Newww, que es la
  // que responde el endpoint.
  "TalentoNet (Newww, Red Aguila, Link Móvil)": CONSULTA_URLS.Newww,
};

export function getPortalUrl(provider: string): string | undefined {
  return PROVIDER_PORTALS[provider];
}
