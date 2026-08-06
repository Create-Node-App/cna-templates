# Architecture

## System Overview

```mermaid
flowchart LR
  User[User] -->|npx create-awesome-node-app| CLI[CLI]
  CLI -->|--template / --addons| Resolve[Resolve template and extension entries]
  Resolve --> TemplatesJson[templates.json]
  TemplatesJson -->|template URL| Template[Template directory]
  TemplatesJson -->|extension URLs in order| Extensions[Extension directories]
  Template --> Copy[Copy base files]
  Extensions --> Merge[Merge extension files on top]
  Copy --> Process[Process special files]
  Process --> Rename[Rename [bracket] directories]
  Rename --> Package[Generate package.json]
  Package --> Merge
  Merge --> Output[Write final project to disk]
```

## How the System Works

A user runs:

```sh
npx create-awesome-node-app --template <slug> --addons <ext1> <ext2>
```

CNA resolves each slug to a `url` in `templates.json`, downloads the directories, merges them, and writes the final project to disk. The merge order is: base template files, then each selected extension in the order the user provided it.

## `templates.json` Structure

Three top-level keys: `categories`, `templates`, `extensions`.

Every template and extension requires: `name`, `slug`, `description`, `url`, `type`, `category`, `labels`.
Templates may also have `customOptions` (interactive CLI prompts — see [AUTHORING.md](./AUTHORING.md)).

`categories` groups templates for the CLI picker. A template belongs to exactly one category via its `category` value. Extensions use a free-form category label and can apply to multiple template types.

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
2. Read `customOptions` when present and collect interactive answers
3. Copy static files from the template directory
4. Process special files (`.template`, `.append`, `.if-pnpm`) — see [AUTHORING.md](./AUTHORING.md)
5. Rename `[bracket]/` directories based on `customOptions` answers
6. Generate `package.json` by calling `package/index.js` (or using the static `package.json`)
7. Merge each extension's files and dependencies on top, in user-provided order
8. Write the final project to disk
