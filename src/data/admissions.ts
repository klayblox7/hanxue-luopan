import type { SourceType } from "./home";
import { universities } from "./universities";

export type VerificationStatus = "verified" | "partial" | "pending";
export type RequirementState = "required" | "optional" | "not_required" | "major_specific" | "unknown";
export type ReviewModel = "hard_gate_plus_holistic_review" | "document_review" | "document_plus_interview" | "unknown";
export type TuitionLevel = "low" | "medium" | "high" | "unknown";

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
  hardGates: string[];
  reviewModel: ReviewModel;
  topikMinimum?: number;
  topikAlternatives: string[];
  englishTrackAvailable: RequirementState;
  englishScoreRequirement?: string;
  academicReview: string;
  academicGatePercent?: number;
  recommendationTargetPercent?: number;
  standardizedTests: string;
  interviewRequired: RequirementState;
  portfolioOrPracticalRequired: RequirementState;
  conditionalAdmission: RequirementState;
  financialProof: RequirementState;
  tuitionLevel?: TuitionLevel;
  tuitionPerSemesterKrw?: string;
  tuitionNotes?: string;
  majorExceptions: string[];
  competitiveNotes: string[];
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
    nationalityRule:
      "International Admissions I generally requires applicant and parents to be non-Korean citizens.",
    educationRule:
      "High school graduate or equivalent; International Admissions II focuses on full primary and secondary education outside Korea.",
    hardGates: [
      "Applicant and parents must satisfy the non-Korean nationality route for International Admissions I.",
      "Applicant must be a high school graduate or hold equivalent education.",
      "At least one accepted Korean or English language proof is required."
    ],
    reviewModel: "hard_gate_plus_holistic_review",
    topikMinimum: 3,
    topikAlternatives: ["TOEFL iBT 80", "IELTS 6.0", "TEPS 551", "SNU Korean Language Center Level 4"],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "TOEFL iBT 80 / IELTS 6.0 / TEPS 551 can satisfy language proof where accepted.",
    academicReview:
      "GPA, study plan, personal statement, recommendation letters, activities, and other achievement records are reviewed holistically.",
    academicGatePercent: 85,
    standardizedTests:
      "SAT, AP, IB, ACT and other academic indicators may be submitted as supplementary materials.",
    interviewRequired: "major_specific",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    majorExceptions: [
      "College or department policy may require interviews or examinations.",
      "Most courses may require Korean study after admission."
    ],
    competitiveNotes: [
      "85%只能当作入场券，不能当作录取保证。",
      "人文、商科等方向通常TOPIK 5-6级会比3-4级更有竞争力。",
      "高中档次、年级排名、成绩趋势、文书、推荐信、活动和高考资料都会影响综合评审。"
    ],
    verificationStatus: "verified",
    updatedAt: "2026-05",
    notes:
      "Official source confirms holistic review and language proof. The 85% competitiveness note is kept as a heuristic requiring guide-by-guide verification."
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
    educationRule:
      "Current Q&A states GED, home schooling, distance learning, or equivalent certificates may not be recognized for international student admission.",
    hardGates: [
      "International applicant route must satisfy nationality rules in the current guide.",
      "Regular high school curriculum completion should be verified."
    ],
    reviewModel: "hard_gate_plus_holistic_review",
    topikAlternatives: [],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "UIC English-taught programs are handled separately by Underwood International College.",
    academicReview:
      "Holistic review based on academic achievement, rigor of curriculum, and preparation for study.",
    standardizedTests:
      "Standardized scores are not always mandatory but may be used as reference if submitted.",
    interviewRequired: "unknown",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    majorExceptions: ["Korean-taught degree admissions and UIC English-taught admissions are separate contact paths."],
    competitiveNotes: [
      "冲SKY层级时，语言成绩、学校档次、年级排名、文书和高考/SAT类补充材料都会影响竞争力。"
    ],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Needs current guide extraction before strict threshold scoring."
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
    hardGates: [
      "Application must follow Korea University OIA international undergraduate admission guide.",
      "High school completion and identity documents must be prepared."
    ],
    reviewModel: "hard_gate_plus_holistic_review",
    topikAlternatives: [],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "International Studies major requires English language qualification.",
    academicReview: "Application guide and uploaded documents are used for admission review.",
    standardizedTests: "Check the current application guide for accepted supplementary academic records.",
    interviewRequired: "unknown",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "required",
    majorExceptions: [
      "College of Education has a quota note.",
      "Global Open Major has separate language and major assignment rules."
    ],
    competitiveNotes: [
      "对很多申请者来说，85%+和TOPIK 4-5级申请韩国TOP5-10会比首尔大更现实，但仍要看具体学科规则。"
    ],
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
    educationRule:
      "High school graduate or expected graduate; GED, home schooling, cyber schooling, or equivalency certificates may not be accepted in current guide.",
    hardGates: [
      "Applicant and parents must be non-Korean foreign nationals.",
      "Applicant must graduate or expect to graduate from high school.",
      "At least one track language condition must be satisfied or handled through preliminary admission rules."
    ],
    reviewModel: "document_review",
    topikAlternatives: ["TOPIK", "Korean language institute completion", "King Sejong Institute completion"],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "TOEFL or IELTS may be used depending on major.",
    academicReview: "Document screening is central; language and academic materials are reviewed.",
    standardizedTests: "SAT, ACT, AP, A-Level, IB, and similar records can be academic references.",
    interviewRequired: "major_specific",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "required",
    financialProof: "unknown",
    majorExceptions: [
      "Some applicants without Korean language documents may apply as preliminary admission candidates.",
      "Some departments require additional evaluation."
    ],
    competitiveNotes: [
      "成绩扎实且TOPIK 4-5级的学生可重点考虑，但强势专业仍然需要认真准备文书和材料。"
    ],
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
    hardGates: [
      "Official OIA guide must be checked before final application.",
      "Nationality, education, and language proof need current guide confirmation."
    ],
    reviewModel: "unknown",
    topikAlternatives: [],
    englishTrackAvailable: "major_specific",
    academicReview: "Admission guide is published by the Office of International Affairs.",
    standardizedTests: "Check current admission guide.",
    interviewRequired: "unknown",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    majorExceptions: ["Some admitted students may be connected to Korean language training if conditions are not met."],
    competitiveNotes: [
      "工科方向、成绩较好且TOPIK 4-5级的学生可以考虑汉阳，但必须核对当年学科要求。"
    ],
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
    hardGates: [
      "Nationality and education conditions must be confirmed in the current guide.",
      "Language proof varies by track and campus."
    ],
    reviewModel: "unknown",
    topikMinimum: 3,
    topikAlternatives: ["KIIP level 3 or higher", "Korean language course for at least 18 months in listed cases"],
    englishTrackAvailable: "major_specific",
    academicReview: "Application guide and scholarship notes confirm language-linked admission management.",
    standardizedTests: "Check current admission guide.",
    interviewRequired: "unknown",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "major_specific",
    financialProof: "unknown",
    majorExceptions: ["Language and scholarship rules vary by campus, track, and department."],
    competitiveNotes: [
      "酒店旅游、国际学和艺术方向要特别核对校区和学科的单独要求。"
    ],
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
    hardGates: [
      "Nationality and education eligibility must be checked in the current guide.",
      "Language proof is a major screening condition."
    ],
    reviewModel: "hard_gate_plus_holistic_review",
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
    competitiveNotes: [
      "传媒、电影、表演和广告方向通常不能只看成绩，还要准备专业相关材料。"
    ],
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
    hardGates: [
      "Applicant and parents must have foreign citizenship before high school entry.",
      "Korean proficiency test or listed language institute completion can affect screening."
    ],
    reviewModel: "document_plus_interview",
    topikMinimum: 4,
    topikAlternatives: ["Hongik International Institute of Language Level 4 completion"],
    englishTrackAvailable: "major_specific",
    academicReview:
      "Humanities and sciences use document review plus interview; fine arts weigh interview more heavily.",
    standardizedTests: "Check current admission guide.",
    interviewRequired: "required",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    majorExceptions: [
      "Humanities/sciences: document review 80 and interview 20.",
      "Fine arts excluding theory: document review 60 and interview 40."
    ],
    competitiveNotes: [
      "艺术和设计申请者要把作品集和面试当成核心竞争力，而不是附加材料。"
    ],
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
    nationalityRule:
      "Applicant and parents must be foreign nationals; dual Korean nationality is not eligible unless nationality loss is completed before deadline.",
    educationRule: "Freshman applicants need high school completion or expected completion.",
    hardGates: [
      "Applicant and parents must be foreign nationals.",
      "Freshman applicant needs high school completion or expected completion.",
      "Language proof is required, with department-specific exceptions."
    ],
    reviewModel: "hard_gate_plus_holistic_review",
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
    majorExceptions: [
      "Information and Computer Engineering has specific English/TOPIK combinations.",
      "Dance requires a performance video in current guide snippet."
    ],
    competitiveNotes: [
      "釜山大学是首尔以外国立大学中的强选项，预算敏感且专业匹配的学生可以重点考虑。"
    ],
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
    hardGates: [
      "International admission guide must be checked before final application.",
      "Language, document review, and interview conditions may apply."
    ],
    reviewModel: "document_plus_interview",
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
    competitiveNotes: [
      "工程、设计和实用技术方向可把首尔科大与其他国立/公立选项一起比较。"
    ],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Official page confirms international admission guide location; detailed guide extraction needed."
  },
  {
    schoolSlug: "jeonbuk-national-university",
    schoolNameCn: "全北大学",
    sourceUrl: "https://ioffice.jbnu.ac.kr/sites/ioffice/atchmnfl/pdfView/72/temp_1775698250436100.pdf",
    sourceType: "official",
    guideYear: "2026 Fall",
    admissionTrackName: "International Undergraduate Admission",
    applicantScope: "Freshman and transfer international undergraduate applicants",
    nationalityRule: "Freshman applicants can apply through the foreign-national route or the full overseas education route; dual Korean nationals are excluded.",
    educationRule: "Freshman applicants need regular high school graduation or expected graduation; GED, home schooling, and cyber education are not recognized.",
    hardGates: [
      "Applicant must satisfy one of the listed international applicant routes.",
      "TOPIK 2 or higher, JBNU Korean test level 2 or higher, qualifying Korean language course proof, or listed English-track score is required depending on track.",
      "TOPIK 2 or JBNU Korean test level 2 entrants must complete two semesters of JBNU Korean language training immediately after admission."
    ],
    reviewModel: "document_plus_interview",
    topikMinimum: 2,
    topikAlternatives: [
      "JBNU Korean language test level 2 or higher",
      "Korean language institute course proof for specified tracks",
      "IELTS 5.5 / TOEFL iBT 71 / related English scores for English-track majors"
    ],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "IELTS 5.5, TEPS 600, New TEPS 330, or TOEFL iBT 71 for listed English-track majors.",
    academicReview: "Document review and department interview evaluate language ability, major study ability, attitude, and basic qualities.",
    recommendationTargetPercent: 68,
    standardizedTests: "High school transcript is required; no standardized test is listed as a universal requirement.",
    interviewRequired: "required",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "required",
    financialProof: "required",
    tuitionLevel: "low",
    tuitionPerSemesterKrw: "2,016,000~2,779,000 KRW",
    tuitionNotes: "2026 first-semester undergraduate tuition table in the international admission guide.",
    majorExceptions: [
      "TOPIK 2 entrants must complete two semesters of JBNU Korean language training after admission.",
      "Some departments list separate campus or language-route options.",
      "Arts applicants may have practical tests during interview."
    ],
    competitiveNotes: [
      "TOPIK 2学生可以作为现实候选，但入学后韩语压力会很大，必须规划至少两个学期的韩语补强。",
      "高中成绩偏低时，应优先准备面试、学习计划书和韩语提升证明。"
    ],
    verificationStatus: "verified",
    updatedAt: "2026-05",
    notes: "Current 2026 Fall official guide confirms TOPIK 2 route, interview evaluation, financial proof, tuition, dormitory, and post-admission Korean-study obligation."
  },
  {
    schoolSlug: "pukyong-national-university",
    schoolNameCn: "釜庆大学",
    sourceUrl: "https://admission.pknu.ac.kr/pdf/2026_Admission_Guide_for_Degree_course_3.pdf",
    sourceType: "official",
    guideYear: "2026 Fall",
    admissionTrackName: "International Undergraduate Admission",
    applicantScope: "International freshman and transfer applicants",
    nationalityRule: "Applicant route includes parents and applicant as foreign nationals, or full overseas education route.",
    educationRule: "Freshman applicants need completion or expected completion of 12 years of elementary and secondary education.",
    hardGates: [
      "Applicant must satisfy the international nationality and education route.",
      "Undergraduate Korean-track applicants generally need TOPIK 3 or higher.",
      "Some departments require TOPIK 4 or TOPIK 5."
    ],
    reviewModel: "hard_gate_plus_holistic_review",
    topikMinimum: 3,
    topikAlternatives: ["Applicant taking a designated TOPIK exam may submit the final score after application under guide rules."],
    englishTrackAvailable: "major_specific",
    academicReview: "Official guide uses application documents and language proof; department-specific exceptions apply.",
    recommendationTargetPercent: 70,
    standardizedTests: "Check the current guide for department-specific supplementary records.",
    interviewRequired: "unknown",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "major_specific",
    financialProof: "required",
    tuitionLevel: "low",
    tuitionNotes: "National university with lower tuition burden; exact department tuition needs guide-table extraction.",
    majorExceptions: [
      "Business, international trade/logistics, social welfare, fisheries life medicine, and public administration require TOPIK 4 in the 2026 guide snippet.",
      "Early childhood education requires TOPIK 5 in the 2026 guide snippet."
    ],
    competitiveNotes: [
      "TOPIK 2学生目前还差一级，适合列为补TOPIK后的现实国立候选。",
      "预算敏感且想去釜山的学生，可与全北大学、庆北大学等国立大学一起比较。"
    ],
    verificationStatus: "verified",
    updatedAt: "2026-05",
    notes: "Official 2026 guide snippets confirm TOPIK 3 baseline and higher requirements for selected departments."
  },
  {
    schoolSlug: "kyungpook-national-university",
    schoolNameCn: "庆北大学",
    sourceUrl: "https://en.knu.ac.kr/admission/foreign01_inc.htm",
    sourceType: "official",
    guideYear: "Current English admissions page",
    admissionTrackName: "Undergraduate International Admission",
    applicantScope: "Freshman and transfer international applicants",
    nationalityRule: "Applicant and parents should satisfy the international applicant route; multi-nationals are not eligible.",
    educationRule: "Freshman applicants need comparable elementary, junior high, and high school education.",
    hardGates: [
      "TOPIK 3 or higher is the general Korean proof listed on the English admissions page.",
      "Some departments require TOPIK 4 or higher.",
      "Recognized English scores can substitute in some routes."
    ],
    reviewModel: "document_plus_interview",
    topikMinimum: 3,
    topikAlternatives: [
      "Korean language institute level 3 or higher",
      "TOEFL iBT 71 / IELTS 5.5 / TEPS / TOEIC 700 or higher where accepted"
    ],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "TOEFL iBT 71 or IELTS 5.5 is listed among English proof options on the English admissions page.",
    academicReview: "Qualification screening checks academic background and language proficiency; department interview follows.",
    recommendationTargetPercent: 73,
    standardizedTests: "English or Korean proficiency test results are required documents; other standardized tests are not universal.",
    interviewRequired: "required",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "required",
    tuitionLevel: "low",
    tuitionPerSemesterKrw: "about 1,754,000~2,410,000 KRW in the English page's historical tuition table",
    tuitionNotes: "The English admissions page contains an older tuition table; current tuition should be verified before final counseling.",
    majorExceptions: [
      "Design applicants must submit a portfolio and Korean language institute proof in the English page.",
      "Mass Communication and some departments require interviews that cannot be handled by phone/internet.",
      "Business and several humanities/social departments require TOPIK 4."
    ],
    competitiveNotes: [
      "TOPIK 2学生目前不足，建议先作为TOPIK 3达成后的国立重点候选。",
      "庆北大学比首尔圈顶尖校现实，但仍需要语言达标和部门面试准备。"
    ],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Official English page is available, but visible tuition table is historical; current Korean PDF extraction is still needed."
  },
  {
    schoolSlug: "kwangwoon-university",
    schoolNameCn: "光云大学",
    sourceUrl: "https://oia.kw.ac.kr/admission/download2/202602_KWU_Admission_Guide_KR.pdf",
    sourceType: "official",
    guideYear: "2026 Fall",
    admissionTrackName: "International Undergraduate Admission",
    applicantScope: "International freshman and transfer applicants",
    nationalityRule: "Check current guide for exact nationality route.",
    educationRule: "Check current guide for exact education route.",
    hardGates: [
      "Korean-track entrants must submit TOPIK 4 before graduation according to the guide snippet.",
      "TOPIK 3 and high English scores are tied to first-semester scholarship categories."
    ],
    reviewModel: "document_review",
    topikMinimum: 3,
    topikAlternatives: ["High English proficiency scores may qualify for scholarship categories, but Korean-track graduation requires TOPIK 4."],
    englishTrackAvailable: "major_specific",
    academicReview: "Guide-based document review; exact department screening should be checked in current PDF.",
    recommendationTargetPercent: 72,
    standardizedTests: "Official language scores can affect scholarship.",
    interviewRequired: "unknown",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "major_specific",
    financialProof: "required",
    tuitionLevel: "medium",
    tuitionPerSemesterKrw: "example 4,499,000 KRW for listed humanities/social departments in 2026 guide snippet",
    tuitionNotes: "Exact tuition depends on department; current PDF includes department tuition table.",
    majorExceptions: ["Korean-track students must reach TOPIK 4 before graduation."],
    competitiveNotes: [
      "TOPIK 2学生暂时偏早，补到3级后可作为首尔圈中段私立候选。",
      "学费明显高于多数国立大学，预算中等以下要谨慎。"
    ],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Current 2026 guide snippet confirms tuition examples, TOPIK graduation requirement, and scholarship language bands."
  },
  {
    schoolSlug: "chonnam-national-university",
    schoolNameCn: "全南大学",
    sourceUrl: "https://international.jnu.ac.kr/Data/tmpfiles/download/2025/240906-ad-kr.pdf",
    sourceType: "official",
    guideYear: "2025",
    admissionTrackName: "International Undergraduate Admission",
    applicantScope: "International freshman and transfer applicants",
    nationalityRule: "Applicant and parents must hold foreign nationality before the applicant starts the equivalent of Korean high school; Korean dual nationality is not accepted.",
    educationRule: "Freshman applicants must complete or be expected to complete education equivalent to Korean elementary and secondary schooling; GED, home schooling, and cyber education are not accepted.",
    hardGates: [
      "Korean proof is TOPIK/TOPIK IBT 3 or higher, or Chonnam National University Language Education Center Korean regular course level 3 or higher.",
      "The Yeosu campus Department of Culture and Tourism Management has a lower Korean route: TOPIK 2 or CNU Korean course level 2.",
      "Applicants without TOPIK 4 or CNU Korean level 4 must complete a first-year intensive Korean program after admission, except transfer and GKS students."
    ],
    reviewModel: "hard_gate_plus_holistic_review",
    topikMinimum: 3,
    topikAlternatives: [
      "Chonnam National University Language Education Center Korean regular course level 3",
      "TOEFL iBT 80 / IELTS 5.5 / TEPS 550 / TOEIC 700",
      "TOPIK 2 or CNU Korean level 2 only for Yeosu Culture and Tourism Management"
    ],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "TOEFL iBT 80, IELTS 5.5, TEPS 550, or TOEIC 700 can be used as the language route in the guide.",
    academicReview: "The guide requires high school graduation and transcript documents; department review and document screening apply.",
    recommendationTargetPercent: 70,
    standardizedTests: "High school transcript is required; no universal standardized test is listed.",
    interviewRequired: "major_specific",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "required",
    financialProof: "required",
    tuitionLevel: "low",
    tuitionPerSemesterKrw: "1,837,000~2,436,000 KRW",
    tuitionNotes: "2025 guide table uses 2024 tuition as the reference; annual tuition review may change exact amounts.",
    majorExceptions: [
      "Yeosu Culture and Tourism Management accepts TOPIK 2 or CNU Korean level 2.",
      "Music, fine arts, and design departments require portfolio, performance audio, or other practical materials.",
      "Applicants below TOPIK 4 must plan for intensive Korean coursework after admission."
    ],
    competitiveNotes: [
      "TOPIK 2学生只有个别学科能直接作为语言线，一般学科仍应先补到TOPIK 3。",
      "预算敏感、想读光州/国立综合大学的学生可重点比较全南大学，但要看校区和学科例外。"
    ],
    verificationStatus: "verified",
    updatedAt: "2026-05",
    notes: "Official 2025 guide confirms language routes, nationality and education rules, Korean intensive program, tuition table, and art/practical exceptions."
  },
  {
    schoolSlug: "chungnam-national-university",
    schoolNameCn: "忠南大学",
    sourceUrl: "https://plus.cnu.ac.kr/html/en/sub03/sub03_0303.html",
    sourceType: "official",
    guideYear: "Current English admissions page",
    admissionTrackName: "Undergraduate Admission for International Students",
    applicantScope: "International undergraduate applicants",
    nationalityRule: "Current page lists international undergraduate admission requirements; exact nationality proof should be checked in the current Korean guide.",
    educationRule: "Freshman applicants submit high school graduation certificate and transcript.",
    hardGates: [
      "TOPIK level 3 or higher is listed as a Korean proficiency route.",
      "TOEIC 700, TOEFL iBT 71, TEPS 600, New TEPS 327, or IELTS 5.5 can be accepted as English proof.",
      "CNU Language Education Center Korean level 3 test or level 4 Korean course completion is also listed."
    ],
    reviewModel: "document_plus_interview",
    topikMinimum: 3,
    topikAlternatives: [
      "CNU Language Education Center Korean proficiency test level 3",
      "CNU Language Education Center Korean course level 4 completion",
      "TOEIC 700 / TOEFL iBT 71 / IELTS 5.5 / TEPS routes"
    ],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "TOEIC 700, TOEFL iBT 71, TEPS 600, New TEPS 327, or IELTS 5.5.",
    academicReview: "The current page says admission is determined by initial document review and interview, based on attitude, academic proficiency, aptitude, and submitted documents.",
    recommendationTargetPercent: 70,
    standardizedTests: "High school transcript is required; English proficiency can substitute for Korean language proof where accepted.",
    interviewRequired: "required",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "required",
    tuitionLevel: "low",
    tuitionNotes: "National university tuition is usually low, but the exact current department tuition table still needs guide-level verification.",
    majorExceptions: ["Departments may request additional materials after document review."],
    competitiveNotes: [
      "TOPIK 2学生目前还差一级，忠南大学适合作为补到TOPIK 3后的大田国立候选。",
      "该校有面试环节，低均分学生需要用学习计划、专业动机和语言提升证明补强。"
    ],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Official English admissions page confirms TOPIK/English routes, interview, documents, and financial proof. Exact tuition table still needs extraction."
  },
  {
    schoolSlug: "chungbuk-national-university",
    schoolNameCn: "忠北大学",
    sourceUrl: "https://oia.cbnu.ac.kr/home/sub.do?menukey=7676",
    sourceType: "official",
    guideYear: "2026 Fall",
    admissionTrackName: "Undergraduate International Admission",
    applicantScope: "International undergraduate applicants",
    nationalityRule: "Official OIA guide page publishes the 2026 Fall undergraduate international admission guides in Korean, English, Chinese, and forms.",
    educationRule: "Applicants must submit original academic and nationality documents according to the 2026 Fall guide notice.",
    hardGates: [
      "Official language proficiency certificate submission is required within the application period for programs requiring TOPIK.",
      "Applicants who submit a TOPIK exam slip must submit the final TOPIK score by the stated deadline or face disqualification.",
      "Financial proof and original academic/nationality documents must be submitted as hard copy."
    ],
    reviewModel: "document_plus_interview",
    topikMinimum: 3,
    topikAlternatives: ["Department-specific official language certificate routes in the 2026 Fall guide"],
    englishTrackAvailable: "major_specific",
    academicReview: "The 2026 Fall notice includes interview screening that may be in person or online depending on department.",
    recommendationTargetPercent: 69,
    standardizedTests: "Check the current guide for department-specific language and academic document rules.",
    interviewRequired: "major_specific",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "required",
    tuitionLevel: "low",
    tuitionNotes: "Exact current department tuition table needs guide extraction; keep as low national-university budget tier until verified.",
    majorExceptions: [
      "The School of International Studies has its own 2026 Fall application notice.",
      "TOPIK deadlines and interview mode vary by applicant group and department."
    ],
    competitiveNotes: [
      "TOPIK 2学生应先按TOPIK 3准备，等具体学科简章确认后再判断能否申请。",
      "清州国立候选适合预算敏感学生，但目前资料应标为部分确认。"
    ],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Official CBNU OIA page confirms 2026 Fall guides and notice details. Exact TOPIK minimum and tuition table still require PDF extraction by department."
  },
  {
    schoolSlug: "kangwon-national-university",
    schoolNameCn: "江原大学",
    sourceUrl: "https://admission.kangwon.ac.kr/english/selectBbsNttView.do?bbsNo=276&key=1944&nttNo=185820&pageIndex=1&pageUnit=10",
    sourceType: "official",
    guideYear: "2026 Fall",
    admissionTrackName: "Foreign Undergraduate Admission",
    applicantScope: "International undergraduate applicants for Chuncheon, Samcheok, and Dogye campus routes",
    nationalityRule: "Official 2026 Fall notice directs applicants to the attached guide for detailed eligibility.",
    educationRule: "Application and original document submission are required during the published 2026 Fall period.",
    hardGates: [
      "Language requirements vary by department, so the attached 2026 Fall guide must be checked before final counseling.",
      "Original documents must be submitted by mail as well as uploaded online.",
      "Global Convergence programs include English-track and Chinese-track contact routes."
    ],
    reviewModel: "hard_gate_plus_holistic_review",
    topikMinimum: 3,
    topikAlternatives: ["Department-specific Korean, English-track, or Chinese-track routes in the attached 2026 guide"],
    englishTrackAvailable: "major_specific",
    academicReview: "The official notice confirms department-specific eligibility and document submission; detailed scoring is in the attached guide.",
    recommendationTargetPercent: 68,
    standardizedTests: "Check department-specific requirements in the attached guide.",
    interviewRequired: "major_specific",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "major_specific",
    financialProof: "unknown",
    tuitionLevel: "low",
    tuitionNotes: "National university budget tier; exact current tuition table still needs guide extraction.",
    majorExceptions: [
      "Language requirements are department-specific.",
      "Global Convergence major has separate English-track and Chinese-track contact points."
    ],
    competitiveNotes: [
      "TOPIK 2阶段可以先列为补语言后的备选，不能在未核对学科前直接当作稳妥学校。",
      "江原大学对预算敏感学生有价值，但必须按校区和学科核对。"
    ],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Official 2026 Fall notice confirms schedule, guide attachments, original-document rule, and department-specific language conditions."
  },
  {
    schoolSlug: "jeju-national-university",
    schoolNameCn: "济州大学",
    sourceUrl: "https://intleng.jejunu.ac.kr/intleng/admission/department.htm",
    sourceType: "official",
    guideYear: "2026",
    admissionTrackName: "Undergraduate Admission for International Students",
    applicantScope: "International undergraduate applicants",
    nationalityRule: "Applicant and parents must satisfy foreign-national eligibility; Korean nationality, Korean dual nationality, and stateless cases are not eligible according to the supporting requirements page.",
    educationRule: "Applicants must complete education equivalent to Korean elementary and secondary schooling; 12-year curriculum rules and exceptions are explained in the official requirements.",
    hardGates: [
      "The 2026 undergraduate admission guide is published by Jeju National University OIA.",
      "Foreign-national eligibility and high school completion rules must be satisfied.",
      "Use TOPIK 3 as the conservative planning line until the department-specific 2026 guide is fully extracted."
    ],
    reviewModel: "hard_gate_plus_holistic_review",
    topikMinimum: 3,
    topikAlternatives: ["Department-specific Korean or English language routes in the 2026 guide"],
    englishTrackAvailable: "major_specific",
    academicReview: "Official pages provide 2026 guide and supporting requirements; department-specific document review should be checked in the guide.",
    recommendationTargetPercent: 67,
    standardizedTests: "Check the current guide for department-specific academic documents.",
    interviewRequired: "major_specific",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "required",
    tuitionLevel: "low",
    tuitionNotes: "National university budget tier; exact 2026 tuition table still needs guide extraction.",
    majorExceptions: [
      "Medical, veterinary, pharmacy, education, and arts routes may have special restrictions or materials.",
      "Island location affects living planning and flight cost."
    ],
    competitiveNotes: [
      "TOPIK 2学生目前应先按补到TOPIK 3规划，济州大学可作为预算友好型国立候选。",
      "如果学生不介意地区，济州大学比首尔圈私立更适合作为现实备选。"
    ],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Official Jeju OIA pages confirm 2026 guide availability and foreign-national/education requirements; detailed tuition and language table still need extraction."
  },
  {
    schoolSlug: "korea-maritime-ocean-university",
    schoolNameCn: "韩国海洋大学",
    sourceUrl: "https://www.studyinkorea.go.kr/en/search/universityInfo.do?univCd=100472",
    sourceType: "government",
    guideYear: "2026 / Study in Korea profile",
    admissionTrackName: "Undergraduate Admission for International Students",
    applicantScope: "International undergraduate applicants",
    nationalityRule: "Study in Korea profile identifies Korea Maritime & Ocean University as a national IEQAS-certified university; current school guide must be checked for nationality documents.",
    educationRule: "Bachelor's degree admission is listed as a 4-year program; current guide file is attached on the profile.",
    hardGates: [
      "Use TOPIK 3 as a practical planning line for undergraduate entry based on Korean-language program to degree-route information.",
      "The official 2026 undergraduate admission guideline is attached in the Study in Korea profile.",
      "English-score scholarships and some routes use TOEFL iBT/IELTS/TOPIK bands."
    ],
    reviewModel: "hard_gate_plus_holistic_review",
    topikMinimum: 3,
    topikAlternatives: ["TOEFL iBT or IELTS routes for scholarship and selected English-related screening"],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "Scholarship bands list TOEFL iBT 80/90/100 and IELTS 6.0/6.5/7.0 tiers.",
    academicReview: "Current admission guide is attached; Study in Korea profile lists undergraduate admission period and departments.",
    recommendationTargetPercent: 68,
    standardizedTests: "Check the attached 2026 undergraduate guide for required academic documents.",
    interviewRequired: "major_specific",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    tuitionLevel: "low",
    tuitionPerSemesterKrw: "about USD 1,290~1,620 per semester",
    tuitionNotes: "Study in Korea profile lists bachelor's tuition by field in USD; KRW amount should be recalculated by exchange rate when shown to users.",
    majorExceptions: ["Maritime, navigation, engineering, logistics, and ocean-related majors may have special department rules."],
    competitiveNotes: [
      "海洋、物流、造船、航海方向匹配时很有价值，但普通人文方向不应只因为预算低而优先推荐。",
      "TOPIK 2学生建议先补到TOPIK 3，再把韩国海洋大学作为釜山国立特色候选。"
    ],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Government Study in Korea profile confirms tuition bands, attached 2026 undergraduate guide, national IEQAS status, scholarships, and departments; exact guide text still needs school PDF extraction."
  },
  {
    schoolSlug: "dong-a-university",
    schoolNameCn: "东亚大学",
    sourceUrl: "https://www.donga.ac.kr/dongaoia/CMS/Contents/Contents.do?mCode=MN092",
    sourceType: "official",
    guideYear: "Current OIA page",
    admissionTrackName: "Undergraduate Korean Track",
    applicantScope: "International undergraduate applicants",
    nationalityRule: "Foreign students with both parents being foreigners; dual citizens and stateless individuals are not considered foreigners.",
    educationRule: "Freshman applicants must be high school graduates or recognized as having equivalent education.",
    hardGates: [
      "Korean-track applicants need TOPIK level 3 or higher, Dong-A Korean Language Course Intermediate 2 completion, or Dong-A Korean Language Proficiency Test level 3 or higher.",
      "Undergraduate students must achieve TOPIK level 4 or higher before graduation, with department-specific differences.",
      "Financial ability proof equivalent to USD 18,000 is listed in required documents."
    ],
    reviewModel: "document_review",
    topikMinimum: 3,
    topikAlternatives: [
      "Dong-A University Korean Language Course Intermediate 2 completion",
      "Dong-A Korean Language Proficiency Test level 3"
    ],
    englishTrackAvailable: "major_specific",
    academicReview: "The OIA page lists eligibility assessment and document review; arts and physical education applicants may undergo practical assessment.",
    recommendationTargetPercent: 67,
    standardizedTests: "High school transcript and graduation certificate are required; standardized tests are not universal.",
    interviewRequired: "major_specific",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "major_specific",
    financialProof: "required",
    tuitionLevel: "medium",
    tuitionPerSemesterKrw: "historical table: 2,857,000~3,947,000 KRW tuition plus 791,000 KRW admission fee",
    tuitionNotes: "The English tuition table is historical; Dong-A also publishes a 2026 tuition notice, so current department tuition must be rechecked before final counseling.",
    majorExceptions: [
      "Nursing, medicine, education, and several special colleges are excluded from the Korean-track recruitment list.",
      "Fine arts may have exceptional admission criteria and practical assessment."
    ],
    competitiveNotes: [
      "TOPIK 2学生目前还差一级，补到3级后可作为釜山私立现实候选。",
      "东亚大学不是低学费国立，预算中等以下要同时看奖学金和生活费。"
    ],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Official OIA page confirms TOPIK 3 route, graduation TOPIK 4 rule, document review, financial proof, and excluded departments. Current exact tuition needs 2026 table extraction."
  },
  {
    schoolSlug: "keimyung-university",
    schoolNameCn: "启明大学",
    sourceUrl: "https://www.kmu.ac.kr/uni/eng/file/2026AdmissionGuidelines.pdf",
    sourceType: "official",
    guideYear: "2026 Fall",
    admissionTrackName: "Admission Guidelines for International Students",
    applicantScope: "International freshman and transfer applicants",
    nationalityRule: "This admission is not available to applicants holding multiple nationalities.",
    educationRule: "Freshman applicants should have completed 12 years of education; transfer routes list university completion conditions.",
    hardGates: [
      "Most Korean-track departments require TOPIK level 3, KKPT pass, Keimyung Korean Language Program level 3, or Korean-medium prior schooling.",
      "Physical education, music, performing arts, and fine arts accept TOPIK level 2 or the same Korean alternatives.",
      "Applicants below TOPIK level 2 or equivalent must take 300 hours of compulsory Korean class in the first year."
    ],
    reviewModel: "document_plus_interview",
    topikMinimum: 3,
    topikAlternatives: [
      "Keimyung Korean Proficiency Test pass",
      "Keimyung Korean Language Program level 3 completion",
      "TOPIK level 2 for selected arts, music, performing arts, and physical education departments"
    ],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "International Business and International Relations require TOEFL iBT 80 or IELTS 5.5; Digipen Game Engineering accepts TOEFL iBT 61, IELTS 5.0, or TOEIC 600.",
    academicReview: "Interview evaluation covers basic personality, study motive, major knowledge, educational background, and study plan; document-only route also exists.",
    recommendationTargetPercent: 66,
    standardizedTests: "Language proof must be submitted by the document deadline; other standardized tests are not universal.",
    interviewRequired: "major_specific",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "required",
    financialProof: "required",
    tuitionLevel: "medium",
    tuitionPerSemesterKrw: "3,460,000~5,066,000 KRW first semester",
    tuitionNotes: "2026 Fall guide lists first-semester tuition and tuition after scholarship categories; rates may change in 2027.",
    majorExceptions: [
      "Arts, music, performing arts, and physical education have lower TOPIK route and practical tests.",
      "Keimyung Adams College English-track majors use English scores and separate scholarship rules.",
      "Digipen Game Engineering has separate English and tuition rules."
    ],
    competitiveNotes: [
      "TOPIK 2学生如果目标是艺术/体育/音乐方向，可作为现实候选；一般学科仍建议补到TOPIK 3。",
      "启明大学有明确2026学费表和奖学金等级，适合把语言、预算和专业一起比较。"
    ],
    verificationStatus: "verified",
    updatedAt: "2026-05",
    notes: "Official 2026 Fall PDF confirms language routes, interview/document evaluation, compulsory Korean classes, scholarships, dormitory costs, and tuition table."
  },
  {
    schoolSlug: "wonkwang-university",
    schoolNameCn: "圆光大学",
    sourceUrl: "https://eng.wku.ac.kr/admissions/colleges-2/application-and-procedures/",
    sourceType: "official",
    guideYear: "Current English admissions page",
    admissionTrackName: "Undergraduate Admission for International Students",
    applicantScope: "International freshman and transfer applicants",
    nationalityRule: "Pure foreigner route requires the applicant and both parents to be foreign nationals.",
    educationRule: "Freshman applicants apply through the new entrance route; transfer routes require college or university study completion conditions.",
    hardGates: [
      "Applicants need TOPIK grade 3 or higher, Wonkwang Korean Language Education Center grade 4 completion, or Wonkwang Korean Language Proficiency Test grade 3.",
      "Arts and physical education may waive the general language qualification if the department recognizes appropriate academic skills.",
      "Students should acquire TOPIK grade 4 before graduation, or grade 3 for arts and physical education."
    ],
    reviewModel: "document_plus_interview",
    topikMinimum: 3,
    topikAlternatives: [
      "Wonkwang University Korean Language Education Center grade 4 completion",
      "Wonkwang University Korean Language Proficiency Test grade 3",
      "Department-recognized exception for arts and physical education"
    ],
    englishTrackAvailable: "unknown",
    academicReview: "Application process is application form, document review, interview and written test, announcement, and registration.",
    recommendationTargetPercent: 64,
    standardizedTests: "No universal standardized test is listed on the English page.",
    interviewRequired: "required",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "major_specific",
    financialProof: "unknown",
    tuitionLevel: "medium",
    tuitionNotes: "Exact tuition table not found yet; official scholarship page confirms TOPIK-based first-semester tuition waivers.",
    majorExceptions: ["Arts and physical education have language exceptions and lower graduation TOPIK target."],
    competitiveNotes: [
      "TOPIK 2学生一般还差一级，但可查看校内韩语考试或艺体例外。",
      "圆光大学更适合作为中低成绩学生的现实私立候选，不应和首尔顶尖私立放在同一竞争层。"
    ],
    verificationStatus: "partial",
    updatedAt: "2026-05",
    notes: "Official English page confirms TOPIK 3 route, school Korean-test route, graduation TOPIK, and process. Tuition amount still needs current official table."
  },
  {
    schoolSlug: "hankuk-university-of-foreign-studies",
    schoolNameCn: "韩国外国语大学",
    sourceUrl: "https://international.hufs.ac.kr/sites/international/contents/files/2026fall/HUFS_2026_Fall_Admission_guide%28KOR%29_update_ver.pdf",
    sourceType: "official",
    guideYear: "2026 Fall",
    admissionTrackName: "International Undergraduate Admission for Applicants Whose Parents Are Both Foreign Nationals",
    applicantScope: "International undergraduate applicants",
    nationalityRule: "Applicant applies through the parents-both-foreign-national route.",
    educationRule: "Freshman applicants must complete or be expected to complete regular elementary, middle, and high school education before entrance.",
    hardGates: [
      "Korean-track applicants may submit TOPIK/TOPIK IBT 3 or higher, HUFS CKLC level 3 completion, accredited Korean language institute level 3 completion, or King Sejong Institute intermediate 1 completion.",
      "English-track applicants submit TOEFL or IELTS according to the guide.",
      "Applicants are evaluated through documents, language ability, and interview."
    ],
    reviewModel: "document_plus_interview",
    topikMinimum: 3,
    topikAlternatives: [
      "HUFS Korean Culture & Language Center regular course level 3 completion",
      "Accredited Korean language institute regular course level 3 completion",
      "King Sejong Institute intermediate 1 completion"
    ],
    englishTrackAvailable: "major_specific",
    englishScoreRequirement: "English Track A/B accepts TOEFL iBT or IELTS scores as specified in the 2026 guide.",
    academicReview: "The guide scores documents 30, language ability 30, and interview 40; documents include self-introduction, major fit, study will, high school grades, national entrance exam score, and recommendation letter.",
    recommendationTargetPercent: 76,
    standardizedTests: "National college entrance exam scores can be reviewed as part of document evaluation when submitted.",
    interviewRequired: "required",
    portfolioOrPracticalRequired: "major_specific",
    conditionalAdmission: "major_specific",
    financialProof: "required",
    tuitionLevel: "medium",
    tuitionPerSemesterKrw: "4,496,000~5,592,000 KRW first semester",
    tuitionNotes: "2026 Fall guide tuition table by college.",
    majorExceptions: [
      "TOPIK/TOPIK IBT 4 or higher submitters, International Studies entrants, and transfer students are excluded from the Korean intensive education program.",
      "Some majors are English-track or campus-specific."
    ],
    competitiveNotes: [
      "TOPIK 2学生目前不足，若目标是外语/人文方向，应先补到TOPIK 3或取得可替代的韩语课程证明。",
      "韩国外国语大学学费高于国立大学，预算中等以下需要同时比较奖学金可能性。"
    ],
    verificationStatus: "verified",
    updatedAt: "2026-05",
    notes: "2026 Fall official guide confirms language alternatives, evaluation weights, Korean intensive education program, and first-semester tuition table."
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
    hardGates: ["Pending official verification."],
    reviewModel: "unknown",
    topikAlternatives: [],
    englishTrackAvailable: "unknown",
    academicReview: "Pending official verification.",
    standardizedTests: "Pending official verification.",
    interviewRequired: "unknown",
    portfolioOrPracticalRequired: "unknown",
    conditionalAdmission: "unknown",
    financialProof: "unknown",
    tuitionLevel: "unknown",
    majorExceptions: [],
    competitiveNotes: ["本校官方招生简章尚未录入，推荐前必须先核验。"],
    verificationStatus: "pending",
    updatedAt: "2026-05",
    notes: "本校官方招生简章尚未录入，推荐前必须先核验。"
  };
}

const researchedBySlug = new Map(researchedProfiles.map((profile) => [profile.schoolSlug, profile]));

export const admissionProfiles: AdmissionProfile[] = universities.map((university) => {
  return researchedBySlug.get(university.slug) ?? createPendingProfile(university.slug, university.nameCn);
});

export function getAdmissionProfile(schoolSlug: string): AdmissionProfile | undefined {
  return admissionProfiles.find((profile) => profile.schoolSlug === schoolSlug);
}
