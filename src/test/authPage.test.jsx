import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../components/context/auth-context";
import ReactDOM from "react-dom";

// Portal rendering — render inline so modal content is queryable.
vi.spyOn(ReactDOM, "createPortal").mockImplementation((node) => node);

// Transition group — pass children through when in=true.
vi.mock("react-transition-group", () => ({
  CSSTransition: ({ children, in: inProp }) => (inProp ? children : null),
}));

// React Query mutation — controlled per test.
vi.mock("@tanstack/react-query", async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
      error: null,
      reset: vi.fn(),
    })),
  };
});
import { useMutation } from "@tanstack/react-query";

// API modules — stub so no real HTTP calls are made.
vi.mock("../api/auth", () => ({
  loginUser: vi.fn(),
  signupUser: vi.fn(),
}));

// Stub ImageUpload to avoid file-input complexity.
vi.mock("../components/shared/imageUpload/imageUpload", () => ({
  default: ({ id }) => <input data-testid={`image-upload-${id}`} type="file" />,
}));

import Auth from "../components/auth/auth";

const mockAuth = {
  isLoggedIn: false,
  userId: null,
  token: null,
  name: null,
  image: null,
  passportCountry: null,
  login: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
};

const wrapper = ({ children }) => (
  <MemoryRouter>
    <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
  </MemoryRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
  // Ensure portal targets exist.
  ["backdrop-hook", "modal-hook"].forEach((id) => {
    if (!document.getElementById(id)) {
      const el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
  });
  document.body.style.overflow = "";
});

describe("Auth page", () => {
  // By default the login form is shown with the "Welcome Back!" heading.
  it("renders login form by default", () => {
    render(<Auth />, { wrapper });
    expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "LOGIN" })
    ).toBeInTheDocument();
  });

  // The switch button label tells users they can switch to signup.
  it("switch button says SWITCH TO SIGNUP in login mode", () => {
    render(<Auth />, { wrapper });
    expect(
      screen.getByRole("button", { name: "SWITCH TO SIGNUP" })
    ).toBeInTheDocument();
  });

  // Clicking switch mode changes the form heading and submit button label.
  it("switches to signup mode when switch button is clicked", async () => {
    render(<Auth />, { wrapper });
    await userEvent.click(
      screen.getByRole("button", { name: "SWITCH TO SIGNUP" })
    );
    expect(screen.getByText("Create an Account")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "SIGNUP" })
    ).toBeInTheDocument();
  });

  // In signup mode the extra Name field and image upload appear.
  it("shows Name field and image upload in signup mode", async () => {
    render(<Auth />, { wrapper });
    await userEvent.click(
      screen.getByRole("button", { name: "SWITCH TO SIGNUP" })
    );
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByTestId("image-upload-image")).toBeInTheDocument();
  });

  // Switching back to login hides the Name field again.
  it("hides Name field when switching back to login", async () => {
    render(<Auth />, { wrapper });
    await userEvent.click(
      screen.getByRole("button", { name: "SWITCH TO SIGNUP" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "SWITCH TO LOGIN" })
    );
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  // While a mutation is pending a loading spinner overlay should appear.
  it("shows loading spinner when mutation is pending", () => {
    useMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      error: null,
      reset: vi.fn(),
    });
    render(<Auth />, { wrapper });
    expect(document.querySelector(".loading-spinner__overlay")).toBeInTheDocument();
  });

  // When mutation returns an error, the ErrorModal receives the error message.
  it("shows error modal when mutation fails", () => {
    useMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: { message: "Invalid credentials" },
      reset: vi.fn(),
    });
    render(<Auth />, { wrapper });
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });
});
