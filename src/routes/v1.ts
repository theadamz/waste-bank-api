import categoryRoute from "@modules/category";
import { Hono } from "hono";

const v1 = new Hono();

v1.route("/categories", categoryRoute);

export default v1;
