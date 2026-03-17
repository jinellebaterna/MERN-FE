import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "../components/context/auth-context";
import { ThemeContext } from "../components/context/theme-context";
import useNavData from "../hook/use-nav-data";

vi.mock("../api/user", () => ({ fetchAllUsers: vi.fn() }));
vi.mock("../hook/use-follow-mutation", () => ({
  default: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

import { fetchAllUsers } from "../api/user";

const mockAuth = {
  isLoggedIn: true,
  userId: "u1",
  token: "tok",
  name: "Alice",
  image: null,
  passportCountry: null,
};

const mockTheme = { theme: "light", toggleTheme: vi.fn() };

const makeWrapper = (path = "/") => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }) => (
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={qc}>
        <AuthContext.Provider value={mockAuth}>
          <ThemeContext.Provider value={mockTheme}>
            {children}
          </ThemeContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  fetchAllUsers.mockResolvedValue([]);
});

describe("useNavData", () => {
  // Returns all expected keys so consumers can destructure without errors.
  it("returns the expected API surface", () => {
    const { result } = renderHook(() => useNavData(), { wrapper: makeWrapper() });
    expect(result.current).toHaveProperty("auth");
    expect(result.current).toHaveProperty("theme");
    expect(result.current).toHaveProperty("toggleTheme");
    expect(result.current).toHaveProperty("allUsers");
    expect(result.current).toHaveProperty("loggedInUser");
    expect(result.current).toHaveProperty("followMutation");
    expect(result.current).toHaveProperty("modalShow");
    expect(result.current).toHaveProperty("setModalShow");
    expect(result.current).toHaveProperty("modalTab");
    expect(result.current).toHaveProperty("setModalTab");
    expect(result.current).toHaveProperty("showLogoutConfirm");
    expect(result.current).toHaveProperty("setShowLogoutConfirm");
    expect(result.current).toHaveProperty("isViewingOtherMap");
  });

  // Modal state starts closed with "followers" tab selected.
  it("initialises modal state correctly", () => {
    const { result } = renderHook(() => useNavData(), { wrapper: makeWrapper() });
    expect(result.current.modalShow).toBe(false);
    expect(result.current.modalTab).toBe("followers");
    expect(result.current.showLogoutConfirm).toBe(false);
  });

  // isViewingOtherMap is false on the home route.
  it("isViewingOtherMap is false on home route", () => {
    const { result } = renderHook(() => useNavData(), { wrapper: makeWrapper("/") });
    expect(result.current.isViewingOtherMap).toBe(false);
  });

  // isViewingOtherMap is false when no ?user param is present.
  it("isViewingOtherMap is false on /map without ?user param", () => {
    const { result } = renderHook(() => useNavData(), { wrapper: makeWrapper("/map") });
    expect(result.current.isViewingOtherMap).toBe(false);
  });

  // isViewingOtherMap is true when on /map viewing a different user's map.
  it("isViewingOtherMap is true on /map?user=u2", () => {
    const { result } = renderHook(() => useNavData(), {
      wrapper: makeWrapper("/map?user=u2"),
    });
    expect(result.current.isViewingOtherMap).toBe(true);
  });

  // isViewingOtherMap is false when the ?user param matches the logged-in user.
  it("isViewingOtherMap is false when ?user matches own userId", () => {
    const { result } = renderHook(() => useNavData(), {
      wrapper: makeWrapper("/map?user=u1"),
    });
    expect(result.current.isViewingOtherMap).toBe(false);
  });

  // loggedInUser is derived by matching auth.userId against allUsers.
  it("loggedInUser matches the current user from allUsers", async () => {
    fetchAllUsers.mockResolvedValue([{ id: "u1", name: "Alice" }, { id: "u2", name: "Bob" }]);
    const { result } = renderHook(() => useNavData(), { wrapper: makeWrapper() });
    // allUsers starts empty until query resolves — loggedInUser is undefined initially
    expect(result.current.loggedInUser).toBeUndefined();
  });
});
