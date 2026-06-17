"use client";

import { Fragment, type ReactNode, useMemo, useState } from "react";

import { getAdmissionCaseSummary, type AdmissionCaseSummary, type DistributionItem } from "@/data/admissionCases";
import { assetPath } from "@/data/assetPath";
import partnerSchoolProfiles from "@/data/partner-school-profiles.json";
import { universityAlumniText } from "@/data/universityAlumni";
import { universityFoundedYear } from "@/data/universityFoundedYears";
import { universities } from "@/data/universities";
import majorTagData from "@/data/university-major-tags.json";
import { getUniversityTierProfile } from "@/data/universityTiers";

type Zone = {
  key: string;
  label: string;
  cities: string[];
};

type MajorTag = {
  label: string;
  className: string;
};

type SchoolProfile = {
  name?: string;
  slug: string;
  nameKr?: string;
  nameEn?: string;
  city?: string;
  type?: string;
  focus?: string;
  founded?: string;
  totalStudents?: string;
  foreignStudents?: string;
  campusImage?: string;
  imagePosition?: string;
  intro?: string;
  officialUrl?: string;
  logoImage?: string;
};

const zones: Zone[] = [
  { key: "seoul", label: "首尔", cities: ["首尔"] },
  { key: "gyeonggi", label: "京畿道", cities: ["水原", "安城", "龙仁", "城南", "富川", "高阳", "仁川", "军浦", "安山", "抱川", "华城", "杨州", "议政府", "东豆川", "ERICA"] },
  { key: "north", label: "北部", cities: ["春川", "原州", "高城"] },
  { key: "central", label: "中部", cities: ["大田", "世宗", "清州", "天安", "牙山", "公州", "礼山", "论山", "锦山", "镇川"] },
  { key: "south", label: "南部", cities: ["釜山", "大邱", "光州", "蔚山", "全州", "庆山", "浦项", "益山", "完州", "罗州", "群山", "顺天", "龟尾", "昌原", "金海", "安东", "庆州"] },
  { key: "jeju", label: "济州岛", cities: ["济州"] }
];

const tagStyles: Record<string, string> = {
  "经营/商科": "bg-[#f6e77d]",
  "计算机/AI": "bg-[#a9dccd]",
  工科: "bg-[#e5edff]",
  "传媒/影视": "bg-[#dfc8f4]",
  "艺术/设计": "bg-[#f2c6d5]",
  "美妆/美容": "bg-[#ffd6e7]",
  "韩语/教育": "bg-[#cdebdc]",
  "酒店/旅游": "bg-[#f5d7b8]",
  "人文/外语": "bg-[#fffefb]",
  "自然科学/生命": "bg-[#ccecf0]"
};

const majorFilterLabels = Object.keys(tagStyles);
const tierFilterLabels = ["T1", "T2", "T3", "T4", "T5"] as const;
const universityMajorTags = majorTagData as Record<string, string[]>;
const caseBarColor = "#d8d6cf";
const caseHighlightColor = "#ffe07a";
const typedSchoolProfiles = partnerSchoolProfiles as SchoolProfile[];
const schoolProfilesBySlug = new Map(typedSchoolProfiles.map((profile) => [profile.slug, profile]));
const genericPartnerFocus = "\u5408\u4f5c\u9879\u76ee\u76f8\u5173\u4e13\u4e1a";

const supplementalProfilesBySlug: Record<string, Partial<SchoolProfile>> = {
  "seoul-national-university": {
    founded: "1946年",
    campusImage: "public/campus-images/seoul-national-university.jpg",
    imagePosition: "center 48%",
    officialUrl: "https://www.snu.ac.kr",
    logoImage: "public/school-logos/seoul-national-university.svg",
    intro:
      "首尔大学位于首尔，成立时间为1946年，是一所国立院校。该校在本项目库中主要用于综合研究、理工、人文社科方向的匹配参考，建议结合项目模式、韩语要求、学费与所在城市生活成本一起判断是否适合申请。"
  }
};

function publicAssetPath(value?: string) {
  if (!value) return "";
  return assetPath(value.startsWith("public/") ? `/${value.replace(/^public\//, "")}` : value);
}

const tagRules = [
  { label: "经营/商科", keywords: ["经营", "经济", "商", "贸易", "创业", "管理", "会计", "通商", "房地产"] },
  { label: "计算机/AI", keywords: ["AI", "IT", "计算机", "软件", "数据", "人工智能", "机器人"] },
  { label: "工科", keywords: ["理工", "工科", "工程", "半导体", "建筑", "造船", "航空", "机械", "电子", "科学技术", "实用", "海洋", "水产", "产业"] },
  { label: "传媒/影视", keywords: ["传媒", "电影", "表演", "影视", "广告", "动画", "内容", "影像"] },
  { label: "艺术/设计", keywords: ["艺术", "设计", "美术", "音乐", "舞蹈", "戏剧"] },
  { label: "美妆/美容", keywords: ["美妆", "美容", "美发", "化妆", "化妆品", "彩妆", "护肤", "皮肤美容", "美甲", "K-Beauty", "K뷰티", "뷰티", "미용", "화장품", "메이크업", "헤어", "네일", "피부"] },
  { label: "韩语/教育", keywords: ["韩语", "国语国文", "教育", "师范", "女子名校"] },
  { label: "酒店/旅游", keywords: ["酒店", "旅游", "观光"] },
  { label: "人文/外语", keywords: ["人文", "外语", "国际", "地域", "通翻译", "法学", "心理", "政治", "社科", "佛教", "英语"] },
  { label: "自然科学/生命", keywords: ["自然", "生命", "医学", "护理", "药学", "保健", "兽医", "食品", "农业", "生态", "森林", "生物", "韩医学"] }
];

const tierOrder = new Map([
  ["T1", 1],
  ["T2", 2],
  ["T3", 3],
  ["T4", 4],
  ["T5", 5]
]);

const zoneOrder = new Map(zones.map((zone, index) => [zone.key, index]));

function tierFor(nameCn: string) {
  return getUniversityTierProfile(nameCn);
}

function primaryCityForZone(city: string) {
  return city.split("/")[0]?.trim() || city;
}

function zonesForCity(city: string) {
  const primaryCity = primaryCityForZone(city);
  const matches = zones
    .filter((zone) => zone.cities.some((cityName) => primaryCity.includes(cityName)))
    .map((zone) => zone.key);
  return [...new Set(matches.length > 0 ? matches : ["unknown"])];
}

function tagsFor(nameCn: string, focus: string): MajorTag[] {
  const seededTags = universityMajorTags[nameCn] ?? [];
  const inferredTags = tagRules
    .filter((rule) => rule.keywords.some((keyword) => focus.includes(keyword)))
    .map((rule) => rule.label);
  const labels = [...new Set([...seededTags, ...inferredTags])]
    .filter((label) => tagStyles[label])
    .slice(0, 5);

  return labels.length > 0
    ? labels.map((label) => ({ label, className: tagStyles[label] }))
    : [{ label: "还没确定", className: "bg-[#eeeae0]" }];
}

function cityLines(city: string) {
  const parts = city.split("/");
  if (parts.length < 2) return [city];
  return parts.map((part, index) => `${part}${index === 0 ? " /" : ""}`);
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
  const percent = ((foreign / total) * 100).toFixed(1).replace(/\.0$/, "");
  return `${foreignStudents}, ${percent}%`;
}

function schoolInfoProfile(university: (typeof universities)[number]) {
  const profile = schoolProfilesBySlug.get(university.slug) ?? {};
  const supplemental = supplementalProfilesBySlug[university.slug] ?? {};
  const merged = { ...profile, ...supplemental };
  const tier = tierFor(university.nameCn).tier;
  const founded = merged.founded || universityFoundedYear(university.slug) || "资料待补";
  const city = merged.city || university.city;
  const type = merged.type || university.type;
  const hasGenericPartnerFocus = merged.focus === genericPartnerFocus;
  const focus = hasGenericPartnerFocus ? university.focus : merged.focus || university.focus;

  return {
    name: merged.name || university.nameCn,
    nameKr: merged.nameKr || university.nameKr,
    nameEn: merged.nameEn || university.nameEn,
    city,
    type,
    focus,
    founded,
    students: merged.totalStudents || university.totalStudents || "资料待补",
    internationalStudents: merged.foreignStudents
      ? `外国人 ${merged.foreignStudents}`
      : university.foreignStudents
        ? `外国人 ${university.foreignStudents}`
        : "",
    tier,
    campusImage: publicAssetPath(merged.campusImage),
    imagePosition: merged.imagePosition || "center",
    intro:
      (!hasGenericPartnerFocus && merged.intro) ||
      `${university.nameCn}位于${city}，成立时间为${founded}，是一所${type}院校。该校在本项目库中主要用于${focus}方向的匹配参考，建议结合项目模式、韩语要求、学费与所在城市生活成本一起判断是否适合申请。`,
    officialUrl: merged.officialUrl || "",
    logoImage: publicAssetPath(merged.logoImage),
    alumni: universityAlumniText(university.slug)
  };
}

function formatCasePercent(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function formatAverageGpa(value: number | null) {
  return typeof value === "number" ? `${value.toFixed(1)}/100` : "暂无";
}

function topCaseSignal(items: DistributionItem[]) {
  const mostCommon = [...items].sort((a, b) => b.count - a.count)[0];

  return mostCommon ? `${mostCommon.label} ${formatCasePercent(mostCommon.percent)}` : "暂无";
}

function compactCaseText(value: string, maxLength = 48) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function miniChartLabel(title: string, label: string) {
  if (title === "TOPIK分布") return label.replace(/^TOPIK\s*/, "");
  if (title === "雅思分布") {
    const score = label.replace(/^雅思\s*/, "");
    return /^\d+(?:\.\d+)?$/.test(score) ? `${score}分` : score.replace("雅思", "");
  }
  return label;
}

function isKnownChartItem(label: string) {
  return !/(未|不详|暂无|unknown)/i.test(label);
}

function highlightItemKey(items: DistributionItem[]) {
  return [...items]
    .filter((item) => isKnownChartItem(item.label))
    .sort((a, b) => b.count - a.count || b.percent - a.percent)[0]?.key;
}

function resultStackColor(label: string) {
  if (label === "录取") return caseHighlightColor;
  if (label === "拒绝") return "#fffefb";
  if (label === "混合") return "#ffd0d8";
  return "#eeeae0";
}

function MiniCaseBars({ items, title }: { items: DistributionItem[]; title: string }) {
  const highlightedKey = highlightItemKey(items);

  return (
    <section className="h-full border border-ink bg-paper p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-black">{title}</h4>
        <span aria-hidden="true" className="text-sm font-black">
          ↗
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.slice(0, 6).map((item) => (
          <div className="grid gap-1" key={`${title}-${item.key}`}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="min-w-0 truncate font-black">{miniChartLabel(title, item.label)}</span>
              <span className="shrink-0">
                {item.count} / {formatCasePercent(item.percent)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full border border-ink bg-surface">
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: item.key === highlightedKey ? caseHighlightColor : caseBarColor,
                  width: `${Math.max(item.percent, item.count > 0 ? 4 : 0)}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MiniResultStack({ items }: { items: DistributionItem[] }) {
  return (
    <section className="grid gap-1 text-[0.85rem] font-extrabold">
      <span>申请结果</span>
      <div className="flex min-h-[2.35rem] overflow-hidden border border-ink bg-surface">
        {items.map((item) => (
          <div
            className="grid place-items-center border-l border-ink text-[0.85rem] font-black first:border-l-0"
            key={item.key}
            style={{ backgroundColor: resultStackColor(item.label), flexBasis: `${item.percent}%` }}
          >
            {item.percent >= 12 ? `${item.label} ${item.count}` : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function UniversityCasePanel({ schoolName, summary }: { schoolName: string; summary: AdmissionCaseSummary }) {
  if (summary.caseCount === 0) {
    return (
      <div className="border border-ink bg-panel p-4 text-sm font-bold">
        {schoolName} 暂无整理好的公开案例图表。
      </div>
    );
  }

  return (
    <section className="grid gap-4 border border-ink bg-panel p-4" aria-label={`${schoolName}案例图表`}>
      <div className="grid gap-3 md:grid-cols-4">
        <div className="grid gap-1 text-[0.85rem] font-extrabold">
          <span>样本量</span>
          <strong className="grid min-h-[2.35rem] items-center border border-ink bg-paper px-3 py-2 text-[0.85rem] font-black text-[#9f1d1d]">
            {summary.caseCount}例
          </strong>
        </div>
        <div className="grid gap-1 text-[0.85rem] font-extrabold">
          <span>录取人平均GPA</span>
          <strong className="grid min-h-[2.35rem] items-center border border-ink bg-paper px-3 py-2 text-[0.85rem] font-black">
            {formatAverageGpa(summary.admittedAverageGpa)}
          </strong>
        </div>
        <div className="grid gap-1 text-[0.85rem] font-extrabold">
          <span>TOPIK 主等级段</span>
          <strong className="grid min-h-[2.35rem] items-center border border-ink bg-paper px-3 py-2 text-[0.85rem] font-black">
            {topCaseSignal(summary.topikDistribution)}
          </strong>
        </div>
        <MiniResultStack items={summary.resultDistribution} />
      </div>

      <div className="grid items-stretch gap-3 lg:grid-cols-4">
        <MiniCaseBars title="TOPIK分布" items={summary.topikDistribution} />
        <MiniCaseBars title="雅思分布" items={summary.ieltsDistribution} />
        <MiniCaseBars title="高中背景" items={summary.highSchoolDistribution} />
        <MiniCaseBars title="入学年份" items={summary.yearDistribution} />
      </div>

      <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {summary.representativeCases.map((admissionCase) => {
          const resultClass =
            admissionCase.resultKey === "admitted"
              ? "bg-[#71d39b]"
              : admissionCase.resultKey === "rejected"
                ? "bg-[#ffd0d8]"
                : "bg-[#ffe07a]";

          return (
            <li className="grid gap-2 border border-ink bg-surface p-3" key={admissionCase.id}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border border-ink px-2 py-1 text-xs font-black ${resultClass}`}>{admissionCase.result}</span>
                <span className="rounded-full border border-ink bg-paper px-2 py-1 text-xs font-bold">{admissionCase.entryYear}</span>
                <span className="rounded-full border border-ink bg-paper px-2 py-1 text-xs font-bold">{admissionCase.topik}</span>
              </div>
              <p className="text-sm font-black leading-snug">{admissionCase.major}</p>
              <p className="text-xs leading-5 text-muted">
                {admissionCase.highSchoolType} / {admissionCase.gpa} / {compactCaseText(admissionCase.coreStrength)}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="text-right text-xs italic leading-5 text-muted">
        公开案例存在样本偏差，只适合做申请画像参考，不等于学校官方录取概率。
      </p>
    </section>
  );
}

function SchoolInfoPanel({ university }: { university: (typeof universities)[number] }) {
  const profile = schoolInfoProfile(university);
  const titleLine = [profile.nameKr, profile.nameEn].filter(Boolean).join(" · ");
  const officialWebsiteLabel = profile.logoImage ? (
    <img className="block h-7 w-[min(6.3rem,70%)] object-contain" src={profile.logoImage} alt={`${profile.name}校徽`} loading="lazy" />
  ) : (
    "官网"
  );

  return (
    <section
      className={`grid items-start gap-4 border border-ink bg-paper p-3 lg:[container-type:inline-size] ${
        profile.campusImage ? "lg:grid-cols-[minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(18rem,1.55fr)]" : "lg:grid-cols-[minmax(15rem,1fr)_minmax(18rem,1.55fr)]"
      }`}
      aria-label={`${profile.name}学校信息`}
    >
      {profile.campusImage ? (
        <figure className="m-0 aspect-square w-full overflow-hidden border border-[#a8a8a8] bg-[#f2f1ec]">
          <img
            className="block h-full w-full object-cover"
            src={profile.campusImage}
            alt={`${profile.name}校园`}
            loading="lazy"
            style={{ objectPosition: profile.imagePosition }}
          />
        </figure>
      ) : null}

      <div className="grid overflow-hidden border border-[#a8a8a8] bg-paper lg:h-[calc((100cqw-2rem)/3.55)] lg:grid-cols-2 lg:grid-rows-[auto_repeat(6,minmax(0,1fr))]">
        <h3 className="col-span-full m-0 border-b border-[#a8a8a8] bg-[#f1f1ee] px-3 py-2 text-center text-[0.98rem] font-black leading-snug">
          {profile.name}
          {titleLine ? <small className="mt-1 block text-[0.68rem] font-extrabold text-muted">{titleLine}</small> : null}
        </h3>
        {[
          ["学校类型", profile.type],
          ["地理位置", profile.city],
          ["成立时间", profile.founded],
          ["学生数", profile.students],
          ["参考层级", profile.tier]
        ].map(([label, value]) => (
          <Fragment key={label}>
            <div className="grid min-h-10 place-items-center border-b border-[#a8a8a8] px-2 py-2 text-center text-[0.8rem] font-black leading-snug">{label}</div>
            <div className="grid min-h-10 place-items-center border-b border-l border-[#a8a8a8] px-2 py-2 text-center text-[0.8rem] font-black leading-snug">
              {value}
              {label === "学生数" && profile.internationalStudents ? (
                <small className="mt-0.5 block text-[0.68rem] font-normal italic">{profile.internationalStudents}</small>
              ) : null}
            </div>
          </Fragment>
        ))}
        <div className="grid min-h-10 place-items-center border-b border-[#a8a8a8] px-2 py-2 text-center text-[0.8rem] font-black leading-snug">学校官网</div>
        <div className="grid min-h-10 place-items-center border-b border-l border-[#a8a8a8] px-2 py-1 text-center text-[0.8rem] font-black leading-snug">
          {profile.officialUrl ? (
            <a
              className={`inline-grid h-full min-h-0 w-full place-items-center font-black underline underline-offset-[0.18em] ${profile.logoImage ? "no-underline" : ""}`}
              href={profile.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {officialWebsiteLabel}
            </a>
          ) : (
            <span>资料待补</span>
          )}
        </div>
      </div>

      <div className="flex flex-col overflow-y-auto border border-[#a8a8a8] bg-paper lg:h-[calc((100cqw-2rem)/3.55)]">
        <h3 className="m-0 border-b border-[#a8a8a8] bg-[#f1f1ee] px-4 py-3 text-center text-[0.98rem] font-black leading-snug">
          {profile.name}介绍
        </h3>
        <p className="mx-5 mt-3 text-[0.86rem] leading-7 text-ink">{profile.intro}</p>
        <p className="mx-5 mt-3 text-[0.86rem] leading-7 text-ink">
          <strong>重点方向：</strong>
          {profile.focus}
        </p>
        <div className="mx-5 mt-3">
          <h4 className="m-0 text-[0.86rem] font-black leading-6">校友名单</h4>
          <p className="mt-2 border-t border-[#a8a8a8] pt-2 text-[0.82rem] font-normal leading-6 text-muted">
            {profile.alumni}
          </p>
        </div>
        <em className="mx-5 mb-4 mt-auto block text-xs leading-5 text-muted">
          学校简介用于快速了解合作院校，申请判断仍需结合官方招生简章、项目合同和最新费用说明。
        </em>
      </div>
    </section>
  );
}

type DirectoryFilters = {
  types: string[];
  zones: string[];
  tiers: string[];
  majors: string[];
};

const emptyDirectoryFilters: DirectoryFilters = {
  types: [],
  zones: [],
  tiers: [],
  majors: []
};

function visibleByFilters(university: (typeof universities)[number], filters: DirectoryFilters) {
  const cityZones = zonesForCity(university.city);
  const majorTags = tagsFor(university.nameCn, university.focus).map((tag) => tag.label);
  if (filters.types.length > 0) {
    const matchesType =
      (filters.types.includes("national") && (university.type.includes("国立") || university.type.includes("公立"))) ||
      (filters.types.includes("private") && university.type.includes("私立"));
    if (!matchesType) return false;
  }
  if (filters.zones.length > 0 && !cityZones.some((zone) => filters.zones.includes(zone))) return false;
  if (filters.tiers.length > 0 && !filters.tiers.includes(tierFor(university.nameCn).tier)) return false;
  if (filters.majors.length > 0 && !filters.majors.every((major) => majorTags.includes(major))) return false;
  return true;
}

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase();
}

function visibleBySearch(university: (typeof universities)[number], query: string) {
  const search = normalizeSearchText(query);
  if (!search) return true;

  return normalizeSearchText([university.nameCn, university.nameKr, university.nameEn, university.slug].join(" ")).includes(search);
}

function filterSort(filters: DirectoryFilters) {
  return [...universities].sort((a, b) => {
    if (filters.zones.length > 0) {
      const zoneCompare =
        (zoneOrder.get(zonesForCity(a.city)[0]) ?? 999) - (zoneOrder.get(zonesForCity(b.city)[0]) ?? 999);
      if (zoneCompare !== 0) return zoneCompare;
    }

    const tierCompare =
      (tierOrder.get(tierFor(a.nameCn).tier) ?? 99) - (tierOrder.get(tierFor(b.nameCn).tier) ?? 99);
    if (tierCompare !== 0) return tierCompare;

    return a.no - b.no;
  });
}

function toggleArrayValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function hasNoFilters(filters: DirectoryFilters) {
  return !filters.types.length && !filters.zones.length && !filters.tiers.length && !filters.majors.length;
}

type UniversitiesDirectoryProps = {
  actions?: ReactNode;
};

export function UniversitiesDirectory({ actions }: UniversitiesDirectoryProps) {
  const [filters, setFilters] = useState<DirectoryFilters>(emptyDirectoryFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPanel, setExpandedPanel] = useState<{ slug: string; type: "case" | "info" } | null>(null);
  const filteredUniversities = useMemo(
    () => filterSort(filters).filter((university) => visibleByFilters(university, filters) && visibleBySearch(university, searchQuery)),
    [filters, searchQuery]
  );
  const togglePanel = (slug: string, type: "case" | "info") => {
    setExpandedPanel((current) => (current?.slug === slug && current.type === type ? null : { slug, type }));
  };
  const clearFilters = () => {
    setFilters(emptyDirectoryFilters);
    setExpandedPanel(null);
  };
  const toggleTypeFilter = (value: string) => {
    setFilters((current) => ({ ...current, types: toggleArrayValue(current.types, value) }));
    setExpandedPanel(null);
  };
  const toggleZoneFilter = (value: string) => {
    setFilters((current) => ({ ...current, zones: toggleArrayValue(current.zones, value) }));
    setExpandedPanel(null);
  };
  const toggleTierFilter = (value: string) => {
    setFilters((current) => ({ ...current, tiers: toggleArrayValue(current.tiers, value) }));
    setExpandedPanel(null);
  };
  const toggleMajorFilter = (value: string) => {
    setFilters((current) => ({ ...current, majors: toggleArrayValue(current.majors, value) }));
    setExpandedPanel(null);
  };

  const buttons = [
    { label: "全部", filter: "all" },
    { label: "国立", filter: "national" },
    { label: "私立", filter: "private" }
  ];

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className={`min-w-0 ${actions ? "" : "lg:col-span-2"}`}>
          <div className="mt-3 grid gap-2 sm:mt-5" aria-label="大学列表分类">
            <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
                {buttons.map((button) => (
                  <button
                    aria-pressed={button.filter === "all" ? hasNoFilters(filters) : filters.types.includes(button.filter)}
                    className="min-h-10 flex-none rounded-full border border-ink bg-surface px-4 py-2 text-sm font-extrabold text-ink aria-pressed:bg-yellow aria-pressed:ring-2 aria-pressed:ring-ink aria-pressed:ring-offset-2 aria-pressed:ring-offset-paper"
                    key={button.filter}
                    type="button"
                    onClick={() => {
                      if (button.filter === "all") clearFilters();
                      else toggleTypeFilter(button.filter);
                    }}
                  >
                    {button.label}
                  </button>
                ))}
                {zones.map((zone) => (
                  <button
                    aria-pressed={filters.zones.includes(zone.key)}
                    className="min-h-10 flex-none rounded-full border border-ink bg-surface px-3 py-2 text-xs font-extrabold text-ink aria-pressed:bg-yellow aria-pressed:ring-2 aria-pressed:ring-ink aria-pressed:ring-offset-2 aria-pressed:ring-offset-paper"
                    key={zone.key}
                    type="button"
                    onClick={() => {
                      toggleZoneFilter(zone.key);
                    }}
                  >
                    {zone.label}
                  </button>
                ))}
              </div>
              <div
                className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:justify-end sm:overflow-visible sm:px-0"
                aria-label="学校等级筛选"
              >
                {tierFilterLabels.map((tier) => (
                  <button
                    aria-pressed={filters.tiers.includes(tier)}
                    className="min-h-10 flex-none rounded-full border border-ink bg-[#e6f7f7] px-4 py-2 text-sm font-extrabold text-ink aria-pressed:bg-yellow aria-pressed:ring-2 aria-pressed:ring-ink aria-pressed:ring-offset-2 aria-pressed:ring-offset-paper"
                    key={tier}
                    type="button"
                    onClick={() => {
                      toggleTierFilter(tier);
                    }}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,12.775rem)] lg:items-start"
              aria-label="专业方向筛选"
            >
              <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
                {majorFilterLabels.map((label) => (
                  <button
                    aria-pressed={filters.majors.includes(label)}
                    className={`min-h-10 flex-none rounded-full border border-ink px-3 py-2 text-xs font-extrabold text-ink ${tagStyles[label]} aria-pressed:ring-2 aria-pressed:ring-ink aria-pressed:ring-offset-2 aria-pressed:ring-offset-paper`}
                    key={label}
                    type="button"
                    onClick={() => {
                      toggleMajorFilter(label);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="relative block min-w-0">
                <span className="sr-only">学校搜索</span>
                <input
                  aria-label="学校搜索"
                  className="h-[2.45rem] w-full rounded-[6px] border border-ink bg-surface px-3 pr-8 text-right text-xs font-normal italic text-ink outline-none placeholder:text-muted focus:ring-1 focus:ring-ink"
                  type="search"
                  value={searchQuery}
                  placeholder="搜索：当前入库韩国96所高校"
                  style={{ borderWidth: "0.7px" }}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setExpandedPanel(null);
                  }}
                />
                {searchQuery ? (
                  <button
                    aria-label="清空学校搜索"
                    className="absolute right-1.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full border border-ink bg-paper text-[0.68rem] font-black leading-none text-ink hover:bg-yellow"
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setExpandedPanel(null);
                    }}
                  >
                    ×
                  </button>
                ) : null}
              </label>
            </div>
          </div>
        </div>

        {actions ? <div className="flex justify-end lg:pt-12">{actions}</div> : null}
      </div>

      <ul className="mt-4 grid gap-3 md:hidden">
        {filteredUniversities.map((university) => {
          const tier = tierFor(university.nameCn);
          const cityZones = zonesForCity(university.city);
          const tags = tagsFor(university.nameCn, university.focus);

          return (
            <li
              className="rounded-lg border border-ink bg-surface p-3"
              data-dormitory-count={university.dormitoryCapacity}
              data-dormitory-rate={university.dormitoryRate}
              data-primary-zone={cityZones[0]}
              data-zones={cityZones.join(" ")}
              data-major-tags={tags.map((tag) => tag.label).join(" ")}
              key={university.slug}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      aria-expanded={expandedPanel?.slug === university.slug && expandedPanel.type === "case"}
                      className="block text-left text-lg font-black leading-tight text-ink underline-offset-4 hover:underline"
                      type="button"
                      onClick={() => togglePanel(university.slug, "case")}
                    >
                      {university.nameCn}
                      <span
                        aria-hidden="true"
                        style={{
                          display: "inline-block",
                          fontSize: "70%",
                          fontWeight: 400,
                          lineHeight: 1,
                          marginLeft: "0.05em",
                          verticalAlign: "middle"
                        }}
                      >
                        ↗
                      </span>
                    </button>
                    <button
                      aria-expanded={expandedPanel?.slug === university.slug && expandedPanel.type === "info"}
                      className="inline-flex min-h-5 items-center border border-[#a8aca2] bg-[#eef8df] px-3 py-0.5 text-xs font-black leading-none text-ink hover:bg-[#e2f3cf] aria-expanded:bg-[#e2f3cf]"
                      type="button"
                      onClick={() => togglePanel(university.slug, "info")}
                    >
                      学校信息
                    </button>
                  </div>
                  <span className="mt-1 block text-xs leading-snug text-muted">
                    {university.nameKr} · {university.nameEn}
                  </span>
                </div>
                <span className="shrink-0 rounded-full border border-ink bg-[#ffe07a] px-2 py-1 text-xs font-black">
                  {tier.tier}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold">
                <span className="rounded-full border border-ink bg-paper px-2 py-1">{university.city}</span>
                <span className="rounded-full border border-ink bg-paper px-2 py-1">{university.type}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{university.focus}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    className={`inline-flex min-h-5 items-center rounded-full border border-ink px-2 py-0.5 text-[0.782rem] font-extrabold leading-none text-ink ${tag.className}`}
                    key={tag.label}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink pt-3 text-xs">
                <span>
                  <b className="block text-sm">学生数</b>
                  {university.totalStudents || "资料待补"}
                </span>
                <span>
                  <b className="block text-sm">外国学生</b>
                  {foreignStudentSummary(university.totalStudents, university.foreignStudents)}
                </span>
              </div>
              {expandedPanel?.slug === university.slug ? (
                <div className="mt-3">
                  {expandedPanel.type === "info" ? (
                    <SchoolInfoPanel university={university} />
                  ) : (
                    <UniversityCasePanel schoolName={university.nameCn} summary={getAdmissionCaseSummary(university.slug)} />
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-8 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[980px] table-fixed border border-ink bg-surface text-left text-[0.85rem]">
          <colgroup>
            <col style={{ width: "24.4%" }} />
            <col style={{ width: "10.2%" }} />
            <col style={{ width: "5.9%" }} />
            <col style={{ width: "7.7%" }} />
            <col style={{ width: "37.6%" }} />
            <col style={{ width: "14.2%" }} />
          </colgroup>
          <thead className="bg-panel text-[0.8925rem] font-black text-ink">
            <tr>
              <th className="border-b border-ink px-4 py-4">学校</th>
              <th className="border-b border-ink px-4 py-4">学校等级</th>
              <th className="border-b border-ink px-4 py-4">城市</th>
              <th className="border-b border-ink px-4 py-4">类型</th>
              <th className="border-b border-ink px-4 py-4">方向参考</th>
              <th className="border-b border-ink px-4 py-4">
                学生数 <span className="text-[0.7em] font-normal italic">(外国人)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUniversities.map((university) => {
              const tier = tierFor(university.nameCn);
              const cityZones = zonesForCity(university.city);
              const tags = tagsFor(university.nameCn, university.focus);

              return (
                <Fragment key={university.slug}>
                  <tr
                    className="border-b border-ink last:border-b-0"
                    data-dormitory-count={university.dormitoryCapacity}
                    data-dormitory-rate={university.dormitoryRate}
                    data-primary-zone={cityZones[0]}
                    data-zones={cityZones.join(" ")}
                    data-major-tags={tags.map((tag) => tag.label).join(" ")}
                  >
                  <td className="px-4 py-4 align-middle">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <button
                        aria-expanded={expandedPanel?.slug === university.slug && expandedPanel.type === "case"}
                        className="block text-left text-[1.003rem] font-black leading-tight text-ink underline-offset-4 hover:underline"
                        type="button"
                        onClick={() => togglePanel(university.slug, "case")}
                      >
                        {university.nameCn}
                        <span
                          aria-hidden="true"
                          style={{
                            display: "inline-block",
                            fontSize: "70%",
                            fontWeight: 400,
                            lineHeight: 1,
                            marginLeft: "0.05em",
                            verticalAlign: "middle"
                          }}
                        >
                          ↗
                        </span>
                      </button>
                      <button
                        aria-expanded={expandedPanel?.slug === university.slug && expandedPanel.type === "info"}
                        className="inline-flex min-h-5 items-center border border-[#a8aca2] bg-[#eef8df] px-3 py-0.5 text-xs font-black leading-none text-ink hover:bg-[#e2f3cf] aria-expanded:bg-[#e2f3cf]"
                        type="button"
                        onClick={() => togglePanel(university.slug, "info")}
                      >
                        学校信息
                      </button>
                    </span>
                    <span className="mt-1 block text-[0.744rem] leading-snug text-muted">
                      {university.nameKr} · {university.nameEn}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <strong className="block text-[1.003rem] font-black leading-tight text-ink">{tier.tier}</strong>
                    <span className="mt-1 block text-[0.5525rem] leading-snug text-muted">{tier.note}</span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    {cityLines(university.city).map((line) => (
                      <span className="block leading-snug text-ink" key={line}>
                        {line}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-4 align-middle text-ink">{university.type}</td>
                  <td className="px-4 py-4 align-middle text-muted">
                    <span className="block text-[0.8075rem] leading-snug">{university.focus}</span>
                    <span className="mt-2 flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <span
                          className={`inline-flex min-h-5 items-center rounded-full border border-ink px-2 py-0.5 text-[0.734rem] font-extrabold leading-none text-ink ${tag.className}`}
                          key={tag.label}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <strong className="block text-[1.003rem] font-black leading-tight text-ink">
                      {university.totalStudents || "资料待补"}
                    </strong>
                    <span className="mt-1 block text-[0.744rem] font-normal leading-snug text-ink">
                      ({foreignStudentSummary(university.totalStudents, university.foreignStudents)})
                    </span>
                  </td>
                  </tr>
                  {expandedPanel?.slug === university.slug ? (
                    <tr className="border-b border-ink bg-panel">
                      <td className="p-4" colSpan={6}>
                        {expandedPanel.type === "info" ? (
                          <SchoolInfoPanel university={university} />
                        ) : (
                          <UniversityCasePanel schoolName={university.nameCn} summary={getAdmissionCaseSummary(university.slug)} />
                        )}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
