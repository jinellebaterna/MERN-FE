import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReactDOM from "react-dom";
import Modal from "../components/shared/modal/modal";

// Render portals inline.
vi.spyOn(ReactDOM, "createPortal").mockImplementation((node) => node);

// CSSTransition — pass children through when in=true.
vi.mock("react-transition-group", () => ({
  CSSTransition: ({ children, in: inProp }) => (inProp ? children : null),
}));

beforeEach(() => {
  vi.clearAllMocks();
  ["backdrop-hook", "modal-hook"].forEach((id) => {
    if (!document.getElementById(id)) {
      const el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
  });
  // Reset scroll lock body styles.
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
});

describe("Modal", () => {
  // When show is false, the modal overlay should not be rendered.
  it("does not render modal overlay when show is false", () => {
    render(<Modal show={false} header="Test" footer={null} />);
    expect(screen.queryByText("Test")).toBeNull();
  });

  // When show is true, the modal header text should appear.
  it("renders modal header when show is true", () => {
    render(<Modal show={true} header="My Modal" footer={null} />);
    expect(screen.getByText("My Modal")).toBeInTheDocument();
  });

  // Modal renders its children inside the content area.
  it("renders children inside the modal content", () => {
    render(
      <Modal show={true} header="Test" footer={null}>
        <p>Modal body text</p>
      </Modal>
    );
    expect(screen.getByText("Modal body text")).toBeInTheDocument();
  });

  // The footer prop content is rendered in the modal footer.
  it("renders footer content", () => {
    render(
      <Modal
        show={true}
        header="Test"
        footer={<button>Close</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  // When show is true, the backdrop should be rendered.
  it("renders backdrop when show is true", () => {
    const { container } = render(
      <Modal show={true} header="Test" footer={null} onCancel={vi.fn()} />
    );
    expect(container.querySelector(".backdrop")).toBeInTheDocument();
  });

  // When show is false, the backdrop should not be rendered.
  it("does not render backdrop when show is false", () => {
    const { container } = render(
      <Modal show={false} header="Test" footer={null} onCancel={vi.fn()} />
    );
    expect(container.querySelector(".backdrop")).toBeNull();
  });

  // Clicking the backdrop calls onCancel.
  it("calls onCancel when backdrop is clicked", async () => {
    const onCancel = vi.fn();
    const { container } = render(
      <Modal show={true} header="Test" footer={null} onCancel={onCancel} />
    );
    const backdrop = container.querySelector(".backdrop");
    await userEvent.click(backdrop);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // When show is true, scroll lock should be activated (body overflow hidden).
  it("locks scroll when show is true", () => {
    render(<Modal show={true} header="Test" footer={null} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  // When show is false, scroll lock should NOT be activated.
  it("does not lock scroll when show is false", () => {
    render(<Modal show={false} header="Test" footer={null} />);
    expect(document.body.style.overflow).toBe("");
  });

  // Custom className is applied to the modal element.
  it("applies custom className to the modal div", () => {
    const { container } = render(
      <Modal show={true} header="Test" footer={null} className="my-modal" />
    );
    expect(container.querySelector(".my-modal")).toBeInTheDocument();
  });
});
