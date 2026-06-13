import {
  getMobilePlannerResult,
  getMobileRecommendationResults,
  mobileHomeActions,
  mobileRouteTracks,
  type MobileRecommendationInput
} from "./mobileHome";

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
    expect(mobileHomeActions.map((action) => action.title)).toEqual([
      "韩国大学地图",
      "韩国大学库",
      "国内+韩国项目",
      "留学费用",
      "韩语",
      "汇率换算"
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

  it("turns mobile filter inputs into a visible recommendation slate", () => {
    const input: MobileRecommendationInput = {
      gpaPercent: 82,
      highSchoolTier: "regular",
      topikLevel: 4,
      intendedMajor: "computer-science",
      preferredRegion: "首尔",
      budgetLevel: "medium",
      schoolTypePreference: "any"
    };

    const results = getMobileRecommendationResults(input);

    expect(results).toHaveLength(5);
    expect(results.every((result) => result.schoolNameCn && result.tier && result.reason)).toBe(true);
    expect(results.some((result) => result.category === "适合申请" || result.category === "较有希望")).toBe(true);
  });
});
