import {
  homeEntries,
  homeMetrics,
  latestUpdate,
  sourceLabels,
  type SourceType
} from "./home";

describe("home data", () => {
  it("defines the supported source labels in simplified Chinese", () => {
    const expected: Record<SourceType, string> = {
      official: "官方",
      school: "学校",
      government: "政府",
      community: "经验",
      commercial: "合作",
      estimate: "估算",
      pending: "待核验"
    };

    expect(sourceLabels).toEqual(expected);
  });

  it("keeps each headline metric traceable with source metadata", () => {
    expect(homeMetrics.length).toBeGreaterThanOrEqual(5);
    expect(homeMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "韩国高等教育外国留学生",
          value: "253,434",
          sourceType: "official"
        }),
        expect.objectContaining({
          label: "中国学生在韩规模",
          value: "76,541",
          note: "约30.2%",
          sourceType: "official"
        })
      ])
    );

    for (const metric of homeMetrics) {
      expect(metric.updatedAt).toMatch(/^\d{4}-\d{2}$/);
      expect(metric.sourceUrl || metric.note).toBeTruthy();
    }
  });

  it("exposes seven homepage entries that point to future product routes", () => {
    expect(homeEntries).toHaveLength(7);
    expect(homeEntries.map((entry) => entry.href)).toEqual([
      "/universities",
      "/topik",
      "/cost",
      "/korean-learning",
      "/scholarships",
      "/application",
      "/application#agency-check"
    ]);
    expect(homeEntries[0]).toMatchObject({
      title: "韩国大学库",
      href: "/universities",
      actionLabel: "查看学校列表",
      status: "available"
    });
  });

  it("uses one latest update marker for the home trust bar", () => {
    expect(latestUpdate.label).toBe("最近更新");
    expect(latestUpdate.updatedAt).toMatch(/^\d{4}-\d{2}$/);
    expect(latestUpdate.description).toContain("官方来源优先");
  });
});

