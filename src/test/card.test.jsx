import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Card from "../components/shared/card/card";

describe("Card snapshots", () => {
  // Captures the basic card with children content.
  it("matches snapshot with children", () => {
    const { container } = render(<Card className="">Hello</Card>);
    expect(container).toMatchSnapshot();
  });

  // Captures the card with a custom className applied.
  // Detects regressions in how extra classes are combined.
  it("matches snapshot with custom className", () => {
    const { container } = render(
      <Card className="my-custom-card">Content</Card>
    );
    expect(container).toMatchSnapshot();
  });
});
