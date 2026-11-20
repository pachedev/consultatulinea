const RAW_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/** Clave pública del widget. Vacía si no está configurada (o es el placeholder). */
export const TURNSTILE_SITE_KEY =
  RAW_SITE_KEY && RAW_SITE_KEY !== "change-me" ? RAW_SITE_KEY : "";

/**
 * Si es false no se pinta el widget ni se exige token en el cliente. El
 * servidor decide igual: fuera de `next dev`, sin configuración rechaza.
 */
export const TURNSTILE_ENABLED = TURNSTILE_SITE_KEY !== "";
