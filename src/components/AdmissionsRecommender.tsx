"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  recommendUniversities,
  type ApplicantProfile,
  type BudgetLevel,
  type GaokaoStrength,
  type GradeRankBand,
  type HighSchoolTier,
  type IntendedMajor,
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
  stable: "较有希望",
  match: "适合申请",
  reach: "冲刺申请",
  prepare_first: "先补条件",
  verify: "需确认"
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

export function AdmissionsRecommender() {
  const [applicant, setApplicant] = useState<ApplicantProfile>(defaultApplicant);
  const [submitted, setSubmitted] = useState(false);
  const [expandedSchoolSlug, setExpandedSchoolSlug] = useState<string | null>(null);
  const results = useMemo(() => recommendUniversities(applicant), [applicant]);

  return (
    <section className="border-y border-ink bg-paper px-3 py-4 sm:px-6 sm:py-6 lg:px-8" aria-label="韩国大学推荐">
      <div className="detail-page-container grid gap-3 sm:gap-4">
        <div className="grid gap-4">
          <div className="grid gap-3 rounded-lg border border-ink bg-surface p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-5">
            <label className="grid gap-1 text-sm font-bold">
              年龄
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
              高中均分
              <select
                className="border border-ink bg-paper px-3 py-2"
                value={applicant.gpaPercent}
                onChange={(event) => setApplicant({ ...applicant, gpaPercent: Number(event.target.value) })}
              >
                {gpaBandOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm font-bold">
              高中类型
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
              年级排名
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
              高考/统考资料
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
                <option value="korean-language">韩语/教育</option>
                <option value="tourism">酒店/旅游</option>
                <option value="humanities">人文/外语</option>
                <option value="science">自然科学/生命</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-bold">
              倾向地区
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

            <label className="grid gap-1 text-sm font-bold">
              学校类型
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
              <p className="text-xs italic leading-5 text-muted sm:mb-0.5 sm:mr-3 sm:flex-1 sm:self-end sm:text-right">
                推荐结果仅用于初步选校，不代表录取保证。请以学校最新招生简章为准。
              </p>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink bg-yellow px-5 py-3 text-sm font-black sm:w-fit"
                type="button"
                onClick={() => {
                  setSubmitted(true);
                  setExpandedSchoolSlug(null);
                }}
              >
                <Search size={16} aria-hidden="true" />
                生成7所推荐大学
              </button>
              <button
                className="inline-flex w-full items-center justify-center rounded-full border border-ink bg-[#71d39b] px-5 py-3 text-sm font-black sm:w-fit"
                type="button"
                onClick={() => {
                  setApplicant(defaultApplicant);
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
                              <span className="text-[#9f1d1d]" data-testid="recommendation-confidence">
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
