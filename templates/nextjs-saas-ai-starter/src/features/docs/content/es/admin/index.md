---
title: Guía de Admin — Resumen
description: Responsabilidades del admin, dashboard y permisos de admin en Next.js SaaS AI Template.
section: admin
order: 1
---

# Guía de Admin — Resumen

Los **admins** de Next.js SaaS AI Template configuran la plataforma para su organización: miembros, habilidades, capacidades, roles, configuración, integraciones y más. Esta guía cubre qué pueden hacer los admins y cómo acceder al área Admin.

## Responsabilidades del admin

| Área                          | Qué hacen los admins                                                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Miembros e invitaciones**   | Agregar y quitar miembros, generar links de invitación con roles, gestionar estado de miembros y vencimiento de invitaciones                               |
| **Gestión de habilidades**    | Crear, editar y archivar habilidades; gestionar categorías; manejar verificación y habilidades extraídas de CV; fusionar duplicados                        |
| **Capacidades**               | Definir capacidades y requisitos de habilidades (nivel mínimo, obligatorio vs. deseable); búsqueda por capacidad                                           |
| **Perfiles de rol**           | Crear descripciones de roles como documentos de conocimiento; vincular competencias y responsabilidades; rutas de carrera                                  |
| **Entrenamientos y roadmaps** | Crear contenido de entrenamiento; usar el editor visual de roadmaps (arrastrar y soltar); publicar/archivar; vincular a habilidades                        |
| **Roles y permisos**          | Gestionar roles del sistema y personalizados; asignar permisos; configurar PBAC (acceso basado en permisos)                                                |
| **Configuración**             | Feature flags, branding (logo, colores), config de proveedor de IA, escalas de habilidades, categorías, almacenamiento                                     |
| **Integraciones**             | Configurar GitHub (activo), Webhooks (activo), LinkedIn, Slack, Google Workspace, GitLab (próximos); OAuth y mapeo de datos |
| **Analíticas y auditoría**    | Ver dashboard de analíticas de admin y registro de auditoría; filtrar por tipo de evento                                                                   |
| **Onboarding e importación**  | Dar de alta nuevas personas (p. ej. subida de CV); procesamiento de CV con IA y extracción de habilidades; importación masiva                              |
| **Reconocimientos**           | Gestionar categorías de reconocimiento; habilitar/deshabilitar; ver todos los reconocimientos                                                              |
| **Ciclos de Revisión 360**    | Crear y gestionar ciclos de revisión 360; agregar participantes; lanzar, cerrar, cancelar ciclos; aprobar nominaciones de pares; seguir progreso           |

## Dashboard de Admin

El **Dashboard de Admin** es la página de llegada cuando abrís la sección Admin. Suele mostrar:

- **Resumen del tenant** — Nombre, cantidad de miembros, resumen de configuración clave
- **Enlaces rápidos** a Miembros, Configuración, Habilidades, Invitaciones y otras áreas de admin
- **Actividad reciente o alertas** — p. ej. invitaciones pendientes, sincronizaciones fallidas o ítems que requieren atención

Usalo como punto de partida cada vez que trabajes en Admin.

## Permisos de admin

El acceso a las funciones de admin es **basado en permisos** (PBAC). Los admins tienen permisos como:

| Categoría de permiso        | Ejemplos                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Dashboard**               | `admin:dashboard` — Ver el área de admin                                                                       |
| **Miembros e invitaciones** | `admin:members`, `admin:invites` — Gestionar miembros e invitaciones                                           |
| **Contenido**               | `admin:skills`, `admin:capabilities`, `admin:role_profiles`, `admin:trainings`, `admin:roadmaps`               |
| **Sistema**                 | `admin:roles` — Roles y permisos; `admin:settings` — Configuración del tenant                                  |
| **Integraciones y datos**   | Integraciones y webhooks (suelen estar en configuración o un área dedicada)                                    |
| **Auditoría y onboarding**  | `admin:audit`, `admin:onboard`, `admin:processing` — Registro de auditoría, onboarding, procesamiento          |
| **Otros**                   | `admin:okrs`, `admin:recognitions`, `admin:review_cycles` — Admin de OKR, reconocimientos y ciclos de revisión |

Solo ves ítems de menú y páginas para los que tenés el permiso correspondiente. Si no ves algo, pedile a un admin senior que asigne el rol o permiso correcto.

## Cómo acceder al área Admin

1. Iniciá sesión en Next.js SaaS AI Template y abrí la navegación principal.
2. Andá a **Admin** (o la etiqueta equivalente de tu tenant).
3. Vas a llegar al Dashboard de Admin. Usá la barra lateral para abrir Miembros, Habilidades, Configuración y otras secciones.

Solo los usuarios con al menos un permiso de admin (p. ej. `admin:dashboard`) ven la sección Admin.

## Enlaces rápidos

- [Miembros e invitaciones](/docs/admin/members-invitations)
- [Gestión de habilidades](/docs/admin/skills-management)
- [Capacidades](/docs/admin/capabilities)
- [Perfiles de rol](/docs/admin/role-profiles)
- [Entrenamientos y roadmaps](/docs/admin/trainings-roadmaps)
- [Roles y permisos](/docs/admin/roles-permissions)
- [Configuración](/docs/admin/settings)
- [Integraciones](/docs/admin/integrations)
- [Analíticas y auditoría](/docs/admin/analytics-audit)
- [Onboarding e importación](/docs/admin/onboarding-import)
- [Reconocimientos](/docs/admin/recognitions)
- [Ciclos de Revisión 360](/docs/admin/review-cycles)

> **Tip:** Empezá con Miembros e invitaciones y Configuración para asegurar que tu tenant y las personas estén configurados; después configurá Habilidades y Capacidades para que el resto de la plataforma tenga una base sólida.
