import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContinentStats from "../components/continent-stats/continent-stats";

beforeEach(() => vi.clearAllMocks());

// We use real data so we can verify correct continent headings and percentage math.
describe("ContinentStats", () => {
  // All continents from CONTINENT_ORDER should be rendered.
  it("renders a card for each continent", () => {
    render(
      <ContinentStats
        countries={[]}
        selectedContinent={null}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText("Africa")).toBeInTheDocument();
    expect(screen.getByText("Asia")).toBeInTheDocument();
    expect(screen.getByText("Europe")).toBeInTheDocument();
    expect(screen.getByText("North America")).toBeInTheDocument();
    expect(screen.getByText("South America")).toBeInTheDocument();
    expect(screen.getByText("Oceania")).toBeInTheDocument();
  });

  // With no countries visited, all counts should show 0.
  it("shows 0 visited for each continent when no countries", () => {
    render(
      <ContinentStats
        countries={[]}
        selectedContinent={null}
        onSelect={vi.fn()}
      />
    );
    // All "0 / N countries" entries
    const countTexts = screen.getAllByText(/^0 \//);
    expect(countTexts.length).toBe(6);
  });

  // France (Europe) should increment the Europe count to 1.
  it("counts visited countries per continent", () => {
    render(
      <ContinentStats
        countries={[{ code: "FR", name: "France" }]}
        selectedContinent={null}
        onSelect={vi.fn()}
      />
    );
    // Europe should show "1 / X countries"
    expect(screen.getByText(/^1 \//)).toBeInTheDocument();
  });

  // The selected continent card gets the --active modifier class.
  it("applies active class to selected continent card", () => {
    render(
      <ContinentStats
        countries={[]}
        selectedContinent="Europe"
        onSelect={vi.fn()}
      />
    );
    const europeCard = screen.getByText("Europe").closest(".continent-stats__card");
    expect(europeCard).toHaveClass("continent-stats__card--active");
  });

  // Other continents do NOT get the active class when a different one is selected.
  it("does not apply active class to non-selected continent cards", () => {
    render(
      <ContinentStats
        countries={[]}
        selectedContinent="Europe"
        onSelect={vi.fn()}
      />
    );
    const africaCard = screen.getByText("Africa").closest(".continent-stats__card");
    expect(africaCard).not.toHaveClass("continent-stats__card--active");
  });

  // Clicking a continent card calls onSelect with the continent name.
  it("calls onSelect with continent name when card is clicked", async () => {
    const onSelect = vi.fn();
    render(
      <ContinentStats
        countries={[]}
        selectedContinent={null}
        onSelect={onSelect}
      />
    );
    await userEvent.click(screen.getByText("Asia").closest(".continent-stats__card"));
    expect(onSelect).toHaveBeenCalledWith("Asia");
  });

  // Progress bar width reflects the percentage of visited countries.
  it("sets bar width to 0% when no countries visited", () => {
    render(
      <ContinentStats
        countries={[]}
        selectedContinent={null}
        onSelect={vi.fn()}
      />
    );
    const bars = document.querySelectorAll(".continent-stats__bar");
    bars.forEach((bar) => {
      expect(bar.style.width).toBe("0%");
    });
  });
});
