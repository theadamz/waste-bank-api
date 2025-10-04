import { boolean, index, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";

export const rolesTable = pgTable("roles", {
  id: uuid()
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  code: varchar({ length: 10 }).notNull().unique(),
  name: varchar({ length: 50 }).notNull(),
  def_path: text(),
  created_by: uuid(),
  updated_by: uuid(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});

export const usersTable = pgTable("users", {
  id: uuid()
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  email: varchar().notNull().unique(),
  password: varchar().notNull(),
  name: varchar({ length: 100 }).notNull(),
  is_active: boolean().notNull().default(true),
  role_id: uuid()
    .notNull()
    .references(() => rolesTable.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  last_change_password_at: timestamp(),
  last_login_at: timestamp(),
  created_by: uuid(),
  updated_by: uuid(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
});

export const categoriesTable = pgTable("categories", {
  id: uuid()
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
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
    id: uuid()
      .primaryKey()
      .$default(() => Bun.randomUUIDv7()),
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
