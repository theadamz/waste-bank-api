import { client } from "@db/client";
import { rolesTable } from "@db/schemas/schema";
import { isRecordExist } from "@utils/common-db-helper";
import { commonDataPaging, commonDataPagingQueryString } from "@utils/common-model";
import { eq, inArray } from "drizzle-orm";
import z from "zod";

export namespace RoleModel {
  // basic
  const body = {
    code: z.string().max(20),
    name: z.string().max(50),
    def_path: z.string(),
  };

  // request body model
  export const bodyReq = z.object(body);

  // validation param id
  export const pathParamId = z.object({
    id: z.uuid({ abort: true }).refine(async (val) => {
      return await isRecordExist({ table: rolesTable, filters: eq(rolesTable.id, val) });
    }),
  });

  // query parameters / string
  export const dataQueryString = commonDataPagingQueryString.and(
    z.object({
      order: z.enum(["id", "code", "name"]).optional(),
    })
  );

  // list data
  export const dataResponse = commonDataPaging.and(
    z.object({
      data: z.array(z.object({ ...body, ...{ id: z.uuid() } })),
    })
  );

  // validation param id
  export const bodyDelete = z
    .uuid({ abort: true })
    .array()
    .superRefine(async (values, ctx) => {
      const data = (await client.select({ id: rolesTable.id }).from(rolesTable).where(inArray(rolesTable.id, values))).map((col) => col.id);

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
