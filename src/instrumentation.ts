// Corre una sola vez al arrancar el server de Next, antes de atender la primera
// petición.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { Agent, setGlobalDispatcher } = await import("undici");

  // undici conserva un socket ocioso del pool hasta ~600s. Varios operadores
  // cierran el suyo mucho antes (att.com.mx y la API de Dialo lo tiran alrededor
  // de los 30s). Cuando los dos no coinciden, undici entrega un socket que cree
  // vivo, escribe la petición sobre una conexión que el otro extremo ya cerró y
  // espera una respuesta que nunca va a llegar: el provider quema todo su
  // presupuesto de abort y reporta un timeout que no tiene nada que ver con que
  // el operador esté lento.
  //
  // Desalojar los sockets ociosos a los 10s nos deja cómodamente por delante del
  // otro extremo, así que el pool nunca sirve una conexión muerta.
  //
  // Esto fija el dispatcher *global*, que solo aplica a las llamadas que no
  // pasan el suyo. Los providers proxeados usan los dispatchers de
  // _proxy.ts (ProxyAgent/Agent propios) y no se ven afectados; telcel.ts usa
  // node:https directo y tampoco pasa por undici.
  setGlobalDispatcher(
    new Agent({
      // Una conexión HTTP/2 muerta es multiplexada: se lleva por delante todas
      // las peticiones que van montadas en ella. Sobre HTTP/1.1 cada conexión
      // falla por su cuenta.
      allowH2: false,
      keepAliveTimeout: 10_000,
      keepAliveMaxTimeout: 10_000,
      // Generoso a propósito: esto es para no reutilizar sockets muertos, no
      // para cortar handshakes lentos pero vivos. El AbortSignal por provider
      // (PROVIDER_TIMEOUT_MS) sigue siendo el techo duro.
      connect: { timeout: 30_000 },
    }),
  );
}
