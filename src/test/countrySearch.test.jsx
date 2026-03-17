import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CountrySearch from "../components/country-search/country-search";

beforeEach(() => vi.clearAllMocks());

describe("CountrySearch", () => {
  // The search input is rendered with the correct placeholder.
  it("renders the search input", () => {
    render(<CountrySearch onSelect={vi.fn()} />);
    expect(
      screen.getByPlaceholderText("Search for a country...")
    ).toBeInTheDocument();
  });

  // Typing a query that matches country names shows the dropdown.
  it("shows dropdown results when typing a matching query", async () => {
    render(<CountrySearch onSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search for a country...");
    await userEvent.type(input, "Fra");
    expect(screen.getByText("France")).toBeInTheDocument();
  });

  // Typing a query with no matches shows an empty dropdown (no items).
  it("shows no results for a non-matching query", async () => {
    render(<CountrySearch onSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search for a country...");
    await userEvent.type(input, "zzznomatch");
    expect(
      document.querySelector(".country-search__dropdown")
    ).not.toBeInTheDocument();
  });

  // Clicking a result calls onSelect with the country object.
  it("calls onSelect when a result is clicked", async () => {
    const onSelect = vi.fn();
    render(<CountrySearch onSelect={onSelect} />);
    const input = screen.getByPlaceholderText("Search for a country...");
    await userEvent.type(input, "Fra");
    // France should appear — click it via mouseDown (the component uses onMouseDown)
    const franceItem = screen.getByText("France");
    await userEvent.pointer({ target: franceItem, keys: "[MouseLeft>]" });
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: "France", code: "FR" })
    );
  });

  // After selecting, the input is cleared.
  it("clears input after a country is selected", async () => {
    render(<CountrySearch onSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search for a country...");
    await userEvent.type(input, "Fra");
    const franceItem = screen.getByText("France");
    await userEvent.pointer({ target: franceItem, keys: "[MouseLeft>]" });
    expect(input).toHaveValue("");
  });

  // Countries in excludeCodes are not shown in results.
  it("excludes countries listed in excludeCodes", async () => {
    render(<CountrySearch onSelect={vi.fn()} excludeCodes={["FR"]} />);
    const input = screen.getByPlaceholderText("Search for a country...");
    await userEvent.type(input, "Fra");
    expect(screen.queryByText("France")).not.toBeInTheDocument();
  });

  // Pressing Escape clears the dropdown.
  it("closes dropdown on Escape key", async () => {
    render(<CountrySearch onSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText("Search for a country...");
    await userEvent.type(input, "Ger");
    expect(screen.getByText("Germany")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(
      document.querySelector(".country-search__dropdown")
    ).not.toBeInTheDocument();
  });
});
