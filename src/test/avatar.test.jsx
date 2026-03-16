import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Avatar from "../components/shared/avatar/avatar";

describe("Avatar", () => {
  // When no image is provided, the component renders a placeholder div
  // showing the first letter of the name in uppercase.
  it("renders the first letter of name as placeholder when no image", () => {
    render(<Avatar name="Jinelle" />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  // When name is missing entirely, the placeholder shows "?" as a fallback
  // to avoid rendering an empty or broken avatar.
  it("renders ? when name is not provided", () => {
    render(<Avatar />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  // When an image path is provided, the component renders an <img> element
  // with the full URL (IMG_BASE + "/" + image) as the src.
  it("renders an img element when image is provided", () => {
    render(<Avatar image="uploads/photo.jpg" name="Jinelle" />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "http://localhost:5001/uploads/photo.jpg");
    expect(img).toHaveAttribute("alt", "Jinelle");
  });

  // When onClick is provided the avatar gets the --clickable class
  // so it shows a pointer cursor via CSS.
  it("adds clickable class when onClick is provided", () => {
    render(<Avatar name="Jinelle" onClick={vi.fn()} />);
    const placeholder = screen.getByText("J").closest("div");
    expect(placeholder).toHaveClass("avatar--clickable");
  });

  // Without onClick, the --clickable class should not be applied.
  it("does not add clickable class when onClick is not provided", () => {
    render(<Avatar name="Jinelle" />);
    const placeholder = screen.getByText("J").closest("div");
    expect(placeholder).not.toHaveClass("avatar--clickable");
  });

  // Clicking the avatar calls the onClick handler.
  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Avatar name="Jinelle" onClick={onClick} />);
    await userEvent.click(screen.getByText("J"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // The size prop sets the width and height inline styles.
  // Default size is 40 but can be overridden.
  it("applies the size as inline width and height", () => {
    render(<Avatar name="Jinelle" size={60} />);
    const placeholder = screen.getByText("J").closest("div");
    expect(placeholder).toHaveStyle({ width: "60px", height: "60px" });
  });
});
