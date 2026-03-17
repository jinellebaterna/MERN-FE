import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "../components/context/auth-context";
import useFollowMutation from "../hook/use-follow-mutation";

// Mock the user API functions so no real HTTP requests are made.
vi.mock("../api/user", () => ({
  followUser: vi.fn(),
  unfollowUser: vi.fn(),
}));

import { followUser, unfollowUser } from "../api/user";

beforeEach(() => {
  vi.clearAllMocks();
});

const makeWrapper = (authOverrides = {}) => {
  const authValue = {
    isLoggedIn: true,
    token: "test-token",
    userId: "current-user",
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

describe("useFollowMutation", () => {
  // The hook should return a mutation object with a mutate function.
  it("returns a mutation object with mutate", () => {
    const { result } = renderHook(() => useFollowMutation(), {
      wrapper: makeWrapper(),
    });
    expect(typeof result.current.mutate).toBe("function");
  });

  // When isFollowing is false, followUser should be called (not unfollowUser).
  it("calls followUser when isFollowing is false", async () => {
    followUser.mockResolvedValueOnce({});
    const { result } = renderHook(() => useFollowMutation(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate({ userId: "other-user", isFollowing: false });
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(followUser).toHaveBeenCalledTimes(1);
    expect(unfollowUser).not.toHaveBeenCalled();
  });

  // When isFollowing is true, unfollowUser should be called (not followUser).
  it("calls unfollowUser when isFollowing is true", async () => {
    unfollowUser.mockResolvedValueOnce({});
    const { result } = renderHook(() => useFollowMutation(), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate({ userId: "other-user", isFollowing: true });
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(unfollowUser).toHaveBeenCalledTimes(1);
    expect(followUser).not.toHaveBeenCalled();
  });

  // The token from auth context should be passed to followUser.
  it("passes auth token to followUser", async () => {
    followUser.mockResolvedValueOnce({});
    const { result } = renderHook(() => useFollowMutation(), {
      wrapper: makeWrapper({ token: "my-token" }),
    });

    await act(async () => {
      result.current.mutate({ userId: "other-user", isFollowing: false });
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(followUser).toHaveBeenCalledWith({
      userId: "other-user",
      token: "my-token",
    });
  });

  // The token from auth context should be passed to unfollowUser.
  it("passes auth token to unfollowUser", async () => {
    unfollowUser.mockResolvedValueOnce({});
    const { result } = renderHook(() => useFollowMutation(), {
      wrapper: makeWrapper({ token: "my-token" }),
    });

    await act(async () => {
      result.current.mutate({ userId: "other-user", isFollowing: true });
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(unfollowUser).toHaveBeenCalledWith({
      userId: "other-user",
      token: "my-token",
    });
  });
});
