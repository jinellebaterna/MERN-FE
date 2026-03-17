import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../components/context/auth-context";
import ReactDOM from "react-dom";

// Portal inline.
vi.spyOn(ReactDOM, "createPortal").mockImplementation((node) => node);
vi.mock("react-transition-group", () => ({
  CSSTransition: ({ children, in: inProp }) => (inProp ? children : null),
}));

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
  fetchUserCountries: vi.fn(),
  fetchUserById: vi.fn(),
  addUserCountry: vi.fn(),
  fetchUserWishlist: vi.fn(),
  addToWishlist: vi.fn(),
  reorderCountries: vi.fn(),
}));

// DnD kit — replace with passthrough so rendering works without drag sensors.
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }) => <>{children}</>,
  closestCenter: vi.fn(),
  PointerSensor: class {},
  KeyboardSensor: class {},
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));
vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }) => <>{children}</>,
  rectSortingStrategy: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: vi.fn(() => ({
    setNodeRef: vi.fn(),
    style: {},
    attributes: {},
    listeners: {},
  })),
}));

// Hook stubs.
vi.mock("../hook/use-sortable-list", () => ({
  default: vi.fn(() => ({ sensors: [], handleDragEnd: vi.fn() })),
}));
vi.mock("../hook/use-sortable-item", () => ({
  default: vi.fn(() => ({
    setNodeRef: vi.fn(),
    style: {},
    attributes: {},
    listeners: {},
  })),
}));
vi.mock("../hook/use-error-handler", () => ({
  default: vi.fn(() => ({ error: null, setError: vi.fn(), clearError: vi.fn() })),
}));

// Stub sub-components.
vi.mock("../components/country-search/country-search", () => ({
  default: vi.fn(({ onSelect: _ }, ref) => (
    <input data-testid="country-search" placeholder="Search for a country..." ref={ref} />
  )),
}));
vi.mock("../components/continent-stats/continent-stats", () => ({
  default: () => <div data-testid="continent-stats" />,
}));
vi.mock("../components/user-countries/country-modal", () => ({
  default: () => <div data-testid="country-modal" />,
}));
vi.mock("../components/shared/skeleton/SkeletonCard", () => ({
  default: () => <div data-testid="skeleton-card" />,
}));

import UserCountries from "../components/user-countries/user-countries";

const mockAuth = {
  isLoggedIn: true,
  userId: "u1",
  token: "tok",
  name: "Alice",
  image: null,
  passportCountry: null,
};

const mockCountries = [
  { code: "FR", name: "France", images: [], cities: [], comments: [], likes: [] },
  { code: "DE", name: "Germany", images: [], cities: [], comments: [], likes: [] },
];

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={["/countries"]}>
    <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
  </MemoryRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
  document.body.style.overflow = "";
  ["backdrop-hook", "modal-hook"].forEach((id) => {
    if (!document.getElementById(id)) {
      const el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
  });
  // Default: all queries return data.
  useQuery.mockReturnValue({ data: mockCountries, isLoading: false });
});

describe("UserCountries", () => {
  // While countries are loading a skeleton card placeholder is shown.
  it("shows skeleton when loading", () => {
    useQuery.mockReturnValue({ data: [], isLoading: true });
    render(<UserCountries />, { wrapper });
    expect(screen.getByTestId("skeleton-card")).toBeInTheDocument();
  });

  // Country cards render with their names.
  it("renders country cards when loaded", () => {
    render(<UserCountries />, { wrapper });
    expect(screen.getByText("France")).toBeInTheDocument();
    expect(screen.getByText("Germany")).toBeInTheDocument();
  });

  // When no countries, the empty state message is shown.
  it("shows empty state when no countries", () => {
    useQuery.mockReturnValue({ data: [], isLoading: false });
    render(<UserCountries />, { wrapper });
    expect(screen.getByText("No countries yet!")).toBeInTheDocument();
  });

  // The search bar is visible when viewing own countries (canEdit = true).
  it("shows country search for own profile", () => {
    render(<UserCountries />, { wrapper });
    expect(screen.getByTestId("country-search")).toBeInTheDocument();
  });

  // When viewing another user's countries (canEdit = false) the search bar is hidden.
  it("hides search for other user's countries", () => {
    const otherUserWrapper = ({ children }) => (
      <MemoryRouter initialEntries={["/countries?user=u99"]}>
        <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
      </MemoryRouter>
    );
    render(<UserCountries />, { wrapper: otherUserWrapper });
    expect(screen.queryByTestId("country-search")).not.toBeInTheDocument();
  });

  // The My Countries heading includes the count badge.
  it("shows country count in heading", () => {
    render(<UserCountries />, { wrapper });
    expect(screen.getByText("My Countries")).toBeInTheDocument();
    // Count badge renders the number of countries
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
