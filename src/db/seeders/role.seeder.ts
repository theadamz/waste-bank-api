import { client } from "@db/client";
import { rolesTable } from "@db/schemas/schema";
import { getTableName } from "drizzle-orm";

const table = rolesTable;
type Data = typeof table.$inferInsert;

export default async function () {
  const values: Data[] = [
    {
      code: "dev",
      name: "Developer",
      def_path: "/",
    },
    {
      code: "admin",
      name: "Administrator",
      def_path: "/",
    },
    {
      code: "cust",
      name: "Customer",
      def_path: "/clients",
    },
  ];

  const insert = await client.insert(table).values(values);
  console.log(`New data in ${getTableName(table)} table created: `, insert.rowCount);
}
