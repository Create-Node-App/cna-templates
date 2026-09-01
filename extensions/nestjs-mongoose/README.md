# NestJS Mongoose Extension

This extension adds Mongoose ORM with MongoDB to your NestJS API with TypeScript support and best practices for NoSQL database operations.

## Features

- NestJS Mongoose integration
- MongoDB database support
- TypeScript definitions
- Schema design patterns
- Docker Compose setup

## Documentation

See the documentation in the `docs/` folder:
- [Mongoose Guide](./docs/MONGOOSE_GUIDE.md) - Essential patterns and best practices for Mongoose with NestJS
- [MongoDB + Mongo Express](./docs/COMPOSE_MONGO.md) - Docker Compose setup guide

## Usage

Mongoose is automatically configured when this extension is added to your project. The extension includes:

- Mongoose ORM setup
- MongoDB connection configuration
- Docker Compose for local development
- TypeScript schema definitions

## Scripts

- `npm run mongoose:db-up` - Start MongoDB and Mongo Express with Docker Compose
- `npm run mongoose:db-down` - Stop and remove the Docker Compose services

## Resources

- [NestJS Mongoose Documentation](https://docs.nestjs.com/techniques/mongodb)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/) 