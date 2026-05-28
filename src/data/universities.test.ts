import { universities } from "./universities";

describe("universities data", () => {
  it("contains the initial 50-school university list from the brief", () => {
    expect(universities).toHaveLength(50);
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
      expect(university.dormitoryCapacity).toMatch(/^\d{1,3}(,\d{3})*(~\d{1,3}(,\d{3})*)?人$/);
      expect(university.dormitoryRate).toMatch(/^\d+(\.\d+)?(~\d+(\.\d+)?)?%$/);
      expect(`${university.dormitoryCapacity} ${university.dormitoryRate}`).not.toContain("有");
    }
  });
});

