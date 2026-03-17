import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

// Mock @dnd-kit/sortable and @dnd-kit/utilities entirely.
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: vi.fn(() => ({
    attributes: { role: "button" },
    listeners: { onPointerDown: vi.fn() },
    setNodeRef: vi.fn(),
    transform: { x: 10, y: 0, scaleX: 1, scaleY: 1 },
    transition: "transform 200ms",
    isDragging: false,
  })),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => "translate3d(10px, 0px, 0)"),
    },
  },
}));

import { useSortable } from "@dnd-kit/sortable";
import useSortableItem from "../hook/use-sortable-item";

beforeEach(() => {
  vi.clearAllMocks();
  useSortable.mockReturnValue({
    attributes: { role: "button" },
    listeners: { onPointerDown: vi.fn() },
    setNodeRef: vi.fn(),
    transform: { x: 10, y: 0, scaleX: 1, scaleY: 1 },
    transition: "transform 200ms",
    isDragging: false,
  });
});

describe("useSortableItem", () => {
  // The hook should return setNodeRef, style, attributes, and listeners.
  it("returns setNodeRef, style, attributes, and listeners", () => {
    const { result } = renderHook(() => useSortableItem("item-1", true));
    expect(result.current).toHaveProperty("setNodeRef");
    expect(result.current).toHaveProperty("style");
    expect(result.current).toHaveProperty("attributes");
    expect(result.current).toHaveProperty("listeners");
  });

  // When canEdit is true, listeners should be forwarded (non-empty object from useSortable).
  it("forwards listeners when canEdit is true", () => {
    const { result } = renderHook(() => useSortableItem("item-1", true));
    expect(result.current.listeners).not.toEqual({});
  });

  // When canEdit is false, listeners should be an empty object to disable dragging.
  it("returns empty listeners when canEdit is false", () => {
    const { result } = renderHook(() => useSortableItem("item-1", false));
    expect(result.current.listeners).toEqual({});
  });

  // When canEdit is true, cursor should be "grab".
  it("sets cursor to grab when canEdit is true", () => {
    const { result } = renderHook(() => useSortableItem("item-1", true));
    expect(result.current.style.cursor).toBe("grab");
  });

  // When canEdit is false, cursor should use the defaultCursor value.
  it("sets cursor to defaultCursor when canEdit is false", () => {
    const { result } = renderHook(() => useSortableItem("item-1", false, "pointer"));
    expect(result.current.style.cursor).toBe("pointer");
  });

  // When canEdit is false and no defaultCursor is given, cursor falls back to "default".
  it("uses default cursor when canEdit is false and no defaultCursor provided", () => {
    const { result } = renderHook(() => useSortableItem("item-1", false));
    expect(result.current.style.cursor).toBe("default");
  });

  // When isDragging is true, opacity should be 0.5.
  it("sets opacity to 0.5 when isDragging is true", () => {
    useSortable.mockReturnValueOnce({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: true,
    });
    const { result } = renderHook(() => useSortableItem("item-1", true));
    expect(result.current.style.opacity).toBe(0.5);
  });

  // When isDragging is false, opacity should be 1.
  it("sets opacity to 1 when isDragging is false", () => {
    const { result } = renderHook(() => useSortableItem("item-1", true));
    expect(result.current.style.opacity).toBe(1);
  });

  // useSortable is called with the correct id.
  it("passes the id to useSortable", () => {
    renderHook(() => useSortableItem("my-item", true));
    expect(useSortable).toHaveBeenCalledWith({ id: "my-item" });
  });
});
