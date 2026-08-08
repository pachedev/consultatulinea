# Comunicado 2026-08-08 — Corrección MoBig y Mega Móvil + transparencia de proxies

Material listo para publicar. Tres piezas: (1) aviso in-app, (2) respuesta de
soporte a quien ya reportó, (3) nota de transparencia sobre proxies.

## Contexto técnico (interno, no publicar tal cual)

- **MoBig**: su endpoint `search-msisdns` cambió el formato de respuesta. Antes
  devolvía un arreglo vacío cuando la CURP no tenía líneas; ahora devuelve un
  objeto `{last_digits, msisdns}`. Nuestra verificación de "sin líneas" dejó de
  coincidir, así que **toda** consulta caía en la rama de "registrada" y se
  mostraba como *MoBig · Registrada · Número oculto*. Verificado en vivo el
  2026-08-08. No hubo fuga de datos: el número nunca existió, la tarjeta era un
  error de interpretación de nuestra parte.
- **Mega Móvil**: su endpoint `validaCURP` responde `status: OK / code: 1` para
  prácticamente cualquier CURP con formato válido. Eso no significa "tiene
  líneas", significa "continúa al siguiente paso". Lo tomábamos como
  confirmación y producía la misma tarjeta falsa.
- Ambas correcciones ya están en el código: ahora solo confirmamos registro con
  líneas reales, y si el operador responde algo que no reconocemos marcamos la
  consulta como no disponible con enlace al portal oficial, en lugar de asumir
  que existe una línea.

## 1. Aviso in-app (tabla `news` del admin)

- **level**: `warning`
- **title**: `Corregimos un error en MoBig y Mega Móvil`
- **body**:

> Durante los últimos días, MoBig y Mega Móvil pudieron aparecer como
> "Registrada · Número oculto" aunque no tuvieras ninguna línea con ellos.
> No fue una línea real ni una filtración de datos: ambos operadores cambiaron
> el formato de su respuesta y nuestra herramienta la interpretó mal. Ya está
> corregido. Si viste ese resultado, vuelve a consultar: ahora verás el estado
> correcto.

Despublicar el aviso a los ~10 días o cuando bajen los reportes.

## 2. Respuesta de soporte (macro)

> Hola, gracias por avisarnos: tu reporte fue justo el que nos permitió
> encontrar la falla.
>
> Lo que viste **no era una línea real a tu nombre**. MoBig y Mega Móvil
> cambiaron el formato con el que responden a la consulta, y nuestra herramienta
> interpretó esa respuesta como "sí hay línea registrada" cuando en realidad
> significaba "no hay ninguna". Por eso aparecía como *Registrada · Número
> oculto*: nunca hubo un número, ni tuyo ni de nadie más. Tampoco hubo acceso ni
> filtración de datos personales; el error estaba de nuestro lado, al leer la
> respuesta.
>
> Ya lo corregimos y además cambiamos el criterio: si un operador contesta algo
> que no reconocemos, ahora marcamos la consulta como *no disponible* y te
> enviamos a su portal oficial, en lugar de asumir que existe una línea. Preferimos
> decirte "no pudimos confirmarlo" antes que alarmarte con algo falso.
>
> Puedes volver a consultar cuando quieras y verás el resultado correcto. Si aún
> te aparece algo que no reconoces, respóndenos este mensaje: en ese caso sí lo
> revisamos caso por caso y te acompañamos con tus derechos ARCO ante el operador.
>
> Gracias por la paciencia y por reportarlo.

**Si preguntan si deben hacer algo (denuncia, ARCO, bloqueo):** no. No hay
línea que cancelar porque nunca existió. Solo tiene sentido iniciar un ARCO si
tras la corrección sigue apareciendo una línea que no reconocen.

## 3. Nota de transparencia sobre proxies

Ya publicada en el sitio (FAQ + aviso de privacidad). Versión corta para
soporte y redes:

> Las consultas las hace nuestro servidor, no tu navegador: tu IP nunca llega al
> operador. Como varios operadores bloquean el tráfico de centros de datos, una
> parte de las consultas sale a través de proxies (incluidos proxies
> residenciales) para que lleguen igual que la de cualquier usuario. El proxy
> solo cambia la IP de salida: no recibe tu identidad ni datos adicionales
> tuyos, y no cambia nada del tratamiento de tu CURP, que se sigue usando solo
> durante la consulta y no se guarda.

**Si preguntan por qué usan proxies residenciales:** porque es la única forma de
que operadores que bloquean centros de datos respondan la consulta. La
alternativa es dejar de cubrir a esos operadores.
