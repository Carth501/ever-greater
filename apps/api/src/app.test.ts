import { describe, expect, it } from "vitest";
import { buildServer } from "./app.js";

async function registerAndGetToken(
  app: ReturnType<typeof buildServer>,
): Promise<string> {
  const response = await app.inject({
    method: "POST",
    url: "/auth/register",
    payload: {
      email: "player@example.com",
      password: "p@ssword",
    },
  });

  expect(response.statusCode).toBe(200);
  return response.json().token as string;
}

describe("API routes", () => {
  it("registers and returns me profile", async () => {
    const app = buildServer();
    const token = await registerAndGetToken(app);

    const meResponse = await app.inject({
      method: "GET",
      url: "/auth/me",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json().email).toBe("player@example.com");

    await app.close();
  });

  it("rejects unauthorized game snapshot requests", async () => {
    const app = buildServer();

    const snapshotResponse = await app.inject({
      method: "GET",
      url: "/game/snapshot",
    });

    expect(snapshotResponse.statusCode).toBe(401);
    await app.close();
  });

  it("prints tickets and supports idempotency", async () => {
    const app = buildServer();
    const token = await registerAndGetToken(app);

    const first = await app.inject({
      method: "POST",
      url: "/game/print-ticket",
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        actionId: "action-1",
      },
    });

    const second = await app.inject({
      method: "POST",
      url: "/game/print-ticket",
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        actionId: "action-1",
      },
    });

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(first.json()).toEqual(second.json());

    await app.close();
  });

  it("validates credentials on login", async () => {
    const app = buildServer();
    await registerAndGetToken(app);

    const loginResponse = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "player@example.com",
        password: "wrong",
      },
    });

    expect(loginResponse.statusCode).toBe(401);
    await app.close();
  });
});
