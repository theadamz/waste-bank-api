import {
  boolean,
  index,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const categoriesTable = pgTable("categories", {
  id: uuid().primaryKey().defaultRandom(),
  code: varchar({ length: 10 }).notNull().unique(),
  name: varchar({ length: 50 }).notNull(),
  is_active: boolean().notNull().default(true),
  created_by: uuid(),
  updated_by: uuid(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});

export const categorySubsTable = pgTable(
  "category_subs",
  {
    id: uuid().primaryKey().defaultRandom(),
    category_id: uuid()
      .notNull()
      .references(() => categoriesTable.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    code: varchar({ length: 20 }).notNull().unique(),
    name: varchar({ length: 50 }).notNull(),
    is_active: boolean().notNull().default(true),
    created_by: uuid(),
    updated_by: uuid(),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
  },
  (t) => [unique().on(t.category_id, t.code), index().on(t.category_id)]
);
