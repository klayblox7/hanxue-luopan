import { universities } from "./universities";
import majorTagData from "./university-major-tags.json";

describe("universities data", () => {
  it("contains the original 50-school list plus application partner schools", () => {
    expect(universities).toHaveLength(96);
    expect(universities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: "cheongju-university", nameCn: "清州大学" }),
        expect.objectContaining({ slug: "partner-gjs-kfy-hlz-i1y", nameCn: "又松大学" }),
        expect.objectContaining({ slug: "partner-ul4-fgd-1v-3d-2q-2t-36-hlz-i1y", nameCn: "高丽 Cyber 大学" })
      ])
    );
  });

  it("keeps school records traceable and non-ranking", () => {
    expect(universities[0]).toMatchObject({
      no: 1,
      slug: "seoul-national-university",
      nameCn: "首尔大学",
      city: "首尔",
      sourceType: "pending"
    });

    for (const university of universities) {
      expect(university.updatedAt).toBe("2026-05");
      expect(university.focus).toBeTruthy();
      expect(university.nameEn).toBeTruthy();
    }
  });

  it("stores dormitory capacity and share without redundant availability text", () => {
    for (const university of universities) {
      if (!university.dormitoryCapacity || !university.dormitoryRate) continue;
      expect(university.dormitoryCapacity).toMatch(/^\d{1,3}(,\d{3})*(~\d{1,3}(,\d{3})*)?人$/);
      expect(university.dormitoryRate).toMatch(/^\d+(\.\d+)?(~\d+(\.\d+)?)?%$/);
      expect(`${university.dormitoryCapacity} ${university.dormitoryRate}`).not.toContain("有");
    }
  });

  it("tags Inje University with beauty and cosmetology", () => {
    const majorTags = majorTagData as Record<string, string[]>;

    expect(majorTags["\u4ec1\u6d4e\u5927\u5b66"]).toContain("\u7f8e\u5986/\u7f8e\u5bb9");
  });
});

