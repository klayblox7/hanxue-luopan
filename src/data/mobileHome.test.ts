import {
  getMobilePlannerResult,
  getMobileRecommendationResults,
  mobileHomeActions,
  mobileRouteTracks,
  type MobileRecommendationInput
} from "./mobileHome";
import { recommendUniversities } from "./recommendations";

describe("mobile home data", () => {
  it("keeps the mini program focused on the desktop homepage categories", () => {
    expect(mobileHomeActions.map((action) => action.href)).toEqual([
      "/korea-university-map",
      "/universities",
      "/application",
      "/cost",
      "/topik",
      "/exchange-rate"
    ]);
    expect(mobileHomeActions.every((action) => action.imageSrc.startsWith("/"))).toBe(true);
    expect(mobileHomeActions.every((action) => action.imageAlt.includes(action.title))).toBe(true);
  });

  it("prioritizes TOPIK preparation when the applicant has no Korean score yet", () => {
    expect(getMobilePlannerResult({ topikLevel: 0, budgetLevel: "medium", route: "undergraduate" })).toMatchObject({
      title: "先补TOPIK"
    });
  });

  it("routes low-budget students toward cost planning before school lists", () => {
    expect(getMobilePlannerResult({ topikLevel: 4, budgetLevel: "low", route: "graduate" })).toMatchObject({
      title: "先算预算"
    });
  });

  it("offers four compact application route tracks", () => {
    expect(mobileRouteTracks.map((track) => track.id)).toEqual(["undergraduate", "transfer", "graduate", "language"]);
  });

  it("turns mobile filter inputs into a five-school recommendation slate", () => {
    const input: MobileRecommendationInput = {
      gpaPercent: 82,
      highSchoolTier: "regular",
      topikLevel: 4,
      intendedMajor: "computer-science",
      preferredRegion: "首尔",
      schoolTypePreference: "any"
    };

    const results = getMobileRecommendationResults(input);

    expect(results).toHaveLength(5);
    expect(results.every((result) => result.schoolNameCn && result.tier && result.reason)).toBe(true);
    expect(results.some((result) => result.reason.includes("专业匹配已计入推荐分"))).toBe(true);
    expect(results.filter((result) => result.category === "录取有望")).toHaveLength(3);
    expect(results.filter((result) => result.category === "条件匹配")).toHaveLength(1);
    expect(results.filter((result) => result.category === "录取较难")).toHaveLength(1);
  });

  it("returns no direct school cards when TOPIK is below 3", () => {
    const results = getMobileRecommendationResults({
      gpaPercent: 77,
      highSchoolTier: "regular",
      topikLevel: 1,
      intendedMajor: "art-design",
      preferredRegion: "",
      schoolTypePreference: "any"
    });

    expect(results).toEqual([]);
  });

  it("uses the same school ordering as the shared desktop recommendation engine", () => {
    const input: MobileRecommendationInput = {
      gpaPercent: 77,
      highSchoolTier: "regular",
      topikLevel: 3,
      intendedMajor: "computer-science",
      preferredRegion: "",
      schoolTypePreference: "any"
    };

    const mobileResults = getMobileRecommendationResults(input);
    const sharedResults = recommendUniversities({
      age: 18,
      gpaPercent: input.gpaPercent,
      highSchoolTier: input.highSchoolTier,
      gradeRankBand: "top_25",
      gaokaoStrength: "not_submitted",
      topikLevel: input.topikLevel,
      intendedMajor: input.intendedMajor,
      preferredRegion: input.preferredRegion,
      budgetLevel: "medium",
      schoolTypePreference: input.schoolTypePreference,
      languageTrack: "korean"
    });

    expect(mobileResults.map((result) => result.schoolSlug)).toEqual(sharedResults.map((result) => result.schoolSlug));
  });
});
