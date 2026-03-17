import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// React Query.
vi.mock("@tanstack/react-query", async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});
import { useQuery } from "@tanstack/react-query";

// groupByMonth stub — returns 12 months of data when given non-null input.
vi.mock("../api/weather", () => ({
  fetchMonthlyClimate: vi.fn(),
  groupByMonth: vi.fn(() =>
    Array.from({ length: 12 }, (_, i) => ({
      avgHigh: 20 + i,
      avgLow: 10 + i,
      precip: 50 + i * 5,
    }))
  ),
}));

import ClimateChart from "../components/climate-chart/climate-chart";

beforeEach(() => {
  vi.clearAllMocks();
  useQuery.mockReturnValue({ data: null, isLoading: false, isError: false });
});

describe("ClimateChart", () => {
  // When lat/lon are provided and query is loading, the skeleton bars render.
  it("shows skeleton bars while loading", () => {
    useQuery.mockReturnValue({ data: null, isLoading: true, isError: false });
    render(<ClimateChart lat={48.8} lon={2.3} />);
    expect(screen.getByText("Monthly Climate")).toBeInTheDocument();
    expect(document.querySelector(".climate-chart__skeleton")).toBeInTheDocument();
  });

  // When there is an error or no data, the component renders nothing.
  it("renders nothing when isError is true", () => {
    useQuery.mockReturnValue({ data: null, isLoading: false, isError: true });
    const { container } = render(<ClimateChart lat={48.8} lon={2.3} />);
    expect(container.firstChild).toBeNull();
  });

  // When data is loaded, the full chart renders with the Monthly Climate heading.
  it("renders chart with data", () => {
    useQuery.mockReturnValue({
      data: { daily: {} },
      isLoading: false,
      isError: false,
    });
    render(<ClimateChart lat={48.8} lon={2.3} />);
    expect(screen.getByText("Monthly Climate")).toBeInTheDocument();
    expect(
      document.querySelector(".climate-chart--loaded")
    ).toBeInTheDocument();
  });

  // Month labels (Jan–Dec) are displayed in the chart.
  it("renders month labels in the chart", () => {
    useQuery.mockReturnValue({
      data: { daily: {} },
      isLoading: false,
      isError: false,
    });
    render(<ClimateChart lat={48.8} lon={2.3} />);
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("Dec")).toBeInTheDocument();
  });

  // The legend is present in the loaded state.
  it("shows legend when chart is loaded", () => {
    useQuery.mockReturnValue({
      data: { daily: {} },
      isLoading: false,
      isError: false,
    });
    render(<ClimateChart lat={48.8} lon={2.3} />);
    expect(screen.getByText(/Temp range/)).toBeInTheDocument();
    expect(screen.getByText(/Rain/)).toBeInTheDocument();
  });

  // No chart renders when lat/lon are not provided (query disabled).
  it("renders nothing when lat/lon are undefined", () => {
    useQuery.mockReturnValue({ data: null, isLoading: false, isError: false });
    const { container } = render(<ClimateChart />);
    expect(container.firstChild).toBeNull();
  });
});
