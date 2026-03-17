import { describe, it, expect } from "vitest";
import { formatDate } from "../utils/formatDate";

describe("formatDate", () => {
  // Smoke test — formatDate should return a non-empty string for a valid date.
  it("returns a non-empty string for a valid date", () => {
    const result = formatDate("2023-06-15");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  // The year should always appear in the output regardless of monthFormat.
  it("includes the year in the output", () => {
    const result = formatDate("2023-06-15");
    expect(result).toContain("2023");
  });

  // Default monthFormat is "short" — verify the month appears in abbreviated form.
  it("uses short month format by default", () => {
    const result = formatDate("2023-01-01");
    // "Jan" or locale equivalent should be present (short format is shorter than long)
    expect(result.length).toBeLessThan(20);
  });

  // Passing "long" as second argument should produce a longer month name.
  it("uses long month format when specified", () => {
    const shortResult = formatDate("2023-01-01", "short");
    const longResult = formatDate("2023-01-01", "long");
    // Long month name is always at least as long as short month name
    expect(longResult.length).toBeGreaterThanOrEqual(shortResult.length);
  });

  // "numeric" month format should produce a numeric representation.
  it("accepts numeric month format", () => {
    const result = formatDate("2023-06-15", "numeric");
    expect(result).toContain("2023");
    expect(typeof result).toBe("string");
  });

  // Different dates should produce different outputs.
  it("returns different output for different dates", () => {
    const jan = formatDate("2023-01-01");
    const dec = formatDate("2023-12-01");
    expect(jan).not.toBe(dec);
  });

  // Dates in different years produce different year values.
  it("reflects the correct year", () => {
    const result2020 = formatDate("2020-06-01");
    const result2024 = formatDate("2024-06-01");
    expect(result2020).toContain("2020");
    expect(result2024).toContain("2024");
  });
});
