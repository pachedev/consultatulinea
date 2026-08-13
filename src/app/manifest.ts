import type { MetadataRoute } from "next";
import { SITE } from "@/lib/data/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Líneas registradas a tu nombre en México`,
    short_name: SITE.name,
    description:
      "Consulta con tu CURP qué líneas telefónicas móviles están registradas a tu nombre en México.",
    start_url: "/",
    display: "standalone",
    lang: "es-MX",
    background_color: "#00132b",
    theme_color: "#00132b",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
