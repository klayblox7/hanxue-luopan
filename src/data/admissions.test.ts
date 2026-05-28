import { admissionProfiles, getAdmissionProfile } from "./admissions";
import { universities } from "./universities";

describe("admission profiles", () => {
  it("has one admission profile for every university slug", () => {
    const profileSlugs = admissionProfiles.map((profile) => profile.schoolSlug).sort();
    const universitySlugs = universities.map((university) => university.slug).sort();

    expect(profileSlugs).toEqual(universitySlugs);
  });

  it("keeps every profile traceable", () => {
    for (const profile of admissionProfiles) {
      expect(profile.schoolSlug).toBeTruthy();
      expect(profile.updatedAt).toMatch(/^\d{4}-\d{2}$/);
      expect(profile.verificationStatus).toMatch(/^(verified|partial|pending)$/);
      expect(profile.sourceType).toMatch(/^(official|school|government|estimate|pending)$/);

      if (profile.verificationStatus !== "pending") {
        expect(profile.sourceUrl).toMatch(/^https?:\/\//);
        expect(profile.guideYear).toBeTruthy();
      }
    }
  });

  it("exposes confirmed first-batch facts without treating pending schools as verified", () => {
    expect(getAdmissionProfile("seoul-national-university")).toMatchObject({
      schoolSlug: "seoul-national-university",
      topikMinimum: 3,
      reviewModel: "hard_gate_plus_holistic_review",
      verificationStatus: "verified"
    });

    expect(getAdmissionProfile("hongik-university")).toMatchObject({
      interviewRequired: "required",
      portfolioOrPracticalRequired: "major_specific"
    });

    expect(getAdmissionProfile("jeju-national-university")).toMatchObject({
      topikMinimum: 3,
      tuitionLevel: "low",
      verificationStatus: "partial"
    });
  });

  it("separates official hard gates from competitive heuristics", () => {
    const snu = getAdmissionProfile("seoul-national-university");

    expect(snu?.hardGates).toEqual(
      expect.arrayContaining([
        expect.stringContaining("non-Korean"),
        expect.stringContaining("high school")
      ])
    );
    expect(snu?.competitiveNotes.join(" ")).toContain("入场券");
  });

  it("stores official or traceable cost and language facts for regional national options", () => {
    expect(getAdmissionProfile("chonnam-national-university")).toMatchObject({
      topikMinimum: 3,
      tuitionLevel: "low",
      tuitionPerSemesterKrw: "1,837,000~2,436,000 KRW",
      verificationStatus: "verified"
    });

    expect(getAdmissionProfile("chungnam-national-university")?.topikAlternatives.join(" ")).toContain("TOEFL iBT 71");
    expect(getAdmissionProfile("korea-maritime-ocean-university")).toMatchObject({
      sourceType: "government",
      tuitionLevel: "low"
    });
  });

  it("adds mid-range private options without treating them like elite schools", () => {
    expect(getAdmissionProfile("keimyung-university")).toMatchObject({
      topikMinimum: 3,
      recommendationTargetPercent: 66,
      tuitionPerSemesterKrw: "3,460,000~5,066,000 KRW first semester",
      verificationStatus: "verified"
    });

    expect(getAdmissionProfile("dong-a-university")).toMatchObject({
      topikMinimum: 3,
      tuitionLevel: "medium",
      verificationStatus: "partial"
    });

    expect(getAdmissionProfile("wonkwang-university")?.competitiveNotes.join(" ")).toContain("中低成绩");
  });
});
