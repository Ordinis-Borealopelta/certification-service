import { serve } from "bun";
import { Hono } from "hono";

const app = new Hono();

const port = Bun.env.CERTIFICATION_PORT || 4002;

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

serve({
  fetch: app.fetch,
  port,
  error: (error) => {
    console.error("Certification service error:", error.message);
  },
});

console.log(`Certification service started at http://localhost:${port}`);
