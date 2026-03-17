import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../components/context/auth-context";

// React Query.
vi.mock("@tanstack/react-query", async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
  };
});
import { useQuery } from "@tanstack/react-query";

// API stubs.
vi.mock("../api/user", () => ({
  addUserCountry: vi.fn(),
  removeFromWishlist: vi.fn(),
  updateWishlistDetails: vi.fn(),
}));
vi.mock("../api/weather", () => ({
  geocodeAddress: vi.fn(() => Promise.resolve({ lat: 48.8, lon: 2.3 })),
  fetchCountryInfo: vi.fn(() => Promise.resolve(null)),
  fetchWeather: vi.fn(() => Promise.resolve(null)),
  getBestMonths: vi.fn(() => null),
  fetchMonthlyClimate: vi.fn(() => Promise.resolve(null)),
  fetchVisaRequirement: vi.fn(() => Promise.resolve("VF")),
  fetchExchangeRate: vi.fn(() => Promise.resolve(1.2)),
}));

// Stub ClimateChart to avoid weather queries inside modal.
vi.mock("../components/climate-chart/climate-chart", () => ({
  default: () => <div data-testid="climate-chart" />,
}));

import WishlistModal from "../components/user-wishlist/wishlist-modal";

const mockAuth = {
  isLoggedIn: true,
  userId: "u1",
  token: "tok",
  name: "Alice",
  image: null,
  passportCountry: "GB",
};

const mockCountry = {
  code: "JP",
  name: "Japan",
  notes: "",
  priority: "medium",
  targetYear: null,
};

const onClose = vi.fn();

const wrapper = ({ children }) => (
  <MemoryRouter>
    <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
  </MemoryRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
  // Default: queries return undefined (no data yet).
  useQuery.mockReturnValue({ data: undefined, isLoading: false });
});

describe("WishlistModal", () => {
  // The country name must appear in the modal header.
  it("renders the country name in the header", () => {
    render(
      <WishlistModal
        country={mockCountry}
        canEdit={true}
        onClose={onClose}
      />,
      { wrapper }
    );
    expect(screen.getByText("Japan")).toBeInTheDocument();
  });

  // While country info is loading, the loading skeleton strips are shown.
  it("shows loading skeleton when info is loading", () => {
    render(
      <WishlistModal
        country={mockCountry}
        canEdit={true}
        onClose={onClose}
      />,
      { wrapper }
    );
    // Loading strips use the info-strip--loading class
    expect(
      document.querySelector(".wishlist-modal__info-strip--loading")
    ).toBeInTheDocument();
  });

  // The close button calls onClose when clicked.
  it("calls onClose when close button is clicked", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    render(
      <WishlistModal
        country={mockCountry}
        canEdit={true}
        onClose={onClose}
      />,
      { wrapper }
    );
    await userEvent.click(screen.getByRole("button", { name: "×" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // Google Flights and Skyscanner links are always rendered.
  it("renders flight links", () => {
    render(
      <WishlistModal
        country={mockCountry}
        canEdit={true}
        onClose={onClose}
      />,
      { wrapper }
    );
    expect(screen.getByRole("link", { name: "Google Flights" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skyscanner" })).toBeInTheDocument();
  });

  // When passport country is not set, the "Set passport in profile" hint is shown.
  it("shows passport hint when no passport country is set", () => {
    const noPassportAuth = { ...mockAuth, passportCountry: null };
    const noPassportWrapper = ({ children }) => (
      <MemoryRouter>
        <AuthContext.Provider value={noPassportAuth}>
          {children}
        </AuthContext.Provider>
      </MemoryRouter>
    );
    render(
      <WishlistModal
        country={mockCountry}
        canEdit={true}
        onClose={onClose}
      />,
      { wrapper: noPassportWrapper }
    );
    expect(screen.getByText("Set passport in profile")).toBeInTheDocument();
  });

  // When visa is loading, the visa loading spinner element is shown.
  it("shows visa loading spinner when visaLoading is true", () => {
    useQuery.mockImplementation(({ queryKey }) => {
      if (queryKey?.[0] === "visa") return { data: undefined, isLoading: true };
      return { data: undefined, isLoading: false };
    });
    render(
      <WishlistModal
        country={mockCountry}
        canEdit={true}
        onClose={onClose}
      />,
      { wrapper }
    );
    expect(
      document.querySelector(".wishlist-modal__visa-loading")
    ).toBeInTheDocument();
  });

  // The climate chart sub-component is always rendered.
  it("renders ClimateChart", () => {
    render(
      <WishlistModal
        country={mockCountry}
        canEdit={true}
        onClose={onClose}
      />,
      { wrapper }
    );
    expect(screen.getByTestId("climate-chart")).toBeInTheDocument();
  });

  // The Mark as Visited button appears for the owner.
  it("shows Mark as Visited button when canEdit is true", () => {
    render(
      <WishlistModal
        country={mockCountry}
        canEdit={true}
        onClose={onClose}
      />,
      { wrapper }
    );
    expect(
      screen.getByRole("button", { name: "✓ Mark as Visited" })
    ).toBeInTheDocument();
  });

  // The Mark as Visited button is hidden when canEdit is false.
  it("hides Mark as Visited button when canEdit is false", () => {
    render(
      <WishlistModal
        country={mockCountry}
        canEdit={false}
        onClose={onClose}
      />,
      { wrapper }
    );
    expect(
      screen.queryByRole("button", { name: "✓ Mark as Visited" })
    ).not.toBeInTheDocument();
  });
});
