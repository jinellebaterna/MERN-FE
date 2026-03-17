import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../components/context/auth-context";
import { ThemeContext } from "../components/context/theme-context";
import ReactDOM from "react-dom";

// Portal rendering inline so modal content is queryable.
vi.spyOn(ReactDOM, "createPortal").mockImplementation((node) => node);
vi.mock("react-transition-group", () => ({
  CSSTransition: ({ children, in: inProp }) => (inProp ? children : null),
}));

// React Query — controlled per test.
vi.mock("@tanstack/react-query", async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
      reset: vi.fn(),
    })),
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
  };
});
import { useQuery } from "@tanstack/react-query";

// API stubs.
vi.mock("../api/user", () => ({
  fetchUserById: vi.fn(),
  fetchUserCountries: vi.fn(),
  fetchUserWishlist: vi.fn(),
  fetchAllUsers: vi.fn(),
  updateUser: vi.fn(),
  changePassword: vi.fn(),
  deleteUser: vi.fn(),
}));

// Follow mutation hook stub.
vi.mock("../hook/use-follow-mutation", () => ({
  default: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

// useAuthMutation stub — wraps useMutation.
vi.mock("../hook/use-auth-mutation", () => ({
  useAuthMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
    reset: vi.fn(),
  })),
}));

import Profile from "../components/profile/profile";

const mockAuth = {
  isLoggedIn: true,
  userId: "u1",
  token: "tok",
  name: "Alice",
  image: null,
  passportCountry: null,
  login: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
};

const mockTheme = { theme: "light", toggleTheme: vi.fn() };

const mockUser = {
  id: "u1",
  name: "Alice",
  email: "alice@example.com",
  createdAt: "2024-01-15T00:00:00.000Z",
  followers: [],
  following: [],
};

const wrapper = ({ children }) => (
  <MemoryRouter>
    <ThemeContext.Provider value={mockTheme}>
      <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
    </ThemeContext.Provider>
  </MemoryRouter>
);

// useQuery is called 4 times in Profile — return appropriate data based on queryKey.
const makeQueryMock = (userData = mockUser) =>
  useQuery.mockImplementation(({ queryKey }) => {
    const key = queryKey?.[0];
    if (key === "user") return { data: userData, isLoading: false };
    if (key === "countries") return { data: [], isLoading: false };
    if (key === "wishlist") return { data: [], isLoading: false };
    if (key === "users") return { data: [], isLoading: false };
    return { data: undefined, isLoading: false };
  });

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
  makeQueryMock();
});

describe("Profile page", () => {
  // While the user data is loading a spinner overlay should block the page.
  it("shows loading spinner while user data loads", () => {
    useQuery.mockReturnValue({ data: undefined, isLoading: true });
    render(<Profile />, { wrapper });
    expect(document.querySelector(".loading-spinner__overlay")).toBeInTheDocument();
  });

  // After loading the user's name from auth context is displayed.
  it("renders the user name from auth context", () => {
    render(<Profile />, { wrapper });
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  // The overview tab is active by default.
  it("shows overview tab by default", () => {
    render(<Profile />, { wrapper });
    const overviewBtn = screen.getByRole("button", { name: "Overview" });
    expect(overviewBtn).toHaveClass("profile-page__tab--active");
  });

  // Clicking Settings tab switches the view to the settings panel.
  it("switches to settings view when Settings tab is clicked", async () => {
    render(<Profile />, { wrapper });
    await userEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
  });

  // The settings form shows a Save Changes button.
  it("settings form contains Save Changes button", async () => {
    render(<Profile />, { wrapper });
    await userEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(
      screen.getByRole("button", { name: "SAVE CHANGES" })
    ).toBeInTheDocument();
  });

  // The member since date is displayed when createdAt is present.
  it("shows member since date when user has createdAt", () => {
    render(<Profile />, { wrapper });
    expect(screen.getByText(/Member since/)).toBeInTheDocument();
  });

  // Stats section shows countries and wishlist counts.
  it("shows profile stats section", () => {
    render(<Profile />, { wrapper });
    expect(screen.getByText("Countries")).toBeInTheDocument();
    expect(screen.getByText("Wishlist")).toBeInTheDocument();
    expect(screen.getByText("Followers")).toBeInTheDocument();
    expect(screen.getByText("Following")).toBeInTheDocument();
  });
});
