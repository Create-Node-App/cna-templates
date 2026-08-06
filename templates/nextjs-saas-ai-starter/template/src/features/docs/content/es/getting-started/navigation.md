---
title: Navegación y vistas
description: Las cuatro vistas principales (Mi vista, Manager, 1:1, Admin), navegación lateral, búsqueda global, tema e idioma.
section: getting-started
order: 3
---

# Navegación y vistas

Next.js SaaS AI Template organiza el producto en **vistas** y una **barra lateral**. Esta página explica cómo moverte por la app, usar la búsqueda global y ajustar tema e idioma.

---

## Cuatro vistas principales

Lo que ves en la app depende de tu **rol y permisos**. Las cuatro vistas son:

| Vista             | Quién la ve                                                | Propósito                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mi vista**      | Todos                                                      | Tu perfil, habilidades, OKRs, aprendizaje, desempeño, proyectos, Buscador de personas, Base de conocimiento, feedback y asistente de IA.                          |
| **Vista Manager** | Usuarios con permisos de manager (o superiores)            | Dashboard de equipo, reportes, proyectos y clientes, evaluaciones de desempeño, asignaciones de aprendizaje, OKRs de equipo y herramientas de reuniones 1:1.      |
| **Vista 1:1**     | Usuarios que son facilitadores 1:1 de al menos una persona | Lista de personas con las que tenés 1:1s, sus reuniones y acceso de solo lectura a su desempeño y proyectos.                                                      |
| **Vista Admin**   | Usuarios con permisos de admin                             | Configuración del tenant: miembros e invitaciones, habilidades, capacidades, perfiles de rol, roadmaps, roles y permisos, configuración, integraciones, análisis. |

Solo ves las vistas a las que tenés acceso. Por ejemplo, si solo sos Miembro, ves **Mi vista**. Si sos Manager y Facilitador 1:1, ves **Mi vista**, **Vista Manager** y **Vista 1:1**.

### Cambiar de vista

- Usá la **barra lateral**: las secciones de primer nivel suelen mapear a estas vistas (ej. "Mi", "Manager", "1:1", "Admin").
- O usá un **selector de vista** en el encabezado o la barra lateral para elegir la vista activa. El menú de la barra lateral muestra entonces los ítems de esa vista.

---

## Navegación en la barra lateral

La **barra lateral** es la forma principal de moverte entre secciones.

- **Colapsable** — Podés colapsarla para dejar solo íconos y ganar espacio; expandila de nuevo para ver las etiquetas completas.
- **Por vista** — Cuando cambiás de vista (Mi / Manager / 1:1 / Admin), la barra lateral se actualiza y muestra solo las páginas de esa vista. Por ejemplo:
  - En **Mi vista**: Dashboard, Perfil, Habilidades, OKRs, Aprendizaje, Desempeño, Proyectos, Buscador de personas, Base de conocimiento, Feedback y reconocimiento, Asistente de IA, etc.
  - En **Vista Manager**: Dashboard Manager, Equipo, Proyectos y clientes, Evaluaciones de desempeño, Asignaciones de aprendizaje, OKRs de equipo, Reuniones 1:1, Análisis.
  - En **Vista 1:1**: Dashboard 1:1, Reuniones, Desempeño y proyectos (solo lectura para las personas 1:1).
  - En **Vista Admin**: Miembros e invitaciones, Habilidades, Capacidades, Perfiles de rol, Roadmaps, Roles y permisos, Configuración, Integraciones, Análisis, etc.

Hacé clic en un ítem de la barra lateral para ir a esa página. La página actual suele estar resaltada.

> **Tip:** Si no ves una sección que esperás, puede que no tengas permiso o que esté en otra vista. Cambiá de vista y revisá de nuevo la barra lateral.

---

## Búsqueda global (Cmd+K / Ctrl+K)

Next.js SaaS AI Template ofrece **búsqueda global** para ir a personas, documentación o acciones sin pasar por los menús.

1. Pulsá **Cmd+K** (Mac) o **Ctrl+K** (Windows/Linux), o usá el disparador de búsqueda en el encabezado.
2. Escribí tu consulta (ej. nombre de una persona, título de un doc o una acción como "Crear OKR").
3. Usá el teclado o el mouse para elegir un resultado. Vas a la página o acción correspondiente.

La búsqueda global es especialmente útil cuando ya conocés un poco la app; usala para abrir perfiles, documentación o tareas frecuentes rápido.

---

## Tema (claro / oscuro)

Si tu tenant lo permite, podés cambiar entre tema **claro** y **oscuro**.

- Buscá un **interruptor de tema** en el encabezado, el pie de la barra lateral o en tu perfil/configuración (ej. ícono sol/luna).
- Tu elección suele guardarse para que en el próximo login veas el mismo tema.

Dónde está el interruptor puede variar según el layout; revisá la barra superior o el área de **Perfil / Configuración** si no lo ves.

---

## Selector de idioma (inglés / español)

Next.js SaaS AI Template se puede usar en varios idiomas (ej. **inglés** y **español**).

- Usá el **selector de idioma** en el encabezado o el menú de cuenta (suele ser un globo o control "EN" / "ES").
- Elegí tu idioma preferido. La interfaz y, cuando esté disponible, la documentación pasan a ese idioma.
- La preferencia suele recordarse para la próxima visita.

> **Tip:** La documentación puede estar en los mismos idiomas; si cambiás de idioma, fijate si la URL o la barra lateral de docs se actualizan (ej. `/docs/en/` vs `/docs/es/`).

---

## Resumen

1. **Elegí tu vista** (Mi / Manager / 1:1 / Admin) desde la barra lateral o el selector de vista.
2. **Usá la barra lateral** para abrir la sección que necesites; colapsala cuando quieras más espacio en pantalla.
3. **Usá Cmd+K (o Ctrl+K)** para buscar y saltar a personas, documentación o acciones.
4. **Configurá tema e idioma** desde el encabezado o la configuración para que la app se adapte a tus preferencias.

Como siguiente paso, completá [Configuración del perfil](/docs/es/getting-started/profile-setup) para que tu identidad y preferencias queden bien configuradas en toda la plataforma.
