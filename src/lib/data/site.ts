/** Configuración pública del sitio: identidad y enlaces externos. */
export const SITE = {
  name: "ConsultaTuLínea",
  url: "https://consultatulinea.mx",
  /** Sitio del autor. Se usa como entidad Person en el JSON-LD y en `authors`. */
  author: "https://pachedev.com",
  repo: "https://github.com/pachedev/consultatulinea",
  donate: "https://buymeacoffee.com/pachedev",
  // Reporte oficial de fallas/fraude ante la CRT.
  reportFraud: "https://portal.crt.gob.mx/reporte-fallas-plataforma-registro",
  // Proyecto que inspira esta iniciativa (crédito).
  inspiration: "https://github.com/moraxh/MisLineas",
} as const;
