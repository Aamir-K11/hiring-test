import { serve } from "@hono/node-server";
import { Hono } from "hono";
import message from "./routes/message";
import user from "./routes/user";

const app = new Hono();

app.route("/message", message);
app.route("/user", user);

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
