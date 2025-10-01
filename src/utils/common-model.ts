import z from "zod";

export const commonDataPagingQueryString = z.object({
  search: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .pipe(z.number().optional()),
  page_size: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .pipe(z.number().optional()),
  order: z.string().optional(),
  dir: z.enum(["asc", "desc"]).optional(),
});

export const commonDataPaging = z.object({
  total: z.number(),
  pages: z.number(),
  page: z.number(),
  data: z.array(z.any()),
});
