import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const rootRoutes = new Hono();

rootRoutes.get("/", (c) => {
  return c.json({
    message: "Hello from Hono!",
    docs: "./docs/README.md",
  });
});

const echoSchema = z.object({
  message: z.string().min(1).max(200),
});

rootRoutes.post("/echo", zValidator("json", echoSchema), (c) => {
  const body = c.req.valid("json");
  return c.json({ echo: body.message });
});
