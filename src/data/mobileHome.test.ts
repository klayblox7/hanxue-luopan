import {
  getMobilePlannerResult,
  mobileHomeActions,
  mobileRouteTracks
} from "./mobileHome";

describe("mobile home data", () => {
  it("keeps the mini program focused on the core homepage routes", () => {
    expect(mobileHomeActions.map((action) => action.href)).toEqual([
      "/universities",
      "/topik",
      "/cost",
      "/application",
      "/exchange-rate"
    ]);
    expect(mobileHomeActions.every((action) => action.title.length <= 8)).toBe(true);
    expect(mobileHomeActions.every((action) => action.iconSrc.startsWith("/mobile-mini-program/"))).toBe(true);
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
});
