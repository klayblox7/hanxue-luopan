import { describe, expect, it } from "vitest";

import partnerSchoolProfiles from "./partner-school-profiles.json";
import { universities } from "./universities";
import { universityFoundedYear } from "./universityFoundedYears";

type SchoolProfile = {
  founded?: string;
  slug: string;
};

const partnerFoundedBySlug = new Map((partnerSchoolProfiles as SchoolProfile[]).map((profile) => [profile.slug, profile.founded || ""]));

describe("universityFoundedYears", () => {
  it("covers every university that does not already have a partner profile founding year", () => {
    const missing = universities
      .filter((university) => !partnerFoundedBySlug.get(university.slug))
      .filter((university) => !universityFoundedYear(university.slug))
      .map((university) => university.slug);

    expect(missing).toEqual([]);
  });

  it("uses the verified Ajou University founding year", () => {
    expect(universityFoundedYear("ajou-university")).toBe("1973年");
  });
});
