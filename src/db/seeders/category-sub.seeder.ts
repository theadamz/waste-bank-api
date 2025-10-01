import { client } from "@db/client";
import { categoriesTable, categorySubsTable } from "@db/schemas/schema";

type CategorySub = typeof categorySubsTable.$inferInsert;

export default async function () {
  const categoryIds = await client.select({ id: categoriesTable.id }).from(categoriesTable);

  const data: CategorySub[] = [
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

  const insert = await client.insert(categorySubsTable).values(data);

  console.log(`New data in category_subs table created: `, insert.rowCount);
}
