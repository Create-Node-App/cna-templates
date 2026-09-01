---
title: Miembros e invitaciones
description: Agregar y quitar miembros, generar links de invitación con roles, gestionar estado de miembros y vencimiento de invitaciones.
section: admin
order: 2
---

# Miembros e invitaciones

Los admins gestionan **quién está en el tenant** y **cómo entran**. Podés agregar miembros directamente, enviar invitaciones con un rol elegido y controlar el vencimiento de invitaciones y el estado de los miembros.

## Agregar miembros

Podés agregar miembros de dos formas principales:

1. **Invitación** — Enviar un link o email de invitación; la persona acepta y se agrega con el rol que elegiste.
2. **Alta directa / importación** — Crear la membresía vos mismo (p. ej. después de importación masiva o SSO). La persona puede seguir teniendo que completar la configuración del perfil.

### Enviar una invitación

1. Andá a **Admin** → **Miembros** (o **Invitaciones**).
2. Hacé clic en **Invitar miembro** (o **Crear invitación**).
3. **Ingresá el email** (y opcionalmente el nombre).
4. **Elegí un rol** — Seleccioná el/los rol(es) que tendrá la persona al aceptar (p. ej. Member, Manager, 1:1er). Esto define sus permisos iniciales.
5. **Definí el vencimiento** (si tu tenant lo soporta) — p. ej. 7 o 30 días. Después, el link puede dejar de funcionar y puede que tengas que reenviar.
6. Generá el link o enviá el email. Compartí el link de invitación con la persona (o lo recibe por email si está configurado).

> **Tip:** Usá roles que coincidan con el trabajo de la persona: p. ej. "Member" para la mayoría, "Manager" o "1:1er" solo cuando necesiten esos permisos.

## Links de invitación y roles

- **Link de invitación** — Una URL única que, al abrirse (y tras iniciar sesión o registrarse), crea o actualiza la membresía de la persona en el tenant con los **rol(es)** que seleccionaste.
- **Roles** — Vienen de los roles del tenant (roles del sistema como Member, Manager, Admin, 1:1er, Referente, más roles personalizados). La invitación guarda el **ID de rol** elegido; al aceptar, ese rol se asigna en `tenant_membership_roles`.

Una persona puede tener **varios roles** después de entrar; podés cambiar roles después desde la lista de Miembros.

## Gestionar estado de miembros

Desde la lista de **Miembros** podés:

- **Ver** todos los miembros del tenant, sus roles y estado (activo, inactivo, etc. si tu tenant lo soporta).
- **Editar roles** — Agregar o quitar roles de un miembro (selección múltiple de roles del tenant). Los permisos efectivos son la unión de todos sus roles.
- **Desactivar o quitar** — Según la config del tenant, podés desactivar un miembro (pierde acceso) o quitarlo del tenant.

Los cambios de roles se aplican en la próxima solicitud; el miembro puede necesitar refrescar o volver a iniciar sesión para ver menús y permisos actualizados.

## Vencimiento de invitaciones

Si el **vencimiento de invitaciones** está habilitado:

- Cada invitación tiene una **fecha de validez**. Después de esa fecha, el link puede mostrar un error o pedir una nueva invitación.
- Podés **reenviar** o **regenerar** una invitación desde la lista de Invitaciones si venció.
- Un vencimiento más corto (p. ej. 7 días) mejora la seguridad; uno más largo (p. ej. 30 días) es más cómodo para el onboarding.

## Paso a paso: invitar un nuevo miembro del equipo

1. Andá a **Admin** → **Miembros** → **Invitaciones** (o **Invitar miembro**).
2. Ingresá el **email** de la persona y seleccioná **rol(es)** (p. ej. Member).
3. Definí el **vencimiento** si es obligatorio.
4. Hacé clic en **Enviar** o **Generar link**. Copiá el link si tenés que compartirlo manualmente.
5. La persona abre el link, inicia sesión (o se registra) y acepta. Ahora es miembro con el/los rol(es) elegido(s).
6. Opcionalmente andá a **Miembros**, buscala y agregá más roles (p. ej. 1:1er) o ajustá según necesites.

> **Tip:** Revisá la lista de Invitaciones por invitaciones pendientes o vencidas y reenviá o extendé según haga falta para que los nuevos no queden bloqueados.
