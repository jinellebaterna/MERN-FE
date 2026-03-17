import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SkeletonCard from "../components/shared/skeleton/SkeletonCard";

describe("SkeletonCard", () => {
  // Renders 12 country skeleton cards by default.
  it("renders default count for type country", () => {
    const { container } = render(<SkeletonCard type="country" />);
    expect(container.querySelectorAll(".country-card--skeleton")).toHaveLength(12);
  });

  // Renders 8 wishlist skeleton cards by default.
  it("renders default count for type wishlist", () => {
    const { container } = render(<SkeletonCard type="wishlist" />);
    expect(container.querySelectorAll(".wishlist-card--skeleton")).toHaveLength(8);
  });

  // Renders 6 traveler skeleton cards by default.
  it("renders default count for type traveler", () => {
    const { container } = render(<SkeletonCard type="traveler" />);
    expect(container.querySelectorAll(".traveler-card--skeleton")).toHaveLength(6);
  });

  // A custom count prop overrides the default.
  it("renders the specified count when count prop is provided", () => {
    const { container } = render(<SkeletonCard type="country" count={3} />);
    expect(container.querySelectorAll(".country-card--skeleton")).toHaveLength(3);
  });

  // Snapshot — detects regressions in the country skeleton card structure.
  it("matches snapshot for type country", () => {
    const { container } = render(<SkeletonCard type="country" count={1} />);
    expect(container).toMatchSnapshot();
  });

  // Snapshot — detects regressions in the wishlist skeleton card structure.
  it("matches snapshot for type wishlist", () => {
    const { container } = render(<SkeletonCard type="wishlist" count={1} />);
    expect(container).toMatchSnapshot();
  });

  // Snapshot — detects regressions in the traveler skeleton card structure.
  it("matches snapshot for type traveler", () => {
    const { container } = render(<SkeletonCard type="traveler" count={1} />);
    expect(container).toMatchSnapshot();
  });
});
