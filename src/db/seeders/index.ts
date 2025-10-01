import { client } from "@db/client";
import * as schema from "@db/schemas/schema";
import { reset } from "drizzle-seed";
import categorySubSeeder from "./category-sub.seeder";
import CategorySeeder from "./category.seeder";

const seeds = [CategorySeeder, categorySubSeeder];

const args = process.argv.slice(2);

async function main() {
  if (args.includes("--truncate")) {
    console.log("Truncate tables...");
    await reset(client, schema);
  }

  console.log("Start seeding...");

  // Loop seeds
  for (const seed of seeds) {
    await seed();
  }

  console.log("Seeding completed!");
}

main();
