/**
 * Contenido propio por operador.
 *
 * Las 108 fichas de /operadores/[slug] se generan del mismo molde: sin texto
 * propio son 108 páginas casi idénticas (unas 40 palabras únicas cada una),
 * justo el patrón de contenido delgado que Google castiga a nivel de dominio.
 *
 * Solo las marcas con perfil aquí se indexan y entran al sitemap; el resto se
 * sirve con `noindex, follow` para que sigan siendo útiles al usuario y pasen
 * autoridad al directorio sin inflar el índice.
 *
 * Al agregar un perfil: escribe información que no se pueda deducir del molde
 * (qué red usa, cómo se comporta su portal, qué pedir cuando algo falla). Si
 * solo puedes repetir lo genérico, no lo agregues.
 */

export type OperatorProfile = {
  /** Red sobre la que opera. Omitir si no está confirmado. */
  network?: string;
  /** Qué es la marca y a quién le sirve. 2-3 frases propias. */
  intro: string;
  /** Pasos reales en el portal oficial de ESTE operador. */
  steps: string[];
  /** Particularidades: bloqueos, requisitos, fallas conocidas. */
  notes?: string[];
  /** FAQ propia de la marca. Alimenta el JSON-LD FAQPage de la ficha. */
  faq: { q: string; a: string }[];
};

export const OPERATOR_PROFILES: Record<string, OperatorProfile> = {
  telcel: {
    network: "Red propia (América Móvil)",
    intro:
      "Telcel es el operador con más líneas activas de México y opera su propia red, así que su registro es independiente del de cualquier OMV. Es también el caso donde más discrepancias hemos visto entre lo que el usuario cree haber registrado y lo que devuelve el portal oficial.",
    steps: [
      "Entra a registro.telcel.com/vinculatulinea desde el navegador.",
      "Elige la opción de consulta por CURP y captura los 18 caracteres.",
      "Resuelve el captcha del portal y espera el listado de líneas vinculadas.",
    ],
    notes: [
      "Una línea Telcel puede no aparecer ni aquí ni en el portal oficial aunque creas haberla registrado: suele significar que la vinculación no quedó guardada, no que la línea no exista.",
      "Si tu línea no aparece, vuelve a hacer la vinculación en el portal de Telcel antes de reportar nada: es el único lugar donde puedes corregirlo.",
    ],
    faq: [
      {
        q: "¿Por qué mi línea Telcel no aparece en la consulta?",
        a: "Porque Telcel responde con lo que tiene guardado en su propio registro. Si la vinculación falló a medias, la línea existe y funciona pero no queda asociada a tu CURP. Repite el proceso en registro.telcel.com/vinculatulinea y vuelve a consultar.",
      },
      {
        q: "¿Amigo Kit y planes de renta se consultan igual?",
        a: "Sí. El registro es por línea, no por tipo de plan: prepago (Amigo) y pospago aparecen en la misma consulta por CURP.",
      },
    ],
  },

  "at-t-unefon-wim": {
    network: "Red propia (AT&T México)",
    intro:
      "AT&T México opera su propia red y bajo ella viven también Unefon y WIM, así que las tres marcas comparten un mismo registro y un mismo portal de consulta. Si tienes líneas en más de una de ellas, aparecerán juntas.",
    steps: [
      "Entra a att.com.mx/controlpersonal.",
      "Captura tu CURP en el formulario de consulta de líneas.",
      "Revisa el listado: incluye líneas AT&T, Unefon y WIM sin distinguir marca.",
    ],
    notes: [
      "Movistar México también usa la red de AT&T, pero su registro es aparte: una línea Movistar no aparece en esta consulta.",
    ],
    faq: [
      {
        q: "¿Unefon y WIM se consultan por separado?",
        a: "No. Las tres marcas son del mismo operador y comparten el registro, así que una sola consulta las cubre.",
      },
    ],
  },

  "telefonica-movistar": {
    network: "Usa la red de AT&T México",
    intro:
      "Movistar México apagó su propia red de radio y desde 2019 presta servicio sobre la infraestructura de AT&T, pero mantiene su propio registro de usuarios y su propio portal. Por eso una línea Movistar nunca aparece en la consulta de AT&T.",
    steps: [
      "Entra a movistar.com.mx/consulta-tu-linea.",
      "Captura tu CURP y completa la verificación del portal.",
      "Revisa las líneas Movistar asociadas.",
    ],
    faq: [
      {
        q: "Si Movistar usa la red de AT&T, ¿por qué son consultas distintas?",
        a: "Porque el registro de usuarios lo lleva cada concesionario, no la red física. Movistar responde por sus propias líneas aunque el radio sea de AT&T.",
      },
    ],
  },

  bait: {
    network: "Red Altán",
    intro:
      "Bait es el operador móvil virtual de Walmart y es, por volumen, el OMV más grande del país: buena parte de las líneas registradas por primera vez con CURP en México son suyas. Opera sobre la Red Altán y tiene portal de consulta propio, separado del de Altán.",
    steps: [
      "Entra a btz.mx/consultaregistro.",
      "Captura tu CURP.",
      "Revisa el listado de líneas Bait vinculadas.",
    ],
    notes: [
      "Las líneas Bait no aparecen en la consulta general de Altán Redes aunque usen su red: hay que consultar el portal de Bait.",
    ],
    faq: [
      {
        q: "Compré un chip Bait en Walmart, ¿queda registrado solo?",
        a: "No necesariamente. El registro ante el RNUTM se hace al activar la línea con tus datos; si el chip se activó sin capturar tu CURP, no aparecerá en la consulta.",
      },
    ],
  },

  "oxxo-cel": {
    intro:
      "OXXO CEL es el OMV de FEMSA y se vende en las tiendas OXXO, lo que lo vuelve uno de los puntos más comunes de alta de líneas de prepago en México. Su consulta corre sobre la plataforma vinculatulinea.com, compartida con varios OMVs.",
    steps: [
      "Entra a vinculatulinea.com/Oxxocel.",
      "Captura tu CURP y resuelve la verificación.",
      "Revisa las líneas OXXO CEL vinculadas a tu clave.",
    ],
    faq: [
      {
        q: "¿Un chip comprado en OXXO queda a nombre de quien lo compra?",
        a: "Solo si al activarlo se capturó su CURP. Un chip activado con datos de otra persona queda registrado a esa persona, no a quien lo pagó.",
      },
    ],
  },

  izzi: {
    intro:
      "Izzi Móvil es la oferta celular de izzi (Grupo Televisa) y suele contratarse como complemento del servicio de internet fijo. A diferencia de la mayoría, su consulta no es un formulario público de CURP: exige iniciar sesión en la cuenta.",
    steps: [
      "Entra a izzi.mx e inicia sesión en Mi izzi.",
      "Abre la sección de líneas móviles de tu cuenta.",
      "Revisa las líneas asociadas al titular.",
    ],
    notes: [
      "Como la consulta va detrás de un inicio de sesión, no podemos automatizarla desde ConsultaTuLínea.",
    ],
    faq: [
      {
        q: "¿Por qué izzi no aparece en la consulta automática?",
        a: "Porque su portal pide credenciales de la cuenta en vez de CURP. Solo el titular, con su usuario y contraseña, puede ver las líneas.",
      },
    ],
  },

  sky: {
    intro:
      "SKY Móvil vende líneas celulares asociadas a la cuenta de televisión de SKY. Igual que izzi, su consulta vive dentro del portal de cliente y no en un formulario abierto de CURP.",
    steps: [
      "Entra a micuenta.sky.com.mx e inicia sesión.",
      "Abre el apartado de servicios móviles.",
      "Revisa las líneas dadas de alta en tu cuenta.",
    ],
    faq: [
      {
        q: "¿Necesito ser titular de la cuenta SKY para consultar?",
        a: "Sí. La consulta se hace dentro de Mi Cuenta, así que requiere las credenciales del titular.",
      },
    ],
  },

  "virgin-mobile": {
    intro:
      "Virgin Mobile México fue uno de los primeros OMV del país y conserva base de usuarios de prepago. Tiene consulta pública por CURP en su portal.",
    steps: [
      "Entra a mi.virginmobile.mx/v1/consultatulinea.",
      "Captura tu CURP.",
      "Revisa las líneas Virgin Mobile vinculadas.",
    ],
    faq: [
      {
        q: "Ya no uso mi línea Virgin, ¿por qué sigue apareciendo?",
        a: "Una línea sigue registrada a tu nombre hasta que el operador la da de baja. Si dejaste de usarla, pide la baja formal para que deje de estar vinculada a tu CURP.",
      },
    ],
  },

  weex: {
    network: "Red Altán",
    intro:
      "Weex es un OMV enfocado en planes de datos para público joven y opera sobre la Red Altán. Su portal de consulta es público y responde por CURP.",
    steps: [
      "Entra a weex.mx/consultalineas.html.",
      "Captura tu CURP.",
      "Revisa las líneas Weex asociadas.",
    ],
    faq: [
      {
        q: "¿Weex aparece también en la consulta de Altán Redes?",
        a: "No. Aunque usa la Red Altán, Weex lleva su propio registro de usuarios y responde desde su propio portal.",
      },
    ],
  },

  dalefon: {
    network: "Red Altán",
    intro:
      "Dalefon es un OMV mexicano sobre la Red Altán, conocido por sus planes de datos sin contrato. Publica su consulta de vinculación en su propio dominio.",
    steps: [
      "Entra a dalefon.mx/vinculatulinea.",
      "Captura tu CURP.",
      "Revisa las líneas Dalefon vinculadas.",
    ],
    faq: [
      {
        q: "¿Qué hago si aparece una línea Dalefon que no reconozco?",
        a: "Solicita a Dalefon el ejercicio de tus derechos ARCO por escrito pidiendo la cancelación del registro, y guarda el acuse. Si no responden, puedes reportarlo ante la CRT.",
      },
    ],
  },

  oxio: {
    intro:
      "Oxio Mobile opera en México con un modelo digital: alta y gestión de la línea desde la app, sin sucursales. Su consulta de vinculación es pública y por CURP.",
    steps: [
      "Entra a verificar.oxiomobile.com/consultatuslineas.",
      "Captura tu CURP.",
      "Revisa las líneas Oxio asociadas.",
    ],
    faq: [
      {
        q: "Di de baja mi eSIM Oxio, ¿desaparece del registro?",
        a: "Debería, una vez que el operador procesa la baja. Si sigue apareciendo semanas después, pide por escrito la cancelación del dato ante Oxio.",
      },
    ],
  },

  "mega-movil": {
    intro:
      "Mega Móvil es el servicio celular de Megacable, normalmente contratado junto con internet o TV. Tiene consulta pública por CURP en un subdominio propio.",
    steps: [
      "Entra a consultavinculacion.megamovil.mx.",
      "Captura tu CURP.",
      "Revisa las líneas Mega Móvil vinculadas.",
    ],
    notes: [
      "En agosto de 2026 corregimos un error de interpretación de su respuesta que podía mostrar una línea inexistente como registrada. Si consultaste antes de esa fecha, vuelve a hacerlo.",
    ],
    faq: [
      {
        q: "Contraté internet de Megacable, ¿tengo línea móvil registrada?",
        a: "Solo si activaste un chip de Mega Móvil. El servicio fijo no genera registro en el RNUTM.",
      },
    ],
  },

  mobig: {
    intro:
      "MoBig es un OMV mexicano con planes de prepago y portal público de vinculación por CURP.",
    steps: [
      "Entra a mobig.mx/vinculatulinea/consulta-curp.",
      "Captura tu CURP.",
      "Revisa las líneas MoBig vinculadas.",
    ],
    notes: [
      "En agosto de 2026 corregimos un error de interpretación de su respuesta que podía mostrar una línea inexistente como registrada. Si consultaste antes de esa fecha, vuelve a hacerlo.",
    ],
    faq: [
      {
        q: "Vi una línea MoBig con el número oculto, ¿fue una filtración?",
        a: "No. Fue un error nuestro al leer el formato de respuesta del operador, ya corregido. No hubo exposición de datos.",
      },
    ],
  },

  dialo: {
    intro:
      "Dialo es un OMV mexicano que publica su consulta de vinculación en su sitio principal y responde por CURP sin necesidad de cuenta.",
    steps: [
      "Entra a dialo.mx/vinculatulinea.",
      "Captura tu CURP.",
      "Revisa las líneas Dialo asociadas.",
    ],
    faq: [
      {
        q: "¿La consulta de Dialo pide algo además de la CURP?",
        a: "No. Es un formulario público que responde con las líneas vinculadas a la clave capturada.",
      },
    ],
  },

  "chedraui-movil": {
    intro:
      "Chedraui Móvil es el OMV de la cadena de supermercados Chedraui. Sus chips se activan en tienda, así que el registro depende de que se haya capturado la CURP correcta en el punto de venta.",
    steps: [
      "Entra a vinculatulinea.com/Chedrauimovil.",
      "Captura tu CURP.",
      "Revisa las líneas Chedraui Móvil vinculadas.",
    ],
    faq: [
      {
        q: "Activé el chip en caja, ¿quedó a mi nombre?",
        a: "Depende de qué CURP se capturó al activarlo. Si el registro se hizo con datos de otra persona, la línea aparecerá en la consulta de esa persona, no en la tuya.",
      },
    ],
  },

  redicoppel: {
    network: "Red Altán",
    intro:
      "Redicoppel es el OMV de Coppel, con fuerte presencia en el norte y noroeste del país. Opera sobre la Red Altán y su vinculación se consulta en el portal general de Altán.",
    steps: [
      "Entra a rnu.altanredes.com/consulta.",
      "Captura tu CURP.",
      "Busca en el resultado las líneas identificadas como Redicoppel.",
    ],
    faq: [
      {
        q: "¿Por qué Redicoppel se consulta en el portal de Altán?",
        a: "Porque delega el registro de usuarios en Altán Redes, el concesionario de la red mayorista. Varios OMV pequeños hacen lo mismo.",
      },
    ],
  },

  "uber-cel": {
    intro:
      "Uber Cel es un OMV mexicano de prepago con consulta pública sobre la plataforma vinculatulinea.com.",
    steps: [
      "Entra a vinculatulinea.com/Ubercel.",
      "Captura tu CURP.",
      "Revisa las líneas Uber Cel vinculadas.",
    ],
    faq: [
      {
        q: "¿Uber Cel tiene relación con la app de viajes Uber?",
        a: "No. Es un operador móvil virtual independiente; la coincidencia de nombre no implica relación entre ambas empresas.",
      },
    ],
  },

  bestel: {
    intro:
      "Bestel es el brazo de telecomunicaciones empresariales de Grupo Televisa y también respalda las líneas de Cablecom. Su consulta vive dentro del portal de facturación, no en un formulario abierto de CURP.",
    steps: [
      "Entra a facturacion.bestel.com.mx.",
      "Inicia sesión con la cuenta del titular del servicio.",
      "Revisa las líneas asociadas al contrato.",
    ],
    faq: [
      {
        q: "¿Bestel y Cablecom se consultan en el mismo lugar?",
        a: "Sí. Ambas marcas usan el mismo portal de facturación para la consulta de líneas.",
      },
    ],
  },
};

export function getOperatorProfile(slug: string): OperatorProfile | null {
  return OPERATOR_PROFILES[slug] ?? null;
}

/** Slugs con contenido propio: los únicos que se indexan y entran al sitemap. */
export function getIndexableOperatorSlugs(): string[] {
  return Object.keys(OPERATOR_PROFILES);
}
