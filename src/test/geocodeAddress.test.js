import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { geocodeAddress } from "../api/weather";

// Replace global fetch before each test — no real HTTP requests.
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

// Restore real fetch after each test to avoid affecting other test files.
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("geocodeAddress", () => {
  // Happy path — Nominatim returns a result array with lat, lon, and address.
  // We verify the function extracts and returns the correct shape.
  it("returns lat, lon, and country on a successful response", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          lat: "59.9139",
          lon: "10.7522",
          address: { country: "Norway" },
        },
      ],
    });

    const result = await geocodeAddress("Oslo");
    expect(result).toEqual({
      lat: "59.9139",
      lon: "10.7522",
      country: "Norway",
    });
  });

  // When the address field is missing from the result, the country falls back
  // to null via optional chaining — the function still returns lat/lon safely.
  it("returns null for country when address field is missing", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ lat: "48.8566", lon: "2.3522", address: {} }],
    });

    const result = await geocodeAddress("Paris");
    expect(result.country).toBeNull();
    expect(result.lat).toBe("48.8566");
  });

  // When Nominatim returns an empty array (location not found),
  // the function throws "Location not found" — callers handle this gracefully.
  it('throws "Location not found" when no results are returned', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await expect(geocodeAddress("Nowhere123")).rejects.toThrow(
      "Location not found"
    );
  });

  // The address is URL-encoded before being sent to Nominatim.
  // We verify the fetch URL contains the encoded version of the address.
  it("encodes the address in the request URL", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { lat: "48.8566", lon: "2.3522", address: { country: "France" } },
      ],
    });

    await geocodeAddress("New York");
    const [url] = fetch.mock.calls[0];
    expect(url).toContain("New%20York");
  });
});
