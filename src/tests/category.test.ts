import { client } from "@db/client";
import { categoriesTable } from "@db/schemas/schema";
import { describe, expect, test } from "bun:test";
import { inArray } from "drizzle-orm";
import app from "../index";

describe("category", () => {
  let id: string;
  const data1 = {
    code: "TEST1",
    name: "Test1",
    is_active: true,
  };
  const data1new = {
    code: "NEW1",
    name: "NEW1",
    is_active: true,
  };
  const data2 = {
    code: "TEST2",
    name: "Test2",
    is_active: false,
  };

  test("clear data before test", async () => {
    const deletedCodes: string[] = (
      await client
        .delete(categoriesTable)
        .where(inArray(categoriesTable.code, [data1.code, data1new.code, data2.code]))
        .returning({ code: categoriesTable.code })
    ).map((col) => col.code);
  });

  test("GET /categories - show data with paging, it should return ok", async () => {
    const res = await app.request("/api/v1/categories");

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty("page");
    expect(json).toHaveProperty("pages");
    expect(json).toHaveProperty("total");
    expect(json).toHaveProperty("data");
  });

  test("POST /categories - check request validation", async () => {
    const res = await app.request("api/v1/categories", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        name: "New categories",
      }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("message", expect.stringContaining("Bad Request"));
    expect(json).toHaveProperty("errors.code", expect.objectContaining(expect.any(String)));
    expect(json).toHaveProperty("errors.is_active", expect.objectContaining(expect.any(String)));
  });

  test("POST /categories - create new data, it should return created", async () => {
    // insert data1
    const res = await app.request("api/v1/categories", {
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
    const res2 = await app.request("api/v1/categories", {
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

  test("POST /categories - check duplicate when create new data, it should return conflict", async () => {
    const res = await app.request("api/v1/categories", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data1),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toHaveProperty("message", expect.stringContaining("already exists"));
  });

  test("GET /categories/:id - show single data", async () => {
    const res = await app.request(`/api/v1/categories/${id}`);

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty("message", "Ok");
    expect(json).toHaveProperty("data.code", data1.code);
    expect(json).toHaveProperty("data.name", data1.name);
    expect(json).toHaveProperty("data.is_active", data1.is_active);
  });

  test("GET /categories/:id - show single data, but it shuld return not found", async () => {
    const res = await app.request(`/api/v1/categories/${crypto.randomUUID()}`);

    expect(res.status).toBe(404);
    expect(await res.json()).toHaveProperty("message", expect.stringContaining("Not found"));
  });

  test("PUT /categories/:id - update data, it should return ok", async () => {
    const res = await app.request(`api/v1/categories/${id}`, {
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

  test("PUT /categories/:id - check record exist when update data, it should return not found", async () => {
    const res = await app.request(`api/v1/categories/${crypto.randomUUID()}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(data2),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toHaveProperty("message", expect.stringContaining("Not found"));
  });

  test("PUT /categories/:id - check duplicate when update data, it should return conflict", async () => {
    const res = await app.request(`api/v1/categories/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(data2),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toHaveProperty("message", expect.stringContaining("already exists"));
  });

  test("DELETE /categories/:id - delete data, it shuld return ok", async () => {
    const res = await app.request("api/v1/categories", {
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
    const deletedCodes: string[] = (
      await client
        .delete(categoriesTable)
        .where(inArray(categoriesTable.code, [data1.code, data1new.code, data2.code]))
        .returning({ code: categoriesTable.code })
    ).map((col) => col.code);
  });
});
