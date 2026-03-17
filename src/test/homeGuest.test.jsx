import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import HomeGuest from "../components/home/home-guest";

// useNavigate must be provided by MemoryRouter — we spy on it via mocking the module.
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importActual) => {
  const actual = await importActual();
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  vi.clearAllMocks();
});

const renderGuest = () =>
  render(
    <MemoryRouter>
      <HomeGuest />
    </MemoryRouter>
  );

describe("HomeGuest", () => {
  // Snapshot — catches unintentional structural regressions in the guest landing page.
  it("matches snapshot", () => {
    const { container } = renderGuest();
    expect(container).toMatchSnapshot();
  });

  // The hero heading must be visible to communicate the app value proposition.
  it("renders the hero heading", () => {
    renderGuest();
    expect(
      screen.getByText("Map Your Journey Across the World")
    ).toBeInTheDocument();
  });

  // The hero CTA button must navigate to /auth when clicked.
  it("Get Started button navigates to /auth", async () => {
    renderGuest();
    await userEvent.click(screen.getByRole("button", { name: "Get Started" }));
    expect(mockNavigate).toHaveBeenCalledWith("/auth");
  });

  // The secondary CTA button at the bottom must also navigate to /auth.
  it("Create Free Account button navigates to /auth", async () => {
    renderGuest();
    await userEvent.click(
      screen.getByRole("button", { name: "Create Free Account" })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/auth");
  });

  // Feature cards must be present to explain the app's capabilities.
  it("renders all six feature headings", () => {
    renderGuest();
    expect(screen.getByText("Interactive Map")).toBeInTheDocument();
    expect(screen.getByText("Pin Cities")).toBeInTheDocument();
    expect(screen.getByText("Photo Memories")).toBeInTheDocument();
    expect(screen.getByText("Bucket List")).toBeInTheDocument();
    expect(screen.getByText("Follow Travelers")).toBeInTheDocument();
    expect(screen.getByText("Travel Stories")).toBeInTheDocument();
  });

  // Footer copyright must be visible.
  it("renders the footer", () => {
    renderGuest();
    expect(screen.getByText(/2026 Wayfarer/)).toBeInTheDocument();
  });
});
