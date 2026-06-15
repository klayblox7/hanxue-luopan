"use client";

import { BadgeCheck, BookOpenCheck, ChevronRight, Route, Search, UsersRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, type TouchEvent, useEffect, useMemo, useRef, useState } from "react";

import partnerSchoolProfiles from "@/data/partner-school-profiles.json";
import { universities, type University } from "@/data/universities";
import { getUniversityTierProfile } from "@/data/universityTiers";
import { getAdmissionCaseSummary, type AdmissionCase, type AdmissionCaseSummary, type DistributionItem } from "@/data/admissionCases";
import {
  getMobileRecommendationResults,
  mobileHomeActions,
  type MobileHomeAction,
  type MobileRecommendationInput
} from "@/data/mobileHome";
import { assetPath } from "@/data/assetPath";
import { CampusImage } from "@/components/CampusImage";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const mobileIntroSlides = [
  {
    alt: "Korea university application guide",
    src: assetPath("/mobile-mini-program/mobile-intro-a1.png")
  },
  {
    alt: "Korea university student guide",
    src: assetPath("/mobile-mini-program/mobile-intro-a3.png")
  }
] as const;

type IntroTouchList = {
  length: number;
  [index: number]: {
    clientX: number;
    clientY: number;
  };
};

const mobileRecommendationCategoryBadgeStyles: Record<string, string> = {
  录取有望: "border-[oklch(59%_0.14_150)] bg-[oklch(94%_0.055_150)] text-[oklch(31%_0.105_150)]",
  条件匹配: "border-[oklch(61%_0.12_230)] bg-[oklch(94%_0.045_230)] text-[oklch(34%_0.105_230)]",
  录取较难: "border-[oklch(66%_0.14_65)] bg-[oklch(94%_0.065_75)] text-[oklch(38%_0.105_55)]",
  暂不符合: "border-[#8c8678] bg-[#ece9e1] text-[#4a4338]"
};

function mobileRecommendationCategoryBadgeStyle(category: string) {
  return mobileRecommendationCategoryBadgeStyles[category] ?? mobileRecommendationCategoryBadgeStyles["条件匹配"];
}

function RequiredControl({ children, flashKey, showValue = false }: { children: ReactNode; flashKey: number; showValue?: boolean }) {
  return (
    <span
      className={`relative block ${flashKey > 0 ? "required-field-flash" : ""}`}
      data-testid="mobile-required-control"
      key={flashKey}
    >
      {showValue ? null : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[0.85rem] font-black leading-none text-[#9f1d1d]"
        >
          必选项
        </span>
      )}
      {children}
    </span>
  );
}

function LabelText({ children }: { children: string }) {
  return (
    <span className="flex items-center">
      {children}
    </span>
  );
}

function NoDirectRecommendationGuidance() {
  return (
    <div className="grid gap-3 rounded-xl border border-ink/20 bg-[#fffaf0] p-3" data-testid="mobile-no-direct-guidance">
      <div>
        <h3 className="text-base font-black leading-tight text-ink">当前条件暂时不适合直接推荐大学</h3>
        <p className="mt-2 text-[0.78rem] font-medium leading-5 text-muted">
          TOPIK低于3级时，直接申请本科风险较高。建议先走项目路径，或先补强韩语后再选校。
        </p>
      </div>
      <div className="grid gap-2">
        <Link
          className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-ink bg-[#dff3dc] px-3 text-sm font-black text-[#004c3f]"
          href="/application"
        >
          <span className="inline-flex items-center gap-2">
            <Route size={17} strokeWidth={2.4} aria-hidden="true" />
            国内+韩国项目
          </span>
          <ChevronRight size={16} strokeWidth={2.4} aria-hidden="true" />
        </Link>
        <Link
          className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-ink bg-[#ffe07a] px-3 text-sm font-black text-ink"
          href="/topik"
        >
          <span className="inline-flex items-center gap-2">
            <BookOpenCheck size={17} strokeWidth={2.4} aria-hidden="true" />
            韩语 / TOPIK、报名、备考
          </span>
          <ChevronRight size={16} strokeWidth={2.4} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

const initialRequiredSelectionState = {
  gpa: false,
  topik: false,
  major: false
};

function MobileIntroOverlay({
  activeIndex,
  onClose,
  onPinchZoomChange
}: {
  activeIndex: number;
  onClose: () => void;
  onPinchZoomChange: (isPinched: boolean) => void;
}) {
  const slide = mobileIntroSlides[activeIndex] ?? mobileIntroSlides[0];
  const [introScale, setIntroScale] = useState(1);
  const introScaleRef = useRef(1);
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef(1);

  useEffect(() => {
    introScaleRef.current = 1;
    pinchStartDistanceRef.current = null;
    pinchStartScaleRef.current = 1;
    setIntroScale(1);
    onPinchZoomChange(false);
  }, [activeIndex, onPinchZoomChange]);

  const updateIntroScale = (value: number) => {
    const nextScale = Math.min(Math.max(value, 1), 2.6);
    introScaleRef.current = nextScale;
    setIntroScale(nextScale);
    onPinchZoomChange(nextScale > 1.04);
  };

  const introTouchDistance = (touches: IntroTouchList) => {
    const firstTouch = touches[0];
    const secondTouch = touches[1];
    const deltaX = firstTouch.clientX - secondTouch.clientX;
    const deltaY = firstTouch.clientY - secondTouch.clientY;

    return Math.hypot(deltaX, deltaY);
  };

  const handleIntroTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2) return;

    pinchStartDistanceRef.current = introTouchDistance(event.touches);
    pinchStartScaleRef.current = introScaleRef.current;
  };

  const handleIntroTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2 || !pinchStartDistanceRef.current) return;

    event.preventDefault();
    updateIntroScale((introTouchDistance(event.touches) / pinchStartDistanceRef.current) * pinchStartScaleRef.current);
  };

  const handleIntroTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length >= 2) return;

    pinchStartDistanceRef.current = null;
    pinchStartScaleRef.current = introScaleRef.current;
    if (introScaleRef.current <= 1.04) onPinchZoomChange(false);
  };

  return (
    <div
      aria-label="Mobile intro"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center px-3 py-[calc(1rem+env(safe-area-inset-top))] md:hidden"
      data-testid="mobile-intro-overlay"
      role="dialog"
      style={{ backgroundColor: "rgba(10, 10, 10, 0.78)" }}
      onClick={onClose}
    >
      <div className="relative w-full max-w-[26rem]" data-testid="mobile-intro-frame">
        <div
          className="relative aspect-[4/3] w-full overflow-visible rounded-xl bg-[#f5f3ed] shadow-[0_18px_70px_rgba(0,0,0,0.45)]"
          data-testid="mobile-intro-image-panel"
          style={{ touchAction: "none" }}
          onClick={(event) => event.stopPropagation()}
          onTouchEnd={handleIntroTouchEnd}
          onTouchMove={handleIntroTouchMove}
          onTouchStart={handleIntroTouchStart}
        >
          <div
            className="absolute inset-0 origin-center rounded-xl"
            data-testid="mobile-intro-image-inner"
            style={{ transform: `scale(${introScale})` }}
          >
            <Image
              alt={slide.alt}
              className="rounded-xl object-contain"
              data-testid="mobile-intro-image"
              fill
              priority
              sizes={introScale > 1.04 ? "260vw" : "100vw"}
              src={slide.src}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2" data-testid="mobile-intro-dots">
          {mobileIntroSlides.map((item, index) => (
            <span
              aria-hidden="true"
              className={`h-2 rounded-full transition-all ${index === activeIndex ? "w-6 bg-[#f5f3ed]" : "w-2 bg-[#f5f3ed]/45"}`}
              key={item.src}
            />
          ))}
        </div>

        <button
          aria-label="Close intro"
          className="mx-auto mt-5 grid size-10 place-items-center rounded-full border border-[#0a0a0a]/30 bg-[#f5f3ed] text-[#0a0a0a] shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition active:scale-95"
          data-testid="mobile-intro-close"
          type="button"
          onClick={onClose}
        >
          <X size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function MobileHomeActionLink({ action }: { action: MobileHomeAction }) {
  return (
    <Link className="grid min-w-0 justify-items-center gap-1.5 px-1 text-center text-ink transition active:translate-y-0.5" href={action.href}>
      <span
        className="flex"
        style={{
          alignItems: "center",
          height: "5.18rem",
          justifyContent: "center",
          maxWidth: "5.98rem",
          overflow: "visible",
          width: "100%"
        }}
      >
        <Image
          alt={action.imageAlt}
          className="drop-shadow-[0_8px_12px_rgba(10,10,10,0.08)]"
          height={90}
          loading="eager"
          sizes="5.98rem"
          src={action.imageSrc}
          style={{ height: "100%", objectFit: "contain", width: "100%" }}
          width={120}
        />
      </span>
      <span className="block min-w-0">
        <span className="block truncate text-[0.92rem] font-black leading-tight">{action.title}</span>
        <span className="mt-1 block text-[0.68rem] font-medium leading-4 text-muted">{action.detail}</span>
      </span>
    </Link>
  );
}

const gpaOptions = [
  { label: "60分以下", value: 55 },
  { label: "60-70分", value: 65 },
  { label: "70-75分", value: 72 },
  { label: "75-80分", value: 77 },
  { label: "80-85分", value: 82 },
  { label: "85-90分", value: 88 },
  { label: "90分以上", value: 95 }
];

const majorOptions: Array<{ label: string; value: MobileRecommendationInput["intendedMajor"] }> = [
  { label: "还没确定", value: "undecided" },
  { label: "经营/商科", value: "business" },
  { label: "计算机/AI", value: "computer-science" },
  { label: "工科", value: "engineering" },
  { label: "传媒/影视", value: "media" },
  { label: "艺术/设计", value: "art-design" },
  { label: "韩语/教育", value: "korean-language" },
  { label: "酒店/旅游", value: "tourism" },
  { label: "人文/外语", value: "humanities" },
  { label: "自然科学/生命", value: "science" }
];

type RecommendedSchoolDetail = University & {
  tier: string;
  tierNote: string;
  caseSummary: AdmissionCaseSummary;
  founded: string;
  intro: string;
};

type RecommendedSheetMode = "info" | "case";

type SchoolProfile = {
  name?: string;
  slug: string;
  city?: string;
  type?: string;
  focus?: string;
  founded?: string;
  intro?: string;
};

const typedSchoolProfiles = partnerSchoolProfiles as SchoolProfile[];
const schoolProfilesBySlug = new Map(typedSchoolProfiles.map((profile) => [profile.slug, profile]));
const genericPartnerFocus = "合作项目相关专业";
const supplementalProfilesBySlug: Record<string, Partial<SchoolProfile>> = {
  "seoul-national-university": {
    founded: "1946年",
    intro:
      "首尔大学位于首尔，成立时间为1946年，是一所国立院校。该校在本项目库中主要用于综合研究、理工、人文社科方向的匹配参考，建议结合项目模式、韩语要求、学费与所在城市生活成本一起判断是否适合申请。"
  }
};

function recommendationSchoolProfile(university: University) {
  const profile = schoolProfilesBySlug.get(university.slug) ?? {};
  const supplemental = supplementalProfilesBySlug[university.slug] ?? {};
  const merged = { ...profile, ...supplemental };
  const founded = merged.founded || "资料待补";
  const city = merged.city || university.city;
  const type = merged.type || university.type;
  const hasGenericPartnerFocus = merged.focus === genericPartnerFocus;
  const focus = hasGenericPartnerFocus ? university.focus : merged.focus || university.focus;

  return {
    founded,
    intro:
      (!hasGenericPartnerFocus && merged.intro) ||
      `${university.nameCn}位于${city}，成立时间为${founded}，是一所${type}院校。该校在本项目库中主要用于${focus}方向的匹配参考，建议结合项目模式、韩语要求、学费与所在城市生活成本一起判断是否适合申请。`
  };
}

function RecommendedMetric({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-ink/15 bg-[#fffaf0] px-3 py-2">
      <p className="text-[0.68rem] font-semibold text-muted">{label}</p>
      <p className="mt-1 text-[0.92rem] font-black leading-tight text-ink">{value || "资料待补"}</p>
    </div>
  );
}

function formatCasePercent(value: number) {
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)}%`;
}

function topCaseSignal(items: DistributionItem[]) {
  const item = [...items]
    .filter((entry) => !/(未|暂无|unknown|无TOPIK)/i.test(entry.label))
    .sort((a, b) => b.count - a.count || b.percent - a.percent)[0];

  return item ? `${item.label.replace(/^TOPIK\s*/, "")} · ${formatCasePercent(item.percent)}` : "暂无";
}

function caseResultText(summary: AdmissionCaseSummary) {
  if (summary.caseCount === 0) return "暂无案例";
  return `录取 ${summary.admittedCount} / 拒绝 ${summary.rejectedCount}`;
}

function caseGpaText(summary: AdmissionCaseSummary) {
  return typeof summary.admittedAverageGpa === "number" ? `${summary.admittedAverageGpa.toFixed(1)}/100` : "暂无";
}

function recommendationCaseExamples(cases: AdmissionCase[]) {
  const admitted = cases.filter((admissionCase) => admissionCase.resultKey === "admitted").slice(0, 2);
  const rejected = cases.filter((admissionCase) => admissionCase.resultKey === "rejected").slice(0, 2);
  const selectedIds = new Set([...admitted, ...rejected].map((admissionCase) => admissionCase.id));
  const fallback = cases.filter((admissionCase) => !selectedIds.has(admissionCase.id));

  return [...admitted, ...rejected, ...fallback].slice(0, 4);
}

function recommendationCaseText(admissionCase: AdmissionCase) {
  const parts = [
    admissionCase.entryYear ? `${admissionCase.entryYear}年申请` : "申请",
    admissionCase.major ? `目标专业为${admissionCase.major}` : "",
    admissionCase.highSchoolType ? `高中背景：${admissionCase.highSchoolType}` : "",
    admissionCase.gpa ? `成绩：${admissionCase.gpa}` : "",
    admissionCase.topik ? `韩语：${admissionCase.topik}` : "",
    admissionCase.ielts ? `英语：${admissionCase.ielts}` : "",
    admissionCase.coreStrength ? `关键点：${admissionCase.coreStrength}` : ""
  ].filter(Boolean);

  return parts.join("，");
}

function primaryRecommendationCity(city: string) {
  const [primaryCity] = city.split(/[\/／]/);
  return primaryCity.trim() || city;
}

function RecommendedSchoolSheet({
  mode,
  onClose,
  onShowCases,
  school
}: {
  mode: RecommendedSheetMode;
  onClose: () => void;
  onShowCases: () => void;
  school: RecommendedSchoolDetail;
}) {
  const caseExamples = recommendationCaseExamples(school.caseSummary.representativeCases);

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-ink/35 px-3 pb-3 pt-[14dvh] md:hidden" onClick={onClose}>
      <section
        aria-label={school.nameCn}
        aria-modal="true"
        className="mx-auto flex max-h-[82dvh] w-full max-w-[26rem] flex-col overflow-hidden rounded-t-2xl border border-ink bg-[#f5f3ed] shadow-[0_-18px_46px_rgba(10,10,10,0.22)]"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink/10 bg-surface px-4 py-3">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#0b6a4a]">{mode === "info" ? "School info" : "Admission evidence"}</p>
            <h2 className="mt-1 text-2xl font-black leading-tight">{school.nameCn}</h2>
            <p className="mt-1 truncate text-xs font-medium text-muted">
              {school.nameKr} · {school.nameEn}
            </p>
          </div>
          <button
            aria-label="关闭"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-ink bg-paper text-ink"
            type="button"
            onClick={onClose}
          >
            <X size={18} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4">
          {mode === "info" ? (
            <div className="grid gap-3">
              <CampusImage
                className="h-40 w-full rounded-xl border border-ink bg-surface object-cover"
                name={school.nameCn}
                slug={school.slug}
              />
              <div className="flex flex-wrap gap-2">
                {[school.tier, school.city, school.type, school.tierNote].map((item) => (
                  <span className="rounded-full border border-ink bg-surface px-3 py-1 text-xs font-black" key={item}>
                    {item}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <RecommendedMetric label="学生数" value={school.totalStudents} />
                <RecommendedMetric label="外国学生" value={school.foreignStudents} />
                <RecommendedMetric label="宿舍容量" value={school.dormitoryCapacity} />
                <RecommendedMetric label="宿舍覆盖" value={school.dormitoryRate} />
              </div>
              <section className="rounded-lg border border-ink bg-surface p-3" data-testid="recommended-school-intro">
                <h3 className="text-sm font-black">学校介绍</h3>
                <p className="mt-2 text-xs font-black text-ink">成立时间：{school.founded}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-muted">{school.intro}</p>
              </section>
              <div className="grid grid-cols-2 gap-2">
                <button className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-ink bg-[#71d39b] px-3 text-sm font-black text-ink" type="button" onClick={onShowCases}>
                  案例画像
                  <ChevronRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </button>
                <Link className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-ink bg-[#ffe07a] px-3 text-sm font-black text-ink" href="/universities">
                  进入大学库
                  <ChevronRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-2">
                <RecommendedMetric label="样本量" value={`${school.caseSummary.caseCount}例`} />
                <RecommendedMetric label="录取均分" value={caseGpaText(school.caseSummary)} />
                <RecommendedMetric label="TOPIK主段" value={topCaseSignal(school.caseSummary.topikDistribution)} />
                <RecommendedMetric label="结果" value={caseResultText(school.caseSummary)} />
              </div>
              <section className="rounded-xl border border-ink/15 bg-surface p-3" aria-label="申请者具体案例">
                <h3 className="text-sm font-black">申请者具体案例</h3>
                <ul className="mt-3 grid gap-2">
                  {caseExamples.map((admissionCase) => (
                    <li className="rounded-lg border border-ink/15 bg-[#fffaf0] p-3" key={admissionCase.id}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border border-ink px-2 py-0.5 text-xs font-black ${
                            admissionCase.resultKey === "admitted" ? "bg-[#71d39b]" : "bg-[#ffd0d8]"
                          }`}
                        >
                          {admissionCase.result}
                        </span>
                        <span className="text-xs font-black text-muted">{admissionCase.entryYear}</span>
                        <span className="text-xs font-black text-muted">{admissionCase.topik}</span>
                      </div>
                      <p className="mt-2 text-sm font-normal leading-6 text-ink">{recommendationCaseText(admissionCase)}</p>
                    </li>
                  ))}
                </ul>
              </section>
              <p className="text-center text-xs font-bold leading-5 text-muted">案例只作申请画像参考，不等于录取承诺。</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function MobileMiniProgramHome() {
  const [showIntro, setShowIntro] = useState(true);
  const [introIndex, setIntroIndex] = useState(0);
  const [isIntroPinched, setIsIntroPinched] = useState(false);
  const [gpaPercent, setGpaPercent] = useState(77);
  const [highSchoolTier, setHighSchoolTier] = useState<MobileRecommendationInput["highSchoolTier"]>("regular");
  const [topikLevel, setTopikLevel] = useState(0);
  const [intendedMajor, setIntendedMajor] = useState<MobileRecommendationInput["intendedMajor"]>("undecided");
  const [preferredRegion, setPreferredRegion] = useState("不限");
  const [schoolTypePreference, setSchoolTypePreference] = useState<MobileRecommendationInput["schoolTypePreference"]>("any");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendationStatus, setRecommendationStatus] = useState<"idle" | "loading" | "result">("idle");
  const [selectedRecommendationSheet, setSelectedRecommendationSheet] = useState<{ slug: string; mode: RecommendedSheetMode } | null>(null);
  const [requiredFlashKey, setRequiredFlashKey] = useState(0);
  const [hasGeneratedRecommendation, setHasGeneratedRecommendation] = useState(false);
  const [requiredSelectionState, setRequiredSelectionState] = useState(initialRequiredSelectionState);
  const recommendationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSelectedMajor = intendedMajor !== "undecided";
  const showGpaValue = requiredSelectionState.gpa || hasGeneratedRecommendation;
  const showTopikValue = requiredSelectionState.topik || hasGeneratedRecommendation;
  const showMajorValue = hasSelectedMajor && (requiredSelectionState.major || hasGeneratedRecommendation);
  const recommendationResults = useMemo(
    () =>
      getMobileRecommendationResults({
        gpaPercent,
        highSchoolTier,
        topikLevel,
        intendedMajor,
        preferredRegion,
        schoolTypePreference
      }),
    [gpaPercent, highSchoolTier, intendedMajor, preferredRegion, schoolTypePreference, topikLevel]
  );
  const selectedRecommendationSchool = useMemo<RecommendedSchoolDetail | null>(() => {
    const school = selectedRecommendationSheet ? universities.find((university) => university.slug === selectedRecommendationSheet.slug) : undefined;
    if (!school) return null;
    const tierProfile = getUniversityTierProfile(school.nameCn);
    const caseSummary = getAdmissionCaseSummary(school.slug);
    const profile = recommendationSchoolProfile(school);
    return { ...school, tier: tierProfile.tier, tierNote: tierProfile.note, caseSummary, founded: profile.founded, intro: profile.intro };
  }, [selectedRecommendationSheet]);

  const clearRecommendationTimer = () => {
    if (recommendationTimerRef.current) {
      clearTimeout(recommendationTimerRef.current);
      recommendationTimerRef.current = null;
    }
  };

  useEffect(() => clearRecommendationTimer, []);

  useEffect(() => {
    if (!showIntro || isIntroPinched) return undefined;

    const introTimer = setTimeout(() => {
      setIntroIndex((currentIndex) => (currentIndex + 1) % mobileIntroSlides.length);
    }, 2000);

    return () => clearTimeout(introTimer);
  }, [introIndex, isIntroPinched, showIntro]);

  const resetRecommendations = () => {
    clearRecommendationTimer();
    setRecommendationStatus("idle");
    setShowRecommendations(false);
  };

  const runRecommendationAi = () => {
    if (!hasSelectedMajor) {
      setHasGeneratedRecommendation(false);
      setRequiredFlashKey((current) => current + 1);
      return;
    }

    clearRecommendationTimer();
    setHasGeneratedRecommendation(true);
    setRequiredSelectionState({ gpa: true, topik: true, major: true });
    setSelectedRecommendationSheet(null);
    setShowRecommendations(false);
    setRecommendationStatus("loading");
    recommendationTimerRef.current = setTimeout(() => {
      setShowRecommendations(true);
      setRecommendationStatus("result");
      recommendationTimerRef.current = null;
    }, 1500);
  };

  return (
    <section className="mobile-app-shell mx-auto min-h-screen w-full max-w-[430px] bg-[#f5f3ed] pb-[calc(5.8rem+env(safe-area-inset-bottom))] md:hidden" aria-label="KOREA UNIVERSITY LINK移动端小程序首页">
      {showIntro ? (
        <MobileIntroOverlay
          activeIndex={introIndex}
          onClose={() => {
            setIsIntroPinched(false);
            setShowIntro(false);
          }}
          onPinchZoomChange={setIsIntroPinched}
        />
      ) : null}

      <div
        className="relative isolate min-h-[15rem] overflow-hidden bg-[#073f2d] px-6 pb-10 pt-8 text-[#fbfbf8]"
        data-testid="mobile-home-hero"
      >
        <Image
          alt="韩国留学小程序首页横幅"
          className="z-0 object-cover object-center opacity-80"
          fill
          priority
          sizes="100vw"
          src={assetPath("/mobile-mini-program/home-hero-a5-2-source.png")}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#073f2d]/96 via-[#073f2d]/62 to-[#f5f3ed]" />
        <div className="absolute inset-x-0 inset-y-0 z-10 bg-gradient-to-r from-[#073f2d] via-[#073f2d]/92 to-[#073f2d]/10" />
        <div className="relative z-20 max-w-[18rem] drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
          <h1 className="text-[0.72rem] font-black uppercase tracking-[0.08em] text-[#d8efe4]">KOREA UNIVERSITY LINK</h1>
          <p className="mt-5 text-[1.02rem] font-medium leading-none text-[#e9fff5]">Hi, 准留学生</p>
        </div>
      </div>

      <div className="-mt-8 px-4" data-testid="mobile-home-content">
        <div className="relative z-20 rounded-2xl bg-surface p-4 shadow-[0_16px_44px_rgba(10,10,10,0.14)]">
          <div
            className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-[#fffaf0] px-4 py-2"
            data-testid="mobile-home-primary-cta"
          >
            <div>
              <p className="text-[0.95rem] font-black leading-tight text-ink">先按条件筛，再看学校</p>
            </div>
            <a className="rounded-full bg-ink px-4 py-1.5 text-[0.74rem] font-black text-surface" href="#mobile-recommender">
              开始
            </a>
          </div>

          <div className="mt-6 rounded-xl bg-surface" data-testid="mobile-home-action-grid">
            <div className="grid grid-cols-3 gap-y-4 pb-4">
              {mobileHomeActions.slice(0, 3).map((action) => (
                <MobileHomeActionLink action={action} key={action.href} />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-y-4 pt-4">
              {mobileHomeActions.slice(3).map((action) => (
                <MobileHomeActionLink action={action} key={action.href} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <section id="mobile-recommender" className="mx-4 mt-4 rounded-2xl bg-surface p-4 shadow-[0_10px_30px_rgba(10,10,10,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[1.06rem] font-black leading-none">按条件推荐学校</h2>
          <BadgeCheck size={21} strokeWidth={2.35} aria-hidden="true" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="grid gap-1 text-[0.75rem] font-semibold text-ink">
            <LabelText>高中均分</LabelText>
            <RequiredControl flashKey={requiredFlashKey} showValue={showGpaValue}>
              <select
                aria-label="高中均分"
                className={`required-value-hidden h-11 w-full rounded-lg border border-ink bg-surface px-3 text-[0.85rem] font-semibold ${showGpaValue ? "text-ink" : "text-transparent"}`}
                value={gpaPercent}
                onChange={(event) => {
                  setRequiredSelectionState((current) => ({ ...current, gpa: true }));
                  setGpaPercent(Number(event.target.value));
                  resetRecommendations();
                }}
              >
                {gpaOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </RequiredControl>
          </label>

          <label className="grid gap-1 text-[0.75rem] font-semibold text-ink">
            <LabelText>高中类型</LabelText>
            <select
              className="h-11 rounded-lg border border-ink bg-surface px-3 text-[0.85rem] font-semibold text-ink"
              value={highSchoolTier}
              onChange={(event) => {
                setHighSchoolTier(event.target.value as MobileRecommendationInput["highSchoolTier"]);
                resetRecommendations();
              }}
            >
              <option value="provincial_key">省重点</option>
              <option value="city_key">市重点</option>
              <option value="regular">普通高中</option>
              <option value="unknown">不确定</option>
            </select>
          </label>

          <label className="grid gap-1 text-[0.75rem] font-semibold text-ink">
            <LabelText>TOPIK等级</LabelText>
            <RequiredControl flashKey={requiredFlashKey} showValue={showTopikValue}>
              <select
                aria-label="TOPIK等级"
                className={`required-value-hidden h-11 w-full rounded-lg border border-ink bg-surface px-3 text-[0.85rem] font-semibold ${showTopikValue ? "text-ink" : "text-transparent"}`}
                value={topikLevel}
                onChange={(event) => {
                  setRequiredSelectionState((current) => ({ ...current, topik: true }));
                  setTopikLevel(Number(event.target.value));
                  resetRecommendations();
                }}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((level) => (
                  <option value={level} key={level}>
                    {level === 0 ? "暂无" : `${level}级`}
                  </option>
                ))}
              </select>
            </RequiredControl>
          </label>

          <label className="grid gap-1 text-[0.75rem] font-semibold text-ink">
            <LabelText>希望专业</LabelText>
            <RequiredControl flashKey={requiredFlashKey} showValue={showMajorValue}>
              <select
                aria-label="希望专业"
                className={`required-value-hidden h-11 w-full rounded-lg border border-ink bg-surface px-3 text-[0.85rem] font-semibold ${showMajorValue ? "text-ink" : "text-transparent"}`}
                value={intendedMajor}
                onChange={(event) => {
                  const nextMajor = event.target.value as MobileRecommendationInput["intendedMajor"];
                  setIntendedMajor(nextMajor);
                  setRequiredSelectionState((current) => ({ ...current, major: nextMajor !== "undecided" }));
                  if (nextMajor === "undecided") {
                    setHasGeneratedRecommendation(false);
                  }
                  setRequiredFlashKey(0);
                  resetRecommendations();
                }}
              >
                {majorOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </RequiredControl>
          </label>

          <label className="grid gap-1 text-[0.75rem] font-semibold text-ink">
            <LabelText>倾向地区</LabelText>
            <select
              className="h-11 rounded-lg border border-ink bg-surface px-3 text-[0.85rem] font-semibold text-ink"
              value={preferredRegion}
              onChange={(event) => {
                setPreferredRegion(event.target.value);
                resetRecommendations();
              }}
            >
              <option value="不限">都可以</option>
              <option value="首尔">首尔</option>
              <option value="地方">地方</option>
            </select>
          </label>

          <label className="grid gap-1 text-[0.75rem] font-semibold text-ink">
            <LabelText>学校类型</LabelText>
            <select
              className="h-11 rounded-lg border border-ink bg-surface px-3 text-[0.85rem] font-semibold text-ink"
              value={schoolTypePreference}
              onChange={(event) => {
                setSchoolTypePreference(event.target.value as MobileRecommendationInput["schoolTypePreference"]);
                resetRecommendations();
              }}
            >
              <option value="any">不限</option>
              <option value="national">国立/公立</option>
              <option value="private">私立</option>
            </select>
          </label>
        </div>

        <button
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#dff3dc] px-4 text-sm font-black text-[#004c3f] shadow-[0_6px_14px_rgba(0,98,65,0.12)] transition disabled:cursor-not-allowed disabled:bg-[#ddd8cc] disabled:text-ink/45 disabled:shadow-none"
          disabled={recommendationStatus === "loading"}
          style={hasSelectedMajor ? { boxShadow: "inset 0 0 0 1px #006241, 0 6px 14px rgba(0, 98, 65, 0.12)" } : undefined}
          type="button"
          onClick={runRecommendationAi}
        >
          <Search size={16} strokeWidth={2.4} aria-hidden="true" />
          {recommendationStatus === "loading" ? "AI计算中..." : "生成5所推荐大学"}
        </button>

        {recommendationStatus === "loading" ? (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-ink/15 bg-[#fffaf0] p-3" role="status">
            <Search className="animate-pulse text-[#0b6a4a]" size={18} strokeWidth={2.4} aria-hidden="true" />
            <div>
              <p className="text-sm font-black leading-tight text-ink">AI正在计算推荐学校</p>
              <p className="mt-1 text-[0.72rem] font-medium leading-5 text-muted">正在匹配高中均分、TOPIK和学校类型。</p>
            </div>
          </div>
        ) : null}

        {showRecommendations ? (
          <div className="mt-4 grid gap-2">
            <h2 className="text-lg font-black leading-tight">初步推荐结果</h2>
            {recommendationResults.length === 0 ? <NoDirectRecommendationGuidance /> : null}
            {recommendationResults.map((result, index) => {
              const caseCount = getAdmissionCaseSummary(result.schoolSlug).caseCount;
              const recommendationCity = primaryRecommendationCity(result.city);

              return (
                <article className="rounded-xl border border-ink/25 bg-[#fffaf0] p-3" data-testid="mobile-recommendation-card" key={result.schoolSlug}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2" data-testid="mobile-recommendation-header">
                    <span
                      className="grid size-[1.7rem] shrink-0 place-items-center rounded-full border border-[#064631] bg-[#0b6a4a] text-[0.74rem] font-black text-surface"
                      data-testid="mobile-recommendation-rank"
                    >
                      {index + 1}
                    </span>
                    <button
                      aria-label={`${result.schoolNameCn}学校信息`}
                      className="text-left transition active:translate-y-0.5"
                      type="button"
                      onClick={() => setSelectedRecommendationSheet({ slug: result.schoolSlug, mode: "info" })}
                    >
                      <h3 className="text-base font-black leading-tight underline-offset-2">{result.schoolNameCn}</h3>
                    </button>
                    <span className="text-[0.76rem] font-medium leading-tight text-muted" data-testid="mobile-recommendation-location">
                      {recommendationCity} / {result.schoolType}
                    </span>
                    <span className="rounded-full border border-[#8d79d6] bg-[#eee8ff] px-2 py-0.5 text-xs font-black text-[#3f2c84]">{result.tier}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-black ${mobileRecommendationCategoryBadgeStyle(result.category)}`}
                      data-testid="mobile-recommendation-category"
                    >
                      {result.category}
                    </span>
                    <span className="rounded-full border border-ink/45 bg-[#e6f7f7] px-2 py-0.5 text-xs font-black">{caseCount}案例</span>
                  </div>
                  <p className="mt-2 text-[0.78rem] font-medium leading-5 text-ink">{result.reason}</p>
                  <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 pt-2" data-testid="mobile-recommendation-card-actions">
                    <button
                      className="inline-flex min-h-[2.35rem] min-w-0 items-center justify-center gap-1 overflow-hidden rounded-lg bg-[#dff3dc] px-1.5 text-center text-[0.82rem] font-black leading-tight text-[#004c3f] shadow-[0_4px_10px_rgba(0,98,65,0.08)]"
                      style={{
                        boxShadow:
                          "inset 0 0 0 0.6px rgba(0, 98, 65, 0.58), 0 4px 10px rgba(0, 98, 65, 0.08)"
                      }}
                      type="button"
                      onClick={() => setSelectedRecommendationSheet({ slug: result.schoolSlug, mode: "info" })}
                    >
                      学校详情
                      <BadgeCheck size={16} strokeWidth={2.4} aria-hidden="true" />
                    </button>
                    <button
                      className="inline-flex min-h-[2.35rem] min-w-0 items-center justify-center gap-1 overflow-hidden rounded-lg border border-ink bg-[#ffd0d8] px-1.5 text-center text-[0.82rem] font-black leading-tight"
                      type="button"
                      onClick={() => setSelectedRecommendationSheet({ slug: result.schoolSlug, mode: "case" })}
                    >
                      案例画像
                      <UsersRound size={16} strokeWidth={2.4} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <MobileBottomNav activeTab="home" />
      {selectedRecommendationSchool ? (
        <RecommendedSchoolSheet
          mode={selectedRecommendationSheet?.mode ?? "info"}
          school={selectedRecommendationSchool}
          onClose={() => setSelectedRecommendationSheet(null)}
          onShowCases={() => setSelectedRecommendationSheet({ slug: selectedRecommendationSchool.slug, mode: "case" })}
        />
      ) : null}
    </section>
  );
}
