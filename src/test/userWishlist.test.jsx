import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
import { useQuery, useMutation } from "@tanstack/react-query";

// API stubs.
vi.mock("../api/user", () => ({
  fetchUserWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  reorderWishlist: vi.fn(),
}));

// DnD kit stubs.
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

// Stub WishlistModal.
vi.mock("../components/user-wishlist/wishlist-modal", () => ({
  default: () => <div data-testid="wishlist-modal" />,
}));
vi.mock("../components/shared/skeleton/SkeletonCard", () => ({
  default: () => <div data-testid="skeleton-card" />,
}));

import UserWishlist from "../components/user-wishlist/user-wishlist";

const mockAuth = {
  isLoggedIn: true,
  userId: "u1",
  token: "tok",
  name: "Alice",
  image: null,
  passportCountry: null,
};

const mockWishlist = [
  { code: "JP", name: "Japan", addedAt: "2024-01-01" },
  { code: "BR", name: "Brazil", addedAt: "2024-02-01" },
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
  useQuery.mockReturnValue({ data: mockWishlist, isLoading: false });
});

describe("UserWishlist", () => {
  // When viewing another user's wishlist, the component returns null.
  it("returns null when viewing another user's wishlist", () => {
    const otherWrapper = ({ children }) => (
      <MemoryRouter initialEntries={["/countries?user=u99"]}>
        <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
      </MemoryRouter>
    );
    const { container } = render(<UserWishlist />, { wrapper: otherWrapper });
    expect(container.firstChild).toBeNull();
  });

  // While loading, a skeleton card placeholder is shown.
  it("shows skeleton when loading", () => {
    useQuery.mockReturnValue({ data: [], isLoading: true });
    render(<UserWishlist />, { wrapper });
    expect(screen.getByTestId("skeleton-card")).toBeInTheDocument();
  });

  // Wishlist cards render with country names.
  it("renders wishlist country cards", () => {
    render(<UserWishlist />, { wrapper });
    expect(screen.getByText("Japan")).toBeInTheDocument();
    expect(screen.getByText("Brazil")).toBeInTheDocument();
  });

  // When wishlist is empty, the empty state message is shown.
  it("shows empty state when wishlist is empty", () => {
    useQuery.mockReturnValue({ data: [], isLoading: false });
    render(<UserWishlist />, { wrapper });
    expect(
      screen.getByText(
        "Add countries you want to visit using the search above!"
      )
    ).toBeInTheDocument();
  });

  // Clicking the × remove button calls the remove mutation.
  it("calls remove mutation when × button is clicked", async () => {
    const mutate = vi.fn();
    useMutation.mockReturnValue({ mutate, isPending: false });
    render(<UserWishlist />, { wrapper });
    const removeBtns = document.querySelectorAll(".wishlist-card__remove");
    await userEvent.click(removeBtns[0]);
    expect(mutate).toHaveBeenCalled();
  });

  // The bucket list count badge is displayed.
  it("shows wishlist count badge", () => {
    render(<UserWishlist />, { wrapper });
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
