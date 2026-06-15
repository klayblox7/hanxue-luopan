import { admissionProfiles, type VerificationStatus } from "./admissions";
import { getUniversityTier } from "./universityTiers";
import { universities } from "./universities";

export type HighSchoolTier = "provincial_key" | "city_key" | "regular" | "unknown";
export type GradeRankBand = "top_5" | "top_10" | "top_25" | "middle" | "unknown";
export type GaokaoStrength = "high" | "above_tier_one" | "submitted" | "not_submitted";
export type BudgetLevel = "low" | "medium" | "high";
export type SchoolTypePreference = "national" | "private" | "any";
export type LanguageTrack = "korean" | "english" | "any";
export type IntendedMajor =
  | "business"
  | "computer-science"
  | "engineering"
  | "media"
  | "art-design"
  | "korean-language"
  | "tourism"
  | "humanities"
  | "science"
  | "undecided";

export type ApplicantProfile = {
  age: number;
  gpaPercent: number;
  highSchoolTier: HighSchoolTier;
  gradeRankBand: GradeRankBand;
  gaokaoStrength: GaokaoStrength;
  topikLevel: number;
  intendedMajor: IntendedMajor;
  preferredRegion: string;
  budgetLevel: BudgetLevel;
  schoolTypePreference: SchoolTypePreference;
  languageTrack: LanguageTrack;
};

export type RecommendationCategory = "stable" | "match" | "reach" | "prepare_first" | "verify";

export type UniversityRecommendation = {
  schoolSlug: string;
  schoolNameCn: string;
  city: string;
  schoolType: string;
  score: number;
  majorMatchCount: number;
  fitPriority: number;
  academicGap: number;
  category: RecommendationCategory;
  verificationStatus: VerificationStatus;
  hardGatePassed: boolean;
  reasons: string[];
  cautions: string[];
};

const directTopikMinimum = 3;
const categoryPlan: RecommendationCategory[] = ["stable", "stable", "stable", "match", "reach"];

const majorKeywords: Record<IntendedMajor, string[]> = {
  business: ["经营", "商", "经济", "贸易", "政经"],
  "computer-science": ["IT", "AI", "计算机", "软件", "数据", "人工智能", "工科", "工程", "电子", "半导体", "机器人"],
  engineering: ["工科", "工程", "电子", "机械", "半导体", "航空", "造船"],
  media: ["传媒", "电影", "影像", "广告", "内容", "表演"],
  "art-design": ["艺术", "设计", "美术", "动画", "建筑"],
  "korean-language": ["韩语", "韩国语", "人文", "教育", "外语"],
  tourism: ["旅游", "酒店"],
  humanities: ["人文", "外语", "国际", "教育", "文学", "历史"],
  science: ["自然", "科学", "生命", "医学", "农业"],
  undecided: []
};

const bySlug = new Map(universities.map((university) => [university.slug, university]));

function clampTier(tier: number): number {
  return Math.min(5, Math.max(1, tier));
}

function universityNo(slug: string): number {
  return bySlug.get(slug)?.no ?? 999;
}

function tierRankForName(schoolNameCn: string): number {
  return Number(getUniversityTier(schoolNameCn).slice(1)) || 5;
}

function countMajorMatches(focus: string, intendedMajor: IntendedMajor): number {
  if (intendedMajor === "undecided") return 0;
  return (majorKeywords[intendedMajor] ?? []).filter((keyword) => focus.includes(keyword)).length;
}

function majorFitBonus(matchCount: number, intendedMajor: IntendedMajor): number {
  if (intendedMajor === "undecided") return 0;
  return matchCount > 0 ? Math.min(18, 8 + matchCount * 4) : -6;
}

function realisticTierForApplicant(applicant: ApplicantProfile): number | null {
  if (applicant.topikLevel < directTopikMinimum) return null;

  const academicPercent = applicant.gpaPercent;
  let realisticTier = 5;
  if (academicPercent >= 88) realisticTier = 2;
  else if (academicPercent >= 75) realisticTier = 3;
  else if (academicPercent >= 70) realisticTier = 4;

  if (applicant.topikLevel >= 5) realisticTier -= 1;
  return clampTier(realisticTier);
}

export function recommendationTargetTier(applicant: ApplicantProfile): number | null {
  const realisticTier = realisticTierForApplicant(applicant);
  if (!realisticTier) return null;

  return clampTier(realisticTier - 1);
}

function targetTierForSlot(targetTier: number, category: RecommendationCategory): number {
  if (category === "reach") return clampTier(targetTier - 1);
  return targetTier;
}

function matchesPreferredRegion(city: string, preferredRegion: string): boolean {
  if (!preferredRegion || preferredRegion === "不限" || preferredRegion === "都可以") return true;
  if (preferredRegion === "首尔") return city.includes("首尔");
  if (preferredRegion === "地方") return !city.includes("首尔");
  return city.includes(preferredRegion);
}

function matchesSchoolType(type: string, preference: SchoolTypePreference): boolean {
  if (preference === "any") return true;
  if (preference === "national") return type.includes("国立") || type.includes("公立");
  return type.includes("私立");
}

function baseScore(
  applicant: ApplicantProfile,
  schoolTier: number,
  targetTier: number,
  schoolNo: number,
  majorMatchCount: number
): number {
  const academicPercent = applicant.gpaPercent;
  const tierFit = 20 - Math.abs(schoolTier - targetTier) * 8;
  const topikScore = Math.min(20, applicant.topikLevel * 3);
  const academicScore = Math.max(0, Math.min(35, academicPercent - 55));
  const rankingOrderScore = Math.max(0, 12 - schoolNo / 12);
  const majorScore = majorFitBonus(majorMatchCount, applicant.intendedMajor);

  return Math.round(academicScore + topikScore + tierFit + rankingOrderScore + majorScore);
}

function compareLowerRankFirst(a: UniversityRecommendation, b: UniversityRecommendation): number {
  const tierCompare = tierRankForName(b.schoolNameCn) - tierRankForName(a.schoolNameCn);
  if (tierCompare !== 0) return tierCompare;
  return universityNo(b.schoolSlug) - universityNo(a.schoolSlug);
}

function compareVisibleTierOrder(a: UniversityRecommendation, b: UniversityRecommendation): number {
  return tierRankForName(b.schoolNameCn) - tierRankForName(a.schoolNameCn);
}

function compareSlotCandidates(slotTier: number) {
  return (a: UniversityRecommendation, b: UniversityRecommendation): number => {
    const aTier = tierRankForName(a.schoolNameCn);
    const bTier = tierRankForName(b.schoolNameCn);
    const tierDistance = Math.abs(aTier - slotTier) - Math.abs(bTier - slotTier);
    if (tierDistance !== 0) return tierDistance;

    const scoreCompare = b.score - a.score;
    if (scoreCompare !== 0) return scoreCompare;

    const sameTierOrder = compareLowerRankFirst(a, b);
    if (sameTierOrder !== 0) return sameTierOrder;

    return 0;
  };
}

export function scoreUniversityRecommendation(applicant: ApplicantProfile, schoolSlug: string): UniversityRecommendation | undefined {
  const university = bySlug.get(schoolSlug);
  const profile = admissionProfiles.find((admissionProfile) => admissionProfile.schoolSlug === schoolSlug);
  if (!university || !profile) return undefined;

  const targetTier = recommendationTargetTier(applicant);
  const schoolTier = tierRankForName(university.nameCn);
  const hardGatePassed = targetTier !== null;
  const majorMatchCount = countMajorMatches(university.focus, applicant.intendedMajor);
  const score = targetTier !== null ? baseScore(applicant, schoolTier, targetTier, university.no, majorMatchCount) : 0;
  const majorFitReason =
    applicant.intendedMajor === "undecided"
      ? "专业选择为必选项，请先选择目标专业"
      : majorMatchCount > 0
        ? `专业匹配已计入推荐分：学校代表方向包含${university.focus}`
        : `专业匹配较弱：学校代表方向为${university.focus}，建议确认是否开设目标专业`;

  return {
    schoolSlug: university.slug,
    schoolNameCn: university.nameCn,
    city: university.city,
    schoolType: university.type,
    score,
    majorMatchCount,
    fitPriority: hardGatePassed ? Math.abs(schoolTier - (targetTier ?? schoolTier)) : 2,
    academicGap: applicant.gpaPercent - 75,
    category: hardGatePassed ? (schoolTier < (targetTier ?? schoolTier) ? "reach" : "stable") : "prepare_first",
    verificationStatus: profile.verificationStatus,
    hardGatePassed,
    reasons: [
      `${university.city} / ${university.type}`,
      `推荐依据：高中均分 ${applicant.gpaPercent}分，TOPIK ${applicant.topikLevel}级`,
      targetTier ? `当前推荐目标：T${targetTier}` : "TOPIK未达到直接申请参考线",
      majorFitReason
    ],
    cautions:
      applicant.topikLevel < directTopikMinimum
        ? ["TOPIK低于3级时，不建议直接生成大学推荐。"]
        : ["请进入学校详情确认是否开设目标专业，并以最新招生简章为准。"]
  };
}

export function recommendUniversities(applicant: ApplicantProfile): UniversityRecommendation[] {
  const targetTier = recommendationTargetTier(applicant);
  if (!targetTier) return [];

  const baseCandidates = admissionProfiles
    .map((profile) => scoreUniversityRecommendation(applicant, profile.schoolSlug))
    .filter((result): result is UniversityRecommendation => Boolean(result))
    .filter((result) => result.verificationStatus !== "pending")
    .filter((result) => matchesPreferredRegion(result.city, applicant.preferredRegion))
    .filter((result) => matchesSchoolType(result.schoolType, applicant.schoolTypePreference));

  const candidates = baseCandidates.length >= categoryPlan.length
    ? baseCandidates
    : admissionProfiles
        .map((profile) => scoreUniversityRecommendation(applicant, profile.schoolSlug))
        .filter((result): result is UniversityRecommendation => Boolean(result))
        .filter((result) => matchesPreferredRegion(result.city, applicant.preferredRegion))
        .filter((result) => matchesSchoolType(result.schoolType, applicant.schoolTypePreference));

  const used = new Set<string>();
  const selected = categoryPlan
    .map((category) => {
      const slotTier = targetTierForSlot(targetTier, category);
      const picked = [...candidates]
        .filter((candidate) => !used.has(candidate.schoolSlug))
        .sort(compareSlotCandidates(slotTier))[0];
      if (!picked) return undefined;
      used.add(picked.schoolSlug);
      return { ...picked, category };
    })
    .filter((result): result is UniversityRecommendation => Boolean(result));

  return selected.sort(compareVisibleTierOrder);
}
