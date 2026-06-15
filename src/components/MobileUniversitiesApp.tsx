"use client";

import {
  BadgeCheck,
  ChevronRight,
  MapPin,
  SlidersHorizontal,
  UsersRound,
  X
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { getAdmissionCaseSummary, type AdmissionCase, type AdmissionCaseSummary, type DistributionItem } from "@/data/admissionCases";
import partnerSchoolProfiles from "@/data/partner-school-profiles.json";
import { universities, type University } from "@/data/universities";
import majorTagData from "@/data/university-major-tags.json";
import { getUniversityTierProfile } from "@/data/universityTiers";

import { CampusImage } from "./CampusImage";
import { MobileBottomNav } from "./MobileBottomNav";

type SheetMode = "info" | "case";
type SchoolTypeFilter = "all" | "national" | "private";
type RegionFilter = "all" | "seoul" | "gyeonggi" | "north" | "central" | "south" | "jeju";
type TierFilter = "all" | "T1" | "T2" | "T3" | "T4" | "T5";
type MajorFilter =
  | "all"
  | "经营/商科"
  | "计算机/AI"
  | "工科"
  | "传媒/影视"
  | "艺术/设计"
  | "美妆/美容"
  | "韩语/教育"
  | "酒店/旅游"
  | "人文/外语"
  | "自然科学/生命";
type CaseFilter = "all" | "hasCases" | "manyCases";

type PreciseFilters = {
  type: SchoolTypeFilter;
  region: RegionFilter;
  tier: TierFilter;
  major: MajorFilter;
  cases: CaseFilter;
};

type MobileUniversity = University & {
  caseSummary: AdmissionCaseSummary;
  caseCount: number;
  founded: string;
  intro: string;
  tier: string;
  tierNote: string;
  tags: string[];
  filterTags: string[];
};

type SchoolProfile = {
  name?: string;
  slug: string;
  city?: string;
  type?: string;
  focus?: string;
  founded?: string;
  intro?: string;
};

const universityMajorTags = majorTagData as Record<string, string[]>;
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

const defaultPreciseFilters: PreciseFilters = {
  type: "all",
  region: "all",
  tier: "all",
  major: "all",
  cases: "all"
};

const schoolTypeFilters: Array<{ value: SchoolTypeFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "national", label: "国立" },
  { value: "private", label: "私立" }
];

const regionFilters: Array<{ value: RegionFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "seoul", label: "首尔" },
  { value: "gyeonggi", label: "京畿/仁川" },
  { value: "north", label: "北部" },
  { value: "central", label: "中部" },
  { value: "south", label: "南部" },
  { value: "jeju", label: "济州" }
];

const tierFilters: Array<{ value: TierFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "T1", label: "T1" },
  { value: "T2", label: "T2" },
  { value: "T3", label: "T3" },
  { value: "T4", label: "T4" },
  { value: "T5", label: "T5" }
];

const majorFilters: Array<{ value: MajorFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "经营/商科", label: "经营/商科" },
  { value: "计算机/AI", label: "计算机/AI" },
  { value: "工科", label: "工科" },
  { value: "传媒/影视", label: "传媒/影视" },
  { value: "艺术/设计", label: "艺术/设计" },
  { value: "美妆/美容", label: "美妆/美容" },
  { value: "韩语/教育", label: "韩语/教育" },
  { value: "酒店/旅游", label: "酒店/旅游" },
  { value: "人文/外语", label: "人文/外语" },
  { value: "自然科学/生命", label: "自然科学/生命" }
];

const caseFilters: Array<{ value: CaseFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "hasCases", label: "有案例" },
  { value: "manyCases", label: "案例10例以上" }
];

const tagRules = [
  { label: "经营/商科", keywords: ["经营", "经济", "商", "贸易", "管理", "会计"] },
  { label: "计算机/AI", keywords: ["AI", "IT", "计算机", "软件", "数据", "人工智能"] },
  { label: "工科", keywords: ["理工", "工科", "工程", "半导体", "机械", "电子"] },
  { label: "传媒/影视", keywords: ["传媒", "电影", "表演", "影视", "广告"] },
  { label: "艺术/设计", keywords: ["艺术", "设计", "美术", "音乐", "舞蹈"] },
  { label: "美妆/美容", keywords: ["美妆", "美容", "化妆", "皮肤"] },
  { label: "韩语/教育", keywords: ["韩语", "国语国文", "教育", "师范"] },
  { label: "酒店/旅游", keywords: ["酒店", "旅游", "观光", "航空"] },
  { label: "人文/外语", keywords: ["人文", "外语", "国际", "通翻译", "法学"] },
  { label: "自然科学/生命", keywords: ["自然", "生命", "医学", "护理", "药学", "生物"] }
];

function formatPercent(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function peopleCount(value?: string) {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function foreignStudentSummary(totalStudents?: string, foreignStudents?: string) {
  const total = peopleCount(totalStudents);
  const foreign = peopleCount(foreignStudents);
  if (!foreignStudents) return "资料待补";
  if (!total || !foreign) return foreignStudents;
  return `${foreignStudents} · ${formatPercent((foreign / total) * 100)}`;
}

function topSignal(items: DistributionItem[]) {
  const item = [...items]
    .filter((entry) => !/(未|暂无|unknown|无TOPIK)/i.test(entry.label))
    .sort((a, b) => b.count - a.count || b.percent - a.percent)[0];

  return item ? `${item.label.replace(/^TOPIK\s*/, "")} · ${formatPercent(item.percent)}` : "暂无";
}

function resultText(summary: AdmissionCaseSummary) {
  if (summary.caseCount === 0) return "暂无案例";
  return `录取 ${summary.admittedCount} / 拒绝 ${summary.rejectedCount}`;
}

function gpaText(summary: AdmissionCaseSummary) {
  return typeof summary.admittedAverageGpa === "number" ? `${summary.admittedAverageGpa.toFixed(1)}/100` : "暂无";
}

function applicantCaseExamples(cases: AdmissionCase[]) {
  const admitted = cases.filter((admissionCase) => admissionCase.resultKey === "admitted").slice(0, 2);
  const rejected = cases.filter((admissionCase) => admissionCase.resultKey === "rejected").slice(0, 2);
  const selectedIds = new Set([...admitted, ...rejected].map((admissionCase) => admissionCase.id));
  const fallback = cases.filter((admissionCase) => !selectedIds.has(admissionCase.id));

  return [...admitted, ...rejected, ...fallback].slice(0, 4);
}

function applicantCaseText(admissionCase: AdmissionCase) {
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

function tagsFor(university: University) {
  const seeded = universityMajorTags[university.nameCn] ?? [];
  const inferred = tagRules
    .filter((rule) => rule.keywords.some((keyword) => university.focus.includes(keyword)))
    .map((rule) => rule.label);

  return [...new Set([...seeded, ...inferred])];
}

function rankTier(tier: string) {
  const value = Number(tier.replace("T", ""));
  return Number.isFinite(value) ? value : 99;
}

function mobileSchoolProfile(university: University) {
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

export function buildMobileUniversities(): MobileUniversity[] {
  return universities
    .map((university) => {
      const tierProfile = getUniversityTierProfile(university.nameCn);
      const caseSummary = getAdmissionCaseSummary(university.slug);
      const profile = mobileSchoolProfile(university);
      const filterTags = tagsFor(university);
      const tags = filterTags.slice(0, 3);

      return {
        ...university,
        caseSummary,
        caseCount: caseSummary.caseCount,
        founded: profile.founded,
        intro: profile.intro,
        tier: tierProfile.tier,
        tierNote: tierProfile.note,
        tags,
        filterTags
      };
    })
    .sort((a, b) => rankTier(a.tier) - rankTier(b.tier) || b.caseCount - a.caseCount || a.no - b.no);
}

function matchesRegion(university: MobileUniversity, region: RegionFilter) {
  if (region === "all") return true;
  const city = university.city;
  if (region === "seoul") return city.includes("首尔");
  if (region === "gyeonggi") return ["仁川", "水原", "城南", "龙仁", "富川", "高阳", "安山", "军浦", "安城", "ERICA"].some((keyword) => city.includes(keyword));
  if (region === "north") return ["江原", "春川"].some((keyword) => city.includes(keyword));
  if (region === "central") return ["大田", "清州", "忠清", "天安", "牙山", "世宗"].some((keyword) => city.includes(keyword));
  if (region === "south") return ["釜山", "大邱", "光州", "庆山", "全州", "蔚山", "浦项", "益山", "全南", "全北"].some((keyword) => city.includes(keyword));
  return city.includes("济州");
}

function matchesPreciseFilters(university: MobileUniversity, filters: PreciseFilters) {
  if (filters.type === "national" && !(university.type.includes("国立") || university.type.includes("公立"))) return false;
  if (filters.type === "private" && !university.type.includes("私立")) return false;
  if (!matchesRegion(university, filters.region)) return false;
  if (filters.tier !== "all" && university.tier !== filters.tier) return false;
  if (filters.major !== "all" && !university.filterTags.includes(filters.major)) return false;
  if (filters.cases === "hasCases" && university.caseCount <= 0) return false;
  if (filters.cases === "manyCases" && university.caseCount < 10) return false;
  return true;
}

function hasPreciseFilters(filters: PreciseFilters) {
  return Object.entries(filters).some(([key, value]) => defaultPreciseFilters[key as keyof PreciseFilters] !== value);
}

function MetricPill({ label, labelPlacement = "top", value }: { label: string; labelPlacement?: "bottomRight" | "top"; value: string }) {
  if (labelPlacement === "bottomRight") {
    return (
      <div className="grid min-h-[3.7rem] grid-cols-[minmax(0,1fr)_auto] items-end rounded-lg border border-ink/15 bg-[#fffaf0] px-3 py-2">
        <p className="min-w-0 text-[0.92rem] font-black leading-tight text-ink">{value}</p>
        <p className="self-end justify-self-end pl-2 text-[0.68rem] font-black leading-none text-muted">{label}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink/15 bg-[#fffaf0] px-3 py-2">
      <p className="text-[0.68rem] font-black text-muted">{label}</p>
      <p className="mt-1 text-[0.92rem] font-black leading-tight text-ink">{value}</p>
    </div>
  );
}

function CompactBars({ title, items }: { title: string; items: DistributionItem[] }) {
  const visibleItems = items.slice(0, 4);

  return (
    <section className="rounded-lg border border-ink/15 bg-surface p-3">
      <h3 className="text-sm font-black">{title}</h3>
      <div className="mt-3 grid gap-2">
        {visibleItems.map((item) => (
          <div className="grid gap-1" key={`${title}-${item.key}`}>
            <div className="flex items-center justify-between gap-2 text-xs font-bold">
              <span className="truncate">{item.label.replace(/^TOPIK\s*/, "")}</span>
              <span className="shrink-0">{formatPercent(item.percent)}</span>
            </div>
            <div className="h-2 rounded-full border border-ink/25 bg-[#ebe8de]">
              <div className="h-full rounded-full bg-[#ffe07a]" style={{ width: `${Math.max(item.percent, item.count ? 4 : 0)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FilterOptionButton<T extends string>({
  active,
  label,
  onSelect,
  value
}: {
  active: boolean;
  label: string;
  onSelect: (value: T) => void;
  value: T;
}) {
  return (
    <button
      aria-pressed={active}
      className={`min-h-10 rounded-full border border-ink px-3 text-sm font-black transition active:translate-y-0.5 ${
        active ? "bg-[#b8a4ed]" : "bg-surface"
      }`}
      type="button"
      onClick={() => onSelect(value)}
    >
      {label}
    </button>
  );
}

function FilterGroup<T extends string>({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  value: T;
}) {
  return (
    <section>
      <h3 className="text-sm font-black leading-tight">{label}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <FilterOptionButton
            active={value === option.value}
            key={`${label}-${option.value}`}
            label={option.label}
            value={option.value}
            onSelect={onChange}
          />
        ))}
      </div>
    </section>
  );
}

function PreciseFilterSheet({
  filters,
  onChange,
  onClose,
  onReset,
  resultCount
}: {
  filters: PreciseFilters;
  onChange: <K extends keyof PreciseFilters>(key: K, value: PreciseFilters[K]) => void;
  onClose: () => void;
  onReset: () => void;
  resultCount: number;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-ink/35 px-3 pb-3 pt-[10dvh] md:hidden" onClick={onClose}>
      <section
        aria-label="精准筛选"
        aria-modal="true"
        className="mx-auto flex max-h-[88dvh] w-full max-w-[26rem] flex-col overflow-hidden rounded-t-2xl border border-ink bg-[#f5f3ed] shadow-[0_-18px_46px_rgba(10,10,10,0.22)]"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink/10 bg-surface px-4 py-3">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#0b6a4a]">Desktop filters</p>
            <h2 className="mt-1 text-2xl font-black leading-tight">精准筛选</h2>
            <p className="mt-1 text-xs font-bold text-muted">按桌面版完整维度筛大学。</p>
          </div>
          <button
            aria-label="关闭筛选"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-ink bg-paper text-ink"
            type="button"
            onClick={onClose}
          >
            <X size={18} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-4 overflow-y-auto px-4 py-4">
          <FilterGroup label="学校类型" options={schoolTypeFilters} value={filters.type} onChange={(value) => onChange("type", value)} />
          <FilterGroup label="地区" options={regionFilters} value={filters.region} onChange={(value) => onChange("region", value)} />
          <FilterGroup label="学校等级" options={tierFilters} value={filters.tier} onChange={(value) => onChange("tier", value)} />
          <FilterGroup label="专业方向" options={majorFilters} value={filters.major} onChange={(value) => onChange("major", value)} />
          <FilterGroup label="案例" options={caseFilters} value={filters.cases} onChange={(value) => onChange("cases", value)} />
        </div>

        <div className="grid grid-cols-[0.72fr_1fr] gap-2 border-t border-ink/10 bg-surface p-3">
          <button className="min-h-11 rounded-xl border border-ink bg-paper px-3 text-sm font-black" type="button" onClick={onReset}>
            重置
          </button>
          <button className="min-h-11 rounded-xl border border-ink bg-[#71d39b] px-3 text-sm font-black" type="button" onClick={onClose}>
            查看{resultCount}所学校
          </button>
        </div>
      </section>
    </div>
  );
}

export function UniversitySheet({
  mode,
  onShowCases,
  school,
  onClose
}: {
  mode: SheetMode;
  onShowCases: () => void;
  school: MobileUniversity;
  onClose: () => void;
}) {
  const label = school.nameCn;
  const summary = school.caseSummary;
  const applicantExamples = applicantCaseExamples(summary.representativeCases);

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-ink/35 px-3 pb-3 pt-[14dvh] md:hidden" onClick={onClose}>
      <section
        aria-label={label}
        aria-modal="true"
        className="mx-auto flex max-h-[82dvh] w-full max-w-[26rem] flex-col overflow-hidden rounded-t-2xl border border-ink bg-[#f5f3ed] shadow-[0_-18px_46px_rgba(10,10,10,0.22)]"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink/10 bg-surface px-4 py-3">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#0b6a4a]">{mode === "info" ? "School detail" : "Admission evidence"}</p>
            <h2 className="mt-1 text-2xl font-black leading-tight">{label}</h2>
            <p className="mt-1 truncate text-xs font-bold text-muted">
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
                {[school.tier, school.city, school.type, `${school.caseCount}案例`].map((item) => (
                  <span className="rounded-full border border-ink bg-surface px-3 py-1 text-xs font-black" key={item}>
                    {item}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MetricPill label="学生数" value={school.totalStudents || "资料待补"} />
                <MetricPill label="外国学生" value={foreignStudentSummary(school.totalStudents, school.foreignStudents)} />
                <MetricPill label="宿舍容量" value={school.dormitoryCapacity || "资料待补"} />
                <MetricPill label="宿舍覆盖" value={school.dormitoryRate || "资料待补"} />
                <MetricPill label="申请层级" value={`${school.tier} · ${school.tierNote}`} />
                <MetricPill label="TOPIK画像" value={topSignal(summary.topikDistribution)} />
              </div>
              <section className="rounded-lg border border-ink bg-surface p-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="shrink-0 text-sm font-black">重点方向</h3>
                  <p className="min-w-0 flex-1 text-right text-[0.78rem] font-medium leading-5 text-muted" data-testid="mobile-university-focus">
                    {school.focus}
                  </p>
                </div>
                <div className="mt-3 border-t border-ink/10 pt-3" data-testid="mobile-university-intro">
                  <p className="text-xs font-black text-ink">成立时间：{school.founded}</p>
                  <p className="mt-2 text-[0.78rem] font-medium leading-6 text-muted">{school.intro}</p>
                </div>
              </section>
              <div className="grid grid-cols-2 gap-2">
                <button className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-ink bg-[#71d39b] px-3 text-sm font-black text-ink" type="button" onClick={onShowCases}>
                  案例画像
                  <ChevronRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </button>
                <Link className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-ink bg-[#ffe07a] px-3 text-sm font-black text-ink" href="/cost">
                  费用预算
                  <ChevronRight size={16} strokeWidth={2.4} aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-2">
                <MetricPill label="样本量" value={`${summary.caseCount}例`} />
                <MetricPill label="录取均分" value={gpaText(summary)} />
                <MetricPill label="TOPIK主段" value={topSignal(summary.topikDistribution)} />
                <MetricPill label="结果" value={resultText(summary)} />
              </div>
              <CompactBars title="TOPIK分布" items={summary.topikDistribution} />
              <section className="rounded-xl border border-ink/15 bg-surface p-3" aria-label="申请者具体案例">
                <h3 className="text-sm font-black">申请者具体案例</h3>
                <ul className="mt-3 grid gap-2">
                  {applicantExamples.map((admissionCase) => (
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
                      <p className="mt-2 text-sm font-normal leading-6 text-ink">{applicantCaseText(admissionCase)}</p>
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

export function MobileUniversitiesApp() {
  const [preciseFilters, setPreciseFilters] = useState<PreciseFilters>(defaultPreciseFilters);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(8);
  const [sheet, setSheet] = useState<{ slug: string; mode: SheetMode } | null>(null);
  const schools = useMemo(() => buildMobileUniversities(), []);
  const hasActivePreciseFilters = hasPreciseFilters(preciseFilters);

  const filteredSchools = useMemo(() => {
    return schools.filter((school) => matchesPreciseFilters(school, preciseFilters));
  }, [preciseFilters, schools]);

  const visibleSchools = filteredSchools.slice(0, visibleLimit);
  const selectedSchool = sheet ? schools.find((school) => school.slug === sheet.slug) : undefined;

  const changePreciseFilter = <K extends keyof PreciseFilters>(key: K, value: PreciseFilters[K]) => {
    setPreciseFilters((current) => ({ ...current, [key]: value }));
    setVisibleLimit(8);
    setSheet(null);
  };

  const resetPreciseFilters = () => {
    setPreciseFilters(defaultPreciseFilters);
    setVisibleLimit(8);
    setSheet(null);
  };

  return (
    <section
      className="mobile-app-shell mx-auto min-h-screen w-full max-w-[430px] overflow-x-hidden bg-[#f5f3ed] pb-[calc(6rem+env(safe-area-inset-bottom))] text-ink md:hidden"
      aria-label="韩国大学库移动端小程序"
    >
      <main className="w-full max-w-full overflow-hidden px-4 pt-4">
        <section className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-muted">当前结果</p>
            <h2 className="text-xl font-black leading-tight">{filteredSchools.length}所学校</h2>
          </div>
          <button
            aria-expanded={isFilterSheetOpen}
            className={`inline-flex min-h-10 items-center gap-1 rounded-full border border-ink px-3 py-2 text-xs font-black active:translate-y-0.5 ${
              hasActivePreciseFilters ? "bg-[#b8a4ed]" : "bg-surface"
            }`}
            type="button"
            onClick={() => {
              setIsFilterSheetOpen(true);
              setSheet(null);
            }}
          >
            <SlidersHorizontal size={15} strokeWidth={2.35} aria-hidden="true" />
            精准筛选
          </button>
        </section>

        <div className="grid gap-2.5">
          {visibleSchools.map((school) => (
            <article className="max-w-full overflow-hidden rounded-xl border border-ink bg-surface p-3 shadow-[0_8px_24px_rgba(10,10,10,0.07)]" aria-label={`${school.nameCn}大学卡片`} key={school.slug}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-[1.18rem] font-black leading-tight">{school.nameCn}</h3>
                  <p className="mt-0.5 truncate text-[0.71rem] font-bold text-muted">{school.nameKr} · {school.nameEn}</p>
                </div>
                <span className="shrink-0 rounded-full border border-ink bg-[#ffe07a] px-2 py-0.5 text-[0.83rem] font-black">{school.tier}</span>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-ink/45 bg-paper px-2 py-0.5 text-[0.71rem] font-black">
                  <MapPin size={12} strokeWidth={2.4} aria-hidden="true" />
                  {school.city}
                </span>
                <span className="rounded-full border border-ink/45 bg-paper px-2 py-0.5 text-[0.71rem] font-black">{school.type}</span>
                <span className="rounded-full border border-ink/45 bg-[#e6f7f7] px-2 py-0.5 text-[0.71rem] font-black">{school.caseCount}案例</span>
              </div>

              <p className="mt-2 line-clamp-2 text-[0.83rem] font-bold leading-5 text-muted">{school.focus}</p>

              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 pt-1.5" data-testid="university-card-actions">
                <button
                  className="inline-flex min-h-[2rem] min-w-0 items-center justify-center gap-1 overflow-hidden rounded-lg bg-[#dff3dc] px-1.5 text-center text-[0.78rem] font-black leading-tight text-[#004c3f] shadow-[0_4px_10px_rgba(0,98,65,0.08)]"
                  style={{
                    boxShadow:
                      "inset 0 0 0 0.6px rgba(0, 98, 65, 0.58), 0 4px 10px rgba(0, 98, 65, 0.08)"
                  }}
                  type="button"
                  onClick={() => setSheet({ slug: school.slug, mode: "info" })}
                >
                  学校详情
                  <BadgeCheck size={14} strokeWidth={2.4} aria-hidden="true" />
                </button>
                <button
                  className="inline-flex min-h-[2rem] min-w-0 items-center justify-center gap-1 overflow-hidden rounded-lg border border-ink bg-[#ffd0d8] px-1.5 text-center text-[0.78rem] font-black leading-tight"
                  type="button"
                  onClick={() => setSheet({ slug: school.slug, mode: "case" })}
                >
                  案例画像
                  <UsersRound size={14} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {visibleSchools.length < filteredSchools.length ? (
          <button
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl border border-ink bg-surface text-base font-black"
            type="button"
            onClick={() => setVisibleLimit((current) => current + 8)}
          >
            查看更多
          </button>
        ) : null}

        {filteredSchools.length === 0 ? (
          <div className="rounded-xl border border-ink bg-surface p-5 text-center">
            <p className="text-lg font-black">没有匹配学校</p>
            <p className="mt-2 text-sm font-bold text-muted">换一个学校名、城市或专业方向试试。</p>
          </div>
        ) : null}
      </main>

      <MobileBottomNav activeTab="universities" />

      {isFilterSheetOpen ? (
        <PreciseFilterSheet
          filters={preciseFilters}
          resultCount={filteredSchools.length}
          onChange={changePreciseFilter}
          onClose={() => setIsFilterSheetOpen(false)}
          onReset={resetPreciseFilters}
        />
      ) : null}

      {selectedSchool && sheet ? (
        <UniversitySheet
          mode={sheet.mode}
          school={selectedSchool}
          onClose={() => setSheet(null)}
          onShowCases={() => setSheet({ slug: selectedSchool.slug, mode: "case" })}
        />
      ) : null}
    </section>
  );
}
