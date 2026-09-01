import { Hono } from "hono";
import type { Env } from "./env";
import { errorHandler } from "./middleware/error-handler";
import { healthRoutes } from "./routes/health";
import { rootRoutes } from "./routes/root";

export function createApp(env: Env) {
  const app = new Hono();

  app.use("*", async (c, next) => {
    c.header("X-App-Name", env.APP_NAME);
    await next();
  });

  app.onError(errorHandler);

  app.route("/", rootRoutes);
  app.route("/health", healthRoutes);

  return app;
}

export type App = ReturnType<typeof createApp>;
