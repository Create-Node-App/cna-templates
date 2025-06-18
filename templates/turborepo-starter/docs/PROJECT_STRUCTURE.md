# Project Structure

This document outlines the structure of the Turborepo monorepo template.

## Directory Structure

```txt
turborepo-starter/
├── apps/                    # Application packages
│   ├── web/                # Web application
│   └── docs/               # Documentation site
├── packages/               # Shared packages
│   ├── ui/                # Shared UI components
│   ├── config/            # Shared configuration
│   └── tsconfig/          # TypeScript configurations
├── .changeset/            # Changeset configuration
├── package.json           # Root package.json
├── turbo.json            # Turborepo configuration
└── pnpm-workspace.yaml   # PNPM workspace configuration
```

## Key Directories

### `apps/`

Contains all the applications in the monorepo. Each application is a separate package that can be developed and deployed independently.

- `web/`: The main web application
- `docs/`: Documentation site (if applicable)

### `packages/`

Contains shared packages that can be used across multiple applications.

- `ui/`: Shared UI components and styles
- `config/`: Shared configuration files (ESLint, Prettier, etc.)
- `tsconfig/`: Shared TypeScript configurations

### Configuration Files

- `turbo.json`: Defines the pipeline and dependencies between packages
- `pnpm-workspace.yaml`: Configures the PNPM workspace
- `.changeset/`: Configuration for versioning and changelog generation

## Package Management

### Adding a New Package

1. Create a new directory in `packages/` or `apps/`
2. Initialize the package with `package.json`
3. Add the package to the workspace in `pnpm-workspace.yaml`
4. Update `turbo.json` if necessary

### Package Dependencies

- Use workspace dependencies (`workspace:*`) for internal packages
- Use regular dependencies for external packages
- Keep shared dependencies in the root `package.json`

## Development Workflow

1. Install dependencies: `pnpm install`
2. Start development: `pnpm dev`
3. Build packages: `pnpm build`
4. Run tests: `pnpm test`

## Best Practices

1. Keep shared code in the `packages/` directory
2. Use TypeScript for all packages
3. Follow the established directory structure
4. Keep package dependencies up to date
5. Use changesets for versioning.
