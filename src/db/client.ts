import * as schema from "@db/schemas/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const client = drizzle({ client: pool, schema: { ...schema } });

export { client };
