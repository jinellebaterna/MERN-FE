import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Navigation from "../components/shared/navigation/navigation";

// Mock child components that have their own context/query dependencies.
vi.mock("../components/shared/navLinks/navLinks", () => ({
  default: () => <div data-testid="nav-links" />,
}));
vi.mock("../components/shared/bottomNav/bottomNav", () => ({
  default: () => <div data-testid="bottom-nav" />,
}));
vi.mock("../components/shared/sideDrawer/sideDrawer", () => ({
  default: ({ show, children }) => (show ? <aside>{children}</aside> : null),
}));
vi.mock("../components/shared/backdrop/backdrop", () => ({
  default: ({ onClick }) => <div className="backdrop" onClick={onClick} />,
}));

beforeEach(() => vi.clearAllMocks());

const renderNav = () =>
  render(
    <MemoryRouter>
      <Navigation />
    </MemoryRouter>
  );

describe("Navigation", () => {
  // Renders the Wayfarer title link.
  it("renders the app title", () => {
    renderNav();
    expect(screen.getByText("Wayfarer")).toBeInTheDocument();
  });

  // Renders the hamburger menu button.
  it("renders the menu button", () => {
    renderNav();
    expect(screen.getByRole("button", { name: /open navigation menu/i })).toBeInTheDocument();
  });

  // NavLinks is rendered in the header nav.
  it("renders NavLinks", () => {
    renderNav();
    expect(screen.getAllByTestId("nav-links").length).toBeGreaterThan(0);
  });

  // BottomNav is rendered.
  it("renders BottomNav", () => {
    renderNav();
    expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
  });

  // Clicking the menu button opens the side drawer (backdrop appears).
  it("opens the side drawer when menu button is clicked", async () => {
    renderNav();
    const menuBtn = screen.getByRole("button", { name: /open navigation menu/i });
    await userEvent.click(menuBtn);
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  // Clicking the backdrop closes the side drawer.
  it("closes the side drawer when backdrop is clicked", async () => {
    renderNav();
    const menuBtn = screen.getByRole("button", { name: /open navigation menu/i });
    await userEvent.click(menuBtn);
    const backdrop = document.querySelector(".backdrop");
    await userEvent.click(backdrop);
    expect(document.querySelector(".backdrop")).not.toBeInTheDocument();
  });
});
