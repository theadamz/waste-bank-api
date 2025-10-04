import categoryRoute from "@modules/category";
import subCategoryRoute from "@modules/sub-category";
import { Hono } from "hono";

const v1 = new Hono();

v1.route("/categories", categoryRoute);
v1.route("/sub-categories", subCategoryRoute);

export default v1;
