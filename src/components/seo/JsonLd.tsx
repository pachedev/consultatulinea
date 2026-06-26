/** Inyecta structured data (JSON-LD) como <script>. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requiere inyección directa
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
