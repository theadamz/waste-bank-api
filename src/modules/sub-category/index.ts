import { client } from "@db/client";
import { categoriesTable, categorySubsTable } from "@db/schemas/schema";
import { zValidator } from "@hono/zod-validator";
import { isRecordExist } from "@utils/common-db-helper";
import { validatorHandler } from "@utils/validator-handler";
import { and, asc, count, desc, eq, ilike, inArray, ne, or, SQL } from "drizzle-orm";
import { alias, PgSelect } from "drizzle-orm/pg-core";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { CategorySubModel } from "./model";

const table = categorySubsTable;
const cat = alias(categoriesTable, "cat");

const withJoinAndFilters = <T extends PgSelect>(qb: T, searching: SQL[], filters: SQL[]) => {
  return qb.leftJoin(cat, eq(table.category_id, cat.id)).where(and(...filters, or(...searching)));
};

export default new Hono()
  .get("/", zValidator("query", CategorySubModel.categorySubQuery, validatorHandler), async (c) => {
    // filters
    const searching: SQL[] = [];
    const filters: SQL[] = [];
    let { search, page, page_size, is_active, order, dir } = c.req.valid("query");

    // handle value filters
    if (search) searching.push(ilike(table.code, search));
    if (search) searching.push(ilike(table.name, search));
    if (typeof is_active !== "undefined") filters.push(eq(table.is_active, is_active));

    page = page ?? 1;
    page_size = page_size ?? process.env.PAGE_SIZE;

    // create query select data
    let query = client.select({ id: table.id, category_id: table.category_id, category_name: cat.name, code: table.code, name: table.name, is_active: table.is_active }).from(table).$dynamic();

    // add join and filters using dynamic
    withJoinAndFilters(query, searching, filters)
      .limit(page_size)
      .offset((page - 1) * page_size);

    // order by
    if (order && dir) {
      query.orderBy(dir === "asc" ? asc(table[order]) : desc(table[order]));
    }

    // get data
    const records = await query;

    // create query count rows
    const queryTotalRows = client
      .select({ total_rows: count().mapWith(Number) })
      .from(table)
      .$dynamic();

    const [record] = await withJoinAndFilters(queryTotalRows, searching, filters);

    return c.json(
      {
        page: page,
        pages: Math.ceil(record.total_rows / page_size),
        total: record.total_rows,
        data: records,
      },
      200
    );
  })
  .post("/", zValidator("json", CategorySubModel.categorySubJson, validatorHandler), async (c) => {
    try {
      // get valid body
      const { category, code, name, is_active } = c.req.valid("json");

      // check conflict
      if (await isRecordExist({ table: table, filters: eq(table.code, code) })) {
        return c.json({ message: "Sub category code already exists" }, 409);
      }

      // create and get inserted data
      const [inserted] = await client.insert(table).values({ code: code, name: name, is_active: is_active, category_id: category }).returning();

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
  .get("/:id", zValidator("param", CategorySubModel.categorySubParamId, validatorHandler), async (c) => {
    // get id
    const { id } = c.req.valid("param");

    // get data
    const [record] = await client.select({ id: table.id, category_id: table.category_id, category_name: cat.name, code: table.code, name: table.name, is_active: table.is_active }).from(table).leftJoin(cat, eq(table.category_id, cat.id)).where(eq(table.id, id));

    return c.json(
      {
        message: "Ok",
        data: record,
      },
      200
    );
  })
  .put("/:id", zValidator("param", CategorySubModel.categorySubParamId, validatorHandler), zValidator("json", CategorySubModel.categorySubJson, validatorHandler), async (c) => {
    try {
      // get id
      const { id } = c.req.valid("param");

      // get input
      const { category, code, name, is_active } = c.req.valid("json");

      // check conflict
      if ((await isRecordExist({ table: table, filters: and(eq(table.code, code), ne(table.id, id)) })) === true) {
        return c.json({ message: "Sub Category code already exists" }, 409);
      }

      // update data
      const [updated] = await client.update(table).set({ code, name, is_active, category_id: category, updated_at: new Date() }).where(eq(table.id, id)).returning();

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
  .delete("/", zValidator("json", CategorySubModel.categorySubDelete, validatorHandler), async (c) => {
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
