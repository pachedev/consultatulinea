<h1 align="center">ConsultaTuLínea</h1>

<p align="center">
  Consulta qué líneas telefónicas móviles están registradas a tu nombre en México, desde un solo lugar.
</p>

<p align="center">
  <a href="https://consultatulinea.mx">consultatulinea.mx</a>
</p>

---

## Sobre el proyecto

En México, con el Registro Nacional de Usuarios de Telefonía Móvil, cada operador administra por separado la información de sus clientes. Para saber qué líneas están registradas a tu nombre tendrías que identificar cada compañía, encontrar su portal y repetir un proceso distinto en cada una.

**ConsultaTuLínea** es un proyecto de código abierto, independiente y sin fines de lucro, que centraliza el acceso a esos portales y unifica la experiencia en una sola interfaz, moderna y transparente.

No pertenece a ninguna institución gubernamental ni a ningún operador. Es una iniciativa de la comunidad.

---

## El problema

Saber qué líneas existen a tu nombre debería ser simple. Hoy no lo es:

- No hay un lugar único para consultarlas.
- Cada operador tiene su propio portal y su propio proceso.
- Registrar una línea con el CURP de otra persona es más común de lo que debería, y puede derivar en fraude o robo de identidad.

ConsultaTuLínea busca cerrar ese vacío.

---

## Privacidad

La privacidad es un principio fundamental del proyecto. Está diseñado bajo un enfoque de *Privacy by Design*.

ConsultaTuLínea **no almacena**:

- CURP
- RFC
- Números telefónicos
- Resultados de las consultas

Las consultas se ejecutan directamente desde tu navegador hacia los portales correspondientes. Tu información no se guarda ni transita por servidores del proyecto.

---

## Cómo funciona

Introduces tu CURP y la aplicación consulta en paralelo los mecanismos de verificación públicos de los operadores y OMVs, mostrando los resultados conforme cada uno responde.

Cuando un operador requiere realizar la consulta directamente en su portal (por ejemplo, si pide validación adicional), la aplicación te orienta hacia el sitio oficial correspondiente.

---

## Derechos ARCO

Si encuentras líneas que no reconoces, la aplicación incluye información sobre cómo iniciar solicitudes ARCO (Acceso, Rectificación, Cancelación y Oposición) ante el operador correspondiente.

---

## Aviso legal

Esta herramienta está diseñada para consultar información asociada a **tu propio CURP**.

Consultar el CURP de terceras personas sin su consentimiento puede ser contrario a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y otras disposiciones aplicables en México. El usuario es responsable del uso que haga de la herramienta.

ConsultaTuLínea no sustituye los servicios oficiales de los operadores ni de la Comisión Reguladora de Telecomunicaciones (CRT). Los nombres comerciales, logotipos y marcas pertenecen a sus respectivos titulares y se usan únicamente con fines informativos.

---

## Créditos

ConsultaTuLínea está inspirado en el proyecto **[MisLíneas](https://github.com/moraxh/MisLineas)**, desarrollado por **[Jorge Mora (@moraxh)](https://github.com/moraxh)**, y reutiliza y adapta parte de su trabajo.

Su proyecto demostró la viabilidad de una plataforma comunitaria para simplificar la consulta de líneas telefónicas en México. Gracias a su esfuerzo es posible esta iniciativa.

---

## Licencia

Este proyecto se distribuye bajo la **Licencia Pública General de GNU, versión 2 (GPL-2.0)**, la misma del proyecto original MisLíneas, del cual deriva.

Esto significa que cualquier persona puede usar, estudiar, modificar y redistribuir el código, siempre que las obras derivadas se distribuyan también bajo GPL-2.0 y conserven los créditos correspondientes.

Texto completo en [LICENSE](LICENSE).
