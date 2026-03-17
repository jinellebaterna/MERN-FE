import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock apiFetch so no real HTTP calls are made.
vi.mock("../api/client", () => ({
  apiFetch: vi.fn(),
}));

import {
  likePlace,
  unlikePlace,
  markVisited,
  unmarkVisited,
  markWantToVisit,
  unmarkWantToVisit,
  fetchComments,
  addComment,
  deleteComment,
  fetchPopularPlaces,
} from "../api/places";

import { apiFetch } from "../api/client";

beforeEach(() => {
  vi.clearAllMocks();
  apiFetch.mockResolvedValue({});
});

describe("likePlace", () => {
  // likePlace POSTs to /api/places/:id/like.
  it("posts to the like endpoint", async () => {
    await likePlace({ placeId: "p1", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/places/p1/like");
    expect(opts.method).toBe("POST");
  });
});

describe("unlikePlace", () => {
  // unlikePlace DELETEs from /api/places/:id/like.
  it("deletes from the like endpoint", async () => {
    await unlikePlace({ placeId: "p1", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/places/p1/like");
    expect(opts.method).toBe("DELETE");
  });
});

describe("markVisited", () => {
  // markVisited POSTs to /api/places/:id/visited.
  it("posts to the visited endpoint", async () => {
    await markVisited({ placeId: "p1", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/places/p1/visited");
    expect(opts.method).toBe("POST");
  });
});

describe("unmarkVisited", () => {
  // unmarkVisited DELETEs from /api/places/:id/visited.
  it("deletes from the visited endpoint", async () => {
    await unmarkVisited({ placeId: "p1", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/places/p1/visited");
    expect(opts.method).toBe("DELETE");
  });
});

describe("markWantToVisit", () => {
  // markWantToVisit POSTs to /api/places/:id/want-to-visit.
  it("posts to the want-to-visit endpoint", async () => {
    await markWantToVisit({ placeId: "p1", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/places/p1/want-to-visit");
    expect(opts.method).toBe("POST");
  });
});

describe("unmarkWantToVisit", () => {
  // unmarkWantToVisit DELETEs from /api/places/:id/want-to-visit.
  it("deletes from the want-to-visit endpoint", async () => {
    await unmarkWantToVisit({ placeId: "p1", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/places/p1/want-to-visit");
    expect(opts.method).toBe("DELETE");
  });
});

describe("fetchComments", () => {
  // fetchComments returns the comments array from the response.
  it("returns the comments array", async () => {
    apiFetch.mockResolvedValueOnce({ comments: [{ text: "Nice!" }] });
    const result = await fetchComments("p1");
    expect(result).toEqual([{ text: "Nice!" }]);
  });

  // fetchComments calls apiFetch with the correct URL.
  it("calls apiFetch with the correct URL", async () => {
    apiFetch.mockResolvedValueOnce({ comments: [] });
    await fetchComments("p1");
    const [url] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/places/p1/comments");
  });
});

describe("addComment", () => {
  // addComment POSTs the comment text to the comments endpoint.
  it("posts comment text to the comments endpoint", async () => {
    await addComment({ placeId: "p1", text: "Hello", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/places/p1/comments");
    expect(opts.method).toBe("POST");
    expect(opts.json.text).toBe("Hello");
  });
});

describe("deleteComment", () => {
  // deleteComment DELETEs the specific comment by its id.
  it("deletes comment by commentId", async () => {
    await deleteComment({ placeId: "p1", commentId: "c1", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/places/p1/comments/c1");
    expect(opts.method).toBe("DELETE");
  });
});

describe("fetchPopularPlaces", () => {
  // fetchPopularPlaces returns the places array from the response.
  it("returns the places array", async () => {
    apiFetch.mockResolvedValueOnce({ places: [{ name: "Eiffel Tower" }] });
    const result = await fetchPopularPlaces();
    expect(result).toEqual([{ name: "Eiffel Tower" }]);
  });

  // fetchPopularPlaces uses the default limit of 6.
  it("uses default limit of 6", async () => {
    apiFetch.mockResolvedValueOnce({ places: [] });
    await fetchPopularPlaces();
    const [url] = apiFetch.mock.calls[0];
    expect(url).toContain("limit=6");
  });

  // fetchPopularPlaces respects a custom limit argument.
  it("accepts a custom limit argument", async () => {
    apiFetch.mockResolvedValueOnce({ places: [] });
    await fetchPopularPlaces(12);
    const [url] = apiFetch.mock.calls[0];
    expect(url).toContain("limit=12");
  });
});
