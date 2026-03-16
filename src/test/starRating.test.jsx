import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StarRating from "../components/shared/starRating/starRating";

describe("StarRating", () => {
  // The component always renders exactly 5 star buttons regardless of value.
  it("renders 5 star buttons", () => {
    render(<StarRating value={0} onChange={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  // Stars at or below the current value get the --filled class.
  // With value=3, stars 1,2,3 should be filled and 4,5 should not.
  it("marks stars up to the current value as filled", () => {
    render(<StarRating value={3} onChange={vi.fn()} />);
    const stars = screen.getAllByRole("button");
    expect(stars[0]).toHaveClass("star-rating__star--filled"); // star 1
    expect(stars[1]).toHaveClass("star-rating__star--filled"); // star 2
    expect(stars[2]).toHaveClass("star-rating__star--filled"); // star 3
    expect(stars[3]).not.toHaveClass("star-rating__star--filled"); // star 4
    expect(stars[4]).not.toHaveClass("star-rating__star--filled"); // star 5
  });

  // Clicking a star calls onChange with that star's number.
  it("calls onChange with the clicked star value", async () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("3 star"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  // Clicking the currently selected star passes 0 to toggle it off.
  // e.g. clicking star 3 when value is already 3 deselects it.
  it("calls onChange with 0 when clicking the already selected star", async () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("3 star"));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  // When readOnly is true all buttons are disabled and onChange is never called.
  it("does not call onChange when readOnly", async () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} readOnly />);
    await userEvent.click(screen.getByLabelText("1 star"));
    expect(onChange).not.toHaveBeenCalled();
  });

  // When readOnly all star buttons should have the disabled attribute.
  it("disables all star buttons when readOnly", () => {
    render(<StarRating value={0} onChange={vi.fn()} readOnly />);
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  // With value=0, no stars should have the filled class.
  it("renders no filled stars when value is 0", () => {
    render(<StarRating value={0} onChange={vi.fn()} />);
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn).not.toHaveClass("star-rating__star--filled");
    });
  });
});
