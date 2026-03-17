import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BottomNav from "../components/shared/bottomNav/bottomNav";

// Mock useNavData so BottomNav doesn't need QueryClient or context providers.
vi.mock("../hook/use-nav-data", () => ({
  default: vi.fn(),
}));

import useNavData from "../hook/use-nav-data";

beforeEach(() => vi.clearAllMocks());

const renderNav = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
    </MemoryRouter>
  );

describe("BottomNav", () => {
  // Returns null when the user is not logged in — nothing is rendered.
  it("renders nothing when not logged in", () => {
    useNavData.mockReturnValue({
      auth: { isLoggedIn: false },
      isViewingOtherMap: false,
    });
    const { container } = renderNav();
    expect(container.firstChild).toBeNull();
  });

  // Logged-in users see all four tabs: Home, My Map, Countries, Profile.
  it("renders all four tabs when logged in", () => {
    useNavData.mockReturnValue({
      auth: { isLoggedIn: true },
      isViewingOtherMap: false,
    });
    renderNav();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("My Map")).toBeInTheDocument();
    expect(screen.getByText("Countries")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  // All four tabs link to the correct routes.
  it("tabs point to the correct routes", () => {
    useNavData.mockReturnValue({
      auth: { isLoggedIn: true },
      isViewingOtherMap: false,
    });
    renderNav();
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/map");
    expect(hrefs).toContain("/countries");
    expect(hrefs).toContain("/profile");
  });

  // Snapshot — detects regressions in the bottom nav structure.
  it("matches snapshot when logged in", () => {
    useNavData.mockReturnValue({
      auth: { isLoggedIn: true },
      isViewingOtherMap: false,
    });
    const { container } = renderNav();
    expect(container).toMatchSnapshot();
  });
});
