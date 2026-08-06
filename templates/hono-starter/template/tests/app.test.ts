import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { loadEnv } from "../src/env";

const app = createApp(loadEnv({ NODE_ENV: "test", PORT: "3000", APP_NAME: "Test API" }));

describe("Hono starter", () => {
  it("returns welcome JSON on GET /", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({
      message: "Hello from Hono!",
    });
  });

  it("returns health on GET /health", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: "ok" });
  });

  it("validates POST /echo body", async () => {
    const bad = await app.request("/echo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });
    expect(bad.status).toBe(400);

    const ok = await app.request("/echo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "ping" }),
    });
    expect(ok.status).toBe(200);
    await expect(ok.json()).resolves.toEqual({ echo: "ping" });
  });
});
