export type FaqItem = { q: string; a: string };

export const FAQ: FaqItem[] = [
  {
    q: "¿ConsultaTuLínea guarda mi CURP o mis resultados?",
    a: "No. Tu CURP sí viaja cifrada a nuestro servidor, porque es él quien le pregunta a cada operador, pero se usa solo durante esa consulta: no se guarda en ninguna base de datos y se omite de los registros del sistema. Para no repetir la misma consulta a los operadores en cuestión de minutos, el resultado puede quedar unos minutos en memoria bajo una huella irreversible (SHA-256) de tu CURP; nunca en disco y nunca en claro.",
  },
  {
    q: "¿Desde dónde salen las consultas? ¿Usan proxies?",
    a: "Las consultas las hace nuestro servidor, no tu navegador, así que tu IP nunca llega al operador. Algunos operadores bloquean el tráfico que viene de centros de datos, así que parte de las consultas sale a través de proxies (incluidos proxies residenciales) para que la consulta llegue igual que la de cualquier usuario. El proxy solo cambia la IP de salida: no ve tu identidad ni recibe datos extra tuyos, y no cambia nada de lo anterior sobre tu CURP.",
  },
  {
    q: "¿Es un servicio oficial del gobierno o de los operadores?",
    a: "No. Es un proyecto independiente y de código abierto. No pertenece a la CRT ni a ningún operador, y no sustituye los portales oficiales.",
  },
  {
    q: "¿Por qué algunos operadores aparecen como no soportados?",
    a: "Algunos portales usan mecanismos (como reCAPTCHA o inicio de sesión) que impiden la consulta automática. En esos casos te enviamos directo al portal oficial del operador.",
  },
  {
    q: "Encontré una línea que no reconozco. ¿Qué hago?",
    a: "Puedes ejercer tus derechos ARCO ante el operador correspondiente para acceder, rectificar, cancelar u oponerte al uso de tus datos. En la ficha de cada operador encontrarás su portal oficial.",
  },
  {
    q: "¿Puedo consultar el CURP de otra persona?",
    a: "La herramienta está pensada para tu propio CURP. Consultar el de terceros sin su consentimiento puede ser contrario a la ley de protección de datos en México.",
  },
];
