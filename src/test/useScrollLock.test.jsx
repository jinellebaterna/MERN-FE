import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useScrollLock from "../hook/use-scroll-lock";

beforeEach(() => {
  // Reset body styles before each test.
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
});

afterEach(() => {
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
});

describe("useScrollLock", () => {
  // When active is true the body scroll should be locked.
  it("locks scroll when active is true", () => {
    renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.width).toBe("100%");
  });

  // When active is false the body styles should remain untouched.
  it("does not lock scroll when active is false", () => {
    renderHook(() => useScrollLock(false));
    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
  });

  // On unmount (when active was true) the body styles should be cleared.
  it("restores body styles on unmount", () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    unmount();
    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
    expect(document.body.style.top).toBe("");
    expect(document.body.style.width).toBe("");
  });

  // The top style should be set to a negative px value reflecting scrollY.
  it("sets body top to a negative scrollY value", () => {
    // jsdom scrollY is 0 by default — body top is set to `-${scrollY}px`
    renderHook(() => useScrollLock(true));
    // Accept both "-0px" (some environments) and "0px" normalised value
    expect(document.body.style.top).toMatch(/^-?\d+px$/);
  });

  // window.scrollTo should be called on cleanup to restore scroll position.
  it("calls window.scrollTo on cleanup", () => {
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const { unmount } = renderHook(() => useScrollLock(true));
    unmount();
    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    scrollToSpy.mockRestore();
  });

  // When active transitions from true to false, cleanup runs and styles are reset.
  it("cleans up when active changes from true to false", () => {
    const { rerender } = renderHook(({ active }) => useScrollLock(active), {
      initialProps: { active: true },
    });
    expect(document.body.style.overflow).toBe("hidden");
    rerender({ active: false });
    expect(document.body.style.overflow).toBe("");
  });
});
