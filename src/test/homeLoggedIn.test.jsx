import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../components/context/auth-context";

// React Query — control useQuery return value per test.
vi.mock("@tanstack/react-query", async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  };
});
import { useQuery } from "@tanstack/react-query";

// Mock follow mutation hook so it doesn't need QueryClient or AuthContext calls.
vi.mock("../hook/use-follow-mutation", () => ({
  default: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
import useFollowMutation from "../hook/use-follow-mutation";

// Stub sub-components that bring their own dependencies.
vi.mock("../components/followers-modal/followers-modal", () => ({
  default: () => <div data-testid="followers-modal" />,
}));
vi.mock("../components/shared/avatar/avatar", () => ({
  default: ({ name }) => <span data-testid="avatar">{name}</span>,
}));
vi.mock("../components/shared/skeleton/SkeletonCard", () => ({
  default: () => <div data-testid="skeleton-card" />,
}));

import HomeLoggedIn from "../components/home/home-loggedin";

const mockAuth = {
  isLoggedIn: true,
  userId: "u1",
  token: "tok",
  name: "Alice",
  image: null,
  passportCountry: null,
};

const mockUsers = [
  {
    id: "u2",
    name: "Bob",
    image: null,
    countries: [{ code: "FR" }],
    followers: [],
    following: [],
  },
  {
    id: "u3",
    name: "Carol",
    image: null,
    countries: [],
    followers: ["u1"],
    following: [],
  },
];

const wrapper = ({ children }) => (
  <MemoryRouter>
    <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
  </MemoryRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  useQuery.mockReturnValue({ data: mockUsers, isLoading: false });
});

describe("HomeLoggedIn", () => {
  // While the query is loading, a skeleton card placeholder should be shown.
  it("shows skeleton card when loading", () => {
    useQuery.mockReturnValue({ data: [], isLoading: true });
    render(<HomeLoggedIn />, { wrapper });
    expect(screen.getByTestId("skeleton-card")).toBeInTheDocument();
  });

  // When data is loaded, traveler cards are rendered (excluding the current user).
  it("renders traveler cards for other users", () => {
    render(<HomeLoggedIn />, { wrapper });
    // getAllByText handles cases where the name appears in both Avatar and card name
    expect(screen.getAllByText("Bob").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Carol").length).toBeGreaterThan(0);
  });

  // The current user (u1) must not appear in the traveler list.
  it("excludes the logged-in user from the list", () => {
    useQuery.mockReturnValue({
      data: [...mockUsers, { id: "u1", name: "Alice", countries: [], followers: [] }],
      isLoading: false,
    });
    render(<HomeLoggedIn />, { wrapper });
    // Alice should only appear in the auth context, not as a traveler card
    const names = screen.queryAllByText("Alice");
    expect(names.length).toBe(0);
  });

  // Typing in the search box filters traveler cards by name.
  it("filters traveler cards when searching", async () => {
    render(<HomeLoggedIn />, { wrapper });
    const input = screen.getByPlaceholderText("Search travelers...");
    await userEvent.type(input, "Bob");
    // Bob should still appear; Carol should be filtered out entirely
    expect(screen.getAllByText("Bob").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Carol")).toHaveLength(0);
  });

  // When no travelers match the search, an empty message is shown.
  it("shows empty message when search has no results", async () => {
    render(<HomeLoggedIn />, { wrapper });
    const input = screen.getByPlaceholderText("Search travelers...");
    await userEvent.type(input, "zzznomatch");
    expect(screen.getByText("No travelers found.")).toBeInTheDocument();
  });

  // Clicking the Follow button calls the follow mutation.
  it("calls follow mutation when Follow is clicked", async () => {
    const mutate = vi.fn();
    useFollowMutation.mockReturnValue({ mutate, isPending: false });
    render(<HomeLoggedIn />, { wrapper });
    const followBtns = screen.getAllByRole("button", { name: "Follow" });
    await userEvent.click(followBtns[0]);
    expect(mutate).toHaveBeenCalled();
  });

  // A user already following the logged-in user shows "Following" button label.
  it("shows Following label for users already followed", () => {
    // Carol's followers includes u1 (the logged-in user)
    render(<HomeLoggedIn />, { wrapper });
    expect(screen.getByRole("button", { name: "Following" })).toBeInTheDocument();
  });

  // The new-user onboarding banner shows when the localStorage flag is set.
  it("shows onboarding banner when new user flag is set", () => {
    localStorage.setItem("wayfarer_new_user", "true");
    render(<HomeLoggedIn />, { wrapper });
    expect(screen.getByText("Welcome to Wayfarer!")).toBeInTheDocument();
  });

  // Dismissing the banner removes it from the DOM.
  it("dismisses onboarding banner when close button clicked", async () => {
    localStorage.setItem("wayfarer_new_user", "true");
    render(<HomeLoggedIn />, { wrapper });
    const closeBtn = screen.getByRole("button", { name: "✕" });
    await userEvent.click(closeBtn);
    expect(screen.queryByText("Welcome to Wayfarer!")).not.toBeInTheDocument();
  });
});
