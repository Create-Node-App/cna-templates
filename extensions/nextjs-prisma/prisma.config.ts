import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 loads the database connection from this config file instead of
// the `url` field in `prisma/schema.prisma` (removed in Prisma 7).
// The fallback keeps `prisma generate` (postinstall) working when
// DATABASE_URL is not set, e.g. on a fresh scaffold or in CI.
// Commands that touch the database (migrate, push, studio, seed) still
// need a real DATABASE_URL — copy .env.example to .env first.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/myapp_dev",
  },
});
