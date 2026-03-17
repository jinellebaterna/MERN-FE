import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { AuthContext } from "../components/context/auth-context";

// Mock @dnd-kit/core entirely — we don't need real DnD sensors in unit tests.
vi.mock("@dnd-kit/core", () => ({
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn((...args) => args),
  PointerSensor: vi.fn(),
}));

// Mock @dnd-kit/sortable's arrayMove to test reorder logic in isolation.
vi.mock("@dnd-kit/sortable", () => ({
  arrayMove: vi.fn((arr, from, to) => {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
  }),
}));

import useSortableList from "../hook/use-sortable-list";

const authValue = {
  isLoggedIn: true,
  token: "test-token",
  userId: "user-1",
  name: "Test",
  image: null,
  passportCountry: null,
  login: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
};

const wrapper = ({ children }) => (
  <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSortableList", () => {
  // The hook should return sensors and handleDragEnd.
  it("returns sensors and handleDragEnd", () => {
    const items = [{ code: "FR" }, { code: "DE" }];
    const setItems = vi.fn();
    const reorderMutation = { mutate: vi.fn() };

    const { result } = renderHook(
      () => useSortableList({ items, setItems, reorderMutation }),
      { wrapper }
    );

    expect(result.current).toHaveProperty("sensors");
    expect(result.current).toHaveProperty("handleDragEnd");
  });

  // handleDragEnd should do nothing when over is null (drag cancelled).
  it("does nothing when over is null", () => {
    const items = [{ code: "FR" }, { code: "DE" }];
    const setItems = vi.fn();
    const reorderMutation = { mutate: vi.fn() };

    const { result } = renderHook(
      () => useSortableList({ items, setItems, reorderMutation }),
      { wrapper }
    );

    act(() => {
      result.current.handleDragEnd({ active: { id: "FR" }, over: null });
    });

    expect(setItems).not.toHaveBeenCalled();
    expect(reorderMutation.mutate).not.toHaveBeenCalled();
  });

  // handleDragEnd should do nothing when active.id === over.id (dropped on same position).
  it("does nothing when active and over ids are the same", () => {
    const items = [{ code: "FR" }, { code: "DE" }];
    const setItems = vi.fn();
    const reorderMutation = { mutate: vi.fn() };

    const { result } = renderHook(
      () => useSortableList({ items, setItems, reorderMutation }),
      { wrapper }
    );

    act(() => {
      result.current.handleDragEnd({ active: { id: "FR" }, over: { id: "FR" } });
    });

    expect(setItems).not.toHaveBeenCalled();
    expect(reorderMutation.mutate).not.toHaveBeenCalled();
  });

  // handleDragEnd should call setItems and reorderMutation.mutate with reordered items.
  it("calls setItems and reorderMutation.mutate on valid drag end", () => {
    const items = [{ code: "FR" }, { code: "DE" }, { code: "ES" }];
    const setItems = vi.fn();
    const reorderMutation = { mutate: vi.fn() };

    const { result } = renderHook(
      () => useSortableList({ items, setItems, reorderMutation }),
      { wrapper }
    );

    act(() => {
      result.current.handleDragEnd({ active: { id: "FR" }, over: { id: "DE" } });
    });

    expect(setItems).toHaveBeenCalledTimes(1);
    expect(reorderMutation.mutate).toHaveBeenCalledTimes(1);
  });

  // reorderMutation.mutate receives userId, codes array and token from auth context.
  it("passes userId, codes, and token from auth context to reorderMutation", () => {
    const items = [{ code: "FR" }, { code: "DE" }];
    const setItems = vi.fn();
    const reorderMutation = { mutate: vi.fn() };

    const { result } = renderHook(
      () => useSortableList({ items, setItems, reorderMutation }),
      { wrapper }
    );

    act(() => {
      result.current.handleDragEnd({ active: { id: "FR" }, over: { id: "DE" } });
    });

    const mutateArg = reorderMutation.mutate.mock.calls[0][0];
    expect(mutateArg.userId).toBe("user-1");
    expect(mutateArg.token).toBe("test-token");
    expect(Array.isArray(mutateArg.codes)).toBe(true);
  });
});
