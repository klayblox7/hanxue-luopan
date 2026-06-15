import {
  recommendUniversities,
  recommendationTargetTier,
  scoreUniversityRecommendation,
  type ApplicantProfile
} from "./recommendations";
import { getUniversityTier } from "./universityTiers";
import { universities } from "./universities";

const directApplicant: ApplicantProfile = {
  age: 18,
  gpaPercent: 77,
  highSchoolTier: "regular",
  gradeRankBand: "top_25",
  gaokaoStrength: "not_submitted",
  topikLevel: 3,
  intendedMajor: "computer-science",
  preferredRegion: "",
  budgetLevel: "medium",
  schoolTypePreference: "any",
  languageTrack: "korean"
};

function tierRanks(results: ReturnType<typeof recommendUniversities>) {
  return results.map((result) => Number(getUniversityTier(result.schoolNameCn).slice(1)));
}

describe("recommendUniversities", () => {
  it("does not generate direct university recommendations below TOPIK 3", () => {
    const results = recommendUniversities({
      ...directApplicant,
      topikLevel: 1
    });

    expect(results).toEqual([]);
    expect(recommendationTargetTier({ ...directApplicant, topikLevel: 1 })).toBeNull();
  });

  it("recommends one tier above the realistic school tier for Korean study abroad positioning", () => {
    expect(recommendationTargetTier(directApplicant)).toBe(2);

    const results = recommendUniversities(directApplicant);

    expect(results).toHaveLength(5);
    expect(tierRanks(results).slice(0, 4).every((tier) => tier === 2)).toBe(true);
    expect(tierRanks(results)[4]).toBe(1);
  });

  it("always returns three hopeful, one matched, and one reach recommendation", () => {
    const results = recommendUniversities(directApplicant);

    expect(results.map((result) => result.category)).toEqual(["stable", "stable", "stable", "match", "reach"]);
  });

  it("orders the visible list from lower school rank toward higher school rank", () => {
    const results = recommendUniversities(directApplicant);
    const ranks = tierRanks(results);

    expect(ranks).toEqual([...ranks].sort((a, b) => b - a));
  });

  it("uses intended major and school focus to influence recommendation ordering", () => {
    const computerResults = recommendUniversities({
      ...directApplicant,
      intendedMajor: "computer-science"
    });
    const artResults = recommendUniversities({
      ...directApplicant,
      intendedMajor: "art-design"
    });

    expect(artResults.map((result) => result.schoolSlug)).not.toEqual(computerResults.map((result) => result.schoolSlug));
    expect(computerResults[0].majorMatchCount).toBeGreaterThan(0);
    expect(artResults[0].majorMatchCount).toBeGreaterThan(0);
    expect(computerResults[0].reasons.join(" ")).toContain("专业匹配已计入推荐分");
    expect(artResults[0].reasons.join(" ")).toContain("专业匹配已计入推荐分");
  });

  it("uses only GPA and TOPIK for the target tier, not high-school context extras", () => {
    const plainApplicant: ApplicantProfile = {
      ...directApplicant,
      highSchoolTier: "regular",
      gradeRankBand: "middle",
      gaokaoStrength: "not_submitted"
    };
    const strongerContextApplicant: ApplicantProfile = {
      ...directApplicant,
      highSchoolTier: "provincial_key",
      gradeRankBand: "top_5",
      gaokaoStrength: "high"
    };

    expect(recommendationTargetTier(strongerContextApplicant)).toBe(recommendationTargetTier(plainApplicant));
    expect(scoreUniversityRecommendation(strongerContextApplicant, "pusan-national-university")?.score).toBe(
      scoreUniversityRecommendation(plainApplicant, "pusan-national-university")?.score
    );
    expect(recommendUniversities(strongerContextApplicant).map((result) => result.schoolSlug)).toEqual(
      recommendUniversities(plainApplicant).map((result) => result.schoolSlug)
    );
  });

  it("respects selected school type as a filter, not as a score bonus", () => {
    const results = recommendUniversities({
      ...directApplicant,
      schoolTypePreference: "national"
    });

    expect(results).toHaveLength(5);
    expect(results.every((result) => result.schoolType.includes("国立") || result.schoolType.includes("公立"))).toBe(true);
  });

  it("can still score every school in the university catalog", () => {
    const scoredSchools = universities
      .map((university) => scoreUniversityRecommendation(directApplicant, university.slug))
      .filter(Boolean);

    expect(scoredSchools).toHaveLength(universities.length);
  });
});
