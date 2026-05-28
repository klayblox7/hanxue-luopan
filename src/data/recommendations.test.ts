import { recommendUniversities, scoreUniversityRecommendation, type ApplicantProfile } from "./recommendations";

const strongItApplicant: ApplicantProfile = {
  age: 18,
  gpaPercent: 90,
  highSchoolTier: "city_key",
  gradeRankBand: "top_10",
  gaokaoStrength: "not_submitted",
  topikLevel: 4,
  intendedMajor: "computer-science",
  preferredRegion: "首尔",
  budgetLevel: "medium",
  schoolTypePreference: "any",
  languageTrack: "korean"
};

describe("recommendUniversities", () => {
  it("returns five recommendations with scores and safety labels", () => {
    const results = recommendUniversities(strongItApplicant);

    expect(results).toHaveLength(5);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    expect(results[0].reasons.length).toBeGreaterThan(0);
    expect(results[0].cautions.length).toBeGreaterThan(0);
    expect(results[0].category).toMatch(/^(stable|match|reach|prepare_first|verify)$/);
  });

  it("penalizes pending admission data instead of presenting it as verified", () => {
    const pendingResult = scoreUniversityRecommendation({
      ...strongItApplicant,
      intendedMajor: "art-design",
      preferredRegion: "首尔"
    }, "sangmyung-university");

    expect(pendingResult?.category).toBe("verify");
    expect(pendingResult?.cautions.join(" ")).toContain("官方");
  });

  it("prefers verified or partial schools in the visible top five", () => {
    const results = recommendUniversities(strongItApplicant);

    expect(results.every((result) => result.verificationStatus !== "pending")).toBe(true);
  });

  it("excludes private schools when national or public type is selected", () => {
    const results = recommendUniversities({
      ...strongItApplicant,
      schoolTypePreference: "national"
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.schoolType.includes("国立") || result.schoolType.includes("公立"))).toBe(true);
  });

  it("excludes private schools when the applicant needs the lowest budget", () => {
    const results = recommendUniversities({
      ...strongItApplicant,
      budgetLevel: "low",
      schoolTypePreference: "any"
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.schoolType.includes("国立") || result.schoolType.includes("公立"))).toBe(true);
  });

  it("flags art recommendations when portfolio or interview burden is likely", () => {
    const results = recommendUniversities({
      ...strongItApplicant,
      intendedMajor: "art-design",
      preferredRegion: "首尔"
    });

    const hongik = results.find((result) => result.schoolSlug === "hongik-university");
    expect(hongik?.cautions.join(" ")).toContain("作品集");
  });

  it("treats SNU's academic threshold as an entry ticket, not an admission promise", () => {
    const snu = scoreUniversityRecommendation({
      ...strongItApplicant,
      gpaPercent: 84,
      topikLevel: 6,
      intendedMajor: "humanities"
    }, "seoul-national-university");

    expect(snu?.category).toBe("prepare_first");
    expect(snu?.cautions.join(" ")).toContain("硬门槛");
  });

  it("does not recommend elite schools first when the applicant is far below academic and language readiness", () => {
    const lowReadinessApplicant: ApplicantProfile = {
      ...strongItApplicant,
      gpaPercent: 60,
      highSchoolTier: "regular",
      gradeRankBand: "middle",
      topikLevel: 2,
      intendedMajor: "humanities",
      preferredRegion: "不限"
    };

    const results = recommendUniversities(lowReadinessApplicant);
    const visibleSlugs = results.map((result) => result.schoolSlug);
    const snu = scoreUniversityRecommendation(lowReadinessApplicant, "seoul-national-university");

    expect(visibleSlugs[0]).toBe("jeonbuk-national-university");
    expect(visibleSlugs).not.toContain("seoul-national-university");
    expect(visibleSlugs).not.toContain("yonsei-university");
    expect(visibleSlugs).not.toContain("korea-university");
    expect(snu?.category).toBe("prepare_first");
    expect(snu?.score).toBeLessThan(20);
  });
});
