# Architecture

## How the System Works

A user runs:

```sh
npx create-awesome-node-app --template <slug> --addons <ext1> <ext2>
```

CNA resolves each slug to a `url` in `templates.json`, downloads the directories, merges them, and writes the final project to disk. The merge order is: base template files → each extension in order.

## `templates.json` Structure

Three top-level keys: `categories`, `templates`, `extensions`.

Every template and extension requires: `name`, `slug`, `description`, `url`, `type`, `category`, `labels`.
Templates may also have `customOptions` (interactive CLI prompts — see [AUTHORING.md](./AUTHORING.md)).

## The Type System

`type` is what connects templates to extensions. A template has a single string type. An extension has a string or array of strings. An extension is compatible with a template when the template's type appears in the extension's type list.

```
compatible = [ext.type].flat().includes(template.type)
```

### Template types

| Slug | Type |
|---|---|
| `nestjs-boilerplate` | `nestjs-backend` |
| `nextjs-starter` | `nextjs` |
| `turborepo-boilerplate` | `monorepo` |
| `react-vite-boilerplate` | `react` |
| `web-extension-react-boilerplate` | `webextension-react` |
| `webdriverio-boilerplate` | `webdriverio` |

## Generation Flow

1. Resolve `url` for template and each selected extension from `templates.json`
2. Copy static files from template directory
3. Process special files (`.template`, `.append`, `.if-pnpm`) — see [AUTHORING.md](./AUTHORING.md)
4. Rename `[bracket]/` directories based on `customOptions` answers
5. Generate `package.json` by calling `package/index.js` (or using the static `package.json`)
6. Merge extension files and dependencies on top
7. Write final project to disk
