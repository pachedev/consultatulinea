/**
 * Contenido del aviso de privacidad.
 *
 * Vive en datos y no en JSX para que cada cambio quede en git con su fecha.
 * REGLA: este texto describe lo que el sistema HACE. Si cambia el código
 * (qué se guarda, a quién se envía, cuánto dura), cambia este archivo en el
 * mismo commit y actualiza `lastUpdated`. El historial de cambios es el del
 * repositorio público.
 */

/** Marcador de datos que faltan por definir antes de publicar. */
export const PENDING = "[PENDIENTE]";

export const PRIVACY_META = {
  /** true mientras queden marcadores PENDIENTE o falte la revisión legal. */
  draft: false,
  lastUpdated: "20 de noviembre de 2026",
  lastUpdatedIso: "2026-11-20",
  responsible: "el autor del proyecto (Pachedev)",
  contact: "contacto@pachedev.com",
  reportRetention: "90 días",
  hosting: "Oracle Cloud",
} as const;

export type DataRow = {
  dato: string;
  finalidad: string;
  donde: string;
  retencion: string;
};

/** Tabla "qué tratamos": una fila por dato, sin eufemismos. */
export const DATA_ROWS: DataRow[] = [
  {
    dato: "CURP que escribes",
    finalidad: "Consultar las líneas registradas ante cada operador",
    donde:
      "Memoria del servidor durante la consulta; se envía a los operadores",
    retencion: "No se guarda. Termina al acabar la consulta",
  },
  {
    dato: "Resultado de la consulta (operador y últimos 4 dígitos)",
    finalidad: "No repetir la misma consulta ante los operadores",
    donde:
      "Memoria volátil del servidor, bajo una huella irreversible (SHA-256) de la CURP",
    retencion: "Hasta 10 minutos; se pierde al reiniciar",
  },
  {
    dato: "Dirección IP",
    finalidad: "Limitar el número de consultas y reportes por minuto",
    donde: "Memoria volátil del servidor",
    retencion: "1 minuto",
  },
  {
    dato: "Conteos anónimos de cada consulta",
    finalidad: "Estadísticas de uso y contador público",
    donde: "Base de datos del proyecto",
    retencion: "Indefinida. No contienen CURP, IP ni números",
  },
  {
    dato: "Reporte que envías (tipo, operador, mensaje, correo opcional, navegador)",
    finalidad: "Atender el problema que reportas",
    donde: "Base de datos del proyecto",
    retencion: PRIVACY_META.reportRetention,
  },
  {
    dato: "Archivo que exportas (CURP y resultado)",
    finalidad:
      "Firmar el archivo para que se pueda comprobar que no fue alterado",
    donde: "Memoria del servidor mientras se calcula la firma",
    retencion: "No se guarda",
  },
  {
    dato: "Historial reciente de CURP y preferencia de tema",
    finalidad: "Comodidad al volver a consultar",
    donde: "Solo en tu navegador (localStorage)",
    retencion: "Hasta que lo borres",
  },
];

export type PrivacySection = {
  id: string;
  title: string;
  body: string[];
  bullets?: string[];
  /** Muestra la tabla DATA_ROWS después del texto. */
  table?: boolean;
  links?: { label: string; href: string }[];
};

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: "responsable",
    title: "Responsable del tratamiento de datos",
    body: [
      "ConsultaTuLínea es una plataforma ciudadana independiente, de código abierto y sin fines de lucro, disponible en consultatulinea.mx. El responsable del tratamiento de los datos es el autor del proyecto (disponible en github.com/pachedev/consultatulinea).",
      `Contacto para asuntos de privacidad: ${PRIVACY_META.contact}.`,
      "No pertenece a la Comisión Reguladora de Telecomunicaciones (CRT) ni a ningún operador, y no sustituye los portales oficiales de consulta o registro.",
    ],
    links: [
      {
        label: "Repositorio del proyecto",
        href: "https://github.com/pachedev/consultatulinea",
      },
    ],
  },
  {
    id: "datos",
    title: "Qué datos tratamos",
    body: [
      "Esta tabla lista todo lo que el sistema toca, para qué, dónde vive y cuánto tiempo.",
    ],
    table: true,
  },
  {
    id: "no-guardamos",
    title: "Qué no guardamos",
    body: [
      "No existe en el proyecto ninguna base de datos con CURP, nombres, números telefónicos ni resultados de consultas.",
    ],
    bullets: [
      "Tu CURP no se escribe en base de datos ni en los registros del sistema.",
      "De las respuestas de los operadores solo conservamos el nombre del operador y los últimos 4 dígitos de cada línea. El resto (nombre del titular, fecha de nacimiento, número completo) se descarta en el servidor y nunca llega a tu navegador.",
      "Los registros técnicos anotan qué operador falló y por qué, no el contenido de su respuesta.",
    ],
  },
  {
    id: "terceros",
    title: "Con quién se comparte",
    body: [
      "Para darte el resultado, tu CURP tiene que llegar a los operadores. Es la única transferencia de ese dato y ocurre en el momento, cifrada (TLS).",
    ],
    bullets: [
      "Operadores de telefonía: reciben tu CURP en sus mecanismos públicos de verificación. No reciben tu dirección IP.",
      "Servicios de proxy, incluidos proxies residenciales y la red Tor: varios operadores bloquean el tráfico de centros de datos, así que parte de las consultas sale a través de ellos. El proxy transporta la conexión cifrada hacia el operador y no recibe tu IP.",
      "Cloudflare (Turnstile): ver la sección siguiente.",
      `Proveedor de alojamiento: ${PRIVACY_META.hosting}. El sitio y su servidor corren en una instancia de cómputo propia del proyecto; las consultas se procesan ahí y no se guardan.`,
    ],
  },
  {
    id: "verificacion",
    title: "Verificación anti-bots (Cloudflare Turnstile)",
    body: [
      "Antes de consultar y antes de enviar un reporte verificamos que no seas un programa automatizado con Cloudflare Turnstile. El widget se carga solo en las pantallas que tienen esos formularios.",
      "Turnstile se ejecuta en tu navegador y Cloudflare recibe directamente tu dirección IP y señales técnicas del navegador para decidir. Nuestro servidor solo envía a Cloudflare el comprobante que produjo el widget. No le enviamos tu CURP ni tu IP.",
    ],
    links: [
      {
        label: "Aviso de privacidad de Turnstile",
        href: "https://www.cloudflare.com/turnstileprivacypolicy/",
      },
    ],
  },
  {
    id: "reportes",
    title: "Reportes de la comunidad",
    body: [
      "Si envías un reporte guardamos lo que escribes: tipo de reporte, operador, mensaje, tu correo si decides dejarlo y la identificación de tu navegador (user-agent). No se guarda tu IP.",
      `Los reportes se conservan ${PRIVACY_META.reportRetention} y después se eliminan. No escribas datos personales en el mensaje: no hacen falta para atenderlo.`,
    ],
  },
  {
    id: "estadisticas",
    title: "Estadísticas y contador",
    body: [
      "Cada consulta deja un registro anónimo con conteos: cuántos operadores se consultaron, cuántos respondieron, cuántas líneas aparecieron y cuánto tardó. Lo registra el servidor; tu navegador no reporta nada.",
      "Ese registro no contiene CURP, IP, números ni nada que permita relacionarlo contigo. De ahí sale el contador del inicio.",
      "No usamos herramientas de analítica de terceros ni publicidad.",
    ],
  },
  {
    id: "almacenamiento",
    title: "Cookies y almacenamiento local",
    body: [
      "El sitio no usa cookies propias de seguimiento. Turnstile puede usar las suyas para funcionar.",
      "En tu navegador (localStorage) se guardan dos cosas: tu preferencia de tema claro u oscuro y, para tu comodidad, las últimas 5 CURP que consultaste. Ese historial nunca se envía a ningún lado y puedes borrarlo con el botón «Borrar» del formulario. Si compartes el dispositivo, bórralo al terminar.",
    ],
  },
  {
    id: "registros",
    title: "Registros técnicos",
    body: [
      "El servidor registra errores de funcionamiento (qué operador no respondió, códigos de estado, tiempos). La CURP se omite de esos registros y no se anota el contenido de las respuestas de los operadores.",
    ],
  },
  {
    id: "arco",
    title: "Tus derechos ARCO",
    body: [
      "Sobre las líneas registradas a tu nombre: el proyecto no tiene esos datos. El Acceso, la Rectificación, la Cancelación y la Oposición se ejercen ante el operador correspondiente; en la ficha de cada operador está el enlace a su portal oficial.",
      `Sobre los datos que sí guarda el proyecto (el reporte que hayas enviado, incluido tu correo): escribe a ${PRIVACY_META.contact} y lo consultamos, corregimos o eliminamos.`,
    ],
    links: [
      {
        label: "Reportar una falla o un registro indebido ante la CRT",
        href: "https://portal.crt.gob.mx/reporte-fallas-plataforma-registro",
      },
    ],
  },
  {
    id: "uso-legitimo",
    title: "Uso legítimo",
    body: [
      "La herramienta está pensada para consultar tu propia CURP. Consultar la CURP de otra persona sin su consentimiento puede ser contrario a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y a otras disposiciones aplicables en México.",
    ],
  },
  {
    id: "cambios",
    title: "Cambios a este aviso",
    body: [
      "Cualquier cambio se publica en esta página con su fecha. El historial completo está en el repositorio público del proyecto.",
    ],
  },
];
