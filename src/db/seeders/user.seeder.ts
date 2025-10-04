import { client } from "@db/client";
import { rolesTable, usersTable } from "@db/schemas/schema";
import { eq, getTableName } from "drizzle-orm";

const table = usersTable;
type Data = typeof table.$inferInsert;

export default async function () {
  const [dev] = await client.select({ id: rolesTable.id }).from(rolesTable).where(eq(rolesTable.code, "dev"));
  const [admin] = await client.select({ id: rolesTable.id }).from(rolesTable).where(eq(rolesTable.code, "admin"));
  const [cust] = await client.select({ id: rolesTable.id }).from(rolesTable).where(eq(rolesTable.code, "cust"));

  const values: Data[] = [
    {
      email: "theadamz91@gmail.com",
      password: await createPassword("123456"),
      name: "Developer",
      role_id: dev.id,
      is_active: true,
    },
    {
      email: "administrator@email.com",
      password: await createPassword("123456"),
      name: "Administrator",
      role_id: admin.id,
      is_active: true,
    },
    {
      email: "customer@email.com",
      password: await createPassword("123456"),
      name: "Customer 1",
      role_id: cust.id,
      is_active: true,
    },
  ];

  const insert = await client.insert(table).values(values);
  console.log(`New data in ${getTableName(table)} table created: `, insert.rowCount);
}

const createPassword = (value: string): Promise<string> => {
  return Bun.password.hash(value, {
    algorithm: "bcrypt",
    cost: 12,
  });
};
