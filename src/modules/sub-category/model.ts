import { client } from "@db/client";
import { categoriesTable, categorySubsTable } from "@db/schemas/schema";
import { isRecordExist } from "@utils/common-db-helper";
import { commonDataPaging, commonDataPagingQueryString } from "@utils/common-model";
import { eq, inArray } from "drizzle-orm";
import z from "zod";

export namespace CategorySubModel {
  // basic form
  const categorySub = {
    category: z.uuid({ abort: true }).refine(async (val) => {
      return await isRecordExist({ table: categoriesTable, filters: eq(categoriesTable.id, val) });
    }),
    code: z.string().max(20),
    name: z.string().max(50),
    is_active: z.boolean(),
  };

  // request body model create
  export const categorySubJson = z.object(categorySub);

  // validation param id
  export const categorySubParamId = z.object({
    id: z.uuid({ abort: true }).refine(async (val) => {
      return await isRecordExist({ table: categorySubsTable, filters: eq(categorySubsTable.id, val) });
    }),
  });

  // query parameters / string
  export const categorySubQuery = commonDataPagingQueryString.and(
    z.object({
      order: z.enum(["id", "code", "name", "is_active"]).optional(),
      is_active: z
        .string()
        .optional()
        .transform((val) => {
          if (val) return val.toLowerCase() === "true";
        })
        .pipe(z.boolean().optional()),
    })
  );

  // list data
  export const categorySubData = commonDataPaging.and(
    z.object({
      data: z.array(z.object({ ...categorySub, ...{ id: z.uuid() } })),
    })
  );

  // validation param id
  export const categorySubDelete = z
    .uuid({ abort: true })
    .array()
    .superRefine(async (values, ctx) => {
      const data = (await client.select({ id: categorySubsTable.id }).from(categorySubsTable).where(inArray(categorySubsTable.id, values))).map((col) => col.id);

      values.forEach((id, index) => {
        if (!data.includes(id)) {
          ctx.addIssue({
            code: "custom",
            path: [index],
          });
        }
      });
    });
}
