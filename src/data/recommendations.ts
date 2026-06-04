import { admissionProfiles, type AdmissionProfile, type TuitionLevel, type VerificationStatus } from "./admissions";
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
  fitPriority: number;
  academicGap: number;
  category: RecommendationCategory;
  verificationStatus: VerificationStatus;
  hardGatePassed: boolean;
  reasons: string[];
  cautions: string[];
};

const recommendationSlatePlan: RecommendationCategory[] = [
  "stable",
  "stable",
  "stable",
  "match",
  "match",
  "reach",
  "prepare_first"
];

const majorKeywords: Record<IntendedMajor, string[]> = {
  business: ["经营", "商", "经济", "贸易", "政经"],
  "computer-science": ["IT", "AI", "计算机", "软件", "数据", "人工智能"],
  engineering: ["工科", "工程", "电子", "机械", "半导体", "航空", "造船"],
  media: ["传媒", "电影", "影像", "广告", "内容", "表演"],
  "art-design": ["艺术", "设计", "美术", "动画", "建筑"],
  "korean-language": ["韩语", "韩国语", "人文", "教育", "外语"],
  tourism: ["旅游", "酒店"],
  humanities: ["人文", "外语", "国际", "教育", "文学", "历史"],
  science: ["自然", "科学", "生命", "医学", "农业"],
  undecided: []
};

const academicTargets: Record<string, number> = {
  "seoul-national-university": 94,
  "yonsei-university": 91,
  "korea-university": 91,
  "sungkyunkwan-university": 88,
  "hanyang-university": 87,
  "kyung-hee-university": 85,
  "chung-ang-university": 85,
  "hongik-university": 84,
  "sogang-university": 86,
  "ewha-womans-university": 85
};

function academicTargetForUniversity(university: (typeof universities)[number]): number {
  const explicitTarget = academicTargets[university.slug];
  if (explicitTarget) return explicitTarget;
  if (university.no <= 10) return 86;
  if (university.no <= 20) return 80;
  if (university.no <= 30) return 76;
  if (university.no <= 40) return 72;
  return 70;
}

function academicTargetForProfile(university: (typeof universities)[number], profile: AdmissionProfile): number {
  return profile.recommendationTargetPercent ?? academicTargetForUniversity(university);
}

const schoolTierBonus: Record<HighSchoolTier, number> = {
  provincial_key: 4,
  city_key: 3,
  regular: 0,
  unknown: 1
};

const rankBonus: Record<GradeRankBand, number> = {
  top_5: 5,
  top_10: 4,
  top_25: 2,
  middle: 0,
  unknown: 1
};

const gaokaoBonus: Record<GaokaoStrength, number> = {
  high: 5,
  above_tier_one: 4,
  submitted: 2,
  not_submitted: 0
};

function scoreMajor(focus: string, intendedMajor: IntendedMajor): number {
  if (intendedMajor === "undecided") return 18;
  const keywords = majorKeywords[intendedMajor];
  const matches = keywords.filter((keyword) => focus.includes(keyword)).length;
  return Math.min(30, matches * 12);
}

function scoreLanguage(topikLevel: number, minimum?: number): number {
  if (!minimum) return topikLevel >= 3 ? 14 : 8;
  if (topikLevel >= minimum + 2) return 20;
  if (topikLevel >= minimum + 1) return 18;
  if (topikLevel >= minimum) return 15;
  if (topikLevel + 1 === minimum) return 8;
  return 3;
}

function scoreAcademic(
  applicant: ApplicantProfile,
  university: (typeof universities)[number],
  profile: AdmissionProfile
): { score: number; adjustedGap: number; target: number } {
  const target = academicTargetForProfile(university, profile);
  const base = applicant.gpaPercent - target;
  const adjusted = base + schoolTierBonus[applicant.highSchoolTier] + rankBonus[applicant.gradeRankBand] + gaokaoBonus[applicant.gaokaoStrength];
  const score = adjusted >= 8 ? 20 : adjusted >= 3 ? 17 : adjusted >= 0 ? 14 : adjusted >= -5 ? 9 : 4;

  return { score, adjustedGap: adjusted, target };
}

function scoreBudget(type: string, budgetLevel: BudgetLevel, tuitionLevel: TuitionLevel = "unknown"): number {
  if (budgetLevel === "high") return 10;
  if (tuitionLevel === "low") return 10;
  if (tuitionLevel === "medium") return budgetLevel === "medium" ? 6 : 2;
  if (tuitionLevel === "high") return budgetLevel === "medium" ? 3 : 0;
  if (type.includes("国立") || type.includes("公立")) return 10;
  return budgetLevel === "medium" ? 7 : 3;
}

function scoreRegion(city: string, preferredRegion: string): number {
  if (!preferredRegion || preferredRegion === "不限" || preferredRegion === "都可以") return 8;
  if (preferredRegion === "首尔") return city.includes("首尔") ? 10 : 0;
  if (preferredRegion === "地方") return city.includes("首尔") ? 0 : 10;
  return city.includes(preferredRegion) ? 10 : 3;
}

function matchesPreferredRegion(city: string, preferredRegion: string): boolean {
  if (!preferredRegion || preferredRegion === "不限" || preferredRegion === "都可以") return true;
  if (preferredRegion === "首尔") return city.includes("首尔");
  if (preferredRegion === "地方") return !city.includes("首尔");
  return city.includes(preferredRegion);
}

function scoreSchoolType(type: string, preference: SchoolTypePreference): number {
  if (preference === "any") return 5;
  if (preference === "national" && (type.includes("国立") || type.includes("公立"))) return 5;
  if (preference === "private" && type.includes("私立")) return 5;
  return 1;
}

function scoreReliability(status: VerificationStatus): number {
  if (status === "verified") return 5;
  if (status === "partial") return 3;
  return -20;
}

function passesHardGate(applicant: ApplicantProfile, minimumTopik?: number, academicGatePercent?: number): boolean {
  if (academicGatePercent && applicant.gpaPercent < academicGatePercent) return false;
  if (minimumTopik && applicant.topikLevel < minimumTopik) return false;
  return true;
}

function readinessPenalty({
  academicGateBlocked,
  languageGateBlocked,
  adjustedAcademicGap,
  languageGap
}: {
  academicGateBlocked: boolean;
  languageGateBlocked: boolean;
  adjustedAcademicGap: number;
  languageGap: number;
}): number {
  let penalty = 0;
  if (academicGateBlocked) penalty += 60;
  if (languageGateBlocked) penalty += 35;
  if (adjustedAcademicGap < -18) penalty += 35;
  else if (adjustedAcademicGap < -12) penalty += 22;
  else if (adjustedAcademicGap < -8) penalty += 12;
  if (languageGap <= -2) penalty += 30;
  else if (languageGap === -1) penalty += 12;
  return penalty;
}

function fitPriority({
  academicGateBlocked,
  languageGateBlocked,
  adjustedAcademicGap,
  languageGap
}: {
  academicGateBlocked: boolean;
  languageGateBlocked: boolean;
  adjustedAcademicGap: number;
  languageGap: number;
}): number {
  if (academicGateBlocked || languageGateBlocked || adjustedAcademicGap < -18 || languageGap <= -2) return 2;
  if (adjustedAcademicGap < -8 || languageGap < 0) return 1;
  return 0;
}

function categorize(score: number, status: VerificationStatus, hardGatePassed: boolean, fit: number): RecommendationCategory {
  if (status === "pending") return "verify";
  if (!hardGatePassed || fit === 2) return "prepare_first";
  if (score >= 82) return "stable";
  if (score >= 68) return "match";
  return "reach";
}

function recommendationTierRank(schoolNameCn: string): number {
  return Number(getUniversityTier(schoolNameCn).slice(1));
}

function compareRecommendationsByEase(a: UniversityRecommendation, b: UniversityRecommendation): number {
  const tierCompare = recommendationTierRank(b.schoolNameCn) - recommendationTierRank(a.schoolNameCn);
  if (tierCompare !== 0) return tierCompare;

  const fitCompare = a.fitPriority - b.fitPriority;
  if (fitCompare !== 0) return fitCompare;
  if (a.fitPriority === 2) return b.academicGap - a.academicGap || b.score - a.score;
  return b.score - a.score;
}

export function scoreUniversityRecommendation(applicant: ApplicantProfile, schoolSlug: string): UniversityRecommendation | undefined {
  const bySlug = new Map(universities.map((university) => [university.slug, university]));
  const profile = admissionProfiles.find((admissionProfile) => admissionProfile.schoolSlug === schoolSlug);
  const university = bySlug.get(schoolSlug);

  if (!profile || !university) return undefined;

  const majorScore = scoreMajor(university.focus, applicant.intendedMajor);
  const languageScore = scoreLanguage(applicant.topikLevel, profile.topikMinimum);
  const academicReadiness = scoreAcademic(applicant, university, profile);
  const academicGateBlocked = Boolean(profile.academicGatePercent && applicant.gpaPercent < profile.academicGatePercent);
  const languageGap = profile.topikMinimum ? applicant.topikLevel - profile.topikMinimum : applicant.topikLevel >= 3 ? 0 : -1;
  const languageGateBlocked = Boolean(profile.topikMinimum && applicant.topikLevel < profile.topikMinimum);
  const hardGatePassed = passesHardGate(applicant, profile.topikMinimum, profile.academicGatePercent);
  const fit = fitPriority({
    academicGateBlocked,
    languageGateBlocked,
    adjustedAcademicGap: academicReadiness.adjustedGap,
    languageGap
  });
  const rawScore =
    majorScore +
    languageScore +
    academicReadiness.score +
    scoreBudget(university.type, applicant.budgetLevel, profile.tuitionLevel) +
    scoreRegion(university.city, applicant.preferredRegion) +
    scoreSchoolType(university.type, applicant.schoolTypePreference) +
    scoreReliability(profile.verificationStatus);
  const score = Math.max(
    0,
    rawScore -
      readinessPenalty({
        academicGateBlocked,
        languageGateBlocked,
        adjustedAcademicGap: academicReadiness.adjustedGap,
        languageGap
      })
  );

  const cautions: string[] = [];
  if (profile.verificationStatus !== "verified") cautions.push("需再次确认学校官方招生简章。");
  if (!hardGatePassed) cautions.push("当前条件可能未过记录中的硬门槛，需要先补强。");
  if (profile.topikMinimum && applicant.topikLevel < profile.topikMinimum) cautions.push("TOPIK等级低于当前记录的参考门槛。");
  if (academicReadiness.adjustedGap < -18) cautions.push("当前高中成绩与该校竞争区间差距较大，不建议作为现阶段主申。");
  if (profile.portfolioOrPracticalRequired === "major_specific") cautions.push("艺术、设计、表演等专业可能需要作品集、面试或实技。");
  if (profile.interviewRequired === "required") cautions.push("该校记录显示面试是重要环节。");
  if (profile.competitiveNotes.length) cautions.push(profile.competitiveNotes[0]);

  const gateText = profile.academicGatePercent
    ? `成绩参考硬门槛：${profile.academicGatePercent}%不是录取保证`
    : "硬门槛需按最新简章确认";

  return {
    schoolSlug: university.slug,
    schoolNameCn: university.nameCn,
    city: university.city,
    schoolType: university.type,
    score,
    fitPriority: fit,
    academicGap: academicReadiness.adjustedGap,
    category: categorize(score, profile.verificationStatus, hardGatePassed, fit),
    verificationStatus: profile.verificationStatus,
    hardGatePassed,
    reasons: [
      `${university.city} / ${university.type}`,
      `专业方向匹配：${university.focus}`,
      profile.topikMinimum ? `当前记录参考TOPIK ${profile.topikMinimum}级以上` : "语言门槛需按最新简章确认",
      profile.tuitionPerSemesterKrw ? `学费参考：${profile.tuitionPerSemesterKrw}/学期` : "学费需按最新简章确认",
      gateText
    ],
    cautions: cautions.length ? cautions : ["请以学校最新招生简章为准。"]
  };
}

export function recommendUniversities(applicant: ApplicantProfile): UniversityRecommendation[] {
  const sortedResults = admissionProfiles
    .map((profile) => scoreUniversityRecommendation(applicant, profile.schoolSlug))
    .filter((result): result is UniversityRecommendation => Boolean(result))
    .filter((result) => {
      if (applicant.schoolTypePreference !== "national") return true;
      return result.schoolType.includes("国立") || result.schoolType.includes("公立");
    })
    .filter((result) => {
      if (applicant.schoolTypePreference !== "private") return true;
      return result.schoolType.includes("私立");
    })
    .filter((result) => {
      if (applicant.budgetLevel !== "low") return true;
      return result.schoolType.includes("国立") || result.schoolType.includes("公立");
    })
    .filter((result) => matchesPreferredRegion(result.city, applicant.preferredRegion))
    .sort((a, b) => {
      const fitCompare = a.fitPriority - b.fitPriority;
      if (fitCompare !== 0) return fitCompare;
      if (a.fitPriority === 2) return b.academicGap - a.academicGap || b.score - a.score;
      return b.score - a.score;
    });

  return buildBalancedSlate(sortedResults).sort(compareRecommendationsByEase);
}

function buildBalancedSlate(results: UniversityRecommendation[]): UniversityRecommendation[] {
  const selected: UniversityRecommendation[] = [];
  const used = new Set<string>();
  const isUnused = (result: UniversityRecommendation) => !used.has(result.schoolSlug);
  const isConfirmedEnough = (result: UniversityRecommendation) => result.verificationStatus !== "pending";
  const pickFirst = (predicate: (result: UniversityRecommendation) => boolean) => results.find((result) => isUnused(result) && predicate(result));
  const pickLast = (predicate: (result: UniversityRecommendation) => boolean) =>
    [...results].reverse().find((result) => isUnused(result) && predicate(result));

  function pickForSlot(category: RecommendationCategory): UniversityRecommendation | undefined {
    if (category === "stable") return pickFirst((result) => result.category === "stable" && isConfirmedEnough(result)) ?? pickFirst(isConfirmedEnough);
    if (category === "match")
      return (
        pickFirst((result) => result.category === "match" && isConfirmedEnough(result)) ??
        pickFirst((result) => result.category === "stable" && isConfirmedEnough(result)) ??
        pickFirst(isConfirmedEnough)
      );
    if (category === "reach")
      return (
        pickFirst((result) => result.category === "reach" && isConfirmedEnough(result)) ??
        pickFirst((result) => result.fitPriority === 1 && isConfirmedEnough(result)) ??
        pickFirst(isConfirmedEnough)
      );
    if (category === "prepare_first")
      return (
        pickFirst((result) => result.category === "prepare_first" && isConfirmedEnough(result)) ??
        pickLast((result) => result.fitPriority > 0 && isConfirmedEnough(result)) ??
        pickLast(isConfirmedEnough)
      );
    return pickFirst(isConfirmedEnough);
  }

  recommendationSlatePlan.forEach((category) => {
    const result = pickForSlot(category) ?? pickFirst(() => true);
    if (!result) return;
    used.add(result.schoolSlug);
    selected.push({ ...result, category });
  });

  return selected;
}
