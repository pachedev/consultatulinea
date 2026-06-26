export type FaqItem = { q: string; a: string };

export const FAQ: FaqItem[] = [
  {
    q: "¿ConsultaTuLínea guarda mi CURP o mis resultados?",
    a: "No. La consulta se ejecuta desde tu navegador hacia los portales de los operadores. El proyecto no almacena tu CURP, tus números ni los resultados.",
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
