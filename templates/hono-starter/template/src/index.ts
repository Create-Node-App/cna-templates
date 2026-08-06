import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { loadEnv } from "./env";

const env = loadEnv();
const app = createApp(env);

serve(
  { fetch: app.fetch, port: env.PORT },
  (info) => {
    console.log(`${env.APP_NAME} listening on http://localhost:${info.port}`);
  },
);

export default app;
