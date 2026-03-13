import { describe, it, expect } from "vitest";
import { getBestMonths } from "../api/weather";

describe("getBestMonths", () => {
  it("returns null when dailyData is missing", () => {
    expect(getBestMonths(null)).toBeNull();
  });

  it("returns null when no months pass the filter", () => {
    // All temps below 10°C
    const data = {
      time: ["2024-01-01", "2024-02-01"],
      temperature_2m_max: [0, 2],
      temperature_2m_min: [-5, -3],
      precipitation_sum: [10, 10],
    };
    expect(getBestMonths(data)).toBeNull();
  });

  it("returns a month range when good months exist", () => {
    const data = {
      time: Array.from({ length: 365 }, (_, i) => {
        const d = new Date(2024, 0, 1);
        d.setDate(i + 1);
        return d.toISOString().split("T")[0];
      }),
      temperature_2m_max: Array(365).fill(22),
      temperature_2m_min: Array(365).fill(15),
      precipitation_sum: Array(365).fill(2),
    };
    expect(getBestMonths(data)).not.toBeNull();
  });
});
