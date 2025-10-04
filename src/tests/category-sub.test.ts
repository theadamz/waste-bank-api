import { client } from "@db/client";
import { categoriesTable, categorySubsTable } from "@db/schemas/schema";
import { describe, expect, test } from "bun:test";
import { inArray } from "drizzle-orm";
import app from "../index";

describe("category-sub", async () => {
  const table = categorySubsTable;

  // get category id
  const categoryIds = (await client.select({ id: categoriesTable.id }).from(categoriesTable)).map((col) => col.id);

  let id: string;

  const data1 = {
    category: categoryIds[Math.floor(Math.random() * categoryIds.length)],
    code: "TEST1",
    name: "Test1",
    is_active: true,
  };

  const data1new = {
    category: categoryIds[Math.floor(Math.random() * categoryIds.length)],
    code: "NEW1",
    name: "NEW1",
    is_active: true,
  };

  const data2 = {
    category: categoryIds[Math.floor(Math.random() * categoryIds.length)],
    code: "TEST2",
    name: "Test2",
    is_active: true,
  };

  test("clear data before test", async () => {
    await client.delete(table).where(inArray(table.code, [data1.code, data1new.code, data2.code]));
  });

  test("GET /sub-categories - show data with paging, it should return ok", async () => {
    const res = await app.request("/api/v1/sub-categories");

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty("page");
    expect(json).toHaveProperty("pages");
    expect(json).toHaveProperty("total");
    expect(json).toHaveProperty("data");
  });

  test("POST /sub-categories - check request validation", async () => {
    const res = await app.request("api/v1/sub-categories", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        name: "New data",
      }),
    });

    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json).toHaveProperty("message", expect.stringContaining("Unprocessable Content"));
    expect(json).toHaveProperty("errors.code", expect.objectContaining(expect.any(String)));
    expect(json).toHaveProperty("errors.is_active", expect.objectContaining(expect.any(String)));
  });

  test("POST /sub-categories - create new data, it should return created", async () => {
    // insert data1
    const res = await app.request("api/v1/sub-categories", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data1),
    });

    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json).toHaveProperty("message", "Success");
    expect(json).toHaveProperty("data.code", data1.code);
    expect(json).toHaveProperty("data.name", data1.name);
    expect(json).toHaveProperty("data.is_active", data1.is_active);

    id = json.data.id;

    // insert data2
    const res2 = await app.request("api/v1/sub-categories", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data2),
    });

    expect(res2.status).toBe(201);

    const json2 = await res2.json();
    expect(json2).toHaveProperty("message", "Success");
    expect(json2).toHaveProperty("data.code", data2.code);
    expect(json2).toHaveProperty("data.name", data2.name);
    expect(json2).toHaveProperty("data.is_active", data2.is_active);
  });

  test("POST /sub-categories - check duplicate when create new data, it should return conflict", async () => {
    const res = await app.request("api/v1/sub-categories", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data1),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toHaveProperty("message", expect.stringContaining("already exists"));
  });

  test("GET /sub-categories/:id - invalid id should return unprocessable", async () => {
    const res = await app.request(`/api/v1/sub-categories/${crypto.randomUUID()}`);

    expect(res.status).toBe(422);
  });

  test("GET /sub-categories/:id - show single data", async () => {
    const res = await app.request(`/api/v1/sub-categories/${id}`);

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty("message", "Ok");
    expect(json).toHaveProperty("data.code", data1.code);
    expect(json).toHaveProperty("data.name", data1.name);
    expect(json).toHaveProperty("data.is_active", data1.is_active);
  });

  test("PUT /sub-categories/:id - check record exist when update data, it should return unprocessable", async () => {
    const res = await app.request(`api/v1/sub-categories/${crypto.randomUUID()}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(data2),
    });

    expect(res.status).toBe(422);
  });

  test("PUT /sub-categories/:id - update data, it should return ok", async () => {
    const res = await app.request(`api/v1/sub-categories/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(data1new),
    });

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty("message", "Success");
    expect(json).toHaveProperty("data.code", data1new.code);
    expect(json).toHaveProperty("data.name", data1new.name);
    expect(json).toHaveProperty("data.is_active", data1new.is_active);
  });

  test("PUT /sub-categories/:id - check duplicate when update data, it should return conflict", async () => {
    const res = await app.request(`api/v1/sub-categories/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(data2),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toHaveProperty("message", expect.stringContaining("already exists"));
  });

  test("DELETE /sub-categories/:id - delete data validation, it shuld return unprocessable", async () => {
    const res = await app.request("api/v1/sub-categories", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      body: JSON.stringify([crypto.randomUUID()]),
    });

    expect(res.status).toBe(422);
  });

  test("DELETE /sub-categories/:id - delete data, it shuld return ok", async () => {
    const res = await app.request("api/v1/sub-categories", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      body: JSON.stringify([id]),
    });

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty("message", "Success");
    expect(json).toHaveProperty("data");
  });

  test("clear data for after test", async () => {
    await client.delete(table).where(inArray(table.code, [data1.code, data1new.code, data2.code]));
  });
});
