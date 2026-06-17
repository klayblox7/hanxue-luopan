import {
  admissionCases,
  getAdmissionCaseSummary,
  getAdmissionCasesForSchool,
  getSchoolCaseOptions
} from "./admissionCases";

describe("admission case data", () => {
  it("loads the public admission case workbook as reusable structured data", () => {
    expect(admissionCases).toHaveLength(1488);
    expect(getSchoolCaseOptions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          count: 38,
          key: "yonsei-university",
          label: "延世大学"
        }),
        expect.objectContaining({
          count: 38,
          key: "seoul-national-university",
          label: "首尔大学"
        })
      ])
    );
  });

  it("keeps the augmented target distribution and provenance metadata", () => {
    const schoolOptions = getSchoolCaseOptions();
    const t5Options = schoolOptions.filter((option) => option.schoolTier.startsWith("T5-"));
    const sourceStatuses = admissionCases.map((admissionCase) => (admissionCase as { sourceStatus?: string }).sourceStatus);
    const syntheticCount = admissionCases.filter(
      (admissionCase) => (admissionCase as { synthetic?: boolean }).synthetic === true
    ).length;
    const collectedCount = admissionCases.filter(
      (admissionCase) => (admissionCase as { synthetic?: boolean }).synthetic === false
    ).length;

    expect(schoolOptions).toHaveLength(52);
    expect(t5Options).toHaveLength(4);
    expect(t5Options.every((option) => option.count === 35)).toBe(true);
    expect(t5Options.reduce((sum, option) => sum + option.count, 0)).toBe(140);
    expect(collectedCount).toBe(284);
    expect(syntheticCount).toBe(1204);
    expect(new Set(sourceStatuses)).toEqual(new Set(["collected_20260616", "tier_augmented_20260617"]));
  });

  it("summarizes a selected school's applicant cases for charts", () => {
    const yonseiCases = getAdmissionCasesForSchool("yonsei-university");
    const summary = getAdmissionCaseSummary("yonsei-university");

    expect(yonseiCases).toHaveLength(38);
    expect(summary.caseCount).toBe(38);
    expect(summary.resultDistribution).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "录取", count: expect.any(Number) }),
        expect.objectContaining({ label: "拒绝", count: expect.any(Number) })
      ])
    );
    expect(summary.topikDistribution.map((item) => item.label)).toContain("TOPIK 5级");
    expect(summary.highSchoolDistribution.map((item) => item.label)).toContain("省重点");
    expect(summary.highSchoolDistribution.map((item) => item.label)).not.toContain("省重点/重点高中");
    expect(summary.highSchoolDistribution.map((item) => item.label)).not.toContain("省重点高中");
    expect(summary.admittedAverageGpa).toEqual(expect.any(Number));
    expect(summary.representativeCases).toHaveLength(9);
    expect(summary.representativeCases.slice(0, 6).every((admissionCase) => admissionCase.resultKey === "admitted")).toBe(
      true
    );
    expect(summary.representativeCases.slice(6, 9).every((admissionCase) => admissionCase.resultKey === "rejected")).toBe(
      true
    );
  });
});
