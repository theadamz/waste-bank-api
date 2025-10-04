import { client } from "@db/client";
import { rolesTable } from "@db/schemas/schema";
import { zValidator } from "@hono/zod-validator";
import { isRecordExist } from "@utils/common-db-helper";
import { validatorHandler } from "@utils/validator-handler";
import { and, asc, desc, eq, ilike, inArray, ne, or, SQL } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { RoleModel } from "./model";

const table = rolesTable;

export default new Hono()
  .get("/", zValidator("query", RoleModel.dataQueryString, validatorHandler), async (c) => {
    // filters
    const searching: SQL[] = [];
    const filters: SQL[] = [];
    let { search, page, page_size, order, dir } = c.req.valid("query");

    // handle value filters
    if (search) searching.push(ilike(table.code, search));
    if (search) searching.push(ilike(table.name, search));

    page = page ?? 1;
    page_size = page_size ?? process.env.PAGE_SIZE;

    // create query
    const query = client
      .select({ id: table.id, code: table.code, name: table.name, def_ath: table.def_path })
      .from(table)
      .where(and(...filters, or(...searching)))
      .limit(page_size)
      .offset((page - 1) * page_size);

    // order by
    if (order && dir) {
      query.orderBy(dir === "asc" ? asc(table[order]) : desc(table[order]));
    }

    // get data
    const records = await query;

    // get total rows
    const totalRows = await client.$count(table, and(...filters, or(...searching)));

    return c.json(
      {
        page: page,
        pages: Math.ceil(totalRows / page_size),
        total: totalRows,
        data: records,
      },
      200
    );
  })
  .post("/", zValidator("json", RoleModel.bodyReq, validatorHandler), async (c) => {
    try {
      // get valid body
      const body = c.req.valid("json");

      // check conflict
      if ((await client.$count(table, eq(table.code, body.code))) >= 1) {
        return c.json({ message: "Role already exists" }, 409);
      }

      // create and get inserted data
      const [inserted] = await client.insert(table).values(body).returning();

      return c.json(
        {
          message: "Success",
          data: inserted,
        },
        201
      );
    } catch (error) {
      throw new HTTPException(500, error as any);
    }
  })
  .get("/:id", zValidator("param", RoleModel.pathParamId, validatorHandler), async (c) => {
    // get id
    const { id } = c.req.valid("param");

    // get data
    const [record] = await client.select({ id: table.id, code: table.code, name: table.name, def_path: table.def_path }).from(table).where(eq(table.id, id));

    return c.json(
      {
        message: "Ok",
        data: record,
      },
      200
    );
  })
  .put("/:id", zValidator("param", RoleModel.pathParamId, validatorHandler), zValidator("json", RoleModel.bodyReq, validatorHandler), async (c) => {
    try {
      // get id
      const { id } = c.req.valid("param");

      // get input
      const { code, name, def_path } = c.req.valid("json");

      // check conflict
      if ((await isRecordExist({ table: table, filters: and(eq(table.code, code), ne(table.id, id)) })) === true) {
        return c.json({ message: "Role already exists" }, 409);
      }

      // update data
      const [updated] = await client.update(table).set({ code, name, def_path, updated_at: new Date() }).where(eq(table.id, id)).returning();

      return c.json(
        {
          message: "Success",
          data: updated,
        },
        200
      );
    } catch (error) {
      throw new HTTPException(500, error as any);
    }
  })
  .delete("/", zValidator("json", RoleModel.bodyDelete, validatorHandler), async (c) => {
    try {
      // get id
      const ids = c.req.valid("json");

      // delete data
      const deletedIds: string[] = (await client.delete(table).where(inArray(table.id, ids)).returning({ id: table.id })).map((col) => col.id);

      return c.json(
        {
          message: "Success",
          data: deletedIds,
        },
        200
      );
    } catch (error) {
      throw new HTTPException(500, error as any);
    }
  });
