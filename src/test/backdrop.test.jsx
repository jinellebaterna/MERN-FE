import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReactDOM from "react-dom";
import Backdrop from "../components/shared/backdrop/backdrop";

// Render the portal inline so the test DOM can query it.
vi.spyOn(ReactDOM, "createPortal").mockImplementation((node) => node);

beforeEach(() => {
  vi.clearAllMocks();
  // Ensure the backdrop portal target exists.
  if (!document.getElementById("backdrop-hook")) {
    const el = document.createElement("div");
    el.id = "backdrop-hook";
    document.body.appendChild(el);
  }
});

describe("Backdrop", () => {
  // The backdrop div should be rendered in the DOM.
  it("renders a backdrop div", () => {
    const { container } = render(<Backdrop onClick={vi.fn()} />);
    expect(container.querySelector(".backdrop")).toBeInTheDocument();
  });

  // Clicking the backdrop should call the onClick handler.
  it("calls onClick when the backdrop is clicked", async () => {
    const onClick = vi.fn();
    const { container } = render(<Backdrop onClick={onClick} />);
    await userEvent.click(container.querySelector(".backdrop"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // Snapshot — captures the backdrop's rendered structure.
  it("matches snapshot", () => {
    const { container } = render(<Backdrop onClick={vi.fn()} />);
    expect(container).toMatchSnapshot();
  });
});
