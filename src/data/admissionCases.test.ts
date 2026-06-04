import {
  admissionCases,
  getAdmissionCaseSummary,
  getAdmissionCasesForSchool,
  getSchoolCaseOptions
} from "./admissionCases";

describe("admission case data", () => {
  it("loads the public admission case workbook as reusable structured data", () => {
    expect(admissionCases).toHaveLength(1400);
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
