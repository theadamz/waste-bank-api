import { describe, expect, test } from "vitest";
import app from "../index";

describe("category", () => {
  test("GET /categories", async () => {
    const res = await app.request("/api/v1/categories");

    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty("page");
    expect(json).toHaveProperty("pages");
    expect(json).toHaveProperty("total");
    expect(json).toHaveProperty("data");
  });
});
