import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("should merge basic string classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle array of strings", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("should handle objects with conditional classes", () => {
    expect(cn("foo", { bar: true, baz: false })).toBe("foo bar");
  });

  it("should handle undefined and null values correctly", () => {
    expect(cn("foo", undefined, null, "bar", false)).toBe("foo bar");
  });

  it("should correctly override conflicting tailwind classes", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    expect(cn("px-2 py-1", "p-4")).toBe("p-4");
    expect(cn("text-sm text-gray-900", "text-lg")).toBe("text-gray-900 text-lg");
  });

  it("should handle complex combinations", () => {
    expect(
      cn(
        "text-white",
        ["bg-red-500", "p-2"],
        { "hover:bg-red-600": true, "text-black": false },
        "bg-blue-500" // overrides bg-red-500
      )
    ).toBe("text-white p-2 hover:bg-red-600 bg-blue-500");
  });
});
