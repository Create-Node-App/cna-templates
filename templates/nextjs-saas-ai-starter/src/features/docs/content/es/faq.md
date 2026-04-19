---
title: Preguntas frecuentes
description: Preguntas comunes sobre la plataforma — restablecer contraseña, roles, integraciones, funciones con IA, exportación de datos y cómo obtener ayuda.
section: faq
order: 1
---

# Preguntas frecuentes

Respuestas a preguntas comunes. Para guías por rol, consultá [Miembro](/docs/member) y [Admin](/docs/admin).

## ¿Cómo restablezco mi contraseña?

- Si tu tenant usa **login con email/contraseña**: Usá el link **¿Olvidaste tu contraseña?** en la página de inicio de sesión. Ingresá tu email; vas a recibir un link para definir una nueva contraseña. El link puede vencer después de un tiempo (p. ej. 1 hora).
- Si iniciás sesión con **SSO** (p. ej. Google, Microsoft): Tu contraseña la gestiona tu proveedor de identidad. Usá el flujo de restablecimiento de contraseña de ese proveedor (p. ej. el IT de tu empresa o la recuperación de cuenta de Google).
- Si no recibís el email: Revisá spam y después pedile a tu **admin** que confirme tu email en el tenant y reenvíe el restablecimiento.

## ¿Cómo funcionan los roles?

La plataforma usa **permisos**, no cargos. Los **roles** (p. ej. Member, Manager, Admin) son conjuntos de **permisos**. Lo que podés hacer lo determinan los **permisos** que tenés.

- Podés tener **varios roles** en un tenant. Tu acceso efectivo es la **unión** de todos los permisos de todos tus roles.
- Solo los **admins** pueden asignar o cambiar roles (Admin → Miembros). Si no ves una sección, es probable que no tengas el rol/permisos correctos — pedile a tu admin.

> **Tip:** La autorización siempre es por clave de permiso (p. ej. `admin:dashboard`, `admin:members`). Los nombres de roles son solo para mostrar y agrupar.

## ¿Cómo conecto integraciones?

- **Para el tenant**: Los **admins** configuran integraciones en **Admin** → **Integraciones**: webhooks, apps OAuth, API keys y mapeo de datos. Si una integración no está disponible, tu admin puede tener que habilitarla o agregar credenciales. Ver [Integraciones](/docs/admin/integrations) para más detalles.

## ¿Cómo funcionan las funciones con IA?

La plataforma puede usar IA para:

- **Asistente con IA** — Chat y recomendaciones (si está habilitado). Usa el proveedor y modelo de IA configurados para el tenant.
- **Búsqueda semántica** — Búsqueda de contenido potenciada por IA usando embeddings para coincidencia por significado.

Los admins definen el **proveedor y modelo de IA** en **Admin** → **Configuración**. Los datos enviados al proveedor dependen de la función. Revisá las políticas de privacidad y procesamiento de datos de tu tenant.

## ¿Cómo exporto datos?

- **Tus propios datos**: Usá **Perfil** o **Configuración** para opciones de exportación de datos de la cuenta.
- **Admins**: **Admin** → **Configuración** puede ofrecer exportaciones para analíticas o registros de auditoría.

Si no ves una opción de exportación, tu rol puede no tener permiso o la función puede no estar habilitada — pedile a tu admin.

## ¿Cómo obtengo ayuda?

- **En la app**: Usá el link **Ayuda** o **Docs** (suele estar en el encabezado o pie) para abrir esta documentación.
- **Tu admin**: Para acceso, roles, invitaciones o comportamiento específico del tenant, contactá a tu **admin del tenant** o a IT.
- **Soporte**: Si tu organización tiene un canal de soporte, usalo para bugs, caídas o problemas de cuenta.

> **Tip:** Agregá [Docs](/docs) a favoritos y usá la barra lateral para ir a tu rol (Miembro, Admin) para guías paso a paso.
