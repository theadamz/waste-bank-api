import { client } from "@db/client";
import { categoriesTable } from "@db/schemas/schema";
import { zValidator } from "@hono/zod-validator";
import { isRecordExist } from "@utils/common-db-helper";
import { validatorHandler } from "@utils/validator-handler";
import { and, asc, desc, eq, ilike, inArray, ne, or, SQL } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import z from "zod";
import { CategoryModel } from "./model";

const col = categoriesTable;

export default new Hono()
  .get("/", zValidator("query", CategoryModel.categoryQuery, validatorHandler), async (c) => {
    // filters
    const searching: SQL[] = [];
    const filters: SQL[] = [];
    let { search, page, page_size, is_active, order, dir } = c.req.valid("query");

    // handle value filters
    if (search) searching.push(ilike(col.code, search));
    if (search) searching.push(ilike(col.name, search));
    if (typeof is_active !== "undefined") filters.push(eq(col.is_active, is_active));

    page = page ?? 1;
    page_size = page_size ?? process.env.PAGE_SIZE;

    // create query
    const query = client
      .select({ id: col.id, code: col.code, name: col.name, is_active: col.is_active })
      .from(categoriesTable)
      .where(and(...filters, or(...searching)))
      .limit(page_size)
      .offset((page - 1) * page_size);

    // order by
    if (order && dir) {
      query.orderBy(dir === "asc" ? asc(col[order]) : desc(col[order]));
    }

    // get data
    const records = await query;

    // get total rows
    const totalRows = await client.$count(categoriesTable, and(...filters, or(...searching)));

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
  .post("/", zValidator("json", CategoryModel.categoryCreate, validatorHandler), async (c) => {
    try {
      // get valid body
      const body = c.req.valid("json");

      // check conflict
      if ((await client.$count(categoriesTable, eq(categoriesTable.code, body.code))) >= 1) {
        return c.json({ message: "Category code already exists" }, 409);
      }

      // create and get inserted data
      const [inserted] = await client.insert(categoriesTable).values(body).returning();

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
  .get("/:id", zValidator("param", z.object({ id: z.uuid() }), validatorHandler), async (c) => {
    // get id
    const { id } = c.req.valid("param");

    // check if record exist
    if ((await isRecordExist({ table: categoriesTable, filters: eq(col.id, id) })) === false) {
      return c.json(
        {
          message: "Not found",
        },
        404
      );
    }

    // get data
    const [record] = await client.select({ id: col.id, code: col.code, name: col.name, is_active: col.is_active }).from(categoriesTable).where(eq(col.id, id));

    return c.json(
      {
        message: "Ok",
        data: record,
      },
      200
    );
  })
  .put("/:id", zValidator("param", z.object({ id: z.uuid() }), validatorHandler), zValidator("json", CategoryModel.categoryUpdate, validatorHandler), async (c) => {
    try {
      // get id
      const { id } = c.req.valid("param");

      // get input
      const body = c.req.valid("json");

      // check if record exist
      if ((await isRecordExist({ table: categoriesTable, filters: eq(col.id, id) })) === false) {
        return c.json({ message: "Not found" }, 404);
      }

      // check conflict
      if ((await isRecordExist({ table: categoriesTable, filters: and(eq(col.code, body.code), ne(col.id, id)) })) === true) {
        return c.json({ message: "Category code already exists" }, 409);
      }

      // update data
      const [updated] = await client.update(categoriesTable).set(body).where(eq(col.id, id)).returning();

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
  .delete("/", zValidator("json", z.array(z.uuid()), validatorHandler), async (c) => {
    try {
      // get id
      const ids = c.req.valid("json");

      // delete data
      const deletedIds: string[] = (await client.delete(categoriesTable).where(inArray(col.id, ids)).returning({ id: col.id })).map((col) => col.id);

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
