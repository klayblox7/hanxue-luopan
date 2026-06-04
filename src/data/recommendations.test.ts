import { recommendUniversities, scoreUniversityRecommendation, type ApplicantProfile } from "./recommendations";
import { getUniversityTier } from "./universityTiers";
import { universities } from "./universities";

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
  it("returns a seven-school balanced application slate", () => {
    const results = recommendUniversities(strongItApplicant);

    expect(results).toHaveLength(7);
    expect(results.filter((result) => result.category === "stable")).toHaveLength(3);
    expect(results.filter((result) => result.category === "match")).toHaveLength(2);
    expect(results.filter((result) => result.category === "reach")).toHaveLength(1);
    expect(results.filter((result) => result.category === "prepare_first")).toHaveLength(1);
    expect(results[0].reasons.length).toBeGreaterThan(0);
    expect(results[0].cautions.length).toBeGreaterThan(0);
    expect(results[0].category).toMatch(/^(stable|match|reach|prepare_first|verify)$/);
  });

  it("orders visible recommendations from easier T5 toward harder T1 tiers", () => {
    const results = recommendUniversities({
      ...strongItApplicant,
      gpaPercent: 77,
      highSchoolTier: "regular",
      gradeRankBand: "top_25",
      topikLevel: 4,
      intendedMajor: "undecided",
      preferredRegion: "不限"
    });

    const tierRanks = results.map((result) => Number(getUniversityTier(result.schoolNameCn).slice(1)));

    expect(tierRanks).toEqual([...tierRanks].sort((a, b) => b - a));
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

  it("prefers verified or partial schools in the visible seven", () => {
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

    expect(Number(getUniversityTier(results[0].schoolNameCn).slice(1))).toBeGreaterThanOrEqual(4);
    expect(visibleSlugs).not.toContain("seoul-national-university");
    expect(visibleSlugs).not.toContain("yonsei-university");
    expect(visibleSlugs).not.toContain("korea-university");
    expect(snu?.category).toBe("prepare_first");
    expect(snu?.score).toBeLessThan(20);
  });

  it("can score every school in the university catalog instead of a small hand-picked subset", () => {
    const scoredSchools = universities
      .map((university) => scoreUniversityRecommendation(strongItApplicant, university.slug))
      .filter(Boolean);

    expect(scoredSchools).toHaveLength(universities.length);
  });

  it("surfaces realistic lower-tier options for low-readiness regional private applicants", () => {
    const results = recommendUniversities({
      ...strongItApplicant,
      gpaPercent: 65,
      highSchoolTier: "regular",
      gradeRankBand: "middle",
      topikLevel: 2,
      gaokaoStrength: "not_submitted",
      intendedMajor: "undecided",
      preferredRegion: "地方",
      budgetLevel: "medium",
      schoolTypePreference: "private"
    });

    const visibleSlugs = results.map((result) => result.schoolSlug);

    expect(visibleSlugs).toContain("soonchunhyang-university");
    expect(visibleSlugs.some((slug) => ["handong-global-university", "wonkwang-university"].includes(slug))).toBe(true);
  });
});
