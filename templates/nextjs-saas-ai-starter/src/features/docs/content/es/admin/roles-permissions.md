---
title: Roles y permisos
description: Roles del sistema (Member, Manager, Admin, 1:1er, Referente), roles personalizados, asignar permisos y el modelo PBAC.
section: admin
order: 7
---

# Roles y permisos

Next.js SaaS AI Template usa un modelo **basado en permisos** (PBAC): el acceso se determina por **permisos**, no por cargo. Los **roles** son conjuntos de permisos; una persona puede tener **varios roles** por tenant, y sus permisos efectivos son la **unión** de los permisos de todos esos roles.

## Roles del sistema

Estos roles suelen estar disponibles en cada tenant:

| Rol           | Uso típico                                     | Permisos principales (ejemplos)                                                                                                                  |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Member**    | Por defecto para la mayoría de usuarios        | profile, self_assess, knowledge, assistant                                                                                                       |
| **Manager**   | Personas con reportes directos                 | member + team, reports, manager:dashboard, manager:team, manager:assignments, manager:performance_assessments, manager:okrs, etc.                |
| **Admin**     | Configuración completa del tenant              | manager + todos admin:_ y a menudo todos one_on_one:_                                                                                            |
| **1:1er**     | Facilitadores 1:1 (no necesariamente managers) | member + one_on_one:dashboard, one_on_one:meetings, one_on_one:feedback, one_on_one:performance_read, one_on_one:projects_read, one_on_one:notes |
| **Referente** | Expertos en la materia que asignan aprendizaje | member + instructor:assign_learning (pueden asignar aprendizaje a cualquiera en el tenant)                                                       |

**Manager** y **1:1er** son **distintos**: un facilitador 1:1 no tiene que ser el manager de la persona. Los permisos definen qué podés hacer; las relaciones de persona (manager, one_to_one) definen con quién.

## Roles personalizados

Si tu tenant tiene **roles personalizados** habilitados (feature flag `allowCustomRoles`):

1. Andá a **Admin** → **Roles y permisos**.
2. Hacé clic en **Crear rol** (o **Agregar rol**).
3. Ingresá **nombre** y **descripción** opcional.
4. **Asigná permisos** — Seleccioná los permisos que debe otorgar este rol (p. ej. un rol "Mentor" con solo one_on_one:meetings y one_on_one:notes).
5. Guardá. El nuevo rol aparece en la lista de roles y puede asignarse a miembros e invitaciones.

Cuando los roles personalizados están **deshabilitados**, solo existen los roles del sistema; el botón "Crear rol" está oculto, pero igual podés editar permisos de roles existentes.

## Asignar permisos a un rol

- Abrí **Admin** → **Roles y permisos** y seleccioná un **rol** (del sistema o personalizado).
- Vas a ver una lista de **permisos** (a menudo agrupados por categoría: profile, manager, one_on_one, admin, etc.).
- **Marcá** los permisos que debe otorgar este rol. Guardá.
- Cualquiera que tenga este rol (solo o con otros) tendrá la unión de todos los permisos de todos sus roles.

> **Tip:** Preferí otorgar el conjunto mínimo de permisos necesario para el rol. Siempre podés agregar más después; evitá dar permisos de admin a grupos amplios.

## Asignar roles a miembros

- Andá a **Admin** → **Miembros** y abrí un miembro.
- **Roles** — Seleccioná uno o más roles (selección múltiple). Los permisos efectivos del miembro son la unión de todos los roles seleccionados.
- Guardá. Los cambios se aplican en la próxima solicitud; el miembro puede necesitar refrescar o volver a iniciar sesión para ver menús y acceso actualizados.

## Resumen del modelo PBAC

| Concepto         | Significado                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Permiso**      | Un derecho puntual (p. ej. `manager:dashboard`, `admin:skills`). Las comprobaciones de autorización usan claves de permiso.           |
| **Rol**          | Un conjunto nombrado de permisos. Se usa por conveniencia y claridad.                                                                 |
| **Miembro**      | Puede tener **varios roles** por tenant. Permisos efectivos = unión de permisos de todos los roles.                                   |
| **Autorización** | Siempre por permiso: "¿Este usuario puede hacer X?" → comprobar `hasPermission(tenant, permissionKey)`. Nunca solo por nombre de rol. |

Los admins gestionan **roles** y **permisos** en Admin → Roles y permisos; asignan **roles** a miembros e invitaciones. El sistema siempre resuelve el acceso por **permisos** en la base de datos.
