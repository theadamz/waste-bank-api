import categoryRoute from "@modules/category";
import roleRoute from "@modules/role";
import subCategoryRoute from "@modules/sub-category";
import { Hono } from "hono";

const v1 = new Hono();

v1.route("/categories", categoryRoute);
v1.route("/sub-categories", subCategoryRoute);
v1.route("/roles", roleRoute);

export default v1;
