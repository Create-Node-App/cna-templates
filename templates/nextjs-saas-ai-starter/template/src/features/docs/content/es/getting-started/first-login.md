---
title: Primer inicio de sesión
description: Cómo iniciar sesión en Next.js SaaS AI Template con Auth0 (SSO o email), elegir un tenant y orientarte en tu primera visita.
section: getting-started
order: 2
---

# Primer inicio de sesión

Esta guía te lleva paso a paso por el primer inicio de sesión en Next.js SaaS AI Template, la selección de tu organización (tenant) y cómo aprovechar al máximo tu primera experiencia en el dashboard.

---

## Iniciar sesión con Auth0

Next.js SaaS AI Template usa **Auth0** para la autenticación. Podés iniciar sesión con:

- **Single sign-on (SSO)** — Si tu organización usa SSO (ej. Google Workspace, Microsoft Azure AD), usá la opción que te indique el admin. Puede que te redirijan a la página de login de tu empresa.
- **Email y contraseña** — Si tu tenant lo permite, podés registrarte o iniciar sesión con email.
- **Conexiones sociales o empresariales** — Según la configuración del tenant, pueden estar disponibles opciones como Google, GitHub o LinkedIn.

### Pasos para iniciar sesión

1. Abrí la URL de Next.js SaaS AI Template que te dio tu organización (ej. `https://your-tenant.saas-template.app` o el dominio personalizado de tu empresa).
2. Hacé clic en **Iniciar sesión** (o **Entrar**).
3. Elegí el método de inicio de sesión que te ofrezcan (SSO, email o red social).
4. Completá el flujo de Auth0 (ingresá credenciales, aprobá MFA si se requiere).
5. Después de autenticarte, te redirigen de vuelta a Next.js SaaS AI Template.

> **Tip:** Si no ves la opción de inicio de sesión que esperás, tu tenant puede tener solo SSO o conexiones específicas habilitadas. Contactá a tu admin de Next.js SaaS AI Template o a IT por el método correcto.

---

## Selección de tenant (varias organizaciones)

Si pertenecés a **más de una organización** (tenant) en Next.js SaaS AI Template, después del login tenés que elegir en cuál trabajar.

- Puede que veas un **selector de tenant** o una **pantalla de selección de tenant** con la lista de tus organizaciones.
- Seleccioná el tenant en el que querés trabajar. La app cargará los datos de ese tenant: miembros, habilidades, proyectos y configuración.
- Más tarde podés cambiar de tenant desde el encabezado o el menú de cuenta sin cerrar sesión.

Si tenés un solo tenant, este paso puede omitirse y vas directo al dashboard.

---

## Primera experiencia en el dashboard

Después de iniciar sesión y elegir un tenant (si aplica), llegás a tu **dashboard**. Lo que ves depende de tu rol:

- **Miembros** ven **Mi vista**: un dashboard personal con enlaces rápidos a perfil, habilidades, OKRs, aprendizaje, desempeño y más.
- **Managers** también pueden ver **Vista Manager**: resumen de equipo, reportes y acciones específicas del manager.
- **Facilitadores 1:1** pueden abrir **Vista 1:1**: la lista de personas con las que tienen 1:1s y las reuniones relacionadas.
- **Admins** pueden acceder a **Vista Admin**: configuración, miembros, habilidades y ajustes del tenant.

En el primer login puede que veas:

- Secciones vacías o placeholder hasta que completes la configuración del perfil y empieces a usar las funciones.
- Sugerencias u tooltips de onboarding (si tu tenant los tiene habilitados).
- Notificaciones o tareas (ej. "Completá tu perfil", "Definí tu primer OKR").

> **Tip:** Dedicale unos minutos a [Configuración del perfil](/docs/es/getting-started/profile-setup) para que tu nombre, cargo y preferencias estén bien. Después explorá [Navegación y vistas](/docs/es/getting-started/navigation) para saber dónde está cada cosa.

---

## Consejos para empezar

1. **Completá tu perfil** — Agregá nombre, cargo, bio, zona horaria y (opcional) GitHub/LinkedIn. Así te encuentran mejor en el Buscador de personas y mejoran las sugerencias de IA.
2. **Elegí tu vista** — Usá la barra lateral o el selector de vista para pasar entre Mi vista, Vista Manager, Vista 1:1 y Vista Admin (si tenés acceso). Cada vista tiene su propio menú.
3. **Usá la búsqueda global** — Pulsá **Cmd+K** (Mac) o **Ctrl+K** (Windows/Linux) para buscar entre personas, documentación y acciones.
4. **Configurá idioma y tema** — Usá el selector de idioma para inglés/español y el interruptor de tema para modo claro/oscuro si tu tenant los soporta.
5. **Guardá la documentación** — Tené a mano [Bienvenido a Next.js SaaS AI Template](/docs/es/getting-started) y las guías por rol para consultar mientras explorás.

Si tenés problemas con el login (tenant incorrecto, SSO faltante, cuenta bloqueada), contactá a tu **administrador de Next.js SaaS AI Template** o al soporte de IT de tu organización.

---

## Seguridad y sesiones

- **Duración de la sesión** — Cuánto tiempo permanecés logueado depende de la configuración de Auth0 y Next.js SaaS AI Template de tu tenant. Puede pedírsete iniciar sesión de nuevo tras un tiempo de inactividad o tras un plazo fijo.
- **Cerrar sesión** — Usá el menú de cuenta (tu avatar o nombre en el encabezado) y elegí **Cerrar sesión**. Vas a tener que iniciar sesión de nuevo para acceder a Next.js SaaS AI Template.
- **Varios dispositivos** — Podés usar Next.js SaaS AI Template en más de un dispositivo. Cada sesión sigue las mismas reglas de seguridad y timeout. Cerrá sesión en dispositivos compartidos cuando termines.
- **Contraseña y MFA** — Los cambios de contraseña y la autenticación multifactor se gestionan en Auth0 (o tu proveedor SSO). Si necesitás restablecer la contraseña o actualizar MFA, usá el enlace de la página de login o contactá a IT o a tu admin de Next.js SaaS AI Template.
