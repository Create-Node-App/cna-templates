---
title: Integraciones
description: GitHub, LinkedIn, Slack, Google Workspace, GitLab, webhooks — configuración OAuth, sincronización y mapeo de datos.
section: admin
order: 9
---

# Integraciones

Next.js SaaS AI Template puede conectarse con sistemas externos para sincronizar personas, habilidades o actividad y enriquecer perfiles. Los admins configuran **integraciones** (OAuth, API keys, webhooks) y **mapeo de datos** para que la información correcta entre y salga.

## Integraciones soportadas (resumen)

| Integración          | Estado      | Uso típico                                                                          |
| -------------------- | ----------- | ----------------------------------------------------------------------------------- |
| **GitHub**           | ✅ Activa   | Vincular perfiles a GitHub; sincronizar repos, actividad o habilidades desde código |
| **Webhooks**         | ✅ Activa   | Eventos salientes (p. ej. persona actualizada, assessment enviado)                  |
| **LinkedIn**         | 🔜 Próximo  | Importar perfil o habilidades desde LinkedIn                                        |
| **Slack**            | 🔜 Próximo  | Notificaciones, bot o vinculación de identidad                                      |
| **Google Workspace** | 🔜 Próximo  | Identidad, calendario o sincronización de directorio                                |
| **GitLab**           | 🔜 Próximo  | Similar a GitHub — repos, actividad, habilidades                                    |

Usá **Admin** → **Integraciones** para ver cuáles están habilitadas.

## Integración con GitHub (Activa)

GitHub es la integración activa principal. Una vez configurada:

1. **Creá una OAuth App** en GitHub → Developer Settings. Obtené **Client ID** y **Client Secret**.
2. **Configurá la redirect URI** — usá la URL que aparece en Admin → Integraciones → GitHub.
3. En **Admin** → **Integraciones** → **GitHub**, ingresá las credenciales y guardá.
4. Los miembros pueden conectar su cuenta de GitHub desde la configuración de su perfil.

En cada sincronización, Next.js SaaS AI Template **crea automáticamente un registro de evidencia** en el perfil de la persona con repos escaneados, lenguajes encontrados, habilidades inferidas y contribuciones.

## Webhooks (Activos — Salientes)

Los **Webhooks** envían eventos desde Next.js SaaS AI Template a tu sistema (p. ej. "person created", "assessment submitted"):

1. **Admin** → **Integraciones** → **Webhooks**.
2. **Agregar webhook** — URL, secret opcional para firmar payloads y **event types** a los que suscribirse.
3. Guardá. Next.js SaaS AI Template enviará un payload JSON por POST a tu URL en cada evento seleccionado. Implementá idempotencia y verificá la firma.

## Configuración OAuth (para integraciones próximas)

Para integraciones que usan **OAuth** (LinkedIn, Slack, Google Workspace, GitLab):

1. **Creá una app** en el portal de desarrolladores del proveedor. Obtené **Client ID** y **Client Secret**.
2. **Configurá la redirect URI** — usá la URL que Next.js SaaS AI Template te indica. Debe coincidir exactamente.
3. En **Admin** → **Integraciones**, seleccioná la integración e ingresá las credenciales.
4. Los miembros autorizan mediante la pantalla de consentimiento del proveedor.

> **Tip:** Usá una app OAuth dedicada por ambiente (dev vs prod) y rotá los secrets si se exponen.

## Búsqueda semántica y embeddings

Las sincronizaciones de integraciones contribuyen a la **búsqueda semántica** (People Finder, AI Assistant):

- Las **nuevas habilidades** del sync de GitHub obtienen embeddings para búsqueda de habilidades.
- Los **perfiles actualizados** regeneran su embedding para que People Finder esté al día.
- Las **importaciones masivas** (habilidades, capacidades, personas) también generan embeddings automáticamente.
