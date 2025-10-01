import api from "@routes/api";
import { errorHandler } from "@utils/error-handler";
import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono();

// middlewares
app.use(logger());
app.onError(errorHandler);
app.notFound((c) => {
  c.status(404);
  return c.json({
    message: "Not found",
  });
});

// routes
app.route("/api", api);

export default app;
