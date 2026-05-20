import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { createApp } from "../src/app";
import { db } from "../src/infrastructure/database/prisma-client";
import { seed } from "../prisma/seed";

const app = createApp();

async function jsonRequest(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await app.handle(
    new Request(`http://localhost${path}`, {
      ...init,
      headers,
    })
  );
  const body = await response.json() as any;
  return { response, body };
}

async function login(email: string, password: string) {
  const { response, body } = await jsonRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  expect(response.status).toBe(200);
  expect(body.success).toBe(true);
  expect(body.data.token).toBeString();
  return body.data.token as string;
}

beforeAll(async () => {
  await seed();
}, 30_000);

afterAll(async () => {
  await db.role.deleteMany({
    where: { name: { startsWith: "TEST_" } },
  });
  await db.permission.deleteMany({
    where: { name: { startsWith: "TEST_" } },
  });
  await db.$disconnect();
}, 30_000);

describe("RBAC API", () => {
  it("menampilkan health check root API", async () => {
    const { response, body } = await jsonRequest("/");

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("login akun seed dan mendapatkan token JWT", async () => {
    const token = await login("superadmin@test.com", "Admin123!");

    expect(token.split(".")).toHaveLength(3);
  });

  it("mengizinkan SUPERADMIN membuat role", async () => {
    const token = await login("superadmin@test.com", "Admin123!");
    const roleName = `TEST_SUPERADMIN_${Date.now()}`;

    const { response, body } = await jsonRequest("/roles", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: roleName,
        description: "Role sementara untuk testing API",
      }),
    });

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.name).toBe(roleName);
  });

  it("menolak USER membuat role karena tidak punya CREATE_ROLE", async () => {
    const token = await login("user@test.com", "User123!");

    const { response, body } = await jsonRequest("/roles", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: `TEST_DENIED_${Date.now()}`,
        description: "Role ini tidak boleh dibuat oleh user biasa",
      }),
    });

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.message).toContain("CREATE_ROLE");
  });

  it("menolak endpoint protected tanpa token", async () => {
    const { response, body } = await jsonRequest("/permissions", {
      method: "POST",
      body: JSON.stringify({
        name: `TEST_PERMISSION_${Date.now()}`,
        description: "Permission sementara untuk testing API",
      }),
    });

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
  });
});
