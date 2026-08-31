import {
  Building2,
  Eye,
  type LucideIcon,
  Scale,
  Signal,
  Wifi,
  Zap,
} from "lucide-react";
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

export const KNOWN_PROVIDERS: { name: string; icon: LucideIcon }[] = [
  { name: "Telcel", icon: Signal },
  { name: "AT&T", icon: Wifi },
  { name: `+${TOTAL_PROVIDERS - 3} MVNOs (Red Altán)`, icon: Building2 },
];

export const WHY_CARDS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Zap,
    title: "Un solo lugar",
    body: `Antes tenías que buscar en ${TOTAL_PROVIDERS} sitios web diferentes. Hoy solo necesitas ingresar tu CURP aquí.`,
  },
  {
    icon: Scale,
    title: "Protección Federal",
    body: "Procesos bajo la Ley Federal de Telecomunicaciones. Orquestación efímera y segura.",
  },
  {
    icon: Eye,
    title: "Transparencia Total",
    body: "No somos una operadora ni vendemos planes. Solo devolvemos la información a su dueño: el ciudadano.",
  },
];

export const SECURITY_BULLETS = [
  "Conexiones cifradas en tránsito (TLS/HTTPS).",
  "Tu CURP no se guarda en base de datos ni en registros del sistema.",
  "No almacenamos tus números ni los resultados de la consulta.",
  "Las consultas salen desde nuestros servidores: tu IP nunca llega al operador.",
  "Tu historial reciente vive solo en tu navegador.",
  "Proyecto open source y auditable.",
];

export const ARCO_RIGHTS = [
  { t: "Acceso", d: "Conoce qué datos tienen de ti" },
  { t: "Rectificación", d: "Corrige lo inexacto" },
  { t: "Cancelación", d: "Elimina tus datos" },
  { t: "Oposición", d: "Niégate al uso" },
];

// Proveedores que consulta /api/lookup. NO es lo mismo que TOTAL_PROVIDERS: una
// sola petición puede cubrir decenas de marcas (Red Altan cubre 65). Sirve para
// que la barra de progreso avance sobre algo real; antes dividía entre
// TOTAL_PROVIDERS y se congelaba al ~19%. Mantener sincronizado con el array
// `providers` de src/app/api/lookup/route.ts (hay un test que lo verifica).
export const ACTIVE_LOOKUP_PROVIDERS = 13;

export const QUERY_TIMEOUT_MS = 15000;

// Techo duro para una sola petición a un operador. Debe quedar por debajo del
// watchdog del cliente (QUERY_TIMEOUT_MS * 2 en useLookup): un operador colgado
// tiene que volver como una tarjeta fallida mientras el resto del stream sigue
// llegando, en lugar de sobrevivir al abort que mata la consulta completa.
// 12s es la convención ya usada por los providers que sí tenían timeout.
export const PROVIDER_TIMEOUT_MS = 12_000;
