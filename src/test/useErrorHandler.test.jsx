import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useErrorHandler from "../hook/use-error-handler";

beforeEach(() => {
  // No mocks needed — pure state hook; clear between tests via fresh renderHook calls.
});

describe("useErrorHandler", () => {
  // Initial state should have error as null.
  it("initialises error as null", () => {
    const { result } = renderHook(() => useErrorHandler());
    expect(result.current.error).toBeNull();
  });

  // setError should update the error state to the provided value.
  it("setError updates error state", () => {
    const { result } = renderHook(() => useErrorHandler());
    act(() => {
      result.current.setError("Something went wrong");
    });
    expect(result.current.error).toBe("Something went wrong");
  });

  // clearError should reset error back to null.
  it("clearError resets error to null", () => {
    const { result } = renderHook(() => useErrorHandler());
    act(() => {
      result.current.setError("Oops");
    });
    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  // Hook exposes exactly three properties: error, setError, clearError.
  it("exposes error, setError and clearError", () => {
    const { result } = renderHook(() => useErrorHandler());
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("setError");
    expect(result.current).toHaveProperty("clearError");
  });

  // setError can be called multiple times, always reflecting the latest value.
  it("setError can be called multiple times, keeping latest value", () => {
    const { result } = renderHook(() => useErrorHandler());
    act(() => {
      result.current.setError("First error");
    });
    act(() => {
      result.current.setError("Second error");
    });
    expect(result.current.error).toBe("Second error");
  });
});
