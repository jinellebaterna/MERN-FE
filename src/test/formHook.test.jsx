import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useForm } from "../hook/form-hook";

beforeEach(() => {
  // Pure hook — no mocks needed; fresh hook per test via renderHook.
});

describe("useForm", () => {
  // The hook returns a tuple of [formState, inputHandler, setFormData].
  it("returns formState, inputHandler, and setFormData", () => {
    const { result } = renderHook(() =>
      useForm({ email: { value: "", isValid: false } }, false)
    );
    const [formState, inputHandler, setFormData] = result.current;
    expect(formState).toBeDefined();
    expect(typeof inputHandler).toBe("function");
    expect(typeof setFormData).toBe("function");
  });

  // Initial state should reflect the provided initialInputs and initialFormValidity.
  it("initialises with provided inputs and validity", () => {
    const initialInputs = { email: { value: "test@test.com", isValid: true } };
    const { result } = renderHook(() => useForm(initialInputs, true));
    const [formState] = result.current;
    expect(formState.inputs.email.value).toBe("test@test.com");
    expect(formState.inputs.email.isValid).toBe(true);
    expect(formState.isValid).toBe(true);
  });

  // inputHandler dispatches INPUT_CHANGE and updates the target field's value.
  it("inputHandler updates value for the given input id", () => {
    const { result } = renderHook(() =>
      useForm({ email: { value: "", isValid: false } }, false)
    );
    act(() => {
      result.current[1]("email", "new@test.com", true);
    });
    const [formState] = result.current;
    expect(formState.inputs.email.value).toBe("new@test.com");
  });

  // inputHandler updates isValid for the target input.
  it("inputHandler updates isValid for the given input id", () => {
    const { result } = renderHook(() =>
      useForm({ email: { value: "", isValid: false } }, false)
    );
    act(() => {
      result.current[1]("email", "valid@test.com", true);
    });
    expect(result.current[0].inputs.email.isValid).toBe(true);
  });

  // Form-level isValid should be false when any input is invalid.
  it("form isValid is false when any input is invalid", () => {
    const { result } = renderHook(() =>
      useForm(
        {
          email: { value: "a@a.com", isValid: true },
          password: { value: "", isValid: false },
        },
        false
      )
    );
    act(() => {
      result.current[1]("email", "updated@test.com", true);
    });
    expect(result.current[0].isValid).toBe(false);
  });

  // Form-level isValid should be true when all inputs are valid.
  it("form isValid is true when all inputs are valid", () => {
    const { result } = renderHook(() =>
      useForm(
        {
          email: { value: "", isValid: false },
          password: { value: "", isValid: false },
        },
        false
      )
    );
    act(() => {
      result.current[1]("email", "a@a.com", true);
    });
    act(() => {
      result.current[1]("password", "secret", true);
    });
    expect(result.current[0].isValid).toBe(true);
  });

  // setFormData replaces the entire form state (used when loading existing data).
  it("setFormData replaces inputs and sets form validity", () => {
    const { result } = renderHook(() =>
      useForm({ email: { value: "", isValid: false } }, false)
    );
    act(() => {
      result.current[2](
        { name: { value: "Alice", isValid: true } },
        true
      );
    });
    const [formState] = result.current;
    expect(formState.inputs).toEqual({ name: { value: "Alice", isValid: true } });
    expect(formState.isValid).toBe(true);
  });

  // inputHandler is referentially stable between renders (useCallback).
  it("inputHandler is stable across re-renders", () => {
    const { result, rerender } = renderHook(() =>
      useForm({ email: { value: "", isValid: false } }, false)
    );
    const first = result.current[1];
    rerender();
    expect(result.current[1]).toBe(first);
  });
});
