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
  };
});
import { useQuery } from "@tanstack/react-query";

// API stubs.
vi.mock("../api/user", () => ({
  fetchUserCountries: vi.fn(),
  fetchUserById: vi.fn(),
  fetchUserWishlist: vi.fn(),
}));
vi.mock("../api/countries", () => ({
  fetchWorldGeoJSON: vi.fn(),
}));

// Leaflet stubs.
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  useMap: vi.fn(() => ({ removeLayer: vi.fn(), addLayer: vi.fn() })),
}));
vi.mock("leaflet", () => ({
  default: {
    geoJSON: vi.fn(() => ({ addTo: vi.fn(), remove: vi.fn() })),
  },
  geoJSON: vi.fn(() => ({ addTo: vi.fn(), remove: vi.fn() })),
}));
vi.mock("leaflet/dist/leaflet.css", () => ({}));

// Map colors hook stub.
vi.mock("../hook/use-map-colors.jsx", () => ({
  default: vi.fn(() => ({
    visitedColor: "#4ade80",
    wishlistColor: "#fb923c",
    setVisitedColor: vi.fn(),
    setWishlistColor: vi.fn(),
    reset: vi.fn(),
  })),
}));

import ScratchMap from "../components/scratch-map/scratch-map";

const mockAuth = {
  isLoggedIn: true,
  userId: "u1",
  token: "tok",
  name: "Alice",
  image: null,
  passportCountry: null,
};

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={["/map"]}>
    <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
  </MemoryRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
  // Default: return loaded countries and no GeoJSON loading.
  useQuery.mockReturnValue({ data: [], isLoading: false });
});

describe("ScratchMap", () => {
  // The MapContainer is always rendered (wrapped by our mock).
  it("renders the map container", () => {
    render(<ScratchMap />, { wrapper });
    expect(screen.getByTestId("map")).toBeInTheDocument();
  });

  // The badge shows 0 countries when no countries are visited.
  it("shows 0 countries visited badge when no countries", () => {
    render(<ScratchMap />, { wrapper });
    expect(screen.getByText(/0 countries visited/)).toBeInTheDocument();
  });

  // With visited countries, the badge shows the correct count.
  it("shows correct country count in badge", () => {
    useQuery.mockReturnValue({
      data: [
        { code: "FR" },
        { code: "DE" },
        { code: "JP" },
      ],
      isLoading: false,
    });
    render(<ScratchMap />, { wrapper });
    expect(screen.getByText(/3 countries visited/)).toBeInTheDocument();
  });

  // When there are no visited countries and it's the own map, the empty state shows.
  it("shows empty state for own map with no countries", () => {
    render(<ScratchMap />, { wrapper });
    expect(screen.getByText("Your map is empty!")).toBeInTheDocument();
  });

  // The legend (Visited / Wishlist) is shown on own map.
  it("renders the legend on own map", () => {
    render(<ScratchMap />, { wrapper });
    expect(screen.getByText("Visited")).toBeInTheDocument();
    expect(screen.getByText("Wishlist")).toBeInTheDocument();
  });

  // The palette customisation button is rendered for the own map.
  it("renders palette button on own map", () => {
    render(<ScratchMap />, { wrapper });
    expect(screen.getByTitle("Customize map colors")).toBeInTheDocument();
  });

  // When viewing another user's map, the legend and palette should NOT appear.
  it("hides legend when viewing another user's map", () => {
    const otherWrapper = ({ children }) => (
      <MemoryRouter initialEntries={["/map?user=u99"]}>
        <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
      </MemoryRouter>
    );
    render(<ScratchMap />, { wrapper: otherWrapper });
    expect(screen.queryByText("Visited")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Customize map colors")).not.toBeInTheDocument();
  });

  // Loading spinner is shown while data is loading.
  it("shows loading spinner while loading", () => {
    useQuery.mockReturnValue({ data: undefined, isLoading: true });
    render(<ScratchMap />, { wrapper });
    expect(document.querySelector(".scratch-map__loading")).toBeInTheDocument();
  });
});
