import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PrismaClient, Prisma } from "@prisma/client";

const app = new Hono();

app.post("/message", async (c) => {});
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
