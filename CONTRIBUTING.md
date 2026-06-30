# Contribuir a ConsultaTuLínea

¡Gracias por querer contribuir! Este proyecto vive gracias a la comunidad.

---

## Formas de contribuir

- Reportar errores o portales caídos
- Actualizar información de operadores
- Agregar nuevos adaptadores
- Mejorar la UI o accesibilidad
- Proponer correcciones o mejoras en las fichas técnicas

---

## Antes de abrir un PR

1. Abre un _issue_ primero para discutir el cambio (especialmente si es grande).
2. Un adaptador por PR.
3. Todo el código en TypeScript estricto.
4. Ejecuta `pnpm lint` y asegúrate de que no hay errores.

---

## Configurar el entorno

```bash
# Requiere Node.js ≥ 20 y pnpm
pnpm install
cp .env.example .env.local
pnpm dev          # → http://localhost:3000
```

---

## Cómo agregar un adaptador

Un adaptador es un archivo TypeScript en `src/lib/providers/` que consulta el
portal de verificación de un operador y devuelve un `LineResult`.

### 1. Crear el archivo

```
src/lib/providers/nombre-operador.ts
```

Para operadores con muchas OMVs bajo una misma red (ej. Altán), usa subcarpeta:

```
src/lib/providers/nombre-operador/
  mvno.ts      # lista de OMVs + función principal
  solver.ts    # lógica auxiliar si la hay
```

### 2. Implementar la función

Firma obligatoria:

```ts
export async function lookupCURPIn<NombreOperador>(
  curp: string,
): Promise<LineResult>
```

Usa `proxyFetch` (o `residentialFetch` si el portal lo requiere) del módulo
`@/lib/providers/_proxy`. **Nunca** uses `fetch` nativo directamente: el proxy
está configurado para evitar bloqueos y preservar la privacidad del usuario.

Ejemplo mínimo (adaptador simple):

```ts
import { BROWSER_HEADERS } from "@/lib/providers/_headers";
import { proxyFetch } from "@/lib/providers/_proxy";
import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

const TIMEOUT_MS = 12_000;

export async function lookupCURPInMiOperador(curp: string): Promise<LineResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await proxyFetch(`https://portal-operador.mx/api/consulta/${curp}`, {
      headers: { ...BROWSER_HEADERS, Accept: "application/json" },
      signal: controller.signal,
    });

    if (!res.ok) {
      return {
        company: "Mi Operador",
        lines: [],
        temporaryUnavailable: res.status === 403 || res.status === 429,
        error: ![403, 429].includes(res.status)
          ? "Error al consultar Mi Operador"
          : undefined,
      };
    }

    const data = await res.json() as { lineas?: string[] } | null;

    if (!data?.lineas?.length) {
      return { company: "Mi Operador", lines: [], isRegistered: false };
    }

    console.log("[mi-operador] registered:", JSON.stringify(stripCURPs(data), null, 2));
    return {
      company: "Mi Operador",
      lines: data.lineas,   // formato: "10DIGITNUM" o "Marca: 10DIGITNUM"
      isRegistered: true,
    };
  } catch (err) {
    console.error("[mi-operador]", (err as Error)?.name === "AbortError" ? "timeout" : err);
    return { company: "Mi Operador", lines: [], temporaryUnavailable: true };
  } finally {
    clearTimeout(timer);
  }
}
```

### 3. El tipo `LineResult`

```ts
type LineResult = {
  company: string;               // nombre del operador / red
  lines: string[];               // números confirmados: "10DIG" o "Marca: 10DIG"
  isRegistered?: boolean;        // true = hay registro pero el número no se devuelve
  possibleProviders?: string[];  // OMVs posibles sin confirmar
  possibleDisclaimer?: string;   // texto aclaratorio para los posibles
  notFoundProviders?: string[];  // OMVs sin registro bajo este operador
  error?: string;                // mensaje de error no recuperable
  temporaryUnavailable?: boolean; // 429/403/timeout — se muestra link al portal
  portalUrl?: string;            // URL portal oficial (se asigna automáticamente)
  rawApiResponse?: unknown;      // respuesta cruda para debugging
};
```

Reglas:
- `temporaryUnavailable: true` cuando el error es transitorio (rate-limit, timeout, 403).
- `error: "..."` cuando es un fallo permanente o inesperado.
- `lines` lleva números confirmados. Si el portal confirma registro pero no devuelve número, usa `isRegistered: true` con `lines: []`.
- Nunca loguees el CURP crudo: usa `stripCURPs(payload)`.

### 4. Registrar el adaptador

Agrega el export en `src/lib/providers/index.ts`:

```ts
export * from "./nombre-operador";
```

### 5. Registrar en la ruta de lookup

En `src/app/api/lookup/route.ts` (o el archivo que orquesta las consultas),
agrega tu función al array de providers que se ejecutan en paralelo con
`Promise.allSettled`.

### 6. (Opcional) Portal oficial

Si el operador requiere consulta manual con frecuencia (por recaptcha, login, etc.),
agrega la URL en `src/lib/providers/_portals.ts`:

```ts
export const PROVIDER_PORTALS: Record<string, string> = {
  // ...
  "Mi Operador": "https://portal-operador.mx/consulta/",
};
```

Esto hace que cuando `temporaryUnavailable: true`, el UI muestre automáticamente
el enlace al portal oficial.

### 7. Verificar antes del PR

```bash
pnpm lint          # sin errores
pnpm build         # build limpio
# Prueba manual: ingresa tu CURP en http://localhost:3000 y verifica que
# el nuevo operador aparece en los resultados (o "Temporalmente no disponible"
# si el portal no responde en tu entorno).
```

---

## Convenciones de código

- **TypeScript estricto.** Sin `any` explícito.
- **Biome** para lint y formato (`pnpm lint:fix`, `pnpm format`).
- Prefijo de log: `[nombre-operador]` en minúsculas con guiones.
- Timeout explícito en cada adaptador (entre 10 000 y 15 000 ms).
- Sin comentarios que expliquen _qué_ hace el código; solo _por qué_ cuando no es obvio.

---

## Estructura del proyecto

```
src/
  app/
    api/
      lookup/route.ts    # orquestador: ejecuta adaptadores en paralelo (Promise.allSettled)
    page.tsx             # home
    operadores/          # directorio y fichas técnicas
  components/
    home/                # UI del formulario y resultados
    operators/           # UI del directorio
    layout/              # header, footer
    ui/                  # componentes reutilizables
  lib/
    providers/           # adaptadores por operador ← aquí agregas el tuyo
    data/                # datos estáticos de operadores
    hooks/               # useCurpHistory, etc.
    api/                 # cliente HTTP hacia el backend
    curp.ts              # validación y sanitize de CURP
    lookup.ts            # transformación de respuestas → DisplayLine[]
    sanitize.ts          # stripCURPs (privacidad en logs)
    export.ts            # exportación de resultados
```

---

## Créditos y licencia

Este proyecto está licenciado bajo **GPL-2.0**, la misma licencia del proyecto
original **[MisLíneas](https://github.com/moraxh/MisLineas)** de
**[@moraxh](https://github.com/moraxh)**, del cual deriva y reutiliza
adaptadores y lógica de consulta.

Al contribuir, aceptas que tu aportación se distribuyó bajo esa misma licencia.

Texto completo en [LICENSE](LICENSE).
