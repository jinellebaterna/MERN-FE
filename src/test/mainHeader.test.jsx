import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MainHeader from "../components/shared/mainHeader/mainHeader";

describe("MainHeader", () => {
  // MainHeader renders a <header> element with the main-header class.
  it("renders a header element with main-header class", () => {
    const { container } = render(<MainHeader />);
    expect(container.querySelector("header.main-header")).toBeInTheDocument();
  });

  // Children passed to MainHeader should appear inside the header.
  it("renders children inside the header", () => {
    render(<MainHeader><span>Nav content</span></MainHeader>);
    expect(screen.getByText("Nav content")).toBeInTheDocument();
  });

  // Snapshot — captures the header structure for regression detection.
  it("matches snapshot with children", () => {
    const { container } = render(
      <MainHeader>
        <nav>Navigation</nav>
      </MainHeader>
    );
    expect(container).toMatchSnapshot();
  });

  // Snapshot — captures the empty header state.
  it("matches snapshot without children", () => {
    const { container } = render(<MainHeader />);
    expect(container).toMatchSnapshot();
  });
});
