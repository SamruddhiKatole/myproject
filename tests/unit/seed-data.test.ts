import { describe, expect, it } from "vitest";

import { loadCategories, loadLocalities, NAGPUR_BOUNDS } from "../../prisma/seed/reference";

describe("Nagpur locality seed data", () => {
  const { city, localities } = loadLocalities();

  it("describes Nagpur with names in all three languages", () => {
    expect(city).toMatchObject({ slug: "nagpur", nameEn: "Nagpur" });
    expect(city.nameHi).toMatch(/[ऀ-ॿ]/);
    expect(city.nameMr).toMatch(/[ऀ-ॿ]/);
  });

  it("has a useful number of localities with unique slugs", () => {
    expect(localities.length).toBeGreaterThanOrEqual(50);
    expect(new Set(localities.map((l) => l.slug)).size).toBe(localities.length);
  });

  it("keeps every centroid inside the Nagpur bounding box", () => {
    for (const l of localities) {
      expect(l.lat, l.slug).toBeGreaterThanOrEqual(NAGPUR_BOUNDS.minLat);
      expect(l.lat, l.slug).toBeLessThanOrEqual(NAGPUR_BOUNDS.maxLat);
      expect(l.lng, l.slug).toBeGreaterThanOrEqual(NAGPUR_BOUNDS.minLng);
      expect(l.lng, l.slug).toBeLessThanOrEqual(NAGPUR_BOUNDS.maxLng);
    }
  });

  it("gives every locality Devanagari Hindi and Marathi names", () => {
    for (const l of localities) {
      expect(l.nameHi, l.slug).toMatch(/[ऀ-ॿ]/);
      expect(l.nameMr, l.slug).toMatch(/[ऀ-ॿ]/);
    }
  });

  it("includes the pilot-candidate localities from roadmap Appendix C", () => {
    const slugs = new Set(localities.map((l) => l.slug));
    for (const s of [
      "dharampeth",
      "ramdaspeth",
      "shivaji-nagar",
      "itwari",
      "gandhibagh",
      "midc-hingna",
    ]) {
      expect(slugs.has(s), s).toBe(true);
    }
  });
});

describe("skill category seed data", () => {
  const { categories } = loadCategories();

  it("covers the MVP worker types with unique slugs and icons", () => {
    const slugs = categories.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of [
      "house-help",
      "cook",
      "cleaner",
      "carpenter",
      "plumber",
      "electrician",
      "painter",
      "construction-helper",
    ]) {
      expect(slugs, s).toContain(s);
    }
    for (const c of categories) expect(c.icon, c.slug).not.toBe("");
  });

  it("keeps 'other' as the catch-all and last entry", () => {
    expect(categories.at(-1)?.slug).toBe("other");
  });
});
