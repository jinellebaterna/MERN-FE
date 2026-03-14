import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchPlaces } from "../api/places";
import { apiFetch } from "../api/client";

// vi.mock replaces the entire module with a mock version.
// Here we replace apiFetch with a vi.fn() so we can inspect
// what URL searchPlaces passes to it — without making real requests.
vi.mock("../api/client", () => ({
  apiFetch: vi.fn(),
}));

// Reset the mock before each test so call history doesn't leak between tests.
beforeEach(() => {
  apiFetch.mockReset();
  apiFetch.mockResolvedValue({ places: [] });
});

describe("searchPlaces", () => {
  // page and limit are always appended, even when no other params are passed.
  // This ensures the API always receives pagination info.
  it("always includes page and limit in the URL", async () => {
    await searchPlaces();
    const [url] = apiFetch.mock.calls[0];
    expect(url).toContain("page=1");
    expect(url).toContain("limit=9");
  });

  // search, creator, and tag are only appended when non-empty.
  // Empty strings are skipped to keep the URL clean.
  it("omits empty search, creator, and tag params", async () => {
    await searchPlaces({ search: "", creator: "", tag: "" });
    const [url] = apiFetch.mock.calls[0];
    expect(url).not.toContain("search=");
    expect(url).not.toContain("creator=");
    expect(url).not.toContain("tag=");
  });

  // When all params are provided, all of them appear in the URL.
  it("includes all params when all are provided", async () => {
    await searchPlaces({
      search: "paris",
      creator: "user1",
      tag: "food",
      page: 2,
      limit: 6,
    });
    const [url] = apiFetch.mock.calls[0];
    expect(url).toContain("search=paris");
    expect(url).toContain("creator=user1");
    expect(url).toContain("tag=food");
    expect(url).toContain("page=2");
    expect(url).toContain("limit=6");
  });

  // Only the provided non-empty params are included — others are omitted.
  it("includes only non-empty params when partially provided", async () => {
    await searchPlaces({ search: "beach", tag: "" });
    const [url] = apiFetch.mock.calls[0];
    expect(url).toContain("search=beach");
    expect(url).not.toContain("tag=");
    expect(url).not.toContain("creator=");
  });
});
