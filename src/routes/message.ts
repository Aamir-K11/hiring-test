import { PrismaClient, Prisma } from "@prisma/client";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const message = new Hono();
const prisma = new PrismaClient();

interface Message {
  id: number;
  body: string;
  likesCount: number;
  authorId: number;
}

message.post("/", async (c) => {
  const { userId, messageBody } = await c.req.json();
  if (!userId || !messageBody)
    throw new HTTPException(400, { message: "Provide a user id and message" });
  try {
    const message = (await prisma.message.create({
      data: {
        authorId: userId,
        body: messageBody,
      },
    })) as Message;

    return c.json({ messageID: message.id });
  } catch (error) {
    throw new HTTPException(400, { message: "Bad Request", cause: error });
  }
});

message.get("/:id", async (c) => {
  const messageId = c.req.param("id");
  if (!messageId) {
    throw new HTTPException(400, { message: "Provide a message ID" });
  }
  try {
    const message = (await prisma.message.findUnique({
      where: {
        id: parseInt(messageId),
      },
    })) as Message;

    return c.json({ message });
  } catch (error) {
    throw new HTTPException(400, { message: "Bad Request", cause: error });
  }
});

message.post("/like", async (c) => {
  const { userId, messageId }: { userId: number; messageId: number } =
    await c.req.json();
  if (!userId || !messageId) {
    throw new HTTPException(400, {
      message: "Provide a user ID and a message ID",
    });
  }
  try {
    const alreadyLiked = await prisma.likesOnMessages.findFirst({
      where: {
        messageId: messageId,
        userId: userId,
      },
    });

    if (alreadyLiked) {
      return c.json({ message: "You have already liked this post" });
    }

    const updatedLikes = await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        likesCount: {
          increment: 1,
        },
        likesbyUsers: {
          create: {
            userId: userId,
          },
        },
      },
    });

    return c.json({ updatedLikes });
  } catch (error) {
    throw new HTTPException(400, { message: "Bad Request", cause: error });
  }
});

export default message;
