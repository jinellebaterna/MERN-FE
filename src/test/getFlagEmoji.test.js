import { describe, it, expect } from "vitest";
import { getFlagEmoji } from "../utils/flags";

describe("getFlagEmoji", () => {
  it("returns the correct flag emoji for uppercase code", () => {
    expect(getFlagEmoji("NO")).toBe("🇳🇴");
  });

  it("returns the correct flag emoji for lowercase code", () => {
    expect(getFlagEmoji("fr")).toBe("🇫🇷");
  });

  it("returns the correct flag emoji for US", () => {
    expect(getFlagEmoji("US")).toBe("🇺🇸");
  });
});
