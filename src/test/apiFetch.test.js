import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiFetch } from "../api/client";

// Before each test, replace the global fetch with a fresh mock function.
// vi.stubGlobal("fetch", vi.fn()) intercepts all fetch() calls in this file
// so no real network requests are made — we control what fetch returns.
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

// After each test, restore the original global fetch so other test files
// are not affected. This keeps tests isolated from each other.
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  // The happy path — fetch returns ok:true and a JSON body.
  // mockResolvedValueOnce simulates fetch resolving with a fake Response object.
  // We verify apiFetch returns the parsed JSON data directly.
  it("returns parsed JSON on a successful response", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ user: { name: "Jinelle" } }),
    });

    const result = await apiFetch("/api/users/123");
    expect(result).toEqual({ user: { name: "Jinelle" } });
  });

  // apiFetch prepends IMG_BASE (http://localhost:5001) to the path.
  // We check the first argument passed to fetch to confirm the full URL is correct.
  it("calls fetch with the correct full URL", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiFetch("/api/users");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5001/api/users",
      expect.any(Object)
    );
  });

  // When a token is provided, apiFetch should attach it as a Bearer token
  // in the Authorization header. We inspect the headers object passed to fetch.
  it("adds Authorization header when token is provided", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiFetch("/api/users/123", { token: "abc123" });

    const [, options] = fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer abc123");
  });

  // When the json option is used, apiFetch should set Content-Type to
  // application/json and serialize the object to a JSON string body.
  it("sets Content-Type and stringifies body when json option is used", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiFetch("/api/users/login", {
      method: "POST",
      json: { email: "test@test.com", password: "secret" },
    });

    const [, options] = fetch.mock.calls[0];
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(
      JSON.stringify({ email: "test@test.com", password: "secret" })
    );
  });

  // A 401 response means the user's token is expired or missing.
  // apiFetch throws a specific "UNAUTHORIZED" error so the app can
  // handle auth errors separately from other failures.
  it('throws "UNAUTHORIZED" on a 401 response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Token expired" }),
    });

    await expect(apiFetch("/api/users/123")).rejects.toThrow("UNAUTHORIZED");
  });

  // For non-401 errors (404, 500, etc.), apiFetch reads the error message
  // from the response body and throws it so the UI can display it.
  it("throws the server error message on a non-ok response", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: "User not found" }),
    });

    await expect(apiFetch("/api/users/999")).rejects.toThrow("User not found");
  });
});
