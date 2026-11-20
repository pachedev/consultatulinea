// SOLO SERVIDOR: importa las listas de los providers, que usan node:crypto.
// No importar desde componentes cliente; pasar el resultado como dato.
import { ALTAN_MVNO_PROVIDERS } from "@/lib/providers/altanredes/mvno";
import { FREEDOMPOP_PROVIDERS } from "@/lib/providers/freedompop";
import { LOGISTICA_ACN_PROVIDERS } from "@/lib/providers/logisticaacn/mvno";

export type OperatorNetwork =
  | "Red Altán"
  | "Freedompop"
  | "Logística ACN"
  | "Consulta propia";

// Marcas que se consultan con su propio servicio (una petición por marca).
const OWN_LOOKUP = [
  "Telcel",
  "Viasat",
  "Weex",
  "Virgin Mobile",
  "Beneleit Móvil",
  "IENTC",
  "Mirlo",
  "MoBig",
  "Mega Móvil",
];

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const GROUPS: [OperatorNetwork, string[]][] = [
  ["Red Altán", ALTAN_MVNO_PROVIDERS],
  ["Freedompop", FREEDOMPOP_PROVIDERS],
  ["Logística ACN", LOGISTICA_ACN_PROVIDERS],
  ["Consulta propia", OWN_LOOKUP],
];

/** Red o servicio por el que se consulta una marca, si se consulta. */
export function getOperatorNetwork(name: string): OperatorNetwork | null {
  const n = norm(name);
  for (const [network, brands] of GROUPS) {
    if (brands.some((b) => norm(b) === n)) return network;
  }
  return null;
}
