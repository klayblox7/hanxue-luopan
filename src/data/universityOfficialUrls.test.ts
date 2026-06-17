import { universities } from "./universities";
import { universityOfficialUrlsBySlug } from "./universityOfficialUrls";

describe("universityOfficialUrls", () => {
  it("has an official homepage for every university detail sheet", () => {
    for (const university of universities) {
      expect(universityOfficialUrlsBySlug[university.slug], university.slug).toMatch(/^https?:\/\//);
    }
  });

  it("keeps top school links pointed at official homepages", () => {
    expect(universityOfficialUrlsBySlug["seoul-national-university"]).toBe("https://www.snu.ac.kr");
    expect(universityOfficialUrlsBySlug["partner-hlz-skx-hlz-i1y"]).toBe("http://daegu.ac.kr/");
    expect(Object.values(universityOfficialUrlsBySlug)).not.toContain("/cost/");
  });
});
