import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatPriceRange,
  slugify,
  getBedroomLabel,
  getBathroomLabel,
  escapeHtml,
} from "./utils";

describe("formatPrice", () => {
  it("formats whole dollar amounts", () => {
    expect(formatPrice(1000)).toBe("$1,000");
    expect(formatPrice(500)).toBe("$500");
    expect(formatPrice(2500)).toBe("$2,500");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0");
  });

  it("truncates decimal cents", () => {
    expect(formatPrice(1000.99)).toBe("$1,001");
  });
});

describe("formatPriceRange", () => {
  it("returns single price when max is null", () => {
    expect(formatPriceRange(1000, null)).toBe("$1,000");
  });

  it("returns single price when max is undefined", () => {
    expect(formatPriceRange(1000)).toBe("$1,000");
  });

  it("returns single price when min equals max", () => {
    expect(formatPriceRange(1000, 1000)).toBe("$1,000");
  });

  it("returns range when min and max differ", () => {
    expect(formatPriceRange(800, 1200)).toBe("$800 - $1,200");
  });
});

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("West Campus #1!")).toBe("west-campus-1");
  });

  it("collapses multiple spaces", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });
});

describe("getBedroomLabel", () => {
  it("returns Studio for 0 bedrooms", () => {
    expect(getBedroomLabel(0)).toBe("Studio");
  });

  it("returns singular for 1 bedroom", () => {
    expect(getBedroomLabel(1)).toBe("1 Bed");
  });

  it("returns plural for multiple bedrooms", () => {
    expect(getBedroomLabel(2)).toBe("2 Beds");
    expect(getBedroomLabel(4)).toBe("4 Beds");
  });
});

describe("getBathroomLabel", () => {
  it("returns singular for 1 bathroom", () => {
    expect(getBathroomLabel(1)).toBe("1 Bath");
  });

  it("returns plural for multiple bathrooms", () => {
    expect(getBathroomLabel(2)).toBe("2 Baths");
    expect(getBathroomLabel(1.5)).toBe("1.5 Baths");
  });
});

describe("escapeHtml", () => {
  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>alert(1)</script>")).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;",
    );
  });

  it("escapes ampersands", () => {
    expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });

  it("escapes quotes", () => {
    expect(escapeHtml('"hello" & \'world\'')).toBe(
      "&quot;hello&quot; &amp; &#39;world&#39;",
    );
  });

  it("passes through safe strings unchanged", () => {
    expect(escapeHtml("The Standard at West Campus")).toBe(
      "The Standard at West Campus",
    );
  });

  it("handles XSS payloads in apartment names", () => {
    expect(escapeHtml('<img src=x onerror=alert(1)>')).toBe(
      "&lt;img src=x onerror=alert(1)&gt;",
    );
  });
});
