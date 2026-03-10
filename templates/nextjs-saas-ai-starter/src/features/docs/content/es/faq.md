---
title: Preguntas frecuentes
description: Preguntas comunes sobre Next.js SaaS AI Template: restablecer contraseña, roles, manager vs. 1:1er, integraciones, funciones con IA, exportación de datos y cómo obtener ayuda.
section: faq
order: 1
---

# Preguntas frecuentes

Respuestas a preguntas comunes sobre Next.js SaaS AI Template. Para guías por rol, consultá [Member](/docs/member), [Manager](/docs/manager), [Facilitador 1:1](/docs/one-on-one) y [Admin](/docs/admin).

## ¿Cómo restablezco mi contraseña?

- Si tu tenant usa **login con email/contraseña**: Usá el link **¿Olvidaste tu contraseña?** en la página de inicio de sesión. Ingresá tu email; vas a recibir un link para definir una nueva contraseña. El link puede vencer después de un tiempo (p. ej. 1 hora).
- Si iniciás sesión con **SSO** (p. ej. Google, Microsoft): Tu contraseña la gestiona tu proveedor de identidad. Usá el flujo de restablecimiento de contraseña de ese proveedor (p. ej. el IT de tu empresa o la recuperación de cuenta de Google).
- Si no recibís el email: Revisá spam y después pedile a tu **admin** que confirme tu email en el tenant y reenvíe el restablecimiento, o que verifique si el restablecimiento de contraseña está habilitado para tu tenant.

## ¿Cómo funcionan los roles?

Next.js SaaS AI Template usa **permisos**, no cargos. Los **roles** (p. ej. Member, Manager, Admin, 1:1er) son conjuntos de **permisos**. Lo que podés hacer lo determinan los **permisos** que tenés.

- Podés tener **varios roles** en un tenant (p. ej. Member + 1:1er). Tu acceso efectivo es la **unión** de todos los permisos de todos tus roles.
- Solo los **admins** pueden asignar o cambiar roles (Admin → Miembros). Si no ves una sección (p. ej. Manager o 1:1), es probable que no tengas el rol/permisos correctos — pedile a tu admin.

> **Tip:** La autorización siempre es por clave de permiso (p. ej. `manager:dashboard`, `one_on_one:meetings`). Los nombres de roles son solo para mostrar y agrupar.

## ¿Cuál es la diferencia entre manager y 1:1er?

Son **distintos**:

|                      | Manager                                                                                                       | Facilitador 1:1 (1:1er)                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Significado**      | Relación de reporte en el **organigrama**. Define "quién reporta a quién".                                    | Persona que **facilita conversaciones 1:1** con otra. Se usa para mentoría, seguimiento de carrera, feedback.   |
| **Quién**            | Una persona tiene un manager (en la jerarquía).                                                               | Una o más personas 1:1er por persona. El 1:1er puede ser **cualquiera** — no necesariamente su manager.         |
| **Para qué**         | Vista de equipo, evaluaciones de desempeño (solicitar/enviar para reportes), asignaciones, OKRs, organigrama. | Reuniones 1:1, notas, ítems de acción, feedback; vista de solo lectura de desempeño y proyectos del facilitado. |
| **Alcance de datos** | Tus **reportes directos** (y posiblemente la jerarquía completa del equipo).                                  | Solo las personas con las que tenés una **relación 1:1** (tus facilitados).                                     |

Entonces: podés ser **facilitador 1:1** de alguien sin ser su **manager**, y viceversa. El organigrama muestra relaciones de manager; el árbol de 1:1 muestra quién facilita 1:1s con quién.

## ¿Cómo conecto integraciones (GitHub, Slack, etc.)?

- **Para tu perfil**: Suele haber un área de **Perfil** o **Configuración** donde podés **conectar** GitHub, LinkedIn, Slack, etc. Te redirigen al proveedor para autorizar; después tu cuenta queda vinculada y el tenant puede usarla (p. ej. para mostrar repos o sincronizar perfil).
- **Para el tenant**: Los **admins** configuran integraciones en **Admin** → **Integraciones**: apps OAuth, API keys, webhooks. Definen URLs de redirección y mapeo de datos. Si una integración no está disponible, tu admin puede tener que habilitarla o agregar credenciales. Ver [Integraciones](/docs/admin/integrations) para más detalles.

## ¿Cómo funcionan las funciones con IA?

Next.js SaaS AI Template puede usar IA para:

- **People Finder** — Búsqueda en lenguaje natural y por capacidad (p. ej. "¿Quién sabe React?"). Usa embeddings y/o modelos de chat según la configuración.
- **Procesamiento de CV** — Extraer texto y **habilidades sugeridas** de CVs subidos durante el onboarding. Los admins revisan y verifican o fusionan habilidades.
- **Asistente con IA** — Chat y recomendaciones (si está habilitado). Usa el proveedor y modelo de IA configurados para el tenant.

Los admins definen el **proveedor y modelo de IA** en **Admin** → **Configuración**. Los datos enviados al proveedor dependen de la función (p. ej. consultas de búsqueda, texto del CV). Revisá las políticas de privacidad y procesamiento de datos de tu tenant.

## ¿Qué es la evidencia de "Sincronización de Integración"?

Cuando tu admin ejecuta una sincronización desde una integración (ej. GitHub), Next.js SaaS AI Template **crea automáticamente un registro de evidencia** en el perfil de cada persona sincronizada. Esto muestra qué datos se sincronizaron y cuándo. Aparece en tu pestaña **Evidencia** junto con CVs y otros documentos.

- Estos registros se etiquetan como **"Sincronización"** e incluyen un resumen (ej. "GitHub Profile — 25 repos, TypeScript, Python").
- Cada sync **actualiza** el registro existente en lugar de crear duplicados. La fecha muestra la última sincronización.
- No necesitás hacer nada — la evidencia de integración se crea y mantiene automáticamente por el sistema.

## ¿Cómo funciona la búsqueda de People Finder por detrás?

People Finder usa **embeddings de IA** — representaciones numéricas de tu perfil, habilidades e intereses que permiten matching semántico. Cuando buscás "desarrolladores React interesados en cloud", no solo busca las palabras exactas — encuentra personas cuyos perfiles y habilidades son semánticamente similares a tu consulta.

Los embeddings se generan y mantienen actualizados automáticamente cuando actualizás tus habilidades, intereses o perfil, cuando se procesa un CV, o cuando un admin ejecuta un sync de integración. Mientras más completo sea tu perfil, mejor aparecés en búsquedas relevantes.

## ¿Qué son los Ciclos de Revisión 360?

Los **Ciclos de Revisión 360** son evaluaciones de desempeño multi-perspectiva estructuradas, gestionadas por tu admin. Un ciclo puede incluir:

- **Autoevaluación** — Te evaluás a vos mismo.
- **Evaluación de supervisor** — Tu manager te evalúa.
- **Revisión de pares** — Los colegas se evalúan entre sí.
- **Evaluación ascendente** — Evaluás a tu manager.

Cuando un ciclo está activo y sos participante, vas a ver tus asignaciones pendientes en tu página de **Desempeño**. Completá cada una antes de su fecha límite.

Si las nominaciones de pares están habilitadas, podés nominar colegas para que te revisen. Las nominaciones necesitan aprobación de un admin o tu manager antes de convertirse en asignaciones.

Para detalles de configuración del admin, ver [Ciclos de Revisión 360](/docs/admin/review-cycles). Para la experiencia del miembro, ver [Desempeño — Ciclos de Revisión 360](/docs/member/performance#ciclos-de-revisión-360).

## ¿Cómo exporto datos?

- **Tus propios datos**: Usá **Perfil** o **Configuración** para datos de la cuenta. Algunos tenants ofrecen una opción **Descargar mis datos** o **Exportar** para el usuario actual.
- **Managers**: Las vistas de Analíticas o equipo pueden ofrecer **Exportar** (p. ej. CSV) de los datos que podés ver (tus reportes, evaluaciones, aprendizaje). Usalo para reportes o respaldos dentro de la política.
- **Admins**: **Admin** → **Analíticas y auditoría** (o similar) puede ofrecer exportaciones para analíticas o registros de auditoría. La exportación masiva de miembros o habilidades depende del tenant y del despliegue; revisá Admin → Miembros o Configuración.

Si no ves una opción de exportación, tu rol puede no tener permiso o la función puede no estar habilitada — pedile a tu admin.

## ¿Cómo obtengo ayuda?

- **En la app**: Usá el link **Ayuda** o **Docs** (suele estar en el encabezado o pie) para abrir esta documentación.
- **Tu admin**: Para acceso, roles, invitaciones o comportamiento específico del tenant, contactá a tu **admin del tenant** o a IT.
- **Soporte**: Si tu organización tiene un canal de soporte o contacto con el proveedor de Next.js SaaS AI Template, usalo para bugs, caídas o problemas de cuenta.

> **Tip:** Agregá [Docs](/docs) a favoritos y usá la barra lateral para ir a tu rol (Member, Manager, Facilitador 1:1, Admin) para guías paso a paso.
