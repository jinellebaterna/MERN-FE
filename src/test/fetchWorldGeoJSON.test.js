import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We declare these here and assign inside beforeEach.
// We can't do a top-level import because we need a fresh module each time
// to reset the module-level cachedGeoJSON variable back to null.
let fetchWorldGeoJSON;

// vi.resetModules() clears Vitest's module registry so the next import()
// gets a brand new copy of countries.js with cachedGeoJSON reset to null.
// Without this, a cached result from test 1 would leak into test 2.
beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal("fetch", vi.fn());
  ({ fetchWorldGeoJSON } = await import("../api/countries"));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchWorldGeoJSON", () => {
  // Happy path — fetch returns ok:true and GeoJSON data.
  // We verify the function returns the parsed JSON directly.
  it("returns parsed GeoJSON on a successful fetch", async () => {
    const mockGeoJSON = { type: "FeatureCollection", features: [] };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGeoJSON,
    });

    const result = await fetchWorldGeoJSON();
    expect(result).toEqual(mockGeoJSON);
  });

  // When the fetch fails (non-ok response), the function throws a specific
  // error message instead of returning bad data — prevents a broken map.
  it("throws an error when response is not ok", async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    await expect(fetchWorldGeoJSON()).rejects.toThrow(
      "Failed to load world map data"
    );
  });

  // The GeoJSON file is large (~500kb) so the result is cached at module level.
  // After the first successful call, subsequent calls return the cached value
  // without hitting the network again.
  it("returns cached result on second call without re-fetching", async () => {
    const mockGeoJSON = { type: "FeatureCollection", features: [] };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGeoJSON,
    });

    const first = await fetchWorldGeoJSON();
    const second = await fetchWorldGeoJSON();

    expect(first).toEqual(mockGeoJSON);
    expect(second).toEqual(mockGeoJSON);
    // fetch should only have been called once — second call used the cache
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
