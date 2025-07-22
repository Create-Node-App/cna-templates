# NestJS Drizzle PostgreSQL Extension

This extension adds Drizzle ORM with PostgreSQL to your NestJS API with TypeScript support and best practices for database operations.

## Features

- NestJS Drizzle ORM integration
- PostgreSQL database support
- TypeScript definitions
- AWS Secrets Manager support
- Docker Compose setup

## Documentation

See the documentation in the `docs/` folder:
- [Drizzle PostgreSQL Guide](./docs/DRIZZLE_POSTGRES_GUIDE.md) - Essential patterns and best practices for Drizzle ORM
- [Compose PostgreSQL](./docs/COMPOSE_POSTGRES.md) - Docker Compose setup guide

## Usage

Drizzle ORM is automatically configured when this extension is added to your project. The extension includes:

- Drizzle ORM setup for PostgreSQL
- Database connection with Pool
- AWS Secrets Manager integration
- Docker Compose for local development
- TypeScript schema definitions

## Scripts

- `npm run drizzle:generate` - Generate database migrations
- `npm run drizzle:migrate` - Run database migrations
- `npm run drizzle:db-up` - Start PostgreSQL with Docker Compose
- `npm run drizzle:db-down` - Stop PostgreSQL services

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS Database Guide](https://docs.nestjs.com/techniques/database) 