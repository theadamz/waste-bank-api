import { client } from "@db/client";
import { SQL, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

interface isRecordExistProps {
  table: PgTable;
  filters?: SQL | SQL[];
}

export const isRecordExist = async ({ table, filters }: isRecordExistProps): Promise<boolean> => {
  // build query
  let query = client.select({ exists: sql<number>`1` }).from(table);

  // if filters is exist
  if (filters) {
    // check if filters is array
    if (Array.isArray(filters)) {
      query.where(sql.join(filters));
    } else {
      query.where(filters);
    }
  }

  return (await query).length > 0;
};
