# Admissions Recommendation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first trustworthy undergraduate school recommendation system for Chinese high school graduates applying to Korean universities.

**Architecture:** Keep admissions facts in a dedicated data module, keep scoring in a pure recommendation engine, then render a compact homepage recommender that never claims admission guarantees. The first implementation covers all 50 existing schools structurally, with verified or partial admission facts for the first research batch and pending status for schools not yet confirmed.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, existing static HTML generator.

---

## File Structure

- Create `src/data/admissions.ts`: typed admissions profile data keyed by `university.slug`.
- Create `src/data/admissions.test.ts`: data integrity tests for source metadata, first-batch coverage, and pending handling.
- Create `src/data/recommendations.ts`: pure scoring and classification functions.
- Create `src/data/recommendations.test.ts`: deterministic scoring tests.
- Create `src/components/AdmissionsRecommender.tsx`: client-side form and result display.
- Create `src/components/AdmissionsRecommender.test.tsx`: interaction smoke tests.
- Modify `src/app/page.tsx`: insert the recommender into the current middle blank area before the large entry index.
- Modify `scripts/generate-static-pages.mjs`: ensure the standalone homepage gets the same recommender markup or a static equivalent.

## Task 1: Admissions Data Model

**Files:**
- Create: `src/data/admissions.ts`
- Test: `src/data/admissions.test.ts`

- [ ] **Step 1: Write the failing data model test**

```ts
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
      verificationStatus: "verified"
    });

    expect(getAdmissionProfile("hongik-university")).toMatchObject({
      interviewRequired: "required",
      portfolioOrPracticalRequired: "major_specific"
    });

    expect(getAdmissionProfile("jeju-national-university")?.verificationStatus).toBe("pending");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm.cmd test -- src/data/admissions.test.ts`

Expected: FAIL because `src/data/admissions.ts` does not exist.

- [ ] **Step 3: Create the admissions data module**

Create `src/data/admissions.ts` with the following structure:

```ts
import { universities } from "./universities";
import type { SourceType } from "./home";

export type VerificationStatus = "verified" | "partial" | "pending";
export type RequirementState = "required" | "optional" | "not_required" | "major_specific" | "unknown";

export type AdmissionProfile = {
  schoolSlug: string;
  schoolNameCn: string;
  sourceUrl?: string;
  sourceType: SourceType;
  guideYear?: string;
  admissionTrackName: string;
  applicantScope: string;
  nationalityRule: string;
  educationRule: string;
  topikMinimum?: number;
  topikAlternatives: string[];
  englishTrackAvailable: RequirementState;
  englishScoreRequirement?: string;
  academicReview: string;
  standardizedTests: string;
  interviewRequired: RequirementState;
  portfolioOrPracticalRequired: RequirementState;
  conditionalAdmission: RequirementState;
  financialProof: RequirementState;
  majorExceptions: string[];
  verificationStatus: VerificationStatus;
  updatedAt: string;
  notes: string;
};

const researchedProfiles: AdmissionProfile[] = [
  {
    schoolSlug: "seoul-national-university",
    schoolNameCn: "首尔大学",
    sourceUrl: "https://en.snu.ac.kr/admission/overview/faq/admission",
    sourceType: "official",
    guideYear: "2026",
    admissionTrackName: "International Admissions I / II",
    applicantScope: "Undergraduate freshman international applicants",
    nationalityRule: "International Admissions I generally requires applicant and parents to be non-Korean citizens.",
    educationRule: "High school graduate or equivalent; International Admissions II focuses on full primary and secondary education outside Korea.",
    topikMinimum: 3,
    topikAlternatives: ["TOEFL iBT 80", "IELTS 6.0", "TEPS 551", "SNU Korean Language Center Level 4"],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "TOEFL iBT 80 / IELTS 6.0 / TEPS 551 can satisfy language proof where accepted.",
    academicReview: "GPA, study plan, personal statement, recommendation letters, activities, and other achievement records are reviewed holistically.",
    standardizedTests: "SAT, AP, IB, ACT and other academic indicators may be submitted as supplementary materials.",
    interviewRequired: "major_specific",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    majorExceptions: ["College or department policy may require interviews or examinations.", "Most courses may require Korean study after admission."],
    verificationStatus: "verified",
    updatedAt: "2026-05",
    notes: "Does not accept international transfer students; freshman route only."
  },
  {
    schoolSlug: "korea-university",
    schoolNameCn: "高丽大学",
    sourceUrl: "https://oia.korea.ac.kr/oia/under/admission.do",
    sourceType: "official",
    guideYear: "2026 Fall / 2027 Spring",
    admissionTrackName: "Undergraduate International Admission",
    applicantScope: "Freshman international undergraduate applicants",
    nationalityRule: "International student route administered by Korea University OIA; detailed eligibility is in the application guide.",
    educationRule: "Freshman applicants apply to listed colleges and majors; high school documents are required in the guide.",
    topikMinimum: undefined,
    topikAlternatives: [],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "International Studies major requires English language qualification.",
    academicReview: "Application guide and uploaded documents are used for admission review.",
    standardizedTests: "Check the current application guide for accepted supplementary academic records.",
    interviewRequired: "unknown",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "required",
    majorExceptions: ["College of Education has a quota note.", "Global Open Major has separate language and major assignment rules."],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Official page confirms current application calendar and guide location; detailed language minimum needs guide extraction."
  },
  {
    schoolSlug: "sungkyunkwan-university",
    schoolNameCn: "成均馆大学",
    sourceUrl: "https://enc.skku.edu/eng_icon/undergraduate.do",
    sourceType: "school",
    guideYear: "2026",
    admissionTrackName: "Undergraduate International Student Admission",
    applicantScope: "Freshman international applicants",
    nationalityRule: "Applicant and both parents must be foreign nationals; dual Korean nationality is not accepted.",
    educationRule: "High school graduate or expected graduate; GED, home schooling, cyber schooling, or equivalency certificates may not be accepted in current guide.",
    topikMinimum: undefined,
    topikAlternatives: ["TOPIK", "Korean language institute completion", "King Sejong Institute completion"],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "TOEFL or IELTS may be used depending on major.",
    academicReview: "Document screening is central; language and academic materials are reviewed.",
    standardizedTests: "SAT, ACT, AP, A-Level, IB, and similar records can be academic references.",
    interviewRequired: "major_specific",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "required",
    financialProof: "unknown",
    majorExceptions: ["Some applicants without Korean language documents may apply as preliminary admission candidates.", "Some departments require additional evaluation."],
    verificationStatus: "verified",
    updatedAt: "2026-05",
    notes: "Language requirement varies by track and major."
  },
  {
    schoolSlug: "hanyang-university",
    schoolNameCn: "汉阳大学",
    sourceUrl: "https://oia.hanyang.ac.kr/admission",
    sourceType: "official",
    guideYear: "2026",
    admissionTrackName: "Regular Admission for International Students",
    applicantScope: "International undergraduate applicants",
    nationalityRule: "Detailed nationality rule must be checked in the downloaded admission guide.",
    educationRule: "Detailed education rule must be checked in the downloaded admission guide.",
    topikMinimum: undefined,
    topikAlternatives: [],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: undefined,
    academicReview: "Admission guide is published by the Office of International Affairs.",
    standardizedTests: "Check current admission guide.",
    interviewRequired: "unknown",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    majorExceptions: ["Some admitted students may be connected to Korean language training if conditions are not met."],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Official OIA page is confirmed; guide extraction needed before strong recommendation."
  },
  {
    schoolSlug: "kyung-hee-university",
    schoolNameCn: "庆熙大学",
    sourceUrl: "https://iadmission.khu.ac.kr/upload/contents/202508/202508111036057550.pdf",
    sourceType: "official",
    guideYear: "2026 Spring",
    admissionTrackName: "International Undergraduate Admission",
    applicantScope: "International undergraduate applicants",
    nationalityRule: "Check the full current guide for exact nationality conditions.",
    educationRule: "Check the full current guide for exact education conditions.",
    topikMinimum: 3,
    topikAlternatives: ["KIIP level 3 or higher", "Korean language course for at least 18 months in listed cases"],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: undefined,
    academicReview: "Application guide and scholarship notes confirm language-linked admission management.",
    standardizedTests: "Check current admission guide.",
    interviewRequired: "unknown",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "major_specific",
    financialProof: "unknown",
    majorExceptions: ["Language and scholarship rules vary by campus, track, and department."],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "TOPIK 3 appears in official material, but full admission guide extraction is still needed."
  },
  {
    schoolSlug: "chung-ang-university",
    schoolNameCn: "中央大学",
    sourceUrl: "https://oia.cau.ac.kr/bbs/board.php?category=&findType=&findWord=&mobile_flag=&mode=VIEW&num=26&page=1&sort1=&sort2=&tbl=bbs65",
    sourceType: "official",
    guideYear: "2026 Spring",
    admissionTrackName: "Undergraduate Admission for International Students",
    applicantScope: "International undergraduate applicants",
    nationalityRule: "Check current guide for exact nationality conditions.",
    educationRule: "Check current guide for exact education conditions.",
    topikMinimum: 4,
    topikAlternatives: ["Official English test scores for eligible English route applicants"],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "TOEFL iBT 60 or IELTS 5.5 is referenced for English proficiency in official schedule notice.",
    academicReview: "Official admission notice references communication skills, language records, and academic materials.",
    standardizedTests: "Check current admission guide.",
    interviewRequired: "unknown",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    majorExceptions: ["English waiver may apply to high school programs entirely conducted in English in eligible countries."],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Official notice confirms language thresholds; full guide extraction needed for all departments."
  },
  {
    schoolSlug: "hongik-university",
    schoolNameCn: "弘益大学",
    sourceUrl: "https://gradedu.hongik.ac.kr/en/admissions/admissions-guide.do",
    sourceType: "official",
    guideYear: "Current page",
    admissionTrackName: "Admissions Guide for International Students",
    applicantScope: "Undergraduate international applicants",
    nationalityRule: "Applicant and parents must have obtained foreign citizenship before the applicant enters high school.",
    educationRule: "Undergraduate applicants follow the international student admission process.",
    topikMinimum: 4,
    topikAlternatives: ["Hongik International Institute of Language Level 4 completion"],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: undefined,
    academicReview: "Humanities and sciences use document review plus interview; fine arts weigh interview more heavily.",
    standardizedTests: "Check current admission guide.",
    interviewRequired: "required",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    majorExceptions: ["Humanities/sciences: document review 80 and interview 20.", "Fine arts excluding theory: document review 60 and interview 40."],
    verificationStatus: "verified",
    updatedAt: "2026-05",
    notes: "Strong art/design fit, but portfolio/interview burden must be surfaced."
  },
  {
    schoolSlug: "pusan-national-university",
    schoolNameCn: "釜山大学",
    sourceUrl: "https://international.pusan.ac.kr/international/15256/subview.do",
    sourceType: "official",
    guideYear: "2026 Fall",
    admissionTrackName: "Undergraduate Program Admissions for International Students",
    applicantScope: "Freshman and transfer international applicants",
    nationalityRule: "Applicant and parents must be foreign nationals; dual Korean nationality is not eligible unless nationality loss is completed before deadline.",
    educationRule: "Freshman applicants need high school completion or expected completion.",
    topikMinimum: 3,
    topikAlternatives: ["PNU Language Education Institute Level 3 completion", "Department-specific English test routes for some programs"],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "Some programs reference TOEFL iBT 80, IELTS 5.5, or New TEPS 326.",
    academicReview: "Official international admissions page and guide define document review and language proof requirements.",
    standardizedTests: "Check current admission guide.",
    interviewRequired: "major_specific",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    majorExceptions: ["Information and Computer Engineering has specific English/TOPIK combinations.", "Dance requires a performance video in current guide snippet."],
    verificationStatus: "verified",
    updatedAt: "2026-05",
    notes: "Good national university option outside Seoul; department exceptions matter."
  },
  {
    schoolSlug: "seoultech",
    schoolNameCn: "首尔科学技术大学",
    sourceUrl: "https://en.seoultech.ac.kr/adm",
    sourceType: "official",
    guideYear: "Current admissions page",
    admissionTrackName: "Admissions Guidelines for International Students",
    applicantScope: "International undergraduate applicants",
    nationalityRule: "Check international admission guide for exact nationality conditions.",
    educationRule: "Check international admission guide for exact education conditions.",
    topikMinimum: 4,
    topikAlternatives: ["TOEFL iBT 80 for MSDE or ITM scholarship route"],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "TOEFL iBT 80 or above appears in scholarship criteria for MSDE/ITM applicants.",
    academicReview: "Admission guide and scholarship page reference document review and interview.",
    standardizedTests: "Check current admission guide.",
    interviewRequired: "major_specific",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    majorExceptions: ["International College and global programs should be checked separately."],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Official page confirms international admission guide location; detailed guide extraction needed."
  },
  {
    schoolSlug: "yonsei-university",
    schoolNameCn: "延世大学",
    sourceUrl: "https://admission.yonsei.ac.kr/seoul/admission/html/international/about_yonsei.asp",
    sourceType: "official",
    guideYear: "Current admissions page",
    admissionTrackName: "International Student Admissions",
    applicantScope: "International undergraduate applicants",
    nationalityRule: "Check current guide for exact nationality conditions.",
    educationRule: "Current Q&A states GED, home schooling, distance learning, or equivalent certificates may not be recognized for international student admission.",
    topikMinimum: undefined,
    topikAlternatives: [],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "UIC English-taught programs are handled separately by Underwood International College.",
    academicReview: "Holistic review based on academic achievement, rigor of curriculum, and preparation for study.",
    standardizedTests: "Standardized scores are not always mandatory but may be used as reference if submitted.",
    interviewRequired: "unknown",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    majorExceptions: ["Korean-taught degree admissions and UIC English-taught admissions are separate contact paths."],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Needs current guide extraction before strict threshold scoring."
  }
];

function createPendingProfile(schoolSlug: string, schoolNameCn: string): AdmissionProfile {
  return {
    schoolSlug,
    schoolNameCn,
    sourceType: "pending",
    admissionTrackName: "International undergraduate freshman admission",
    applicantScope: "Chinese high school graduate or expected graduate",
    nationalityRule: "Pending official verification.",
    educationRule: "Pending official verification.",
    topikAlternatives: [],
    englishTrackAvailable: "unknown",
    academicReview: "Pending official verification.",
    standardizedTests: "Pending official verification.",
    interviewRequired: "unknown",
    portfolioOrPracticalRequired: "unknown",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    majorExceptions: [],
    verificationStatus: "pending",
    updatedAt: "2026-05",
    notes: "Official admission guide has not yet been captured in the local dataset."
  };
}

const researchedBySlug = new Map(researchedProfiles.map((profile) => [profile.schoolSlug, profile]));

export const admissionProfiles: AdmissionProfile[] = universities.map((university) => {
  return researchedBySlug.get(university.slug) ?? createPendingProfile(university.slug, university.nameCn);
});

export function getAdmissionProfile(schoolSlug: string): AdmissionProfile | undefined {
  return admissionProfiles.find((profile) => profile.schoolSlug === schoolSlug);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm.cmd test -- src/data/admissions.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/admissions.ts src/data/admissions.test.ts
git commit -m "feat: add admissions profile data model"
```

## Task 2: Recommendation Engine

**Files:**
- Create: `src/data/recommendations.ts`
- Test: `src/data/recommendations.test.ts`

- [ ] **Step 1: Write the failing recommendation tests**

```ts
import { recommendUniversities, type ApplicantProfile } from "./recommendations";

const strongItApplicant: ApplicantProfile = {
  age: 18,
  academicLevel: "strong",
  topikLevel: 4,
  intendedMajor: "computer-science",
  preferredRegion: "首尔",
  budgetLevel: "medium",
  schoolTypePreference: "any",
  languageTrack: "korean"
};

describe("recommendUniversities", () => {
  it("returns five recommendations with scores and safety labels", () => {
    const results = recommendUniversities(strongItApplicant);

    expect(results).toHaveLength(5);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    expect(results[0].reasons.length).toBeGreaterThan(0);
    expect(results[0].cautions.length).toBeGreaterThan(0);
    expect(results[0].category).toMatch(/^(stable|match|reach|prepare_first|verify)$/);
  });

  it("penalizes pending admission data instead of presenting it as verified", () => {
    const results = recommendUniversities({
      ...strongItApplicant,
      intendedMajor: "tourism",
      preferredRegion: "济州"
    });

    const pendingResult = results.find((result) => result.verificationStatus === "pending");
    expect(pendingResult?.category).toBe("verify");
    expect(pendingResult?.cautions.join(" ")).toContain("官方");
  });

  it("flags art recommendations when portfolio or interview burden is likely", () => {
    const results = recommendUniversities({
      ...strongItApplicant,
      intendedMajor: "art-design",
      preferredRegion: "首尔"
    });

    const hongik = results.find((result) => result.schoolSlug === "hongik-university");
    expect(hongik?.cautions.join(" ")).toContain("作品集");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm.cmd test -- src/data/recommendations.test.ts`

Expected: FAIL because `src/data/recommendations.ts` does not exist.

- [ ] **Step 3: Create the scoring engine**

Create `src/data/recommendations.ts`:

```ts
import { admissionProfiles, type VerificationStatus } from "./admissions";
import { universities } from "./universities";

export type AcademicLevel = "excellent" | "strong" | "average" | "needs_support";
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
  academicLevel: AcademicLevel;
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
  score: number;
  category: RecommendationCategory;
  verificationStatus: VerificationStatus;
  reasons: string[];
  cautions: string[];
};

const majorKeywords: Record<IntendedMajor, string[]> = {
  business: ["经营", "商", "经济", "贸易"],
  "computer-science": ["IT", "AI", "计算机", "软件", "数据"],
  engineering: ["工科", "工程", "电子", "机械", "半导体", "航空"],
  media: ["传媒", "电影", "影像", "广告", "内容"],
  "art-design": ["艺术", "设计", "美术", "动画", "建筑"],
  "korean-language": ["韩语", "韩国语", "人文", "教育"],
  tourism: ["旅游", "酒店"],
  humanities: ["人文", "外语", "国际", "教育"],
  science: ["自然", "科学", "生命", "医学"],
  undecided: []
};

const academicTargets: Record<string, AcademicLevel> = {
  "seoul-national-university": "excellent",
  "yonsei-university": "excellent",
  "korea-university": "excellent",
  "sungkyunkwan-university": "strong",
  "hanyang-university": "strong",
  "kyung-hee-university": "strong",
  "chung-ang-university": "strong",
  "hongik-university": "strong"
};

const academicRank: Record<AcademicLevel, number> = {
  needs_support: 1,
  average: 2,
  strong: 3,
  excellent: 4
};

function scoreMajor(focus: string, intendedMajor: IntendedMajor): number {
  if (intendedMajor === "undecided") return 18;
  const keywords = majorKeywords[intendedMajor];
  const matches = keywords.filter((keyword) => focus.includes(keyword)).length;
  return Math.min(30, matches * 12);
}

function scoreLanguage(topikLevel: number, minimum?: number): number {
  if (!minimum) return topikLevel >= 3 ? 14 : 8;
  if (topikLevel >= minimum + 1) return 20;
  if (topikLevel >= minimum) return 17;
  if (topikLevel + 1 === minimum) return 10;
  return 4;
}

function scoreAcademic(applicant: AcademicLevel, schoolSlug: string): number {
  const target = academicTargets[schoolSlug] ?? "average";
  const gap = academicRank[applicant] - academicRank[target];
  if (gap >= 1) return 20;
  if (gap === 0) return 16;
  if (gap === -1) return 10;
  return 5;
}

function scoreBudget(type: string, budgetLevel: BudgetLevel): number {
  if (budgetLevel === "high") return 10;
  if (type.includes("国立") || type.includes("公立")) return 10;
  return budgetLevel === "medium" ? 7 : 3;
}

function scoreRegion(city: string, preferredRegion: string): number {
  if (!preferredRegion || preferredRegion === "不限") return 8;
  return city.includes(preferredRegion) ? 10 : 3;
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
  return 0;
}

function categorize(score: number, status: VerificationStatus, languageScore: number): RecommendationCategory {
  if (status === "pending") return "verify";
  if (languageScore < 10) return "prepare_first";
  if (score >= 82) return "stable";
  if (score >= 68) return "match";
  return "reach";
}

export function recommendUniversities(applicant: ApplicantProfile): UniversityRecommendation[] {
  const bySlug = new Map(universities.map((university) => [university.slug, university]));

  return admissionProfiles
    .map((profile) => {
      const university = bySlug.get(profile.schoolSlug);
      if (!university) return undefined;

      const majorScore = scoreMajor(university.focus, applicant.intendedMajor);
      const languageScore = scoreLanguage(applicant.topikLevel, profile.topikMinimum);
      const academicScore = scoreAcademic(applicant.academicLevel, university.slug);
      const score =
        majorScore +
        languageScore +
        academicScore +
        scoreBudget(university.type, applicant.budgetLevel) +
        scoreRegion(university.city, applicant.preferredRegion) +
        scoreSchoolType(university.type, applicant.schoolTypePreference) +
        scoreReliability(profile.verificationStatus);

      const cautions: string[] = [];
      if (profile.verificationStatus !== "verified") cautions.push("需再次确认学校官方招生简章。");
      if (profile.topikMinimum && applicant.topikLevel < profile.topikMinimum) cautions.push("TOPIK等级低于当前记录的参考门槛。");
      if (profile.portfolioOrPracticalRequired === "major_specific") cautions.push("艺术、设计、表演等专业可能需要作品集、面试或实技。");
      if (profile.interviewRequired === "required") cautions.push("该校记录显示面试是重要环节。");

      return {
        schoolSlug: university.slug,
        schoolNameCn: university.nameCn,
        city: university.city,
        score,
        category: categorize(score, profile.verificationStatus, languageScore),
        verificationStatus: profile.verificationStatus,
        reasons: [
          `${university.city} / ${university.type}`,
          `专业方向匹配：${university.focus}`,
          profile.topikMinimum ? `当前记录参考TOPIK ${profile.topikMinimum}级以上` : "语言门槛需按最新简章确认"
        ],
        cautions: cautions.length ? cautions : ["请以学校最新招生简章为准。"]
      };
    })
    .filter((result): result is UniversityRecommendation => Boolean(result))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
```

- [ ] **Step 4: Run the recommendation tests**

Run: `npm.cmd test -- src/data/recommendations.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/recommendations.ts src/data/recommendations.test.ts
git commit -m "feat: add university recommendation scoring"
```

## Task 3: Homepage Recommender Component

**Files:**
- Create: `src/components/AdmissionsRecommender.tsx`
- Test: `src/components/AdmissionsRecommender.test.tsx`

- [ ] **Step 1: Write the failing component test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AdmissionsRecommender } from "./AdmissionsRecommender";

describe("AdmissionsRecommender", () => {
  it("collects applicant inputs and renders five school recommendations", async () => {
    const user = userEvent.setup();
    render(<AdmissionsRecommender />);

    await user.selectOptions(screen.getByLabelText("希望专业"), "computer-science");
    await user.selectOptions(screen.getByLabelText("TOPIK等级"), "4");
    await user.click(screen.getByRole("button", { name: "生成5所推荐大学" }));

    expect(screen.getByText("初步推荐结果")).toBeInTheDocument();
    expect(screen.getAllByTestId("recommendation-result")).toHaveLength(5);
    expect(screen.getByText(/不代表录取保证/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm.cmd test -- src/components/AdmissionsRecommender.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Create the client component**

Create `src/components/AdmissionsRecommender.tsx`:

```tsx
"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { recommendUniversities, type AcademicLevel, type ApplicantProfile, type BudgetLevel, type IntendedMajor } from "@/data/recommendations";

const defaultApplicant: ApplicantProfile = {
  age: 18,
  academicLevel: "strong",
  topikLevel: 3,
  intendedMajor: "undecided",
  preferredRegion: "不限",
  budgetLevel: "medium",
  schoolTypePreference: "any",
  languageTrack: "korean"
};

export function AdmissionsRecommender() {
  const [applicant, setApplicant] = useState<ApplicantProfile>(defaultApplicant);
  const [submitted, setSubmitted] = useState(false);
  const results = useMemo(() => recommendUniversities(applicant), [applicant]);

  return (
    <section className="border-y border-ink bg-paper px-4 py-8 sm:px-6 lg:px-8" aria-label="韩国大学推荐">
      <div className="mx-auto grid max-w-[92rem] gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="mb-3 text-sm font-bold text-muted">AI选校入口</p>
          <h1 className="max-w-[13ch] text-4xl font-black leading-none tracking-normal text-ink sm:text-5xl">
            输入条件，先筛5所可考虑大学
          </h1>
          <p className="mt-4 max-w-[56ch] text-base leading-7 text-muted">
            根据高中成绩、TOPIK、专业、地区和预算做初步筛选。结果只用于选校参考，不代替学校官方招生简章。
          </p>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-bold">
              高中成绩
              <select
                className="border border-ink bg-paper px-3 py-2"
                value={applicant.academicLevel}
                onChange={(event) => setApplicant({ ...applicant, academicLevel: event.target.value as AcademicLevel })}
              >
                <option value="excellent">非常优秀</option>
                <option value="strong">较好</option>
                <option value="average">普通</option>
                <option value="needs_support">需要补强</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-bold">
              TOPIK等级
              <select
                className="border border-ink bg-paper px-3 py-2"
                value={applicant.topikLevel}
                onChange={(event) => setApplicant({ ...applicant, topikLevel: Number(event.target.value) })}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((level) => (
                  <option value={level} key={level}>
                    {level === 0 ? "暂无" : `${level}级`}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm font-bold">
              希望专业
              <select
                className="border border-ink bg-paper px-3 py-2"
                value={applicant.intendedMajor}
                onChange={(event) => setApplicant({ ...applicant, intendedMajor: event.target.value as IntendedMajor })}
              >
                <option value="undecided">还没确定</option>
                <option value="business">经营/商科</option>
                <option value="computer-science">计算机/AI</option>
                <option value="engineering">工科</option>
                <option value="media">传媒/影视</option>
                <option value="art-design">艺术/设计</option>
                <option value="tourism">酒店/旅游</option>
                <option value="humanities">人文/外语</option>
                <option value="science">自然科学/生命</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-bold">
              预算
              <select
                className="border border-ink bg-paper px-3 py-2"
                value={applicant.budgetLevel}
                onChange={(event) => setApplicant({ ...applicant, budgetLevel: event.target.value as BudgetLevel })}
              >
                <option value="low">尽量低</option>
                <option value="medium">中等</option>
                <option value="high">较充足</option>
              </select>
            </label>
          </div>

          <button
            className="inline-flex w-fit items-center gap-2 rounded-full border border-ink bg-yellow px-5 py-3 text-sm font-black"
            type="button"
            onClick={() => setSubmitted(true)}
          >
            <Search size={16} aria-hidden="true" />
            生成5所推荐大学
          </button>

          {submitted ? (
            <div className="grid gap-3">
              <h2 className="text-xl font-black">初步推荐结果</h2>
              {results.map((result) => (
                <article className="border border-ink bg-surface p-4" data-testid="recommendation-result" key={result.schoolSlug}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black">{result.schoolNameCn}</h3>
                      <p className="text-sm text-muted">{result.city} · {result.category} · {result.score}分</p>
                    </div>
                    <span className="rounded-full border border-ink px-2 py-1 text-xs font-bold">{result.verificationStatus}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6">{result.reasons.join(" / ")}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{result.cautions.join(" ")}</p>
                </article>
              ))}
              <p className="text-xs leading-5 text-muted">
                推荐结果仅用于初步选校，不代表录取保证。请以学校最新招生简章为准。
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the component test**

Run: `npm.cmd test -- src/components/AdmissionsRecommender.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/AdmissionsRecommender.tsx src/components/AdmissionsRecommender.test.tsx
git commit -m "feat: add admissions recommender component"
```

## Task 4: Homepage Integration

**Files:**
- Modify: `src/app/page.tsx`
- Test: `src/data/home.test.ts`

- [ ] **Step 1: Write a failing homepage route test by adding a home entry assertion**

Add this assertion to `src/data/home.test.ts` in the homepage entry test:

```ts
expect(homeEntries.some((entry) => entry.title === "韩国大学库")).toBe(true);
```

This step mainly keeps the homepage data test active while integrating the component. Existing tests should still pass after the page import.

- [ ] **Step 2: Modify the homepage**

Update `src/app/page.tsx`:

```tsx
import { ArrowRight } from "lucide-react";

import { AdmissionsRecommender } from "@/components/AdmissionsRecommender";
import { HomeEntryCard } from "@/components/HomeEntryCard";
import { SiteHeader } from "@/components/SiteHeader";
import { homeEntries } from "@/data/home";

const copy = {
  brand: "\u97e9\u5b66\u7f57\u76d8",
  footerRule: "\u5b98\u65b9\u4f18\u5148",
  footerRuleEnd: "\u7ecf\u9a8c\u53c2\u8003\u5206\u79bb"
};

export default function Home() {
  return (
    <main id="top" className="flex min-h-screen flex-col bg-paper text-ink">
      <SiteHeader />

      <AdmissionsRecommender />

      <section id="entries" aria-label="\u4fe1\u606f\u5165\u53e3" className="shrink-0 scroll-mt-40 bg-paper">
        <div className="border-t border-ink">
          {homeEntries.map((entry) => (
            <HomeEntryCard entry={entry} key={entry.title} />
          ))}
        </div>
      </section>

      <footer className="shrink-0 border-t border-ink bg-paper px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[92rem] flex-col gap-3 text-sm text-ink sm:flex-row sm:items-center sm:justify-between">
          <span>
            {copy.brand} {"\u00a9"} 2026
          </span>
          <span className="inline-flex items-center gap-2">
            {copy.footerRule}
            <ArrowRight size={14} aria-hidden="true" />
            {copy.footerRuleEnd}
          </span>
        </div>
      </footer>
    </main>
  );
}
```

- [ ] **Step 3: Run unit tests**

Run: `npm.cmd test`

Expected: PASS.

- [ ] **Step 4: Run lint**

Run: `npm.cmd run lint`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/data/home.test.ts
git commit -m "feat: place admissions recommender on homepage"
```

## Task 5: Static Homepage Generator

**Files:**
- Modify: `scripts/generate-static-pages.mjs`
- Verify: `hanxue-luopan-home.html`

- [ ] **Step 1: Add static recommender markup to the generator**

In `scripts/generate-static-pages.mjs`, add a static middle section with the same copy and a non-interactive explanation if the generator does not hydrate React. Use normal UTF-8 Chinese copy and keep the safety disclaimer visible.

- [ ] **Step 2: Generate static pages**

Run: `node scripts/generate-static-pages.mjs`

Expected: `hanxue-luopan-home.html` updates and contains `AI选校入口`.

- [ ] **Step 3: Verify generated file text**

Run: `Select-String -LiteralPath 'hanxue-luopan-home.html' -Pattern 'AI选校入口','不代表录取保证'`

Expected: Both strings are found.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-static-pages.mjs hanxue-luopan-home.html
git commit -m "feat: add static admissions recommender section"
```

## Final Verification

- [ ] Run `npm.cmd test`
- [ ] Run `npm.cmd run lint`
- [ ] Run `npm.cmd run build`
- [ ] Open the local page and confirm the middle area is now an information-first recommender, not a flashy hero.

## Self-Review

Spec coverage:
- Target applicant is covered by `ApplicantProfile`.
- Official-source discipline is covered by `AdmissionProfile.verificationStatus`.
- Deterministic scoring before AI-style explanation is covered by `recommendUniversities`.
- Safety copy is rendered by `AdmissionsRecommender`.
- The first research batch is included in `researchedProfiles`, with unverified schools downgraded to pending.

Placeholder scan:
- No implementation step asks the worker to invent missing behavior without a concrete file or command.
- Pending admissions facts are explicit data states, not plan placeholders.

Type consistency:
- `VerificationStatus`, `RequirementState`, `ApplicantProfile`, and `UniversityRecommendation` are defined before use.
