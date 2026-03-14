import { describe, it, expect } from "vitest";
import {
  validate,
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
  VALIDATOR_MAXLENGTH,
  VALIDATOR_MIN,
  VALIDATOR_MAX,
  VALIDATOR_EMAIL,
} from "../utils/validators";

describe("validate", () => {
  // REQUIRE fails on empty string or whitespace-only input.
  // trim().length > 0 means "   " is treated as empty.
  it("REQUIRE returns false for empty or whitespace input", () => {
    expect(validate("", [VALIDATOR_REQUIRE()])).toBe(false);
    expect(validate("   ", [VALIDATOR_REQUIRE()])).toBe(false);
  });

  // REQUIRE passes when the value has at least one non-whitespace character.
  it("REQUIRE returns true for non-empty input", () => {
    expect(validate("hello", [VALIDATOR_REQUIRE()])).toBe(true);
  });

  // MINLENGTH checks trimmed length — "ab" has length 2, fails min of 3.
  it("MINLENGTH returns false when input is too short", () => {
    expect(validate("ab", [VALIDATOR_MINLENGTH(3)])).toBe(false);
  });

  // Exactly at the minimum length passes.
  it("MINLENGTH returns true when input meets minimum length", () => {
    expect(validate("abc", [VALIDATOR_MINLENGTH(3)])).toBe(true);
  });

  // MAXLENGTH checks trimmed length — "abcde" has length 5, fails max of 4.
  it("MAXLENGTH returns false when input exceeds max length", () => {
    expect(validate("abcde", [VALIDATOR_MAXLENGTH(4)])).toBe(false);
  });

  // Exactly at the maximum length passes.
  it("MAXLENGTH returns true when input is within max length", () => {
    expect(validate("abcd", [VALIDATOR_MAXLENGTH(4)])).toBe(true);
  });

  // MIN coerces the string value to a number with +value before comparing.
  // "4" as a number is 4, which is less than min 5 — fails.
  it("MIN returns false when number is below minimum", () => {
    expect(validate("4", [VALIDATOR_MIN(5)])).toBe(false);
  });

  it("MIN returns true when number meets minimum", () => {
    expect(validate("5", [VALIDATOR_MIN(5)])).toBe(true);
  });

  // MAX coerces the string to a number — "11" > 10 fails.
  it("MAX returns false when number exceeds maximum", () => {
    expect(validate("11", [VALIDATOR_MAX(10)])).toBe(false);
  });

  it("MAX returns true when number is within maximum", () => {
    expect(validate("10", [VALIDATOR_MAX(10)])).toBe(true);
  });

  // EMAIL uses a regex — must match pattern: something@something.something
  it("EMAIL returns false for invalid email format", () => {
    expect(validate("notanemail", [VALIDATOR_EMAIL()])).toBe(false);
    expect(validate("missing@domain", [VALIDATOR_EMAIL()])).toBe(false);
  });

  it("EMAIL returns true for valid email format", () => {
    expect(validate("user@example.com", [VALIDATOR_EMAIL()])).toBe(true);
  });

  // Multiple validators all run — if any fails, the result is false.
  // Here REQUIRE passes but MINLENGTH(5) fails for "hi".
  it("returns false when one validator in a chain fails", () => {
    expect(validate("hi", [VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(5)])).toBe(
      false
    );
  });

  // All validators must pass for the result to be true.
  it("returns true when all validators in a chain pass", () => {
    expect(
      validate("hello@test.com", [VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()])
    ).toBe(true);
  });
});
