import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../components/context/auth-context";

// Mock both child views so Home.jsx can be tested in isolation.
vi.mock("../components/home/home-guest", () => ({
  default: () => <div data-testid="home-guest" />,
}));
vi.mock("../components/home/home-loggedin", () => ({
  default: () => <div data-testid="home-loggedin" />,
}));
// home.jsx imports home.css — stub it out.
vi.mock("../components/home/home.css", () => ({}));

import Home from "../components/home/home";

const guestAuth = {
  isLoggedIn: false,
  userId: null,
  token: null,
  name: null,
  image: null,
  passportCountry: null,
};

const loggedInAuth = {
  isLoggedIn: true,
  userId: "u1",
  token: "tok",
  name: "Alice",
  image: null,
  passportCountry: null,
};

beforeEach(() => vi.clearAllMocks());

const renderHome = (authValue) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        <Home />
      </AuthContext.Provider>
    </MemoryRouter>
  );

describe("Home", () => {
  // When the user is not logged in, the guest view should be shown.
  it("renders HomeGuest when user is not logged in", () => {
    renderHome(guestAuth);
    expect(screen.getByTestId("home-guest")).toBeInTheDocument();
    expect(screen.queryByTestId("home-loggedin")).not.toBeInTheDocument();
  });

  // When the user is logged in, the logged-in view should be shown instead.
  it("renders HomeLoggedIn when user is logged in", () => {
    renderHome(loggedInAuth);
    expect(screen.getByTestId("home-loggedin")).toBeInTheDocument();
    expect(screen.queryByTestId("home-guest")).not.toBeInTheDocument();
  });
});
