import { categoriesTable } from "@db/schemas/schema";
import { commonDataPaging, commonDataPagingQueryString } from "@utils/common-model";
import z from "zod";

const columns = categoriesTable;

export namespace CategoryModel {
  // basic form
  const category = {
    code: z.string().max(20),
    name: z.string().max(50),
    is_active: z.boolean(),
  };

  // request body model create
  export const categoryCreate = z.object(category);

  // request body model update
  export const categoryUpdate = z.object(category);

  // query parameters / string
  export const categoryQuery = commonDataPagingQueryString.and(
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
  export const categoryData = commonDataPaging.and(
    z.object({
      data: z.array(z.object({ ...category, ...{ id: z.uuid() } })),
    })
  );
}
