import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchCitiesForCountry } from "../api/cities";

// Replace global fetch before each test so no real HTTP requests are made.
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

// Restore real fetch after each test to keep other test files unaffected.
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchCitiesForCountry", () => {
  // Happy path — the API returns ok:true and a data array.
  // We verify the function returns the cities array from json.data.
  it("returns city list on a successful response", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: false, data: ["Oslo", "Bergen", "Tromsø"] }),
    });

    const result = await fetchCitiesForCountry("Norway");
    expect(result).toEqual(["Oslo", "Bergen", "Tromsø"]);
  });

  // When the server responds with ok:false (e.g. 500 error), the function
  // should return an empty array rather than throwing — keeps the UI safe.
  it("returns [] when response is not ok", async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    const result = await fetchCitiesForCountry("Nowhere1");
    expect(result).toEqual([]);
  });

  // The API can return ok:true but still signal an error via json.error:true.
  // The function checks this flag and returns [] instead of bad data.
  it("returns [] when json.error is true", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: true, data: null }),
    });

    const result = await fetchCitiesForCountry("Nowhere2");
    expect(result).toEqual([]);
  });

  // If fetch itself throws (network down, DNS failure, etc.),
  // the catch block returns [] so the app doesn't crash.
  it("returns [] on a network error", async () => {
    fetch.mockRejectedValueOnce(new Error("Network failure"));

    const result = await fetchCitiesForCountry("Nowhere3");
    expect(result).toEqual([]);
  });

  // The cache sits at module level — after the first successful call,
  // subsequent calls with the same country name skip fetch entirely.
  // We verify fetch is only called once even though we call the function twice.
  it("returns cached result on second call without re-fetching", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: false, data: ["Paris", "Lyon"] }),
    });

    const first = await fetchCitiesForCountry("France");
    const second = await fetchCitiesForCountry("France");

    expect(first).toEqual(["Paris", "Lyon"]);
    expect(second).toEqual(["Paris", "Lyon"]);
    // fetch should only have been called once — second call used the cache
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
