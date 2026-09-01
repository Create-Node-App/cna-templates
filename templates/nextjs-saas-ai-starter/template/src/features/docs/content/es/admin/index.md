---
title: Guía de Admin — Resumen
description: Responsabilidades del admin, dashboard y permisos de admin.
section: admin
order: 1
---

# Guía de Admin — Resumen

Los **admins** configuran la plataforma para su organización: miembros, roles, configuración, integraciones y más. Esta guía cubre qué pueden hacer los admins y cómo acceder al área Admin.

## Responsabilidades del admin

| Área                        | Qué hacen los admins                                                               |
| --------------------------- | ---------------------------------------------------------------------------------- |
| **Miembros e invitaciones** | Agregar y quitar miembros, generar links de invitación con roles, gestionar estado |
| **Roles y permisos**        | Gestionar roles del sistema y personalizados; asignar permisos; configurar PBAC    |
| **Configuración**           | Feature flags, branding (colores, tipografía), config de proveedor de IA, storage  |
| **Integraciones**           | Configurar Webhooks, sincronización con sistemas externos, OAuth y mapeo de datos  |

## Dashboard de Admin

El **Dashboard de Admin** es la página de llegada cuando abrís la sección Admin. Suele mostrar:

- **Resumen del tenant** — Nombre, cantidad de miembros, resumen de configuración clave
- **Enlaces rápidos** a Miembros, Configuración y otras áreas de admin
- **Actividad reciente o alertas** — p. ej. invitaciones pendientes o ítems que requieren atención

Usalo como punto de partida cada vez que trabajes en Admin.

## Permisos de admin

El acceso a las funciones de admin es **basado en permisos** (PBAC). Los admins tienen permisos como:

| Categoría de permiso        | Ejemplos                                                             |
| --------------------------- | -------------------------------------------------------------------- |
| **Dashboard**               | `admin:dashboard` — Ver el área de admin                             |
| **Miembros e invitaciones** | `admin:members`, `admin:invites` — Gestionar miembros e invitaciones |
| **Sistema**                 | `admin:roles` — Roles y permisos; `admin:settings` — Configuración   |
| **Integraciones y datos**   | Configuración de integraciones y webhooks                            |

Solo ves ítems de menú y páginas para los que tenés el permiso correspondiente. Si no ves algo, pedile a un admin senior que asigne el rol o permiso correcto.

## Cómo acceder al área Admin

1. Iniciá sesión y abrí la navegación principal.
2. Andá a **Admin** (o la etiqueta equivalente de tu tenant).
3. Vas a llegar al Dashboard de Admin. Usá la barra lateral para abrir Miembros, Configuración y otras secciones.

Solo los usuarios con al menos un permiso de admin (p. ej. `admin:dashboard`) ven la sección Admin.

## Enlaces rápidos

- [Miembros e invitaciones](/docs/admin/members-invitations)
- [Roles y permisos](/docs/admin/roles-permissions)
- [Configuración](/docs/admin/settings)
- [Integraciones](/docs/admin/integrations)

> **Tip:** Empezá con Miembros e invitaciones y Configuración para asegurar que tu tenant y las personas estén configurados correctamente.
