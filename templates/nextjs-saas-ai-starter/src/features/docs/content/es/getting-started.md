---
title: Bienvenido a Next.js SaaS AI Template
description: Visión general de la plataforma — SaaS multi-tenant con asistencia de IA, RBAC e integraciones. Conceptos clave, roles de usuario y enlaces a las guías.
section: getting-started
order: 1
---

# Bienvenido a Next.js SaaS AI Template

Next.js SaaS AI Template es un **starter multi-tenant para SaaS** con asistencia de IA, control de acceso basado en roles e integraciones incorporadas. Ayuda a equipos a colaborar, gestionar miembros y aprovechar IA — todo con aislamiento de datos por tenant y permisos adecuados.

Esta guía presenta la plataforma, los conceptos clave, los roles de usuario y los próximos pasos.

---

## Qué hace esta plataforma

El template provee tres pilares fundacionales:

- **Organización multi-tenant** — Cada tenant (organización) tiene sus propios miembros, roles, departamentos y configuración. Los datos están completamente aislados entre tenants.
- **Asistencia potenciada por IA** — Un asistente de IA integrado que puede responder preguntas, buscar contenido semánticamente y dar recomendaciones. Configurable por tenant.
- **Integraciones y automatización** — Webhooks, motor de sincronización y conectividad con sistemas externos para construir flujos de trabajo a medida.

> **Tip:** Esta es una plataforma **basada en tenants**. Tu organización (tenant) tiene sus propios miembros, configuración y datos. Si pertenecés a varias organizaciones, podés cambiar entre ellas desde la app.

---

## Conceptos clave

| Concepto            | Qué significa                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------- |
| **Tenant**          | Tu organización. Cada tenant tiene sus propios miembros, roles y configuración.             |
| **Persona**         | Un miembro dentro de un tenant — contiene información de perfil, departamento y relaciones. |
| **Rol**             | Define permisos: qué podés ver y hacer (member, manager, admin).                            |
| **Asistente de IA** | IA conversacional integrada para preguntas, búsqueda y orientación.                         |
| **Integraciones**   | Conexiones a sistemas externos vía webhooks y motor de sincronización.                      |

Entender estos conceptos ayuda a navegar las guías de Miembro y Admin.

---

## Roles de usuario

Tu experiencia depende de tu **rol** (y permisos) en el tenant. Los roles son independientes del cargo; definen qué podés ver y hacer.

| Rol         | Para quién                 | Qué tenés                                                                                |
| ----------- | -------------------------- | ---------------------------------------------------------------------------------------- |
| **Miembro** | Todos                      | Tu perfil, dashboard, asistente de IA y acceso a recursos compartidos.                   |
| **Manager** | Quienes gestionan equipos  | Todo lo de Miembro, más visibilidad y capacidades de gestión de equipo.                  |
| **Admin**   | Administradores del tenant | Acceso completo: miembros, invitaciones, roles, permisos, configuración e integraciones. |

---

## Enlaces rápidos a las guías

Según tu rol, empezá por acá:

- **¿Nuevo en la plataforma?** → [Primer inicio de sesión](/docs/es/getting-started/first-login) y [Navegación](/docs/es/getting-started/navigation).
- **Configurar tu perfil** → [Configuración del perfil](/docs/es/getting-started/profile-setup).
- **Miembro** → Guía Miembro: dashboard, configuración del perfil y asistente de IA.
- **Admin** → Guía Admin: miembros, roles, configuración e integraciones.

Usá la **barra lateral de docs** o la **búsqueda** para ir a cualquier tema.

---

## Por qué este template

Este template está diseñado como una base sólida para tu SaaS:

- **Multi-tenancy desde el día uno** — Aislamiento de datos apropiado, configuración por tenant y arquitectura escalable.
- **IA nativa** — Infraestructura de asistente de IA lista para tus casos de uso específicos de dominio.
- **Permisos bien hechos** — RBAC con permisos granulares, no solo verificaciones de rol.
- **Listo para integraciones** — Infraestructura de webhooks y motor de sincronización para conectar con sistemas externos.

Si tenés feedback o preguntas, usá el canal de soporte habitual de tu tenant o contactá a tu admin.
