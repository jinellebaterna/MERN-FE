import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "../components/shared/errorBoundary/errorBoundary";

// A component that throws an error when the `shouldThrow` prop is true.
// Used to trigger the ErrorBoundary in tests.
const BrokenComponent = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error("Test error");
  return <div>Working fine</div>;
};

// React logs error output to the console when a component throws.
// We suppress it here to keep test output clean — it's expected behaviour.
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

describe("ErrorBoundary", () => {
  // When no error is thrown, the ErrorBoundary renders its children normally.
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Working fine")).toBeInTheDocument();
  });

  // When a child throws, the ErrorBoundary catches it and shows
  // the fallback UI with a "Something went wrong." heading.
  it("renders fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });

  // The error message from the thrown error is displayed in the fallback UI
  // so the user gets a meaningful description of what went wrong.
  it("displays the error message in the fallback UI", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  // The fallback UI has a "Try Again" button that resets the error state
  // and re-renders the children.
  // We use a ref to stop the child from throwing before the reset fires,
  // since the boundary re-renders children immediately on reset.
  it("resets the error state and shows children when Try Again is clicked", async () => {
    const throwRef = { current: true };

    const ControlledChild = () => {
      if (throwRef.current) throw new Error("Test error");
      return <div>Working fine</div>;
    };

    render(
      <ErrorBoundary>
        <ControlledChild />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();

    // Stop throwing before reset so the child renders successfully after reset
    throwRef.current = false;
    await userEvent.click(screen.getByRole("button", { name: "Try Again" }));

    expect(screen.getByText("Working fine")).toBeInTheDocument();
  });

  // The fallback UI also has a "Go Home" link pointing to the root path.
  it("renders a Go Home link in the fallback UI", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    const link = screen.getByRole("link", { name: "Go Home" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
