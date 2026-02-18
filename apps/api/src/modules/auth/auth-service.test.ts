import { describe, expect, it } from "vitest";
import { AuthService } from "./auth-service.js";

describe("AuthService", () => {
  it("registers and logs in a user", () => {
    const service = new AuthService();
    const registered = service.register("test@example.com", "s3cret");
    const loggedIn = service.login("test@example.com", "s3cret");

    expect(registered.userId).toBeTypeOf("string");
    expect(loggedIn.userId).toBe(registered.userId);
  });

  it("rejects duplicate registration", () => {
    const service = new AuthService();
    service.register("test@example.com", "s3cret");

    expect(() => service.register("test@example.com", "s3cret")).toThrowError(
      "Email is already registered",
    );
  });

  it("rejects invalid login credentials", () => {
    const service = new AuthService();
    service.register("test@example.com", "s3cret");

    expect(() => service.login("test@example.com", "wrong")).toThrowError(
      "Invalid credentials",
    );
    expect(() => service.login("missing@example.com", "s3cret")).toThrowError(
      "Invalid credentials",
    );
  });

  it("requires email and password at registration", () => {
    const service = new AuthService();
    expect(() => service.register("", "")).toThrowError(
      "Email and password are required",
    );
  });
});
