import { describe, it, expect } from "vitest";
import { safeAuthRedirectPath } from "./safe-redirect";

describe("safeAuthRedirectPath", () => {
  it("allows plain relative paths", () => {
    expect(safeAuthRedirectPath("/dashboard")).toBe("/dashboard");
    expect(safeAuthRedirectPath("/roommates/profile")).toBe("/roommates/profile");
  });

  it("rejects scheme-relative and absolute URLs", () => {
    expect(safeAuthRedirectPath("//evil.com")).toBe("/dashboard");
    expect(safeAuthRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(safeAuthRedirectPath("/\\slash")).toBe("/dashboard");
  });

  it("uses fallback for empty or unsafe input", () => {
    expect(safeAuthRedirectPath(null)).toBe("/dashboard");
    expect(safeAuthRedirectPath("")).toBe("/dashboard");
    expect(safeAuthRedirectPath("not-a-path")).toBe("/dashboard");
  });
});
