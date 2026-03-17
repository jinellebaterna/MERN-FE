import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "../components/context/auth-context";
import { useAuthMutation } from "../hook/use-auth-mutation";

beforeEach(() => {
  vi.clearAllMocks();
});

const makeWrapper = (authOverrides = {}) => {
  const authValue = {
    isLoggedIn: true,
    token: "tok",
    userId: "u1",
    name: "Alice",
    image: null,
    passportCountry: null,
    login: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    ...authOverrides,
  };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe("useAuthMutation", () => {
  // The hook should return a mutation object with a mutate function.
  it("returns a mutation object", () => {
    const { result } = renderHook(
      () => useAuthMutation({ mutationFn: vi.fn() }),
      { wrapper: makeWrapper() }
    );
    expect(typeof result.current.mutate).toBe("function");
  });

  // On a successful mutation the provided onSuccess callback is called.
  it("calls onSuccess on successful mutation", async () => {
    const onSuccess = vi.fn();
    const mutationFn = vi.fn().mockResolvedValue("ok");

    const { result } = renderHook(
      () => useAuthMutation({ mutationFn, onSuccess }),
      { wrapper: makeWrapper() }
    );

    await act(async () => {
      result.current.mutate({});
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  // When the mutation throws "UNAUTHORIZED", auth.logout() should be called.
  it("calls auth.logout when error message is UNAUTHORIZED", async () => {
    const logout = vi.fn();
    const mutationFn = vi.fn().mockRejectedValue(new Error("UNAUTHORIZED"));

    const { result } = renderHook(
      () => useAuthMutation({ mutationFn, onError: vi.fn() }),
      { wrapper: makeWrapper({ logout }) }
    );

    await act(async () => {
      result.current.mutate({});
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(logout).toHaveBeenCalledTimes(1);
  });

  // When the error is NOT "UNAUTHORIZED", logout should not be called.
  it("does not call logout for non-UNAUTHORIZED errors", async () => {
    const logout = vi.fn();
    const onError = vi.fn();
    const mutationFn = vi.fn().mockRejectedValue(new Error("Server error"));

    const { result } = renderHook(
      () => useAuthMutation({ mutationFn, onError }),
      { wrapper: makeWrapper({ logout }) }
    );

    await act(async () => {
      result.current.mutate({});
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(logout).not.toHaveBeenCalled();
  });

  // The caller-provided onError is still invoked even for UNAUTHORIZED errors.
  it("calls caller onError callback for UNAUTHORIZED errors", async () => {
    const onError = vi.fn();
    const mutationFn = vi.fn().mockRejectedValue(new Error("UNAUTHORIZED"));

    const { result } = renderHook(
      () => useAuthMutation({ mutationFn, onError }),
      { wrapper: makeWrapper({ logout: vi.fn() }) }
    );

    await act(async () => {
      result.current.mutate({});
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  // The caller-provided onError is invoked for general errors too.
  it("calls caller onError for general errors", async () => {
    const onError = vi.fn();
    const mutationFn = vi.fn().mockRejectedValue(new Error("Bad request"));

    const { result } = renderHook(
      () => useAuthMutation({ mutationFn, onError }),
      { wrapper: makeWrapper() }
    );

    await act(async () => {
      result.current.mutate({});
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });
});
