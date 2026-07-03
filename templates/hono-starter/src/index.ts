import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "Hello from Hono!" });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

const port = parseInt(process.env.PORT || "3000", 10);

serve(
  { fetch: app.fetch, port },
  (info: { port: number }) => {
    console.log(`Server running on http://localhost:${info.port}`);
  },
);

export default app;
