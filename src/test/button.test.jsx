import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Button from "../components/shared/button/button";

describe("Button", () => {
  // When neither href nor to is provided, renders a <button> element.
  // This is the default case used for actions like form submissions.
  it("renders a button element by default", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  // When href is provided, renders an <a> tag for external links.
  it("renders an anchor element when href is provided", () => {
    render(<Button href="https://example.com">Visit</Button>);
    const link = screen.getByRole("link", { name: "Visit" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  // When to is provided, renders a React Router <Link> for internal navigation.
  // MemoryRouter is required to provide the router context Link depends on.
  it("renders a Link element when to is provided", () => {
    render(
      <MemoryRouter>
        <Button to="/profile">Profile</Button>
      </MemoryRouter>
    );
    const link = screen.getByRole("link", { name: "Profile" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/profile");
  });

  // Clicking the button calls the onClick handler.
  it("calls onClick when button is clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Submit</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // When disabled, the button cannot be clicked and onClick is not called.
  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Submit</Button>);
    const btn = screen.getByRole("button", { name: "Submit" });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  // The size prop controls the CSS class — defaults to "default" when not provided.
  it("applies default size class when size is not provided", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toHaveClass("button--default");
  });

  // When size is provided it overrides the default class.
  it("applies the provided size class", () => {
    render(<Button size="small">Click</Button>);
    expect(screen.getByRole("button")).toHaveClass("button--small");
  });
});
