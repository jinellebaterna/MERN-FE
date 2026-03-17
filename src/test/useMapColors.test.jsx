import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useMapColors from "../hook/use-map-colors.jsx";

const DEFAULTS = { visited: "#5ca4a9", wishlist: "#c08f9d" };

beforeEach(() => {
  localStorage.clear();
});

describe("useMapColors", () => {
  // Returns the built-in defaults when localStorage has no saved values.
  it("returns default colors when localStorage is empty", () => {
    const { result } = renderHook(() => useMapColors());
    expect(result.current.visitedColor).toBe(DEFAULTS.visited);
    expect(result.current.wishlistColor).toBe(DEFAULTS.wishlist);
  });

  // Reads persisted values from localStorage on mount so colors survive page reloads.
  it("reads saved colors from localStorage on mount", () => {
    localStorage.setItem("wayfarer_map_visited", "#ff0000");
    localStorage.setItem("wayfarer_map_wishlist", "#0000ff");
    const { result } = renderHook(() => useMapColors());
    expect(result.current.visitedColor).toBe("#ff0000");
    expect(result.current.wishlistColor).toBe("#0000ff");
  });

  // setVisitedColor updates state and persists to localStorage.
  it("setVisitedColor updates state and localStorage", () => {
    const { result } = renderHook(() => useMapColors());
    act(() => result.current.setVisitedColor("#123456"));
    expect(result.current.visitedColor).toBe("#123456");
    expect(localStorage.getItem("wayfarer_map_visited")).toBe("#123456");
  });

  // setWishlistColor updates state and persists to localStorage.
  it("setWishlistColor updates state and localStorage", () => {
    const { result } = renderHook(() => useMapColors());
    act(() => result.current.setWishlistColor("#abcdef"));
    expect(result.current.wishlistColor).toBe("#abcdef");
    expect(localStorage.getItem("wayfarer_map_wishlist")).toBe("#abcdef");
  });

  // reset() restores both colors to defaults and removes the localStorage keys.
  it("reset restores defaults and clears localStorage", () => {
    localStorage.setItem("wayfarer_map_visited", "#ff0000");
    localStorage.setItem("wayfarer_map_wishlist", "#0000ff");
    const { result } = renderHook(() => useMapColors());
    act(() => result.current.reset());
    expect(result.current.visitedColor).toBe(DEFAULTS.visited);
    expect(result.current.wishlistColor).toBe(DEFAULTS.wishlist);
    expect(localStorage.getItem("wayfarer_map_visited")).toBeNull();
    expect(localStorage.getItem("wayfarer_map_wishlist")).toBeNull();
  });
});
