import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PrismaClient, Prisma } from "@prisma/client";
import { HTTPException } from "hono/http-exception";

const app = new Hono();
const prisma = new PrismaClient();

app.post("/user", async (c) => {
  const { email, name } = await c.req.json();
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    return c.json({ userId: user });
  } catch (error) {
    throw new HTTPException(300, { message: "Bad Request", cause: error });
  }
});

app.post("/message", async (c) => {
  const { userId, messageBody } = await c.req.json();
  try {
    const message = await prisma.message.create({
      data: {
        authorId: userId,
        body: messageBody,
      },
    });

    return c.json({ messageID: message });
  } catch (error) {
    throw new HTTPException(400, { message: "Bad Request", cause: error });
  }
});

app.get("/message/:id", async (c) => {
  const messageId = c.req.param("id");
  if (messageId === undefined || messageId === null) {
    throw new HTTPException(400, { message: "Provide a message ID" });
  }
  try {
    const message = await prisma.message.findUnique({
      where: {
        id: parseInt(messageId),
      },
    });

    return c.json({ message });
  } catch (error) {
    throw new HTTPException(400, { message: "Bad Request", cause: error });
  }
});

app.post("/like", async (c) => {
  const { userId, messageId } = await c.req.json();

  try {
    // const alreadyLiked = await prisma.message.findUnique({
    //   where: {
    //     id: messageId,
    //     likesbyUsers: {
    //       some: {
    //         userId,
    //       },
    //     },
    //   },
    // });
    // if (alreadyLiked) {
    //   return c.json({ message: "You have already liked this post" });
    // }
    const updatedLikes = await prisma.message.update({
      where: {
        id: messageId,
        authorId: userId,
      },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    });

    return c.json({ updatedLikes });
  } catch (error) {
    throw new HTTPException(400, { message: "Bad Request", cause: error });
  }
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// app.onError((err, c) => {
//   if (err instanceof HTTPException) {
//     // Get the custom response
//     return err.getResponse();
//   }
//   //...
// });

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
