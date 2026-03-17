import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReactDOM from "react-dom";
import ErrorModal from "../components/shared/errorModal/errorModal";

// Modal uses ReactDOM.createPortal — render inline so the test DOM captures it.
vi.spyOn(ReactDOM, "createPortal").mockImplementation((node) => node);

// CSSTransition is not needed in unit tests — render children directly when in=true.
vi.mock("react-transition-group", () => ({
  CSSTransition: ({ children, in: inProp }) => (inProp ? children : null),
}));

beforeEach(() => {
  vi.clearAllMocks();
  // Ensure portal target elements exist in jsdom.
  ["backdrop-hook", "modal-hook"].forEach((id) => {
    if (!document.getElementById(id)) {
      const el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
  });
});

describe("ErrorModal", () => {
  // When error is null/falsy, the modal should not be visible.
  it("does not render modal when error is null", () => {
    render(<ErrorModal error={null} onClear={vi.fn()} />);
    expect(screen.queryByText("An Error Occurred!")).toBeNull();
  });

  // When error is a non-empty string the modal header should appear.
  it("renders modal header when error is provided", () => {
    render(<ErrorModal error="Something broke" onClear={vi.fn()} />);
    expect(screen.getByText("An Error Occurred!")).toBeInTheDocument();
  });

  // The error message text should be rendered in the modal body.
  it("renders the error message in the modal body", () => {
    render(<ErrorModal error="Network timeout" onClear={vi.fn()} />);
    expect(screen.getByText("Network timeout")).toBeInTheDocument();
  });

  // Clicking the Okay button should call onClear.
  it("calls onClear when Okay button is clicked", async () => {
    const onClear = vi.fn();
    render(<ErrorModal error="Oops" onClear={onClear} />);
    await userEvent.click(screen.getByRole("button", { name: "Okay" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  // Snapshot — captures the rendered structure of the visible error modal.
  it("matches snapshot when error is present", () => {
    const { container } = render(
      <ErrorModal error="Test error message" onClear={vi.fn()} />
    );
    expect(container).toMatchSnapshot();
  });

  // Snapshot — captures the empty state when there is no error.
  it("matches snapshot when error is null", () => {
    const { container } = render(<ErrorModal error={null} onClear={vi.fn()} />);
    expect(container).toMatchSnapshot();
  });
});
