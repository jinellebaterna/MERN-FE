import { describe, it, expect } from "vitest";
import { fileKey } from "../utils/fileKey";

describe("fileKey", () => {
  // fileKey combines name and size with a dash to create a unique identifier.
  // This is used to track files in the upload queue without duplicates.
  it("returns a string in the format name-size", () => {
    const file = { name: "photo.jpg", size: 1024 };
    expect(fileKey(file)).toBe("photo.jpg-1024");
  });

  // Two files with the same name but different sizes produce different keys —
  // prevents treating a re-uploaded file as a duplicate.
  it("produces different keys for same name but different sizes", () => {
    const a = { name: "photo.jpg", size: 1024 };
    const b = { name: "photo.jpg", size: 2048 };
    expect(fileKey(a)).not.toBe(fileKey(b));
  });

  // Two files with the same size but different names also produce different keys.
  it("produces different keys for different names with same size", () => {
    const a = { name: "photo.jpg", size: 1024 };
    const b = { name: "avatar.png", size: 1024 };
    expect(fileKey(a)).not.toBe(fileKey(b));
  });
});
