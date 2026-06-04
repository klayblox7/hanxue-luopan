export type UniversityTier = "T1" | "T2" | "T3" | "T4" | "T5";

export type UniversityTierProfile = {
  tier: UniversityTier;
  note: string;
};

// Advisory tiers for Chinese undergraduate applicants.
// This blends QS/THE Korea position, Korean reputation, flagship-national status, location, and field strength.
const universityTierProfiles: Record<string, UniversityTierProfile> = {
  首尔大学: { tier: "T1", note: "韩国顶尖/最高认知" },
  延世大学: { tier: "T1", note: "韩国顶尖/最高认知" },
  高丽大学: { tier: "T1", note: "韩国顶尖/最高认知" },
  韩国科学技术院: { tier: "T1", note: "韩国顶尖/最高认知" },
  成均馆大学: { tier: "T2", note: "一流名校/全国强校" },
  汉阳大学: { tier: "T2", note: "一流名校/全国强校" },
  庆熙大学: { tier: "T2", note: "一流名校/全国强校" },
  中央大学: { tier: "T2", note: "一流名校/全国强校" },
  梨花女子大学: { tier: "T2", note: "一流名校/全国强校" },
  西江大学: { tier: "T2", note: "一流名校/全国强校" },
  世宗大学: { tier: "T2", note: "研究排名强/特色强校" },
  釜山大学: { tier: "T2", note: "重点国立/全国强校" },
  庆北大学: { tier: "T2", note: "重点国立/全国强校" },
  亚洲大学: { tier: "T2", note: "理工医学强校" },
  韩国艺术综合学校: { tier: "T2", note: "艺术顶尖特色院校" },
  韩国外国语大学: { tier: "T3", note: "主流名校/重点国私立" },
  东国大学: { tier: "T3", note: "主流名校/重点国私立" },
  建国大学: { tier: "T3", note: "主流名校/重点国私立" },
  弘益大学: { tier: "T3", note: "艺术设计强校" },
  国民大学: { tier: "T3", note: "设计工科强校" },
  崇实大学: { tier: "T3", note: "IT/经营强校" },
  首尔市立大学: { tier: "T3", note: "公立名校/性价比高" },
  仁荷大学: { tier: "T3", note: "工科物流强校" },
  韩国航空大学: { tier: "T3", note: "航空特色强校" },
  首尔科学技术大学: { tier: "T3", note: "国立工科强校" },
  加图立大学: { tier: "T3", note: "医学保健强校" },
  全南大学: { tier: "T3", note: "重点国立/区域强校" },
  忠南大学: { tier: "T3", note: "重点国立/区域强校" },
  忠北大学: { tier: "T3", note: "重点国立/区域强校" },
  全北大学: { tier: "T3", note: "重点国立/区域强校" },
  嘉泉大学: { tier: "T3", note: "医学AI强校" },
  淑明女子大学: { tier: "T3", note: "首尔主流女子大学" },
  岭南大学: { tier: "T3", note: "区域大型私立强校" },
  蔚山大学: { tier: "T3", note: "医学工程强校" },
  江原大学: { tier: "T4", note: "中坚院校/区域国立" },
  济州大学: { tier: "T4", note: "中坚院校/区域国立" },
  檀国大学: { tier: "T4", note: "中坚院校/专业特色" },
  明知大学: { tier: "T4", note: "中坚院校/专业特色" },
  祥明大学: { tier: "T4", note: "中坚院校/艺术设计" },
  诚信女子大学: { tier: "T4", note: "中坚院校/女子大学" },
  光云大学: { tier: "T4", note: "中坚院校/电子IT" },
  韩国海洋大学: { tier: "T4", note: "海洋物流特色国立" },
  釜庆大学: { tier: "T4", note: "海洋水产特色国立" },
  东亚大学: { tier: "T4", note: "中坚院校/区域私立" },
  启明大学: { tier: "T4", note: "中坚院校/区域私立" },
  顺天乡大学: { tier: "T4", note: "医学保健特色院校" },
  韩东大学: { tier: "T4", note: "国际化特色院校" },
  德成女子大学: { tier: "T5", note: "保底友好/女子大学" },
  首尔女子大学: { tier: "T5", note: "保底友好/女子大学" },
  圆光大学: { tier: "T5", note: "保底友好/区域私立" }
};

export function getUniversityTierProfile(nameCn: string): UniversityTierProfile {
  return universityTierProfiles[nameCn] ?? { tier: "T4", note: "待补充分层" };
}

export function getUniversityTier(nameCn: string): UniversityTier {
  return getUniversityTierProfile(nameCn).tier;
}
