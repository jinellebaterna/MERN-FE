import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock apiFetch and uploadFiles at the module level — no real HTTP calls.
vi.mock("../api/client", () => ({
  apiFetch: vi.fn(),
}));

vi.mock("../api/upload", () => ({
  uploadFiles: vi.fn(),
}));

import {
  fetchUserById,
  updateUser,
  changePassword,
  deleteUser,
  fetchUserCountries,
  addUserCountry,
  removeUserCountry,
  updateCountryImages,
  updateCountry,
  fetchUserWishlist,
  addToWishlist,
  removeFromWishlist,
  fetchAllUsers,
  followUser,
  unfollowUser,
  toggleLikeCountry,
  addCountryComment,
  deleteCountryComment,
  reorderCountries,
  reorderWishlist,
  updateWishlistDetails,
} from "../api/user";

import { apiFetch } from "../api/client";
import { uploadFiles } from "../api/upload";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchUserById", () => {
  // fetchUserById should call apiFetch with the correct user URL and return user.
  it("calls apiFetch with /api/users/:id and returns user", async () => {
    apiFetch.mockResolvedValueOnce({ user: { name: "Alice" } });
    const result = await fetchUserById("u1");
    expect(apiFetch).toHaveBeenCalledWith("/api/users/u1");
    expect(result).toEqual({ name: "Alice" });
  });
});

describe("updateUser", () => {
  // updateUser without an image should NOT call uploadFiles.
  it("does not call uploadFiles when no image is provided", async () => {
    apiFetch.mockResolvedValueOnce({ success: true });
    await updateUser({ userId: "u1", userData: { name: "Bob" }, token: "tok" });
    expect(uploadFiles).not.toHaveBeenCalled();
  });

  // updateUser with an image should call uploadFiles first, then apiFetch.
  it("calls uploadFiles when an image is provided", async () => {
    uploadFiles.mockResolvedValueOnce({ paths: ["/img/a.png"] });
    apiFetch.mockResolvedValueOnce({ success: true });
    await updateUser({
      userId: "u1",
      userData: { name: "Bob", image: new File(["x"], "a.png") },
      token: "tok",
    });
    expect(uploadFiles).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  // updateUser includes passportCountry in the payload when provided.
  it("includes passportCountry when defined", async () => {
    apiFetch.mockResolvedValueOnce({});
    await updateUser({
      userId: "u1",
      userData: { name: "Bob", passportCountry: "CA" },
      token: "tok",
    });
    const [, opts] = apiFetch.mock.calls[0];
    expect(opts.json.passportCountry).toBe("CA");
  });
});

describe("changePassword", () => {
  // changePassword should PATCH /api/users/:id/password with passwords.
  it("calls apiFetch PATCH with password fields", async () => {
    apiFetch.mockResolvedValueOnce({});
    await changePassword({
      userId: "u1",
      currentPassword: "old",
      newPassword: "new",
      token: "tok",
    });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/users/u1/password");
    expect(opts.method).toBe("PATCH");
    expect(opts.json.currentPassword).toBe("old");
    expect(opts.json.newPassword).toBe("new");
  });
});

describe("deleteUser", () => {
  // deleteUser should DELETE /api/users/:id.
  it("calls apiFetch DELETE for the user", async () => {
    apiFetch.mockResolvedValueOnce({});
    await deleteUser({ userId: "u1", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/users/u1");
    expect(opts.method).toBe("DELETE");
  });
});

describe("fetchUserCountries", () => {
  // fetchUserCountries should return the countries array from the response.
  it("returns countries array", async () => {
    apiFetch.mockResolvedValueOnce({ countries: [{ code: "FR" }] });
    const result = await fetchUserCountries("u1");
    expect(result).toEqual([{ code: "FR" }]);
  });
});

describe("addUserCountry", () => {
  // addUserCountry should POST to /api/users/:id/countries with name and code.
  it("posts to countries endpoint with name and code", async () => {
    apiFetch.mockResolvedValueOnce({});
    await addUserCountry({ userId: "u1", name: "France", code: "FR", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/users/u1/countries");
    expect(opts.method).toBe("POST");
    expect(opts.json).toEqual({ name: "France", code: "FR" });
  });
});

describe("removeUserCountry", () => {
  // removeUserCountry should DELETE /api/users/:id/countries/:code.
  it("deletes the country by code", async () => {
    apiFetch.mockResolvedValueOnce({});
    await removeUserCountry({ userId: "u1", code: "FR", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/users/u1/countries/FR");
    expect(opts.method).toBe("DELETE");
  });
});

describe("updateCountry", () => {
  // updateCountry PATCHes /api/users/:id/countries/:code with story, cities, ratings, visitedAt.
  it("patches country with story, cities, ratings, and visitedAt", async () => {
    apiFetch.mockResolvedValueOnce({});
    await updateCountry({
      userId: "u1",
      code: "FR",
      story: "Amazing trip",
      cities: ["Paris"],
      ratings: { food: 5 },
      visitedAt: "2024-06",
      token: "tok",
    });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/users/u1/countries/FR");
    expect(opts.method).toBe("PATCH");
    expect(opts.json.story).toBe("Amazing trip");
    expect(opts.json.cities).toEqual(["Paris"]);
    expect(opts.json.ratings).toEqual({ food: 5 });
    expect(opts.json.visitedAt).toBe("2024-06");
  });
});

describe("updateCountryImages", () => {
  // updateCountryImages PATCHes the images endpoint with add/remove arrays.
  it("patches images with addImages and removeImages", async () => {
    apiFetch.mockResolvedValueOnce({});
    await updateCountryImages({
      userId: "u1",
      code: "FR",
      addImages: ["/new.png"],
      removeImages: ["/old.png"],
      token: "tok",
    });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toContain("FR/images");
    expect(opts.json.addImages).toEqual(["/new.png"]);
    expect(opts.json.removeImages).toEqual(["/old.png"]);
  });
});

describe("fetchUserWishlist", () => {
  // fetchUserWishlist returns the wishlist array from the response.
  it("returns wishlist array", async () => {
    apiFetch.mockResolvedValueOnce({ wishlist: [{ code: "JP" }] });
    const result = await fetchUserWishlist("u1");
    expect(result).toEqual([{ code: "JP" }]);
  });
});

describe("addToWishlist", () => {
  // addToWishlist posts the country name and code to the wishlist endpoint.
  it("posts name and code to wishlist endpoint", async () => {
    apiFetch.mockResolvedValueOnce({});
    await addToWishlist({ userId: "u1", name: "Japan", code: "JP", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/users/u1/wishlist");
    expect(opts.json).toEqual({ name: "Japan", code: "JP" });
  });
});

describe("removeFromWishlist", () => {
  // removeFromWishlist deletes the country from the wishlist by code.
  it("deletes wishlist item by code", async () => {
    apiFetch.mockResolvedValueOnce({});
    await removeFromWishlist({ userId: "u1", code: "JP", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/users/u1/wishlist/JP");
    expect(opts.method).toBe("DELETE");
  });
});

describe("fetchAllUsers", () => {
  // fetchAllUsers returns the users array from /api/users.
  it("returns all users", async () => {
    apiFetch.mockResolvedValueOnce({ users: [{ name: "Alice" }] });
    const result = await fetchAllUsers();
    expect(result).toEqual([{ name: "Alice" }]);
  });
});

describe("followUser", () => {
  // followUser POSTs to /api/users/:id/follow.
  it("posts to follow endpoint", async () => {
    apiFetch.mockResolvedValueOnce({});
    await followUser({ userId: "u2", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/users/u2/follow");
    expect(opts.method).toBe("POST");
  });
});

describe("unfollowUser", () => {
  // unfollowUser DELETEs from /api/users/:id/follow.
  it("deletes from follow endpoint", async () => {
    apiFetch.mockResolvedValueOnce({});
    await unfollowUser({ userId: "u2", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toBe("/api/users/u2/follow");
    expect(opts.method).toBe("DELETE");
  });
});

describe("toggleLikeCountry", () => {
  // toggleLikeCountry posts to the like endpoint.
  it("posts to country like endpoint", async () => {
    apiFetch.mockResolvedValueOnce({});
    await toggleLikeCountry({ userId: "u1", code: "FR", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toContain("FR/like");
    expect(opts.method).toBe("POST");
  });
});

describe("addCountryComment", () => {
  // addCountryComment posts a comment text to the comments endpoint.
  it("posts comment text to the comments endpoint", async () => {
    apiFetch.mockResolvedValueOnce({});
    await addCountryComment({ userId: "u1", code: "FR", text: "Great!", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toContain("FR/comments");
    expect(opts.json.text).toBe("Great!");
  });
});

describe("deleteCountryComment", () => {
  // deleteCountryComment deletes a comment by its id.
  it("deletes comment by commentId", async () => {
    apiFetch.mockResolvedValueOnce({});
    await deleteCountryComment({ userId: "u1", code: "FR", commentId: "c1", token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toContain("c1");
    expect(opts.method).toBe("DELETE");
  });
});

describe("reorderCountries", () => {
  // reorderCountries patches the reorder endpoint with an array of codes.
  it("patches reorder endpoint with codes", async () => {
    apiFetch.mockResolvedValueOnce({});
    await reorderCountries({ userId: "u1", codes: ["FR", "DE"], token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toContain("reorder");
    expect(opts.json.codes).toEqual(["FR", "DE"]);
  });
});

describe("reorderWishlist", () => {
  // reorderWishlist patches the wishlist reorder endpoint.
  it("patches wishlist reorder endpoint with codes", async () => {
    apiFetch.mockResolvedValueOnce({});
    await reorderWishlist({ userId: "u1", codes: ["JP", "KR"], token: "tok" });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toContain("wishlist/reorder");
    expect(opts.json.codes).toEqual(["JP", "KR"]);
  });
});

describe("updateWishlistDetails", () => {
  // updateWishlistDetails patches a wishlist item's details (notes, priority, targetYear).
  it("patches wishlist item details", async () => {
    apiFetch.mockResolvedValueOnce({});
    await updateWishlistDetails({
      userId: "u1",
      code: "JP",
      notes: "Dream trip",
      priority: "high",
      targetYear: 2025,
      token: "tok",
    });
    const [url, opts] = apiFetch.mock.calls[0];
    expect(url).toContain("JP/details");
    expect(opts.json.notes).toBe("Dream trip");
    expect(opts.json.priority).toBe("high");
    expect(opts.json.targetYear).toBe(2025);
  });
});
