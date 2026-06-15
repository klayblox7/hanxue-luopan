"use client";

import { BookOpenCheck, ChevronRight, Route, Search } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";

import {
  recommendUniversities,
  type ApplicantProfile,
  type BudgetLevel,
  type GaokaoStrength,
  type GradeRankBand,
  type HighSchoolTier,
  type IntendedMajor,
  type RecommendationCategory,
  type SchoolTypePreference
} from "@/data/recommendations";
import { getAdmissionCaseSummary } from "@/data/admissionCases";
import { getUniversityTier } from "@/data/universityTiers";
import { UniversityCasePanel } from "./UniversitiesDirectory";

const defaultApplicant: ApplicantProfile = {
  age: 18,
  gpaPercent: 77,
  highSchoolTier: "regular",
  gradeRankBand: "top_25",
  gaokaoStrength: "not_submitted",
  topikLevel: 3,
  intendedMajor: "undecided",
  preferredRegion: "不限",
  budgetLevel: "medium",
  schoolTypePreference: "any",
  languageTrack: "korean"
};

const categoryLabels = {
  stable: "录取有望",
  match: "条件匹配",
  reach: "录取较难",
  prepare_first: "暂不符合",
  verify: "暂不符合"
};

const categoryBadgeStyles: Record<RecommendationCategory, string> = {
  stable: "border-[oklch(59%_0.14_150)] bg-[oklch(94%_0.055_150)] text-[oklch(31%_0.105_150)]",
  match: "border-[oklch(61%_0.12_230)] bg-[oklch(94%_0.045_230)] text-[oklch(34%_0.105_230)]",
  reach: "border-[oklch(66%_0.14_65)] bg-[oklch(94%_0.065_75)] text-[oklch(38%_0.105_55)]",
  prepare_first: "border-[oklch(63%_0.11_25)] bg-[oklch(94%_0.035_25)] text-[oklch(35%_0.105_25)]",
  verify: "border-[oklch(63%_0.11_25)] bg-[oklch(94%_0.035_25)] text-[oklch(35%_0.105_25)]"
};

const gpaBandOptions = [
  { label: "60分以下", value: 55 },
  { label: "60-70分", value: 65 },
  { label: "70-75分", value: 72 },
  { label: "75-80分", value: 77 },
  { label: "80-85分", value: 82 },
  { label: "85-90分", value: 88 },
  { label: "90分以上", value: 95 }
];

function RequiredControl({ children, flashKey, showValue = false }: { children: ReactNode; flashKey: number; showValue?: boolean }) {
  return (
    <span
      className={`relative block ${flashKey > 0 ? "required-field-flash" : ""}`}
      data-testid="required-control"
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
    <div className="grid gap-3 rounded-lg border border-ink bg-[#fffaf0] p-4" data-testid="no-direct-recommendation-guidance">
      <div>
        <h3 className="text-lg font-black leading-tight">当前条件暂时不适合直接推荐大学</h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          TOPIK低于3级时，直接申请本科风险较高。建议先走项目路径，或先补强韩语后再重新生成推荐。
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
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

export function AdmissionsRecommender() {
  const [applicant, setApplicant] = useState<ApplicantProfile>(defaultApplicant);
  const [submitted, setSubmitted] = useState(false);
  const [expandedSchoolSlug, setExpandedSchoolSlug] = useState<string | null>(null);
  const [requiredFlashKey, setRequiredFlashKey] = useState(0);
  const [requiredSelectionState, setRequiredSelectionState] = useState(initialRequiredSelectionState);
  const results = useMemo(() => recommendUniversities(applicant), [applicant]);
  const hasSelectedMajor = applicant.intendedMajor !== "undecided";
  const showGpaValue = requiredSelectionState.gpa || submitted;
  const showTopikValue = requiredSelectionState.topik || submitted;
  const showMajorValue = hasSelectedMajor && (requiredSelectionState.major || submitted);

  return (
    <section className="bg-paper px-3 py-4 sm:px-6 sm:py-6 lg:px-8" aria-label="韩国大学推荐">
      <div className="detail-page-container grid gap-3 sm:gap-4">
        <div className="grid gap-4">
          <div className="grid gap-3 rounded-lg border border-ink bg-surface p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-5">
            <label className="grid gap-1 text-sm font-bold">
              <LabelText>年龄</LabelText>
              <input
                className="border border-ink bg-paper px-3 py-2"
                max={30}
                min={15}
                type="number"
                value={applicant.age}
                onChange={(event) => setApplicant({ ...applicant, age: Number(event.target.value) })}
              />
            </label>

            <label className="grid gap-1 text-sm font-bold">
              <LabelText>高中均分</LabelText>
              <RequiredControl flashKey={requiredFlashKey} showValue={showGpaValue}>
                <select
                  aria-label="高中均分"
                  className={`required-value-hidden min-h-[2.75rem] w-full border border-ink bg-paper px-3 py-2 ${showGpaValue ? "text-ink" : "text-transparent"}`}
                  value={applicant.gpaPercent}
                  onChange={(event) => {
                    setRequiredSelectionState((current) => ({ ...current, gpa: true }));
                    setApplicant({ ...applicant, gpaPercent: Number(event.target.value) });
                  }}
                >
                  {gpaBandOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </RequiredControl>
            </label>

            <label className="grid gap-1 text-sm font-bold">
              <LabelText>高中类型</LabelText>
              <select
                className="border border-ink bg-paper px-3 py-2"
                value={applicant.highSchoolTier}
                onChange={(event) => setApplicant({ ...applicant, highSchoolTier: event.target.value as HighSchoolTier })}
              >
                <option value="provincial_key">省重点</option>
                <option value="city_key">市重点</option>
                <option value="regular">普通高中</option>
                <option value="unknown">不确定</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-bold">
              <LabelText>年级排名</LabelText>
              <select
                className="border border-ink bg-paper px-3 py-2"
                value={applicant.gradeRankBand}
                onChange={(event) => setApplicant({ ...applicant, gradeRankBand: event.target.value as GradeRankBand })}
              >
                <option value="top_5">前5%</option>
                <option value="top_10">前10%</option>
                <option value="top_25">前25%</option>
                <option value="middle">中游</option>
                <option value="unknown">不确定</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-bold">
              <LabelText>TOPIK等级</LabelText>
              <RequiredControl flashKey={requiredFlashKey} showValue={showTopikValue}>
                <select
                  aria-label="TOPIK等级"
                  className={`required-value-hidden min-h-[2.75rem] w-full border border-ink bg-paper px-3 py-2 ${showTopikValue ? "text-ink" : "text-transparent"}`}
                  value={applicant.topikLevel}
                  onChange={(event) => {
                    setRequiredSelectionState((current) => ({ ...current, topik: true }));
                    setApplicant({ ...applicant, topikLevel: Number(event.target.value) });
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

            <label className="grid gap-1 text-sm font-bold">
              <LabelText>高考/统考资料</LabelText>
              <select
                className="border border-ink bg-paper px-3 py-2"
                value={applicant.gaokaoStrength}
                onChange={(event) => setApplicant({ ...applicant, gaokaoStrength: event.target.value as GaokaoStrength })}
              >
                <option value="high">高分/强证明</option>
                <option value="above_tier_one">一本线以上</option>
                <option value="submitted">可提交</option>
                <option value="not_submitted">暂不提交</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-bold">
              <LabelText>希望专业</LabelText>
              <RequiredControl flashKey={requiredFlashKey} showValue={showMajorValue}>
                <select
                  aria-label="希望专业"
                  className={`required-value-hidden min-h-[2.75rem] w-full border border-ink bg-paper px-3 py-2 ${showMajorValue ? "text-ink" : "text-transparent"}`}
                  value={applicant.intendedMajor}
                  onChange={(event) => {
                    const nextMajor = event.target.value as IntendedMajor;
                    setRequiredSelectionState((current) => ({ ...current, major: nextMajor !== "undecided" }));
                    setApplicant({ ...applicant, intendedMajor: nextMajor });
                    setRequiredFlashKey(0);
                    if (nextMajor === "undecided") setSubmitted(false);
                    setExpandedSchoolSlug(null);
                  }}
                >
                  <option value="undecided">还没确定</option>
                  <option value="business">经营/商科</option>
                  <option value="computer-science">计算机/AI</option>
                  <option value="engineering">工科</option>
                  <option value="media">传媒/影视</option>
                  <option value="art-design">艺术/设计</option>
                  <option value="korean-language">韩语/教育</option>
                  <option value="tourism">酒店/旅游</option>
                  <option value="humanities">人文/外语</option>
                  <option value="science">自然科学/生命</option>
                </select>
              </RequiredControl>
            </label>

            <label className="grid gap-1 text-sm font-bold">
              <LabelText>倾向地区</LabelText>
              <select
                className="border border-ink bg-paper px-3 py-2"
                value={applicant.preferredRegion}
                onChange={(event) => setApplicant({ ...applicant, preferredRegion: event.target.value })}
              >
                <option value="不限">都可以</option>
                <option value="首尔">首尔</option>
                <option value="地方">地方</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-bold">
              <LabelText>预算</LabelText>
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

            <label className="grid gap-1 text-sm font-bold">
              <LabelText>学校类型</LabelText>
              <select
                className="border border-ink bg-paper px-3 py-2"
                value={applicant.schoolTypePreference}
                onChange={(event) =>
                  setApplicant({ ...applicant, schoolTypePreference: event.target.value as SchoolTypePreference })
                }
              >
                <option value="any">不限</option>
                <option value="national">国立/公立</option>
                <option value="private">私立</option>
              </select>
            </label>

            <div className="grid gap-2 sm:col-span-2 sm:flex sm:items-center sm:gap-3 lg:col-span-5 lg:ml-auto lg:w-[min(58rem,100%)] lg:justify-end">
              <div className="grid gap-2 text-xs leading-5 text-muted sm:mb-0.5 sm:mr-3 sm:flex-1 sm:self-end sm:text-right">
                <p className="italic">推荐结果仅用于初步选校，不代表录取保证。请以学校最新招生简章为准。</p>
              </div>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink bg-yellow px-5 py-3 text-sm font-black sm:w-fit"
                type="button"
                onClick={() => {
                  if (!hasSelectedMajor) {
                    setRequiredFlashKey((current) => current + 1);
                    return;
                  }
                  setRequiredSelectionState({ gpa: true, topik: true, major: true });
                  setSubmitted(true);
                  setExpandedSchoolSlug(null);
                }}
              >
                <Search size={16} aria-hidden="true" />
                生成5所推荐大学
              </button>
              <button
                className="inline-flex w-full items-center justify-center rounded-full border border-ink bg-[#71d39b] px-5 py-3 text-sm font-black sm:w-fit"
                type="button"
                onClick={() => {
                  setApplicant(defaultApplicant);
                  setRequiredFlashKey(0);
                  setRequiredSelectionState(initialRequiredSelectionState);
                  setSubmitted(false);
                  setExpandedSchoolSlug(null);
                }}
              >
                还原
              </button>
            </div>
          </div>

          {submitted ? (
            <div className="grid gap-3">
              <h2 className="text-xl font-black">初步推荐结果</h2>
              {results.length === 0 ? <NoDirectRecommendationGuidance /> : null}
              {results.map((result, index) => (
                <article className="rounded-lg border border-ink bg-surface p-3 sm:p-4" data-testid="recommendation-result" key={result.schoolSlug}>
                  <div className="flex items-start gap-3">
                    <span
                      aria-label={`推荐第${index + 1}位`}
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-black leading-none text-surface"
                      data-testid="recommendation-order"
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="grid gap-2 sm:flex sm:items-start sm:justify-between sm:gap-3">
                        <div>
                          <h3 className="text-lg font-black">
                            <button
                              aria-expanded={expandedSchoolSlug === result.schoolSlug}
                              className="text-left font-black underline-offset-4 hover:underline focus:underline focus:outline-none"
                              data-testid="recommendation-school-toggle"
                              type="button"
                              onClick={() =>
                                setExpandedSchoolSlug((current) => (current === result.schoolSlug ? null : result.schoolSlug))
                              }
                            >
                              {result.schoolNameCn}
                            </button>
                            <span className="ml-2 align-baseline text-[0.82em] font-black not-italic text-muted">
                              {getUniversityTier(result.schoolNameCn)}
                            </span>
                            <span className="ml-5 align-baseline text-[0.82em] font-bold text-ink">
                              {result.city} / {result.schoolType} ·{" "}
                              <span
                                className={`inline-flex rounded-full border px-2 py-0.5 text-[0.75rem] font-black leading-none ${categoryBadgeStyles[result.category]}`}
                                data-testid="recommendation-confidence"
                              >
                                {categoryLabels[result.category]}
                              </span>
                            </span>
                          </h3>
                        </div>
                        <span className="w-fit rounded-full border border-ink px-2 py-1 text-xs font-bold">
                          {result.verificationStatus}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-ink">{result.reasons.slice(1).join(" / ")}</p>
                      <p className="mt-2 text-sm leading-6 text-ink" data-testid="recommendation-cautions">
                        {result.cautions.join(" ")}
                      </p>
                      {expandedSchoolSlug === result.schoolSlug ? (
                        <div className="mt-4" data-testid="recommendation-case-panel">
                          <UniversityCasePanel
                            schoolName={result.schoolNameCn}
                            summary={getAdmissionCaseSummary(result.schoolSlug)}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
