import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import NavLinks from "../components/shared/navLinks/navLinks";

// Mock useNavData so NavLinks doesn't need QueryClient or context providers.
vi.mock("../hook/use-nav-data", () => ({
  default: vi.fn(),
}));

import useNavData from "../hook/use-nav-data";

const baseNavData = {
  auth: { isLoggedIn: false, userId: null, name: null, image: null },
  isViewingOtherMap: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  useNavData.mockReturnValue(baseNavData);
});

const renderNavLinks = () =>
  render(
    <MemoryRouter>
      <NavLinks />
    </MemoryRouter>
  );

describe("NavLinks", () => {
  // Guest users see the AUTHENTICATE link, not the map/countries links.
  it("renders AUTHENTICATE link when not logged in", () => {
    renderNavLinks();
    expect(screen.getByText("AUTHENTICATE")).toBeInTheDocument();
    expect(screen.queryByText("MY MAP")).not.toBeInTheDocument();
    expect(screen.queryByText("MY COUNTRIES")).not.toBeInTheDocument();
  });

  // Logged-in users see MY MAP and MY COUNTRIES but not AUTHENTICATE.
  it("renders MY MAP and MY COUNTRIES when logged in", () => {
    useNavData.mockReturnValue({
      ...baseNavData,
      auth: { isLoggedIn: true, userId: "u1", name: "Alice", image: null },
    });
    renderNavLinks();
    expect(screen.getByText("MY MAP")).toBeInTheDocument();
    expect(screen.getByText("MY COUNTRIES")).toBeInTheDocument();
    expect(screen.queryByText("AUTHENTICATE")).not.toBeInTheDocument();
  });

  // Logged-in users see the avatar button (accessible name is the user's initial).
  it("renders avatar button when logged in", () => {
    useNavData.mockReturnValue({
      ...baseNavData,
      auth: { isLoggedIn: true, userId: "u1", name: "Alice", image: null },
    });
    renderNavLinks();
    expect(document.querySelector(".avatar-btn")).toBeInTheDocument();
  });

  // Clicking the avatar button is possible (navigation handled by useNavigate).
  it("avatar button is clickable when logged in", async () => {
    useNavData.mockReturnValue({
      ...baseNavData,
      auth: { isLoggedIn: true, userId: "u1", name: "Alice", image: null },
    });
    renderNavLinks();
    const btn = document.querySelector(".avatar-btn");
    await userEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });
});
