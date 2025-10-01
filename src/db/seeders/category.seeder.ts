import { client } from "@db/client";
import { categoriesTable } from "@db/schemas/schema";

type Category = typeof categoriesTable.$inferInsert;

export default async function () {
  const categories: Category[] = [
    {
      code: "TOY",
      name: "Toys",
      is_active: true,
    },
    {
      code: "PLSC",
      name: "Plastic",
      is_active: true,
    },
    {
      code: "COMP",
      name: "Computer",
      is_active: true,
    },
  ];

  const insert = await client.insert(categoriesTable).values(categories);
  console.log(`New data in categories table created: `, insert.rowCount);
}
