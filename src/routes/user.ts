import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { PrismaClient, Prisma } from "@prisma/client";

const user = new Hono();
const prisma = new PrismaClient();

interface User {
  id: number;
  email: string;
  name: string;
}

user.post("/", async (c) => {
  const { email, name } = await c.req.json();
  if (!email || !name)
    throw new HTTPException(400, { message: "Provide email and username" });
  try {
    const user = (await prisma.user.create({
      data: {
        email,
        name,
      },
    })) as User;

    return c.json({ userId: user.id });
  } catch (error) {
    throw new HTTPException(400, { message: "Bad Request", cause: error });
  }
});

export default user;
