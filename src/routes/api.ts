import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import v1 from "./v1";

const api = new Hono();

api.get(
  "/docs",
  Scalar((c) => {
    return {
      url: `${process.env.APP_URL}/api/docs`,
      pageTitle: process.env.APP_NAME,
      title: process.env.APP_NAME,
    };
  })
);

api.route("/v1", v1);

export default api;
