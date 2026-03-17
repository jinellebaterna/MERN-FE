import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CountryCities from "../components/user-countries/country-cities";

beforeEach(() => vi.clearAllMocks());

const baseProps = {
  canEdit: true,
  cityInput: "",
  setCityInput: vi.fn(),
  citySuggestions: [],
  cityActiveIndex: -1,
  setCityActiveIndex: vi.fn(),
  onCitiesChange: vi.fn(),
};

describe("CountryCities", () => {
  // The Cities Visited heading must always be present.
  it("renders the Cities Visited heading", () => {
    render(
      <CountryCities
        country={{ code: "FR", cities: [] }}
        {...baseProps}
      />
    );
    expect(screen.getByText("Cities Visited")).toBeInTheDocument();
  });

  // Existing cities are rendered as tags.
  it("renders existing city tags", () => {
    render(
      <CountryCities
        country={{ code: "FR", cities: ["Paris", "Lyon"] }}
        {...baseProps}
      />
    );
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("Lyon")).toBeInTheDocument();
  });

  // The city input field is shown when canEdit is true.
  it("shows city input field when canEdit is true", () => {
    render(
      <CountryCities
        country={{ code: "FR", cities: [] }}
        {...baseProps}
        canEdit={true}
      />
    );
    expect(
      screen.getByPlaceholderText("Add a city...")
    ).toBeInTheDocument();
  });

  // No input field should be rendered for read-only viewers.
  it("hides city input when canEdit is false", () => {
    render(
      <CountryCities
        country={{ code: "FR", cities: [] }}
        {...baseProps}
        canEdit={false}
      />
    );
    expect(
      screen.queryByPlaceholderText("Add a city...")
    ).not.toBeInTheDocument();
  });

  // Typing a city name triggers setCityInput so the controlled value updates.
  it("calls setCityInput when typing in the input", async () => {
    const setCityInput = vi.fn();
    render(
      <CountryCities
        country={{ code: "FR", cities: [] }}
        {...baseProps}
        setCityInput={setCityInput}
        canEdit={true}
      />
    );
    const input = screen.getByPlaceholderText("Add a city...");
    await userEvent.type(input, "P");
    expect(setCityInput).toHaveBeenCalled();
  });

  // When there are matching suggestions and user types, the dropdown is shown.
  it("shows suggestions dropdown when cityInput matches a suggestion", () => {
    render(
      <CountryCities
        country={{ code: "FR", cities: [] }}
        {...baseProps}
        cityInput="Par"
        citySuggestions={["Paris", "Marseille"]}
        canEdit={true}
      />
    );
    expect(screen.getByText("Paris")).toBeInTheDocument();
  });

  // Pressing Enter with a typed city calls onCitiesChange.
  it("calls onCitiesChange when Enter is pressed with a city value", async () => {
    const onCitiesChange = vi.fn();
    render(
      <CountryCities
        country={{ code: "FR", cities: [] }}
        {...baseProps}
        cityInput="Bordeaux"
        onCitiesChange={onCitiesChange}
        canEdit={true}
      />
    );
    const input = screen.getByPlaceholderText("Add a city...");
    await userEvent.type(input, "{Enter}");
    expect(onCitiesChange).toHaveBeenCalledWith(["Bordeaux"]);
  });

  // Clicking a city tag's remove button calls onCitiesChange without that city.
  it("removes a city when its × button is clicked", async () => {
    const onCitiesChange = vi.fn();
    render(
      <CountryCities
        country={{ code: "FR", cities: ["Paris", "Lyon"] }}
        {...baseProps}
        onCitiesChange={onCitiesChange}
        canEdit={true}
      />
    );
    // Each city tag has a × button
    const removeButtons = screen.getAllByRole("button", { name: "×" });
    await userEvent.click(removeButtons[0]);
    // Should remove Paris, leaving Lyon
    expect(onCitiesChange).toHaveBeenCalledWith(["Lyon"]);
  });
});
