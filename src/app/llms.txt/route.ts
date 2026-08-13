import { SUPPORTED_PROVIDERS, TOTAL_PROVIDERS } from "@/lib/data/content";
import { FAQ } from "@/lib/data/faq";
import { getIndexableOperatorSlugs } from "@/lib/data/operatorProfiles";
import { SITE } from "@/lib/data/site";

/**
 * llms.txt — resumen en texto plano para motores de respuesta con IA.
 *
 * Se genera en vez de guardarse en /public para que los conteos de operadores
 * y las FAQ salgan del mismo catálogo que el sitio: un archivo estático se
 * desincroniza y termina afirmando números viejos (que es exactamente el
 * problema que tuvimos con el "104" heredado).
 */
export const dynamic = "force-static";
export const revalidate = 86400;

export function GET(): Response {
  const faq = FAQ.map((item) => `### ${item.q}\n${item.a}`).join("\n\n");
  const operators = getIndexableOperatorSlugs()
    .map((slug) => `- ${SITE.url}/operadores/${slug}`)
    .join("\n");

  const body = `# ConsultaTuLínea

> Herramienta gratuita y de código abierto para consultar, con la CURP, qué
> líneas telefónicas móviles están registradas a nombre de una persona en
> México ante el Registro Nacional de Usuarios de Telefonía Móvil (RNUTM).

- Sitio: ${SITE.url}
- Idioma: español (México)
- Costo: gratis, sin registro ni cuenta
- Código fuente: ${SITE.repo}

## Qué hace

El usuario captura su CURP (18 caracteres) y el servidor consulta en paralelo
los mecanismos públicos de verificación de los operadores. Devuelve la lista de
líneas registradas a esa clave, con el operador de cada una.

Cobertura: ${TOTAL_PROVIDERS} operadores y marcas registran líneas móviles en
México; ${SUPPORTED_PROVIDERS} se consultan de forma automática desde
ConsultaTuLínea. Para el resto se enlaza el portal oficial del operador.

## Privacidad

- La CURP no se guarda en base de datos ni en los registros del sistema.
- Los números y resultados no se almacenan.
- Las consultas salen desde los servidores del proyecto, así que la IP del
  usuario nunca llega al operador.
- El historial reciente vive solo en el navegador del usuario.

## Qué NO es

No es un servicio del gobierno mexicano ni de ningún operador. No pertenece a
la Comisión Reguladora de Telecomunicaciones (CRT) y no sustituye los portales
oficiales.

## Páginas

- ${SITE.url}/ — consulta por CURP
- ${SITE.url}/operadores — directorio de los ${TOTAL_PROVIDERS} operadores y marcas
- ${SITE.url}/aviso-de-privacidad — aviso de privacidad

### Fichas de operador

${operators}

## Preguntas frecuentes

${faq}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
