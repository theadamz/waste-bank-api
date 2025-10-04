import { client } from "@db/client";
import { categoriesTable, categorySubsTable } from "@db/schemas/schema";
import { getTableName } from "drizzle-orm";

const table = categorySubsTable;
type Data = typeof table.$inferInsert;

export default async function () {
  const categoryIds = await client.select({ id: categoriesTable.id }).from(categoriesTable);

  const values: Data[] = [
    {
      category_id: categoryIds[Math.floor(Math.random() * categoryIds.length)].id,
      code: "SUBCAT001",
      name: "Drinking Water 600ml",
      is_active: true,
    },
    {
      category_id: categoryIds[Math.floor(Math.random() * categoryIds.length)].id,
      code: "SUBCAT002",
      name: "Office Paper",
      is_active: true,
    },
    {
      category_id: categoryIds[Math.floor(Math.random() * categoryIds.length)].id,
      code: "SUBCAT003",
      name: "Sparepart",
      is_active: true,
    },
  ];

  const insert = await client.insert(table).values(values);
  console.log(`New data in ${getTableName(table)} table created: `, insert.rowCount);
}
