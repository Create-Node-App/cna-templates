# Contributing

Thanks for contributing! This repo powers [create-awesome-node-app](https://www.npmjs.com/package/create-awesome-node-app).

For a full explanation of how templates, extensions, and the file system work, read [docs/AUTHORING.md](./docs/AUTHORING.md).

## Adding an extension

1. Create `extensions/<your-slug>/`
2. Add a `package.json` with `dependencies` and/or `devDependencies` to merge into the project
3. Add any files to copy (use `.template`, `.append`, `[bracket]/` as needed — see [docs/AUTHORING.md](./docs/AUTHORING.md))
4. Register it in `templates.json` under `"extensions"`:

```json
{
  "name": "My Extension",
  "slug": "my-extension",
  "description": "Adds X to your project",
  "url": "https://github.com/Create-Node-App/cna-templates/tree/main/extensions/my-extension",
  "type": ["react"],
  "category": "UI",
  "labels": ["React", "UI"]
}
```

## Adding a template

1. Create `templates/<your-slug>/`
2. Set up `package/index.js`, `package/dependencies.js`, `package/devDependencies.js` (preferred) — or a deliberate static `package.json`
3. Add project files with the appropriate suffixes
4. Meet the **M1 maturity checklist** in [docs/MAINTENANCE_TEMPLATES.md §11](./docs/MAINTENANCE_TEMPLATES.md#11-template-maturity-m1--m2--m3) (docs suite, real lint, honest scripts, landing integrity)
5. Register it in `templates.json` under `"templates"` (same fields as extension; put interactive prompts in `cna.config.json`, not the registry)

For a full explanation of how templates, extensions, and the file system work, read [docs/AUTHORING.md](./docs/AUTHORING.md).

## Commit messages

Use [conventional commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`.

## PR checklist

- [ ] Directory name matches the `slug` in `templates.json` (or the `url` path if they intentionally differ — see [MAINTENANCE_TEMPLATES.md](./docs/MAINTENANCE_TEMPLATES.md#52-directory-naming-caveat))
- [ ] `url` points to the correct path on the `main` branch
- [ ] `slug` is globally unique across templates and extensions
- [ ] All required fields present: `name`, `slug`, `description`, `url`, `type`, `category`, `labels`
- [ ] Extension `type` is an array if it supports multiple template types
- [ ] **New** templates meet [M1 maturity](./docs/MAINTENANCE_TEMPLATES.md#11-template-maturity-m1--m2--m3). Updates to existing thin starters must link an uplift issue until M1 is met
- [ ] Tested locally — see [docs/TESTING.md](./docs/TESTING.md)

## Questions?

Open an [issue](https://github.com/Create-Node-App/cna-templates/issues) or start a [discussion](https://github.com/Create-Node-App/cna-templates/discussions).
