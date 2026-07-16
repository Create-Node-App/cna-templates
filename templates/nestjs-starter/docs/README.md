# Extra Documentation

This folder contains NestJS-specific guides for project structure, configuration, testing, and API usage.

## Guides

| Document | Description |
| -------- | ----------- |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Source layout, modules, and where to add features |
| [CONFIGURATION.md](./CONFIGURATION.md) | Environment variables, Zod validation, and ConfigModule |
| [TESTING.md](./TESTING.md) | Jest unit tests, e2e tests, and coverage |
| [API.md](./API.md) | HTTP routes, response shapes, and OpenAPI |

## OpenAPI (Swagger)

When the server is running locally, browse interactive API docs at:

```
http://localhost:3000/docs
```

The port follows your `PORT` environment variable.

## External resources

- [NestJS Documentation](https://docs.nestjs.com/) — Official NestJS documentation
- [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction) — Swagger integration
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration) — ConfigModule patterns
