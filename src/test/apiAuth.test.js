import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock apiFetch and uploadFiles to avoid real HTTP calls.
vi.mock("../api/client", () => ({
  apiFetch: vi.fn(),
}));

vi.mock("../api/upload", () => ({
  uploadFiles: vi.fn(),
}));

import { loginUser, signupUser } from "../api/auth";
import { apiFetch } from "../api/client";
import { uploadFiles } from "../api/upload";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loginUser", () => {
  // loginUser should POST to /api/users/login with email and password.
  it("posts to /api/users/login with email and password", async () => {
    apiFetch.mockResolvedValueOnce({ userId: "u1", token: "tok" });
    await loginUser({ email: "a@a.com", password: "secret" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/users/login");
    expect(opts.method).toBe("POST");
    expect(opts.json.email).toBe("a@a.com");
    expect(opts.json.password).toBe("secret");
  });

  // loginUser should return the response from apiFetch.
  it("returns the apiFetch response", async () => {
    const mockResponse = { userId: "u1", token: "tok" };
    apiFetch.mockResolvedValueOnce(mockResponse);
    const result = await loginUser({ email: "a@a.com", password: "secret" });
    expect(result).toEqual(mockResponse);
  });
});

describe("signupUser", () => {
  // signupUser without an image should NOT call uploadFiles.
  it("does not call uploadFiles when no image is provided", async () => {
    apiFetch.mockResolvedValueOnce({ userId: "u1" });
    await signupUser({ name: "Alice", email: "a@a.com", password: "pw" });
    expect(uploadFiles).not.toHaveBeenCalled();
  });

  // signupUser with an image should call uploadFiles first.
  it("calls uploadFiles when image is provided", async () => {
    uploadFiles.mockResolvedValueOnce({ paths: ["/img/avatar.png"] });
    apiFetch.mockResolvedValueOnce({ userId: "u1" });
    await signupUser({
      name: "Alice",
      email: "a@a.com",
      password: "pw",
      image: new File(["x"], "avatar.png"),
    });
    expect(uploadFiles).toHaveBeenCalledTimes(1);
  });

  // signupUser with an image should include the uploaded path in the request payload.
  it("includes uploaded image path in apiFetch payload", async () => {
    uploadFiles.mockResolvedValueOnce({ paths: ["/img/avatar.png"] });
    apiFetch.mockResolvedValueOnce({ userId: "u1" });
    await signupUser({
      name: "Alice",
      email: "a@a.com",
      password: "pw",
      image: new File(["x"], "avatar.png"),
    });
    const [, opts] = apiFetch.mock.calls[0];
    expect(opts.json.image).toBe("/img/avatar.png");
  });

  // signupUser without image passes null for image in the payload.
  it("passes null for image when no image is provided", async () => {
    apiFetch.mockResolvedValueOnce({ userId: "u1" });
    await signupUser({ name: "Alice", email: "a@a.com", password: "pw" });
    const [, opts] = apiFetch.mock.calls[0];
    expect(opts.json.image).toBeNull();
  });

  // signupUser posts to /api/users/signup.
  it("posts to /api/users/signup", async () => {
    apiFetch.mockResolvedValueOnce({ userId: "u1" });
    await signupUser({ name: "Alice", email: "a@a.com", password: "pw" });
    const [url] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/users/signup");
  });

  // signupUser includes name, email and password in the payload.
  it("includes name, email, and password in the payload", async () => {
    apiFetch.mockResolvedValueOnce({ userId: "u1" });
    await signupUser({ name: "Alice", email: "a@a.com", password: "mypassword" });
    const [, opts] = apiFetch.mock.calls[0];
    expect(opts.json.name).toBe("Alice");
    expect(opts.json.email).toBe("a@a.com");
    expect(opts.json.password).toBe("mypassword");
  });
});
