# Creación de plantillas y extensiones

## Estructura del directorio de plantilla

```
my-template/
├── package/
│   ├── index.js           # Requerido: exporta una función que devuelve package.json
│   ├── dependencies.js    # module.exports = { "lib": "^1.0.0" }
│   └── devDependencies.js
├── [src]/                 # Se renombra según la customOption `srcDir`
│   └── App.tsx.template   # Se procesa con EJS
├── vite.config.ts.template
└── .gitignore             # Estático: se copia tal cual
```

## `package/index.js`

Exporta una función que recibe el contexto del usuario y devuelve el
`package.json` completo:

```js
const dependencies = require("./dependencies");
const devDependencies = require("./devDependencies");

module.exports = function resolvePackage(setup, { appName, runCommand, usePnpm }) {
  return {
    name: appName,
    version: "0.1.0",
    scripts: { dev: "vite", build: "tsc && vite build" },
    dependencies,
    devDependencies,
  };
};
```

Parámetros disponibles: `appName`, `runCommand`, `installCommand`, `usePnpm`.

## Convenciones de nombres de archivo

| Sufijo | Comportamiento |
|---|---|
| `.template` | Se procesa con EJS y se elimina el sufijo del nombre de salida |
| `.append` | El contenido se agrega al archivo equivalente que ya existe en el proyecto |
| `.if-pnpm` | Solo se incluye cuando el usuario elige pnpm; se elimina el sufijo |
| `[name]/` | El directorio se renombra al valor de la customOption `name` |

## Variables EJS

Todos los archivos `.template` usan la sintaxis `<%= variableName %>`.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `<%= projectName %>` | Nombre del proyecto que introduce el usuario | `my-app` |
| `<%= srcDir %>` | Directorio de origen (desde customOption) | `src` |
| `<%= projectImportPath %>` | Alias de importación (desde customOption) | `@/` |
| `<%= scope %>` | Alcance del paquete en un monorepo | `@my-org/` |
| `<%= installCommand %>` | Comando completo de instalación | `npm install` |
| `<%= runCommand %>` | Comando para ejecutar scripts | `npm run` |

## Estructura de extensiones

Las extensiones son más simples: solo agregan archivos y dependencias.

**Patrón más habitual** — un `package.json` sencillo con dependencias para fusionar:

```json
{ "devDependencies": { "husky": "^9.0.0" } }
```

Todo lo demás en el directorio de la extensión se copia al proyecto,
respetando las convenciones de sufijos descritas arriba.

## `customOptions` — Prompts interactivos

Solo las plantillas pueden definirlos. Se convierten en variables EJS y controlan
el renombrado de directorios entre corchetes.

Se definen en `cna.config.json`, en la raíz del directorio de la plantilla:

```json
{
  "customOptions": [
    {
      "name": "srcDir",
      "type": "text",
      "message": "Source directory (e.g. `src`). Leave blank for root.",
      "initial": "src"
    }
  ]
}
```

| Campo | Descripción |
|---|---|
| `name` | Se usa como `<%= name %>` en las plantillas y coincide con los directorios `[name]/` |
| `type` | Tipo de prompt (`"text"` es el estándar) |
| `message` | Pregunta que se muestra en la CLI |
| `initial` | Valor por defecto (se usa automáticamente en modo no interactivo / CI) |
| `required` | Opcional. El valor por defecto es true |

> `cna.config.json` vive junto a la plantilla para funcionar tanto con
> resolución por slug como con URLs locales `file://`.
> No pongas `customOptions` en `templates.json`; ya no se leen desde ahí.

## Madurez de plantilla

Antes de fusionar un starter nuevo o muy modificado, cumple el nivel
**M1 mature scaffold** documentado en
[MAINTENANCE_TEMPLATES.md §11](./MAINTENANCE_TEMPLATES.md#11-template-maturity-m1--m2--m3).

En resumen:

- Prefiere `package/index.js` sobre un `package.json` estático, salvo que
  quieras publicar un paquete estático a propósito (por ejemplo, showcases
  estilo Next.js con lockfile).
- Incluye una suite real de `docs/`; nunca enlaces landings o READMEs a docs
  que no existen.
- Los scripts `lint` / `test` deben hacer trabajo real (u omitirse): nada de
  stubs con `echo` ni scripts falsos en READMEs.
- Usa `react-vite-starter` / `nextjs-starter` como referencia; no trates
  `nextjs-saas-ai-starter` como el alcance por defecto.
