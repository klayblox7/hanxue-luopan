"use client";

import { BadgeCheck, ChevronRight, Search, UsersRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import partnerSchoolProfiles from "@/data/partner-school-profiles.json";
import { universities, type University } from "@/data/universities";
import { getUniversityTierProfile } from "@/data/universityTiers";
import { getAdmissionCaseSummary, type AdmissionCase, type AdmissionCaseSummary, type DistributionItem } from "@/data/admissionCases";
import {
  getMobileRecommendationResults,
  mobileHomeActions,
  type MobileBudgetLevel,
  type MobileHomeAction,
  type MobileRecommendationInput
} from "@/data/mobileHome";
import { assetPath } from "@/data/assetPath";
import { CampusImage } from "@/components/CampusImage";
import { MobileBottomNav } from "@/components/MobileBottomNav";

function MobileHomeActionLink({ action }: { action: MobileHomeAction }) {
  return (
    <Link className="grid min-w-0 justify-items-center gap-1.5 px-1 text-center text-ink transition active:translate-y-0.5" href={action.href}>
      <span
        className="flex"
        style={{
          alignItems: "center",
          height: "7.1rem",
          justifyContent: "center",
          maxWidth: "8.2rem",
          overflow: "visible",
          width: "100%"
        }}
      >
        <Image
          alt={action.imageAlt}
          className="drop-shadow-[0_8px_12px_rgba(10,10,10,0.08)]"
          height={123}
          sizes="8.2rem"
          src={action.imageSrc}
          style={{ height: "100%", objectFit: "contain", width: "100%" }}
          width={164}
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
    <div className="fixed inset-0 z-50 bg-ink/35 px-3 pb-3 pt-[14dvh] md:hidden" onClick={onClose}>
      <section
        aria-label={school.nameCn}
        aria-modal="true"
        className="ml-auto flex max-h-[82dvh] w-full max-w-[26rem] flex-col overflow-hidden rounded-t-2xl border border-ink bg-[#f5f3ed] shadow-[0_-18px_46px_rgba(10,10,10,0.22)]"
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
  const [gpaPercent, setGpaPercent] = useState(77);
  const [highSchoolTier, setHighSchoolTier] = useState<MobileRecommendationInput["highSchoolTier"]>("regular");
  const [topikLevel, setTopikLevel] = useState(0);
  const [budgetLevel, setBudgetLevel] = useState<MobileBudgetLevel>("medium");
  const [intendedMajor, setIntendedMajor] = useState<MobileRecommendationInput["intendedMajor"]>("undecided");
  const [preferredRegion, setPreferredRegion] = useState("不限");
  const [schoolTypePreference, setSchoolTypePreference] = useState<MobileRecommendationInput["schoolTypePreference"]>("any");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendationStatus, setRecommendationStatus] = useState<"idle" | "loading" | "result">("idle");
  const [selectedRecommendationSheet, setSelectedRecommendationSheet] = useState<{ slug: string; mode: RecommendedSheetMode } | null>(null);
  const recommendationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recommendationResults = useMemo(
    () =>
      getMobileRecommendationResults({
        gpaPercent,
        highSchoolTier,
        topikLevel,
        intendedMajor,
        preferredRegion,
        budgetLevel,
        schoolTypePreference
      }),
    [budgetLevel, gpaPercent, highSchoolTier, intendedMajor, preferredRegion, schoolTypePreference, topikLevel]
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

  const resetRecommendations = () => {
    clearRecommendationTimer();
    setRecommendationStatus("idle");
    setShowRecommendations(false);
  };

  const runRecommendationAi = () => {
    clearRecommendationTimer();
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
    <section className="min-h-screen bg-[#f5f3ed] pb-[calc(5.8rem+env(safe-area-inset-bottom))] md:hidden" aria-label="KOREA UNIVERSITY LINK移动端小程序首页">
      <div
        className="relative isolate min-h-[15rem] overflow-hidden bg-[#073f2d] px-6 pb-10 pt-8 text-[#fbfbf8]"
        data-testid="mobile-home-hero"
      >
        <Image
          alt="韩国留学小程序首页横幅"
          className="z-0 origin-left scale-[1.32] object-cover object-[62%_center] opacity-80"
          fill
          priority
          sizes="100vw"
          src={assetPath("/mobile-mini-program/home-hero-mobile.png")}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#073f2d]/96 via-[#073f2d]/62 to-[#f5f3ed]" />
        <div className="absolute inset-y-0 left-0 z-10 w-[82%] bg-gradient-to-r from-[#073f2d] via-[#073f2d]/92 to-[#073f2d]/10" />
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

          <div className="mt-4 rounded-xl bg-surface">
            <div className="grid grid-cols-3 gap-y-4 border-b border-ink/10 pb-4">
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
            高中均分
            <select
              className="h-11 rounded-lg border border-ink bg-surface px-3 text-[0.85rem] font-semibold text-ink"
              value={gpaPercent}
              onChange={(event) => {
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
          </label>

          <label className="grid gap-1 text-[0.75rem] font-semibold text-ink">
            高中类型
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
            TOPIK等级
            <select
              className="h-11 rounded-lg border border-ink bg-surface px-3 text-[0.85rem] font-semibold text-ink"
              value={topikLevel}
              onChange={(event) => {
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
          </label>

          <label className="grid gap-1 text-[0.75rem] font-semibold text-ink">
            希望专业
            <select
              className="h-11 rounded-lg border border-ink bg-surface px-3 text-[0.85rem] font-semibold text-ink"
              value={intendedMajor}
              onChange={(event) => {
                setIntendedMajor(event.target.value as MobileRecommendationInput["intendedMajor"]);
                resetRecommendations();
              }}
            >
              {majorOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-[0.75rem] font-semibold text-ink">
            倾向地区
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
            预算
            <select
              className="h-11 rounded-lg border border-ink bg-surface px-3 text-[0.85rem] font-semibold text-ink"
              value={budgetLevel}
              onChange={(event) => {
                setBudgetLevel(event.target.value as MobileBudgetLevel);
                resetRecommendations();
              }}
            >
              <option value="low">尽量低</option>
              <option value="medium">中等</option>
              <option value="high">较充足</option>
            </select>
          </label>

          <label className="col-span-2 grid gap-1 text-[0.75rem] font-semibold text-ink">
            学校类型
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
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-ink bg-[#ffe07a] px-4 text-sm font-black text-ink"
          disabled={recommendationStatus === "loading"}
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
              <p className="mt-1 text-[0.72rem] font-medium leading-5 text-muted">正在匹配成绩、TOPIK、专业、预算和地区。</p>
            </div>
          </div>
        ) : null}

        {showRecommendations ? (
          <div className="mt-4 grid gap-2">
            <h2 className="text-lg font-black leading-tight">初步推荐结果</h2>
            {recommendationResults.map((result, index) => (
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
                      {result.city} / {result.schoolType}
                    </span>
                    <span className="rounded-full border border-ink bg-[#ffd0d8] px-2 py-0.5 text-xs font-black">{result.tier}</span>
                    <span className="rounded-full border border-ink bg-surface px-2 py-0.5 text-xs font-black">{result.category}</span>
                  </div>
                  <p className="mt-2 text-[0.78rem] font-medium leading-5 text-ink">{result.reason}</p>
                  <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 border-t border-ink/10 pt-2" data-testid="mobile-recommendation-card-actions">
                    <button
                      className="inline-flex min-h-[2.35rem] min-w-0 items-center justify-center gap-1 overflow-hidden rounded-lg border border-ink bg-[#eef8df] px-1.5 text-center text-[0.82rem] font-black leading-tight"
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
            ))}
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
