import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import LoadingSpinner from "../components/shared/loadingSpinner/loadingSpinner";

describe("LoadingSpinner snapshots", () => {
  // Captures the default spinner without overlay.
  // Detects regressions in the spinner's HTML structure.
  it("matches snapshot without overlay", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container).toMatchSnapshot();
  });

  // Captures the overlay state — adds the overlay wrapper class.
  // Detects regressions in how the overlay class is conditionally applied.
  it("matches snapshot with overlay", () => {
    const { container } = render(<LoadingSpinner asOverlay />);
    expect(container).toMatchSnapshot();
  });
});
