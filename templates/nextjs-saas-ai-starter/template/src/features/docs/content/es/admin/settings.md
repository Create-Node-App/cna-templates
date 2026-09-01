---
title: Configuración
description: Feature flags, branding (logo, colores), configuración del proveedor de IA, escalas de habilidades, categorías de habilidades y configuración de almacenamiento.
section: admin
order: 8
---

# Configuración

Los admins configuran **configuración a nivel de tenant** en **Admin** → **Configuración**: feature flags, branding, proveedor de IA, escalas de habilidades, categorías y almacenamiento. Esto afecta cómo se ve y se comporta la plataforma para todos en el tenant.

## Feature flags

Los **feature flags** activan o desactivan funciones para el tenant sin un deploy de código.

| Flags típicos                       | Qué controlan                                                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **allowCustomRoles**                | Cuando está activado: los admins pueden crear roles personalizados. Cuando está desactivado: solo existen los roles del sistema. |
| **OKRs**                            | Habilitar u ocultar funciones de OKR (objetivos, check-ins) para el tenant.                                                      |
| **Recognitions**                    | Habilitar u ocultar funciones de reconocimiento/elogio.                                                                          |
| **Integrations**                    | Habilitar integraciones específicas (p. ej. GitHub, Slack).                                                                      |
| **Subida de CV / onboarding**       | Habilitar procesamiento de CV con IA y extracción de habilidades para onboarding.                                                |
| **People Finder / búsqueda con IA** | Habilitar búsqueda en lenguaje natural y por capacidad.                                                                          |

Activá o desactivá flags según el lanzamiento o cumplimiento. Los cambios se aplican al guardar; los usuarios pueden necesitar refrescar.

## Branding

- **Logo** — Subí o definí el logo del tenant que se muestra en el encabezado y en login/shell. El formato y tamaño recomendados suelen indicarse en la UI.
- **Colores** — Colores primarios (y opcionalmente secundarios) para botones, links y acentos. Usá los colores de marca de tu organización para una apariencia consistente.

> **Tip:** Usá un logo y colores con buen contraste para que la interfaz siga siendo accesible.

## Configuración del proveedor de IA

Si tu tenant usa **funciones con IA** (p. ej. People Finder, extracción de CV, asistente con IA):

- **Proveedor** — p. ej. OpenAI, Azure OpenAI u otro proveedor configurado.
- **Modelo** — Qué modelo usar para embeddings y/o chat (p. ej. para búsqueda vs. asistente).
- **API key / endpoint** — Se guardan de forma segura; los admins definen o rotan claves en Configuración. Las claves no se muestran completas después de guardar.

Revisá la documentación del proveedor por límites de tasa y costos. Cambios de modelo o clave pueden requerir reinicio o limpieza de caché para algunas funciones.

## Escalas de habilidades (niveles 1–5)

Los niveles de habilidad suelen definirse en una **escala** (p. ej. 1–5). En Configuración podés:

- **Definir la escala** — p. ej. 1 = Principiante, 5 = Experto. Las etiquetas pueden ser editables por nivel.
- **Usar de forma consistente** — La misma escala aplica a autoevaluaciones, capacidades (nivel mínimo) y reportes. Cambiá solo cuando estés listo para alinear datos históricos (o aceptar una migración única).

## Categorías de habilidades

- Las **categorías** agrupan habilidades en el catálogo (p. ej. "Técnico", "Liderazgo"). Podés crear, renombrar, reordenar o archivar categorías en Configuración (o en Gestión de habilidades).
- Las categorías ayudan a filtrar habilidades en las UIs de admin y miembros. Mantené la lista concisa.

## Configuración de almacenamiento

Según tu despliegue, Configuración puede incluir:

- **Almacenamiento de archivos** — Dónde se guardan los archivos subidos (p. ej. CVs, avatares, adjuntos) (p. ej. S3, local). Los admins pueden definir bucket, región o rutas.
- **Límites** — Tamaño máximo de archivo, tipos permitidos o retención. Configurá según la política.

## Paso a paso: cambiar branding y un feature flag

1. Andá a **Admin** → **Configuración**.
2. **Branding** — Subí un nuevo logo y definí el color primario. Guardá.
3. **Feature flags** — Buscá el flag (p. ej. "Reconocimientos") y activalo o desactivalo. Guardá.
4. Refrescá la app y confirmá el logo/colores y la visibilidad de la función (p. ej. el menú de Reconocimientos aparece o desaparece).
