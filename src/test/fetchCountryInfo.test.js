import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchCountryInfo } from "../api/weather";

// Replace global fetch before each test — no real HTTP requests.
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

// Restore real fetch after each test to avoid affecting other test files.
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchCountryInfo", () => {
  // Happy path — the API returns currencies and languages objects.
  // fetchCountryInfo extracts the first currency symbol and first language name
  // from the response, transforming the shape before returning it.
  it("returns currency and language extracted from the response", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        currencies: { NOK: { name: "Norwegian krone", symbol: "kr" } },
        languages: { nno: "Norwegian Nynorsk" },
      }),
    });

    const result = await fetchCountryInfo("NO");
    expect(result).toEqual({ currency: "kr", currencyCode: "NOK", language: "Norwegian Nynorsk" });
  });

  // When the API response has no currencies or languages (empty objects),
  // both values fall back to null instead of throwing.
  it("returns null for currency and language when objects are empty", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ currencies: {}, languages: {} }),
    });

    const result = await fetchCountryInfo("XX");
    expect(result).toEqual({ currency: null, currencyCode: null, language: null });
  });

  // When the currency entry exists but has no symbol field,
  // the optional chaining ?.symbol falls back to null.
  it("returns null for currency when symbol is missing", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        currencies: { USD: { name: "US Dollar" } }, // no symbol field
        languages: { eng: "English" },
      }),
    });

    const result = await fetchCountryInfo("US");
    expect(result.currency).toBeNull();
    expect(result.language).toBe("English");
  });

  // When the fetch response is not ok (e.g. 404 for unknown country code),
  // the function returns null instead of throwing — keeps the UI safe.
  it("returns null when response is not ok", async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    const result = await fetchCountryInfo("ZZ");
    expect(result).toBeNull();
  });
});
