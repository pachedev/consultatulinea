import { getConsultaUrl } from "@/lib/data/consultaUrls";
import {
  getOperatorDisplayStatus,
  OPERATORS,
  type OperatorDisplayStatus,
  type OperatorEntry,
} from "@/lib/data/operators";
import { getProviderWebsite } from "@/lib/data/providerWebsites";

export type OperatorView = {
  name: string;
  slug: string;
  status: OperatorDisplayStatus;
  reason?: string;
  website: string | null;
  /** URL oficial directa para consultar el estatus de líneas. */
  consultaUrl: string | null;
};

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toView(o: OperatorEntry): OperatorView {
  return {
    name: o.name,
    slug: slugify(o.name),
    status: getOperatorDisplayStatus(o),
    reason: o.reason,
    website: getProviderWebsite(o.name),
    consultaUrl: getConsultaUrl(o.name),
  };
}

export function getAllOperatorViews(): OperatorView[] {
  return OPERATORS.map(toView).sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );
}

export function getOperatorSlugs(): string[] {
  return OPERATORS.map((o) => slugify(o.name));
}

export function getOperatorBySlug(slug: string): OperatorView | null {
  const found = OPERATORS.find((o) => slugify(o.name) === slug);
  return found ? toView(found) : null;
}
