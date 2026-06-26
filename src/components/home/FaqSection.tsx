import { Plus } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { FAQ } from "@/lib/data/faq";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export function FaqSection() {
  return (
    <section>
      <JsonLd data={faqJsonLd} />
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:py-20">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Preguntas frecuentes
        </h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                {item.q}
                <Plus
                  className="size-4 shrink-0 text-ink-faint transition-transform group-open:rotate-45"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 text-pretty text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
