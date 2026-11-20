import { getOperatorDisplayStatus, OPERATORS } from "@/lib/data/operators";

// Se deriva del catálogo en vez de quemarse: el 104 venía heredado de upstream
// y quedó viejo cuando la lista creció, así que el home decía 104 mientras
// /operadores (que ya usaba operators.length) decía otra cosa.
export const TOTAL_PROVIDERS = OPERATORS.length;

// Marcas con consulta automática desde aquí. El resto solo tiene ficha con su
// portal oficial, así que el copy no debe prometer que escaneamos las 108.
export const SUPPORTED_PROVIDERS = OPERATORS.filter(
  (o) => getOperatorDisplayStatus(o) === "supported",
).length;

// Ley Federal de Protección de Datos Personales en Posesión de los
// Particulares, texto publicado por la Cámara de Diputados.
export const LFPDPPP_URL =
  "https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf";

// Proveedores que consulta /api/lookup. NO es lo mismo que TOTAL_PROVIDERS: una
// sola petición puede cubrir decenas de marcas (Red Altan cubre 89). Sirve para
// que la barra de progreso avance sobre algo real; antes dividía entre
// TOTAL_PROVIDERS y se congelaba al ~19%. Mantener sincronizado con el array
// `providers` de src/app/api/lookup/route.ts (hay un test que lo verifica).
export const ACTIVE_LOOKUP_PROVIDERS = 12;

export const QUERY_TIMEOUT_MS = 15000;

// Techo duro para una sola petición a un operador. Debe quedar por debajo del
// watchdog del cliente (QUERY_TIMEOUT_MS * 2 en useLookup): un operador colgado
// tiene que volver como una tarjeta fallida mientras el resto del stream sigue
// llegando, en lugar de sobrevivir al abort que mata la consulta completa.
// 12s es la convención ya usada por los providers que sí tenían timeout.
export const PROVIDER_TIMEOUT_MS = 12_000;
