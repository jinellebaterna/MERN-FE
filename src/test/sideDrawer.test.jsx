import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ReactDOM from "react-dom";
import SideDrawer from "../components/shared/sideDrawer/sideDrawer";

// Render portals inline so test DOM can inspect the output.
vi.spyOn(ReactDOM, "createPortal").mockImplementation((node) => node);

// CSSTransition — render children when in=true, nothing when in=false.
vi.mock("react-transition-group", () => ({
  CSSTransition: ({ children, in: inProp }) => (inProp ? children : null),
}));

beforeEach(() => {
  vi.clearAllMocks();
  if (!document.getElementById("drawer-hook")) {
    const el = document.createElement("div");
    el.id = "drawer-hook";
    document.body.appendChild(el);
  }
});

describe("SideDrawer", () => {
  // When show is true the aside element should appear.
  it("renders the side-drawer aside when show is true", () => {
    const { container } = render(<SideDrawer show={true}>Menu</SideDrawer>);
    expect(container.querySelector(".side-drawer")).toBeInTheDocument();
  });

  // When show is false the CSSTransition hides the aside.
  it("does not render side-drawer when show is false", () => {
    const { container } = render(<SideDrawer show={false}>Menu</SideDrawer>);
    expect(container.querySelector(".side-drawer")).toBeNull();
  });

  // Children should be rendered inside the aside when show is true.
  it("renders children inside the drawer", () => {
    render(<SideDrawer show={true}><p>Drawer content</p></SideDrawer>);
    expect(screen.getByText("Drawer content")).toBeInTheDocument();
  });

  // Snapshot — captures the open drawer state.
  it("matches snapshot when open", () => {
    const { container } = render(
      <SideDrawer show={true}><nav>Links</nav></SideDrawer>
    );
    expect(container).toMatchSnapshot();
  });

  // Snapshot — captures the closed/hidden drawer state.
  it("matches snapshot when closed", () => {
    const { container } = render(
      <SideDrawer show={false}><nav>Links</nav></SideDrawer>
    );
    expect(container).toMatchSnapshot();
  });
});
