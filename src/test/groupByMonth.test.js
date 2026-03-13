import { describe, it, expect } from "vitest";
import { groupByMonth } from "../api/weather";

describe("groupByMonth", () => {
  // groupByMonth always returns one entry per month regardless of input size
  it("returns an array of 12 months", () => {
    const result = groupByMonth({
      time: ["2024-01-15"],
      temperature_2m_max: [10],
      temperature_2m_min: [5],
      precipitation_sum: [20],
    });
    expect(result).toHaveLength(12);
  });

  // avgHigh and avgLow are the mean of all daily readings within that month
  it("correctly averages temperatures for a month", () => {
    const result = groupByMonth({
      time: ["2024-06-15", "2024-06-16"],
      temperature_2m_max: [20, 30],
      temperature_2m_min: [10, 20],
      precipitation_sum: [5, 5],
    });
    expect(result[5].avgHigh).toBe(25);
    expect(result[5].avgLow).toBe(15);
  });

  // precip is the total (sum) of all daily precipitation in the month, not an average
  it("sums precipitation for a month", () => {
    const result = groupByMonth({
      time: ["2024-03-15", "2024-03-16"],
      temperature_2m_max: [15, 15],
      temperature_2m_min: [8, 8],
      precipitation_sum: [10, 20],
    });
    expect(result[2].precip).toBe(30);
  });

  // null daily values are excluded — empty months return null, not 0
  it("returns null for avgHigh/avgLow/precip when values are null", () => {
    const result = groupByMonth({
      time: ["2024-01-15"],
      temperature_2m_max: [null],
      temperature_2m_min: [null],
      precipitation_sum: [null],
    });
    expect(result[0].avgHigh).toBeNull();
    expect(result[0].avgLow).toBeNull();
    expect(result[0].precip).toBeNull();
  });

  // mid-month dates avoid UTC midnight boundary issues with getMonth()
  it("places data into the correct month bucket", () => {
    const result = groupByMonth({
      time: ["2024-01-15", "2024-12-15"],
      temperature_2m_max: [5, 25],
      temperature_2m_min: [0, 18],
      precipitation_sum: [10, 30],
    });
    expect(result[0].avgHigh).toBe(5);
    expect(result[11].avgHigh).toBe(25);
  });
});
