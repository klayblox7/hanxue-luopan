import { describe, expect, it } from "vitest";

import { universities } from "./universities";
import { noPublicAlumniText, universityAlumniBySlug, universityAlumniText } from "./universityAlumni";

describe("universityAlumni", () => {
  it("keeps an alumni entry for every university slug", () => {
    const missingSlugs = universities
      .map((university) => university.slug)
      .filter((slug) => !Object.prototype.hasOwnProperty.call(universityAlumniBySlug, slug));

    expect(missingSlugs).toEqual([]);
  });

  it("uses Chinese-facing display text without Korean or Latin names", () => {
    for (const [slug, names] of Object.entries(universityAlumniBySlug)) {
      expect(Array.isArray(names), slug).toBe(true);

      for (const name of names) {
        expect(name.trim(), slug).toBe(name);
        expect(name, slug).not.toMatch(/[A-Za-z\uac00-\ud7af]/);
      }
    }
  });

  it("formats known alumni and empty schools consistently", () => {
    expect(universityAlumniText("seoul-national-university")).toContain("潘基文");
    expect(universityAlumniText("seoul-national-university")).toContain("尹锡悦");
    expect(universityAlumniText("partner-lla-iji-r7m-g21-hlz-i1y")).toBe(noPublicAlumniText);
  });
});
