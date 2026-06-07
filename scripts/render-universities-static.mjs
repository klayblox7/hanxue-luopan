import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const source = readFileSync(new URL("src/data/universities.ts", root), "utf8").replace(/^\uFEFF/, "");
const tierSource = readFileSync(new URL("src/data/universityTiers.ts", root), "utf8").replace(/^\uFEFF/, "");
const universityMajorTags = JSON.parse(readFileSync(new URL("src/data/university-major-tags.json", root), "utf8"));
const admissionCases = JSON.parse(readFileSync(new URL("src/data/admission-cases.json", root), "utf8"));
const partnerSchoolProfiles = JSON.parse(readFileSync(new URL("src/data/partner-school-profiles.json", root), "utf8"));
const staticHomeSource = readFileSync(new URL("hanxue-luopan-home.html", root), "utf8");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function field(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*"([^"]*)"`));
  return match?.[1] ?? "";
}

function numberField(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*(\\d+)`));
  return match ? Number(match[1]) : 0;
}

const universities = [...source.matchAll(/\{\s*no:[\s\S]*?\n\s*\}/g)]
  .map((match) => {
    const block = match[0];
    return {
      no: numberField(block, "no"),
      slug: field(block, "slug"),
      nameCn: field(block, "nameCn"),
      nameKr: field(block, "nameKr"),
      nameEn: field(block, "nameEn"),
      city: field(block, "city"),
      type: field(block, "type"),
      focus: field(block, "focus"),
      totalStudents: field(block, "totalStudents") || "",
      foreignStudents: field(block, "foreignStudents") || "",
      dormitoryCapacity: field(block, "dormitoryCapacity") || "",
      dormitoryRate: field(block, "dormitoryRate") || ""
    };
  })
  .filter((university) => university.no > 0);

const tierProfiles = new Map(
  [...tierSource.matchAll(/^\s*"([^"]+)":\s*\{\s*tier:\s*"(T[1-5])",\s*note:\s*"([^"]+)"/gm)].map(
    ([, nameCn, tier, note]) => [nameCn, [tier, note]]
  )
);

const partnerProfilesBySlug = new Map(
  partnerSchoolProfiles.filter((profile) => profile.slug).map((profile) => [profile.slug, profile])
);
const genericPartnerFocus = "\u5408\u4f5c\u9879\u76ee\u76f8\u5173\u4e13\u4e1a";

function parseStaticHomeStringMap(name) {
  const block = staticHomeSource.match(new RegExp(`const ${name} = \\{([\\s\\S]*?)\\n\\s*\\};`))?.[1] || "";
  return new Map([...block.matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map(([, slug, value]) => [slug, value]));
}

const campusImageBySlug = parseStaticHomeStringMap("campusImageBySlug");
const campusImagePositionBySlug = parseStaticHomeStringMap("campusImagePositionBySlug");
const schoolLogoBySlug = parseStaticHomeStringMap("schoolLogoBySlug");
const schoolFactBySlug = new Map();

const factBlock = staticHomeSource.match(/const schoolFactBySlug = \{([\s\S]*?)\n\s*\};/)?.[1] || "";
for (const [, slug, founded, students, foreignStudents, officialWebsite] of factBlock.matchAll(
  /"([^"]+)":\s*schoolFact\("([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)"\)/g
)) {
  schoolFactBySlug.set(slug, {
    founded: `${founded}年`,
    students: `${students}人`,
    internationalStudents: `外国人 ${foreignStudents}人`,
    officialWebsite
  });
}

const zones = [
  { key: "seoul", label: "首尔", cities: ["首尔"] },
  { key: "gyeonggi", label: "京畿/仁川", cities: ["水原", "安城", "龙仁", "城南", "富川", "高阳", "仁川", "军浦", "安山", "抱川", "华城", "杨州", "议政府", "东豆川", "ERICA"] },
  { key: "north", label: "北部", cities: ["春川", "原州", "高城"] },
  { key: "central", label: "中部", cities: ["大田", "世宗", "清州", "天安", "牙山", "公州", "礼山", "论山", "锦山", "镇川"] },
  { key: "south", label: "南部", cities: ["釜山", "大邱", "光州", "蔚山", "全州", "庆山", "浦项", "益山", "完州", "罗州", "群山", "顺天", "龟尾", "昌原", "金海", "安东", "庆州"] },
  { key: "jeju", label: "济州", cities: ["济州"] }
];

const tagClasses = new Map([
  ["经营/商科", "tag-business"],
  ["计算机/AI", "tag-computer"],
  ["工科", "tag-engineering"],
  ["传媒/影视", "tag-media"],
  ["艺术/设计", "tag-art"],
  ["美妆/美容", "tag-beauty"],
  ["韩语/教育", "tag-korean"],
  ["酒店/旅游", "tag-tourism"],
  ["人文/外语", "tag-humanities"],
  ["自然科学/生命", "tag-science"]
]);

const tagRules = [
  { label: "经营/商科", keywords: ["经营", "经济", "商", "贸易", "创业", "管理", "会计", "通商", "房地产"] },
  { label: "计算机/AI", keywords: ["AI", "IT", "计算机", "软件", "数据", "人工智能", "机器", "智能"] },
  { label: "工科", keywords: ["理工", "工科", "工程", "半导体", "建筑", "造船", "航空", "机械", "电子", "科学技术", "实用", "海洋", "水产", "产业", "电气"] },
  { label: "传媒/影视", keywords: ["传媒", "电影", "表演", "影视", "广告", "动画", "内容", "影像", "媒体"] },
  { label: "艺术/设计", keywords: ["艺术", "设计", "美术", "音乐", "舞蹈", "戏剧", "服装"] },
  { label: "美妆/美容", keywords: ["美妆", "美容", "美发", "化妆", "化妆品", "彩妆", "护肤", "皮肤美容", "美甲", "K-Beauty", "K뷰티", "뷰티", "미용", "화장품", "메이크업", "헤어", "네일", "피부"] },
  { label: "韩语/教育", keywords: ["韩语", "国语国文", "教育", "师范", "女子名校"] },
  { label: "酒店/旅游", keywords: ["酒店", "旅游", "观光"] },
  { label: "人文/外语", keywords: ["人文", "外语", "国际", "地域", "通翻译", "法学", "心理", "政治", "社科", "佛教", "英语", "日语"] },
  { label: "自然科学/生命", keywords: ["自然", "生命", "医学", "护理", "药学", "保健", "兽医", "食品", "农业", "生态", "森林", "生物", "韩医"] }
];

const majorFilterLabels = [...tagClasses.keys()];
const tierFilterLabels = ["T1", "T2", "T3", "T4", "T5"];

function primaryCityForZone(city) {
  return city.split("/")[0]?.trim() || city;
}

function zonesForCity(city) {
  const primaryCity = primaryCityForZone(city);
  const matches = zones
    .filter((zone) => zone.cities.some((cityName) => primaryCity.includes(cityName)))
    .map((zone) => zone.key);
  return [...new Set(matches.length > 0 ? matches : ["unknown"])];
}

function cityHtml(city) {
  const parts = city.split("/");
  if (parts.length < 2) return escapeHtml(city);
  return parts
    .map((part, index) => `<span class="city-line">${escapeHtml(part)}${index === 0 ? " /" : ""}</span>`)
    .join("");
}

function peopleCount(value) {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function foreignStudentSummary(totalStudents, foreignStudents) {
  const total = peopleCount(totalStudents);
  const foreign = peopleCount(foreignStudents);
  if (!total || !foreign) return foreignStudents;
  const percent = ((foreign / total) * 100).toFixed(1).replace(/\.0$/, "");
  return `${foreignStudents}, ${percent}%`;
}

function majorTagLabels(nameCn, focus) {
  const seededTags = universityMajorTags[nameCn] ?? [];
  const inferredTags = tagRules
    .filter((rule) => rule.keywords.some((keyword) => focus.includes(keyword)))
    .map((rule) => rule.label);
  const labels = [...new Set([...seededTags, ...inferredTags])]
    .filter((label) => tagClasses.has(label))
    .slice(0, 5);
  return labels.length > 0 ? labels : ["还没确定"];
}

function majorTags(nameCn, focus) {
  const usefulTags = majorTagLabels(nameCn, focus);
  return usefulTags
    .map((label) => `<span class="major-tag ${tagClasses.get(label) ?? "tag-pending"}">${escapeHtml(label)}</span>`)
    .join("");
}

function schoolInfoProfile(university) {
  const [tier] = tierProfiles.get(university.nameCn) ?? ["T4", "待补充分层"];
  const partnerProfile = partnerProfilesBySlug.get(university.slug) || {};
  const fact = schoolFactBySlug.get(university.slug) || {};
  const founded = partnerProfile.founded || fact.founded || "资料待补";
  const hasGenericPartnerFocus = partnerProfile.focus === genericPartnerFocus;
  const focus = hasGenericPartnerFocus ? university.focus : partnerProfile.focus || university.focus;
  const city = partnerProfile.city || university.city;
  const type = partnerProfile.type || university.type;

  return {
    name: partnerProfile.name || university.nameCn,
    nameKr: partnerProfile.nameKr || university.nameKr,
    nameEn: partnerProfile.nameEn || university.nameEn,
    city,
    type,
    focus,
    founded,
    students: partnerProfile.totalStudents || fact.students || university.totalStudents || "资料待补",
    internationalStudents:
      partnerProfile.foreignStudents ||
      fact.internationalStudents ||
      (university.foreignStudents ? `外国人 ${university.foreignStudents}` : ""),
    tier,
    campusImage: partnerProfile.campusImage || campusImageBySlug.get(university.slug) || "",
    imagePosition: campusImagePositionBySlug.get(university.slug) || partnerProfile.imagePosition || "center",
    intro:
      (!hasGenericPartnerFocus && partnerProfile.intro) ||
      `${university.nameCn}位于${city}，成立时间为${founded}，是一所${type}院校。该校在本项目库中主要用于${focus}方向的匹配参考，建议结合项目模式、韩语要求、学费与所在城市生活成本一起判断是否适合申请。`,
    officialWebsite: partnerProfile.officialUrl || fact.officialWebsite || "",
    logoImage: partnerProfile.logoImage || schoolLogoBySlug.get(university.slug) || ""
  };
}

function rowHtml(university) {
  const [tier, tierNote] = tierProfiles.get(university.nameCn) ?? ["T4", "待补充分层"];
  const cityZones = zonesForCity(university.city);
  const majorLabels = majorTagLabels(university.nameCn, university.focus);
  return `<tr class="university-row"
    data-order="${university.no}"
    data-school-slug="${escapeHtml(university.slug)}"
    data-school-name="${escapeHtml(university.nameCn)}"
    data-search-text="${escapeHtml([university.nameCn, university.nameKr, university.nameEn, university.slug].join(" "))}"
    data-type="${escapeHtml(university.type)}"
    data-tier="${escapeHtml(tier)}"
    data-zones="${escapeHtml(cityZones.join(" "))}"
    data-primary-zone="${escapeHtml(cityZones[0])}"
    data-major-tags="${escapeHtml(majorLabels.join(" "))}"
    data-dormitory-count="${escapeHtml(university.dormitoryCapacity)}"
    data-dormitory-rate="${escapeHtml(university.dormitoryRate)}"
  >
    <td>
      <span class="school-name-line"><button class="university-name university-toggle" type="button" aria-expanded="false">${escapeHtml(university.nameCn)}</button><button class="school-info-toggle" type="button" aria-expanded="false">学校信息</button></span>
      <span class="school-subtitle">${escapeHtml(university.nameKr)} · ${escapeHtml(university.nameEn)}</span>
    </td>
    <td class="tier-cell">
      <strong class="tier-code">${escapeHtml(tier)}</strong>
      <span class="tier-note">${escapeHtml(tierNote)}</span>
    </td>
    <td class="city-cell">${cityHtml(university.city)}</td>
    <td>${escapeHtml(university.type)}</td>
    <td class="direction-cell">
      <span class="direction-text">${escapeHtml(university.focus)}</span>
      <span class="major-tags">${majorTags(university.nameCn, university.focus)}</span>
    </td>
    <td class="student-cell">
      <strong class="student-total">${escapeHtml(university.totalStudents)}</strong>
      <span class="student-foreign">(${escapeHtml(foreignStudentSummary(university.totalStudents, university.foreignStudents))})</span>
    </td>
  </tr>`;
}

const zoneButtons = zones
  .map((zone) => `<button class="category-button region-filter" type="button" data-filter="zone:${zone.key}" aria-pressed="false">${zone.label}</button>`)
  .join("\n");

const tierButtons = tierFilterLabels
  .map((tier) => `<button class="category-button tier-filter" type="button" data-filter="tier:${tier}" aria-pressed="false">${tier}</button>`)
  .join("\n");

const majorButtons = majorFilterLabels
  .map((label) => `<button class="category-button major-filter ${tagClasses.get(label)}" type="button" data-filter="major:${escapeHtml(label)}" aria-pressed="false">${escapeHtml(label)}</button>`)
  .join("\n");

const resultLabels = {
  admitted: "录取",
  rejected: "拒绝",
  mixed: "混合",
  unknown: "未注明"
};
const resultOrder = ["admitted", "rejected", "mixed", "unknown"];

function percent(count, total) {
  return total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
}

function averageGpa(cases) {
  const values = cases
    .map((admissionCase) => admissionCase.gpaPercent)
    .filter((value) => typeof value === "number" && Number.isFinite(value));

  return values.length > 0 ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : null;
}

function sortRecentCases(a, b) {
  const yearCompare = (b.entryYearNumber ?? 0) - (a.entryYearNumber ?? 0);
  if (yearCompare !== 0) return yearCompare;
  const resultCompare = resultOrder.indexOf(a.resultKey) - resultOrder.indexOf(b.resultKey);
  if (resultCompare !== 0) return resultCompare;
  return a.sourceRow - b.sourceRow;
}

function representativeCaseSet(cases) {
  const displayLimit = 9;
  const rejectedTarget = 3;
  const sortedAdmitted = cases.filter((admissionCase) => admissionCase.resultKey === "admitted").sort(sortRecentCases);
  const sortedRejected = cases.filter((admissionCase) => admissionCase.resultKey === "rejected").sort(sortRecentCases);
  const admittedLimit = Math.min(
    sortedAdmitted.length,
    Math.max(displayLimit - rejectedTarget, displayLimit - sortedRejected.length)
  );
  const admitted = sortedAdmitted.slice(0, admittedLimit);
  const rejected = sortedRejected.slice(0, displayLimit - admitted.length);
  const selectedIds = new Set([...admitted, ...rejected].map((admissionCase) => admissionCase.id));
  const remaining = cases
    .filter((admissionCase) => !selectedIds.has(admissionCase.id))
    .sort((a, b) => {
      const resultCompare = resultOrder.indexOf(a.resultKey) - resultOrder.indexOf(b.resultKey);
      if (resultCompare !== 0) return resultCompare;
      return sortRecentCases(a, b);
    });

  return [...admitted, ...rejected, ...remaining].slice(0, displayLimit);
}

function toDistribution(cases, getValue, options = {}) {
  const counts = new Map();
  for (const admissionCase of cases) {
    const label = String(getValue(admissionCase) || "").trim() || "未注明";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const orderMap = new Map((options.order ?? []).map((label, index) => [label, index]));
  const items = [...counts.entries()]
    .map(([label, count]) => ({ key: label, label, count, percent: percent(count, cases.length) }))
    .sort((a, b) => {
      const orderA = orderMap.get(a.label);
      const orderB = orderMap.get(b.label);
      if (orderA !== undefined || orderB !== undefined) return (orderA ?? 999) - (orderB ?? 999);
      return b.count - a.count || a.label.localeCompare(b.label, "zh-Hans-CN");
    });
  return typeof options.limit === "number" ? items.slice(0, options.limit) : items;
}

function topikLabel(admissionCase) {
  if (typeof admissionCase.topikLevel === "number") {
    return admissionCase.topikLevel === 0 ? "无TOPIK" : `TOPIK ${admissionCase.topikLevel}级`;
  }
  return admissionCase.topik || "未注明";
}

function highSchoolLabel(admissionCase) {
  const label = String(admissionCase.highSchoolType || "").trim();
  return label === "省重点/重点高中" || label === "省重点高中" ? "省重点" : label;
}

function summaryForSchool(schoolKey) {
  const cases = admissionCases
    .filter((admissionCase) => admissionCase.schoolSlug === schoolKey || admissionCase.schoolName === schoolKey)
    .sort(sortRecentCases);
  const admittedCount = cases.filter((admissionCase) => admissionCase.resultKey === "admitted").length;
  const rejectedCount = cases.filter((admissionCase) => admissionCase.resultKey === "rejected").length;
  const mixedCount = cases.filter((admissionCase) => admissionCase.resultKey === "mixed").length;
  const admittedCases = cases.filter((admissionCase) => admissionCase.resultKey === "admitted");
  return {
    caseCount: cases.length,
    admittedCount,
    rejectedCount,
    mixedCount,
    admitRate: percent(admittedCount, cases.length),
    admittedAverageGpa: averageGpa(admittedCases),
    resultDistribution: toDistribution(cases, (admissionCase) => resultLabels[admissionCase.resultKey], {
      order: resultOrder.map((resultKey) => resultLabels[resultKey])
    }),
    topikDistribution: toDistribution(cases, topikLabel, {
      order: ["TOPIK 6级", "TOPIK 5级", "TOPIK 4级", "TOPIK 3级", "TOPIK 2级", "无TOPIK", "未注明"]
    }),
    ieltsDistribution: toDistribution(cases, (admissionCase) => admissionCase.ielts || "未注明", {
      order: ["雅思 7.5", "雅思 7.0", "雅思 6.5", "雅思 6.0", "雅思 5.5", "未提供雅思", "未注明"]
    }),
    highSchoolDistribution: toDistribution(cases, highSchoolLabel, { limit: 6 }),
    yearDistribution: toDistribution(cases, (admissionCase) => admissionCase.entryYear, {
      order: ["2026", "2025", "2024", "2023", "2022", "2021", "不详"]
    }),
    representativeCases: representativeCaseSet(cases).map((admissionCase) => ({
      id: admissionCase.id,
      result: admissionCase.result,
      resultKey: admissionCase.resultKey,
      entryYear: admissionCase.entryYear,
      topik: admissionCase.topik,
      major: admissionCase.major,
      highSchoolType: admissionCase.highSchoolType,
      gpa: admissionCase.gpa,
      coreStrength: admissionCase.coreStrength
    }))
  };
}

const caseSummaries = Object.fromEntries(universities.map((university) => [university.slug, summaryForSchool(university.slug)]));
const schoolProfiles = Object.fromEntries(universities.map((university) => [university.slug, schoolInfoProfile(university)]));

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>韩国大学库｜韩学罗盘</title>
    <style>
      :root {
        --paper: #fbfbf8;
        --surface: #fffefb;
        --ink: #0a0a0a;
        --muted: #6d6a62;
        --panel: #f0eee6;
        --yellow: #ffe07a;
        --mint: #a4d4c5;
        --pink: #ffd0d8;
        --green: #71d39b;
        --peach: #ffb084;
      }

      * { box-sizing: border-box; }

      html {
        overflow-y: scroll;
        scrollbar-gutter: stable;
      }

      body {
        margin: 0;
        background: var(--paper);
        color: var(--ink);
        font-family:
          "Microsoft YaHei UI", "Microsoft YaHei", "微软雅黑", "PingFang SC", "Noto Sans CJK SC",
          "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, "MS Gothic", "Malgun Gothic", Inter,
          system-ui, -apple-system, sans-serif;
      }

      a { color: inherit; text-decoration: none; }

      .header {
        position: sticky;
        top: 0;
        z-index: 50;
        padding: 1rem 4rem;
        background: var(--paper);
        border-bottom: 1px solid var(--ink);
      }

      .header-inner {
        display: grid;
        min-height: 5rem;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 1rem;
      }

      .logo {
        display: block;
        width: 6.5rem;
        height: 5rem;
        object-fit: contain;
      }

      .header-title {
        min-width: 12rem;
        overflow: hidden;
        padding-left: 1rem;
        font-size: clamp(1.11rem, 1.92vw, 2.1rem);
        font-weight: 900;
        line-height: 1;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .nav {
        display: flex;
        max-width: min(72rem, calc(100vw - 11rem));
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        justify-content: flex-end;
      }

      .pill,
      .category-button,
      .back {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--ink);
        border-radius: 999px;
        color: var(--ink);
        font-weight: 800;
        line-height: 1;
        white-space: nowrap;
      }

      .pill {
        padding: 0.45rem 0.72rem;
        font-size: 0.95rem;
        background: #ffffff;
      }

      .pink { background: var(--pink); }
      .green { background: var(--green); }
      .yellow { background: var(--yellow); }
      .mint { background: var(--mint); }
      .peach { background: var(--peach); }

      .pill { background: #ffffff; }
      .pill.pink.active,
      .pill.pink:hover,
      .pill.pink:focus { background: var(--pink); }
      .pill.green.active,
      .pill.green:hover,
      .pill.green:focus { background: var(--green); }
      .pill.yellow.active,
      .pill.yellow:hover,
      .pill.yellow:focus { background: var(--yellow); }
      .pill.mint.active,
      .pill.mint:hover,
      .pill.mint:focus { background: var(--mint); }
      .pill.peach.active,
      .pill.peach:hover,
      .pill.peach:focus { background: var(--peach); }
      .nav-suffix { font-size: 0.85em; font-style: italic; font-weight: 400; }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .wrap {
        width: calc(100% - 25rem);
        margin: 0 auto;
        padding: 1.5rem 0 5rem;
      }

      .university-panel {
        width: 100%;
        margin: 0 auto;
      }

      .university-titlebar {
        display: none;
        align-items: flex-start;
        justify-content: flex-end;
        gap: 1.5rem;
      }

      .university-toolbox {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 1.25rem;
      }

      .university-toolbox > .category-controls {
        grid-column: 1 / -1;
      }

      h1 {
        margin: 0;
        font-size: clamp(2.4rem, 5vw, 4.4rem);
        font-weight: 900;
        line-height: 1;
        letter-spacing: 0;
      }

      .back {
        flex: 0 0 auto;
        background: var(--panel);
        padding: 0.65rem 1rem;
        font-size: 1rem;
      }

      .category-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0;
      }

      .filter-top-row {
        display: grid;
        width: 100%;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 1rem;
      }

      .filter-bottom-row {
        display: grid;
        width: 100%;
        grid-template-columns: minmax(0, 1fr) minmax(12rem, 12.775rem);
        align-items: start;
        gap: 1rem;
      }

      .category-button {
        background: var(--panel);
        cursor: pointer;
        font: inherit;
        font-size: 0.82rem;
        font-weight: 800;
        padding: 0.52rem 0.88rem;
      }

      .category-button:not(.major-filter)[aria-pressed="true"] { background: var(--yellow); }

      .major-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        width: 100%;
        padding-top: 0.18rem;
      }

      .region-filter,
      .tier-filter,
      .major-filter {
        font-size: 0.78rem;
        padding: 0.46rem 0.78rem;
      }

      .tier-filter {
        background: #e6f7f7;
      }

      .tier-controls {
        justify-content: flex-end;
      }

      .major-filter[aria-pressed="true"] {
        outline: 2px solid var(--ink);
        outline-offset: 2px;
      }

      .school-search {
        position: relative;
        display: block;
        min-width: 0;
      }

      .school-search input {
        width: 100%;
        height: 2.45rem;
        border: 0.7px solid var(--ink);
        border-radius: 6px;
        background: var(--surface);
        color: var(--ink);
        font: inherit;
        font-size: 0.82rem;
        font-style: italic;
        font-weight: 400;
        padding: 0 2rem 0 0.9rem;
        text-align: right;
        outline: none;
      }

      .school-search input::placeholder {
        color: var(--muted);
        font-style: italic;
        font-weight: 400;
      }

      .school-search input:focus {
        border-color: var(--ink);
        box-shadow: 0 0 0 1px var(--ink);
      }

      .school-search-clear {
        position: absolute;
        top: 50%;
        right: 0.45rem;
        display: none;
        width: 1.15rem;
        height: 1.15rem;
        transform: translateY(-50%);
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: var(--paper);
        color: var(--ink);
        cursor: pointer;
        font: inherit;
        font-size: 0.68rem;
        font-weight: 900;
        line-height: 1;
      }

      .school-search-clear.is-visible {
        display: grid;
        place-items: center;
      }

      .school-search-clear:hover,
      .school-search-clear:focus {
        background: var(--yellow);
      }

      .result-count {
        margin: 0.7rem 0 0;
        color: var(--muted);
        font-size: 0.75rem;
        font-weight: 800;
      }

      table {
        width: 100%;
        margin-top: 2rem;
        border: 1px solid var(--ink);
        border-collapse: collapse;
        background: var(--surface);
        font-size: 0.85rem;
        table-layout: fixed;
      }

      th,
      td {
        border-bottom: 1px solid var(--ink);
        padding: 0.95rem 1rem;
        text-align: left;
        vertical-align: middle;
        word-break: keep-all;
        overflow-wrap: anywhere;
      }

      th {
        background: var(--panel);
        font-size: 0.969rem;
        font-weight: 900;
      }

      .student-head-note {
        font-size: 0.7em;
        font-style: italic;
        font-weight: 400;
      }

      .university-name,
      .tier-code,
      .student-total {
        display: block;
        font-size: 1.003rem;
        font-weight: 900;
        line-height: 1.2;
      }

      .university-toggle {
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font-family: inherit;
        padding: 0;
        text-align: left;
        text-decoration-thickness: 1px;
        text-underline-offset: 0.22rem;
      }

      .university-toggle:hover,
      .university-toggle[aria-expanded="true"] {
        text-decoration: underline;
      }

      .school-name-line {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.45rem 0.75rem;
      }

      .school-info-toggle {
        display: inline-flex;
        min-height: 1.25rem;
        align-items: center;
        justify-content: center;
        border: 1px solid #a8aca2;
        background: #eef8df;
        color: var(--ink);
        padding: 0.12rem 0.72rem;
        font: inherit;
        font-size: 0.72rem;
        font-weight: 900;
        line-height: 1;
        cursor: pointer;
      }

      .school-info-toggle:hover,
      .school-info-toggle:focus,
      .school-info-toggle[aria-expanded="true"] {
        background: #e2f3cf;
        outline: none;
      }

      .school-subtitle,
      .tier-note,
      .student-foreign {
        display: block;
        margin-top: 0.25rem;
        color: var(--muted);
      }

      .school-subtitle { font-size: 0.748rem; line-height: 1.35; }
      .tier-note { font-size: 0.5525rem; line-height: 1.35; }
      .student-foreign { color: var(--ink); font-size: 0.765rem; font-weight: 400; }

      .city-line {
        display: block;
        line-height: 1.35;
      }

      .direction-cell {
        color: var(--muted);
      }

      .direction-text {
        display: block;
        font-size: 0.8075rem;
        line-height: 1.4;
      }

      .major-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.28rem;
        margin-top: 0.4rem;
      }

      .major-tag {
        display: inline-flex;
        align-items: center;
        min-height: 1.28rem;
        border: 1px solid var(--ink);
        border-radius: 999px;
        padding: 0.16rem 0.5rem;
        color: var(--ink);
        font-size: 0.704rem;
        font-weight: 800;
        line-height: 1;
      }

      .tag-business { background: #f6e77d; }
      .tag-computer { background: #a9dccd; }
      .tag-engineering { background: #e5edff; }
      .tag-media { background: #dfc8f4; }
      .tag-art { background: #f2c6d5; }
      .tag-beauty { background: #ffd6e7; }
      .tag-korean { background: #cdebdc; }
      .tag-tourism { background: #f5d7b8; }
      .tag-humanities { background: #fffefb; }
      .tag-science { background: #ccecf0; }
      .tag-pending { background: #eeeae0; }

      .case-detail-row > td {
        padding: 1rem;
        background: var(--panel);
      }

      .case-panel {
        display: grid;
        gap: 1rem;
        border: 1px solid var(--ink);
        background: var(--panel);
        padding: 1rem;
      }

      .school-info-panel {
        display: grid;
        grid-template-columns: minmax(12rem, 1fr) minmax(12rem, 1fr) minmax(18rem, 1.55fr);
        align-items: start;
        gap: 1rem;
        border: 1px solid var(--ink);
        background: var(--paper);
        container-type: inline-size;
        padding: 0.8rem;
      }

      .school-info-panel.is-no-photo {
        grid-template-columns: minmax(15rem, 1fr) minmax(18rem, 1.55fr);
      }

      .school-info-photo-frame {
        width: 100%;
        aspect-ratio: 1 / 1;
        align-self: start;
        overflow: hidden;
        border: 1px solid #a8a8a8;
        background: #f2f1ec;
        margin: 0;
      }

      .school-info-photo {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .school-info-table,
      .school-info-intro {
        height: calc((100cqw - 2rem) / 3.55);
        overflow: hidden;
        border: 1px solid #a8a8a8;
        background: var(--paper);
      }

      .school-info-table {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        grid-template-rows: auto repeat(6, minmax(0, 1fr));
      }

      .school-info-table h3,
      .school-info-intro h3 {
        margin: 0;
        border-bottom: 1px solid #a8a8a8;
        background: #f1f1ee;
        text-align: center;
        font-size: 0.98rem;
        line-height: 1.35;
      }

      .school-info-table h3 {
        grid-column: 1 / -1;
        padding: 0.62rem 0.7rem;
      }

      .school-info-intro h3 {
        padding: 0.78rem 0.9rem;
      }

      .school-info-table h3 small {
        display: block;
        margin-top: 0.15rem;
        color: var(--muted);
        font-size: 0.68rem;
        font-weight: 800;
      }

      .school-info-cell {
        display: grid;
        min-height: 0;
        place-items: center;
        border-bottom: 1px solid #a8a8a8;
        padding: 0.42rem 0.5rem;
        text-align: center;
        font-size: 0.8rem;
        font-weight: 900;
        line-height: 1.3;
      }

      .school-info-cell:nth-child(2n + 1) {
        border-left: 1px solid #a8a8a8;
      }

      .school-info-cell small {
        display: block;
        margin-top: 0.1rem;
        font-size: 0.68rem;
        font-style: italic;
        font-weight: 400;
      }

      .school-info-logo {
        display: block;
        width: min(6.3rem, 70%);
        height: 1.85rem;
        object-fit: contain;
      }

      .school-info-logo-cell {
        padding-block: 0.25rem;
      }

      .school-info-link {
        display: inline-grid;
        place-items: center;
        color: var(--ink);
        font-weight: 900;
        text-decoration: underline;
        text-underline-offset: 0.18em;
      }

      .school-info-logo-link {
        width: 100%;
        height: 100%;
        min-height: 0;
        text-decoration: none;
      }

      .school-info-intro {
        display: flex;
        flex-direction: column;
        padding: 0;
      }

      .school-info-intro p {
        margin: 0.65rem 1.25rem 0;
        color: var(--ink);
        font-size: 0.86rem;
        line-height: 1.75;
      }

      .school-info-intro em {
        display: block;
        margin: auto 1.25rem 1.15rem;
        color: var(--muted);
        font-size: 0.72rem;
        font-style: italic;
        line-height: 1.65;
      }

      .case-summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.75rem;
      }

      .case-field {
        display: grid;
        gap: 0.3rem;
        font-size: 0.85rem;
        font-weight: 800;
      }

      .case-field strong {
        display: grid;
        min-height: 2.35rem;
        align-items: center;
        border: 1px solid var(--ink);
        background: var(--paper);
        padding: 0.55rem 0.65rem;
        font-size: 0.85rem;
        line-height: 1.1;
      }

      .case-count-value {
        color: #9f1d1d;
      }

      .case-charts {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.75rem;
        align-items: start;
      }

      .case-chart,
      .case-snapshot {
        border: 1px solid var(--ink);
        background: var(--paper);
        padding: 0.85rem;
      }

      .case-chart-head,
      .case-bar-meta {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .case-chart h3 {
        margin: 0;
        font-size: 0.9rem;
      }

      .case-bars {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.825rem;
        margin-top: 0.75rem;
      }

      .case-bar-meta {
        font-size: 0.72rem;
      }

      .case-bar-meta strong {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .case-bar-meta span {
        flex-shrink: 0;
      }

      .case-bar-track {
        height: 0.65rem;
        overflow: hidden;
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: var(--surface);
      }

      .case-bar-track span {
        display: block;
        height: 100%;
        border-radius: 999px;
      }

      .case-result-stack {
        display: flex;
        height: 2.25rem;
        overflow: hidden;
        border: 1px solid var(--ink);
        background: var(--surface);
      }

      .case-result-stack span {
        display: grid;
        place-items: center;
        font-size: 0.72rem;
        font-weight: 900;
      }

      .case-result-stack span + span {
        border-left: 1px solid var(--ink);
      }

      .case-result-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin-top: 0.8rem;
      }

      .case-result-legend span,
      .case-snapshot span {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--ink);
        border-radius: 999px;
        padding: 0.35rem 0.58rem;
        font-size: 0.72rem;
        font-weight: 900;
      }

      .case-result-legend i {
        width: 0.6rem;
        height: 0.6rem;
        margin-right: 0.35rem;
        border: 1px solid var(--ink);
        border-radius: 50%;
      }

      .case-snapshots {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .case-snapshot {
        display: grid;
        gap: 0.7rem;
      }

      .case-snapshot strong {
        font-size: 0.9rem;
      }

      .case-snapshot p {
        margin: 0;
        color: var(--ink);
        font-size: 0.78rem;
        line-height: 1.55;
      }

      .case-admitted { background: var(--green); }
      .case-rejected { background: var(--pink); }
      .case-mixed { background: var(--yellow); }

      .case-panel-note {
        margin: 0;
        color: var(--muted);
        font-size: 0.78rem;
        font-style: italic;
        line-height: 1.6;
        text-align: right;
      }

      /* Fixed desktop shortcut navigation */
      @media (min-width: 721px) {
        .header .header-inner {
          display: grid;
          grid-template-columns: 6.5rem minmax(0, 1fr) auto;
        }

        .nav {
          position: absolute;
          top: 2.3rem;
          right: 4rem;
          width: min(53rem, calc(100vw - 13rem));
          max-width: none;
          flex-wrap: nowrap;
          justify-content: flex-end;
          justify-self: end;
        }

        .nav > .pill {
          flex: 0 0 auto;
          height: 2.35rem;
          min-height: 0;
          padding: 0;
          white-space: nowrap;
        }

        .nav > .pill:nth-child(1) { width: 11.4rem; }
        .nav > .pill:nth-child(2) { width: 9.4rem; }
        .nav > .pill:nth-child(3) { width: 10.6rem; }
        .nav > .pill:nth-child(4) { width: 12.4rem; }
        .nav > .pill:nth-child(5) { width: 5.6rem; }
      }

      @media (max-width: 980px) {
        .header {
          padding: 0.85rem 1rem;
        }

        .header-inner {
          min-height: auto;
          grid-template-columns: auto 1fr;
        }

        .logo {
        display: block;
          width: 4.9rem;
          height: 3.75rem;
        }

        .header-title {
          min-width: 0;
          padding-left: 0;
          font-size: 0.69rem;
        }

        .nav { max-width: none; }
        .nav {
          grid-column: 1 / -1;
          margin: 0 -1rem;
          overflow-x: auto;
          flex-wrap: nowrap;
          justify-content: flex-start;
          padding: 0.25rem 1rem 0.2rem;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .nav::-webkit-scrollbar { display: none; }
        .pill {
          flex: 0 0 auto;
          min-height: 2.5rem;
          padding: 0.5rem 0.7rem;
          font-size: 0.86rem;
        }

        .wrap {
          width: calc(100% - 1.5rem);
          padding-top: 1rem;
          padding-bottom: calc(5rem + env(safe-area-inset-bottom));
        }

        .university-panel { width: 100%; }
        .university-toolbox { grid-template-columns: 1fr; }
        .university-toolbox .back {
          justify-self: end;
          margin-top: 0.75rem;
        }
        table { font-size: 0.765rem; }
        th:nth-child(3), td:nth-child(3),
        th:nth-child(4), td:nth-child(4) { display: none; }
        .school-info-panel {
          grid-template-columns: minmax(13rem, 1fr) minmax(18rem, 1.3fr);
        }
        .school-info-photo-frame {
          display: none;
        }
        .school-info-table,
        .school-info-intro {
          height: auto;
          min-height: 16rem;
        }
        .case-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .case-charts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .case-snapshots { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      @media (max-width: 640px) {
        .category-controls {
          display: grid;
          width: 100%;
          gap: 0.5rem;
          margin: 0;
          overflow: visible;
          padding: 0;
        }
        .category-button {
          flex: 0 0 auto;
          min-height: 2.5rem;
        }
        .major-controls {
          width: 100%;
          flex-wrap: nowrap;
          padding-top: 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .major-controls::-webkit-scrollbar { display: none; }
        .filter-top-row {
          display: grid;
          width: 100%;
          grid-template-columns: minmax(0, 1fr);
          gap: 0.5rem;
        }
        .tier-controls {
          justify-content: flex-start;
        }
        .filter-bottom-row {
          display: grid;
          width: 100%;
          grid-template-columns: minmax(0, 1fr);
          gap: 0.5rem;
        }
        .filter-bottom-row .major-controls {
          width: 100%;
        }
        .school-search {
          width: 100%;
        }
        table,
        tbody,
        tr,
        td {
          display: block;
          width: 100%;
        }
        colgroup,
        thead {
          display: none;
        }
        table {
          margin-top: 1rem;
          border: 0;
          background: transparent;
        }
        tr {
          margin-bottom: 0.75rem;
          border: 1px solid var(--ink);
          border-radius: 8px;
          background: var(--surface);
          padding: 0.85rem;
        }
        td,
        td:nth-child(3),
        td:nth-child(4) {
          display: grid;
          grid-template-columns: 5rem minmax(0, 1fr);
          gap: 0.75rem;
          border-bottom: 0;
          padding: 0.42rem 0;
          font-size: 0.86rem;
        }
        td::before {
          color: var(--muted);
          font-size: 0.72rem;
          font-weight: 900;
        }
        td:nth-child(1) {
          display: block;
          padding-top: 0;
        }
        td:nth-child(1)::before { content: ""; display: none; }
        td:nth-child(2)::before { content: "学校等级"; }
        td:nth-child(3)::before { content: "城市"; }
        td:nth-child(4)::before { content: "类型"; }
        td:nth-child(5)::before { content: "方向"; }
        td:nth-child(6)::before { content: "学生"; }
        .case-detail-row {
          display: block;
          margin-bottom: 0.75rem;
          border: 0;
          padding: 0;
        }
        .case-detail-row > td {
          display: block;
          padding: 0;
        }
        .case-detail-row > td::before {
          display: none;
          content: "";
        }
        .school-info-panel,
        .school-info-panel.is-no-photo {
          grid-template-columns: 1fr;
        }
        .school-info-table,
        .school-info-intro {
          min-height: 0;
        }
        .school-info-intro p,
        .school-info-intro em {
          margin-left: 0.9rem;
          margin-right: 0.9rem;
        }
        .school-info-intro em {
          margin-top: 1rem;
        }
        .case-summary-grid,
        .case-charts,
        .case-snapshots {
          grid-template-columns: 1fr;
        }
        .direction-cell,
        .student-cell {
          align-items: start;
        }
      }
      /* Image back-to-top control */
      .back-to-top-button {
        position: fixed;
        right: 4.25rem;
        bottom: 1.25rem;
        z-index: 90;
        display: block;
        width: 5.1rem;
        border: 0;
        background: transparent;
        padding: 0;
        cursor: pointer;
      }

      .back-to-top-button img {
        display: block;
        width: 100%;
        height: auto;
        object-fit: contain;
        pointer-events: none;
      }

      .back-to-top-button:hover,
      .back-to-top-button:focus,
      .back-to-top-button:active {
        background: transparent;
      }

      .back-to-top-button:focus {
        outline: none;
      }

      .back-to-top-button:focus-visible {
        border-radius: 0.75rem;
        outline: 2px solid var(--ink, #0a0a0a);
        outline-offset: 0.25rem;
      }

      @media (max-width: 720px) {
        .back-to-top-button {
          right: 0.75rem;
          bottom: calc(0.75rem + env(safe-area-inset-bottom));
          width: 4.08rem;
        }
      }

    
      /* header-lock: keep page headers aligned across every module */
      .nav-suffix {
        font-size: 0.85em;
        font-style: italic;
        font-weight: 400;
      }

      @media (min-width: 721px) {
        .header {
          padding: 1rem 4rem;
        }
        .header .header-inner {
          display: grid;
          min-height: 5rem;
          grid-template-columns: 6.5rem minmax(0, 1fr) auto;
          align-items: center;
          gap: 1rem;
        }
        .header .logo,
        .header img.logo {
          width: 6.5rem;
          height: 5rem;
          object-fit: contain;
        }
        .header .header-title {
          min-width: 12rem;
          overflow: hidden;
          padding-left: 1rem;
          font-size: clamp(1.11rem, 1.92vw, 2.1rem);
          font-weight: 900;
          line-height: 1;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .header .nav,
        .header .top-nav {
          position: absolute;
          top: 2.3rem;
          right: 4rem;
          width: min(53rem, calc(100vw - 13rem));
          max-width: none;
          flex-wrap: nowrap;
          justify-content: flex-end;
          justify-self: end;
        }
        .header .nav > .pill,
        .header .top-nav > .nav-pill {
          flex: 0 0 auto;
          height: 2.35rem;
          min-height: 0;
          padding: 0;
          white-space: nowrap;
        }
        .header .nav > .pill:nth-child(1),
        .header .top-nav > .nav-pill:nth-child(1) { width: 11.4rem; }
        .header .nav > .pill:nth-child(2),
        .header .top-nav > .nav-pill:nth-child(2) { width: 9.4rem; }
        .header .nav > .pill:nth-child(3),
        .header .top-nav > .nav-pill:nth-child(3) { width: 10.6rem; }
        .header .nav > .pill:nth-child(4),
        .header .top-nav > .nav-pill:nth-child(4) { width: 12.4rem; }
        .header .nav > .pill:nth-child(5),
        .header .top-nav > .nav-pill:nth-child(5) { width: 5.6rem; }
      }

      @media (max-width: 980px) {
        .header {
          padding: 0.85rem 1rem;
        }
        .header .header-inner {
          min-height: auto;
          grid-template-columns: auto 1fr;
        }
        .header .logo,
        .header img.logo {
          width: 4.9rem;
          height: 3.75rem;
        }
        .header .header-title {
          min-width: 0;
          padding-left: 0;
          font-size: 0.69rem;
        }
        .header .nav,
        .header .top-nav {
          grid-column: 1 / -1;
          position: static;
          width: auto;
          max-width: none;
          margin: 0 -1rem;
          padding: 0.25rem 1rem 0.15rem;
          flex-wrap: nowrap;
          justify-content: flex-start;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
      }

    
      /* header-lock-pill: normalize nav pill height across modules */
      .header .nav > .pill,
      .header .top-nav > .nav-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.15rem;
        font-size: 0.95rem;
        line-height: 1;
      }

      @media (max-width: 980px) {
        .header .nav > .pill,
        .header .top-nav > .nav-pill {
          flex: 0 0 auto;
          height: 2.35rem;
          min-height: 0;
          padding: 0 0.72rem;
          white-space: nowrap;
        }
      }

    
      /* final-header-lock: absolute header geometry, based on application/cost pages */
      .nav-suffix {
        font-size: 0.85em !important;
        font-style: italic !important;
        font-weight: 400 !important;
      }

      @media (min-width: 981px) {
        .header {
          position: sticky !important;
          top: 0 !important;
          height: 7.05rem !important;
          min-height: 7.05rem !important;
          padding: 1rem 4rem !important;
          box-sizing: border-box !important;
        }
        .header .header-inner {
          position: relative !important;
          display: block !important;
          width: 100% !important;
          max-width: none !important;
          height: 5rem !important;
          min-height: 5rem !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .header .logo,
        .header img.logo {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 6.5rem !important;
          height: 5rem !important;
          object-fit: contain !important;
        }
        .header .header-title {
          position: absolute !important;
          left: 8.5rem !important;
          top: 50% !important;
          width: calc(100vw - 18rem) !important;
          min-width: 0 !important;
          max-width: none !important;
          transform: translateY(-50%) !important;
          overflow: hidden !important;
          padding-left: 0 !important;
          font-size: clamp(1.11rem, 1.92vw, 2.1rem) !important;
          font-weight: 900 !important;
          line-height: 1 !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        .header .nav,
        .header .top-nav {
          position: absolute !important;
          top: 50% !important;
          right: 0 !important;
          width: 53rem !important;
          max-width: calc(100vw - 13rem) !important;
          height: 2.35rem !important;
          transform: translateY(-50%) !important;
          display: flex !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 0.5rem !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
          scrollbar-width: auto !important;
        }
        .header .nav > .pill,
        .header .top-nav > .nav-pill {
          display: inline-flex !important;
          flex: 0 0 auto !important;
          box-sizing: border-box !important;
          align-items: center !important;
          justify-content: center !important;
          gap: normal !important;
          height: 2.35rem !important;
          min-height: 0 !important;
          padding: 0 !important;
          font-size: 0.95rem !important;
          line-height: 1 !important;
          white-space: nowrap !important;
        }
        .header .nav > .pill:nth-child(1),
        .header .top-nav > .nav-pill:nth-child(1) { width: 11.4rem !important; }
        .header .nav > .pill:nth-child(2),
        .header .top-nav > .nav-pill:nth-child(2) { width: 9.4rem !important; }
        .header .nav > .pill:nth-child(3),
        .header .top-nav > .nav-pill:nth-child(3) { width: 10.6rem !important; }
        .header .nav > .pill:nth-child(4),
        .header .top-nav > .nav-pill:nth-child(4) { width: 12.4rem !important; }
        .header .nav > .pill:nth-child(5),
        .header .top-nav > .nav-pill:nth-child(5) { width: 5.6rem !important; }
      }

      @media (max-width: 980px) {
        .header {
          height: 9.25rem !important;
          min-height: 9.25rem !important;
          padding: 0.85rem 1rem !important;
          box-sizing: border-box !important;
        }
        .header .header-inner {
          position: relative !important;
          display: block !important;
          height: 4.25rem !important;
          min-height: 4.25rem !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .header .logo,
        .header img.logo {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 4.9rem !important;
          height: 3.75rem !important;
          object-fit: contain !important;
        }
        .header .header-title {
          position: absolute !important;
          left: 5.95rem !important;
          top: 1.9rem !important;
          width: calc(100vw - 7rem) !important;
          min-width: 0 !important;
          transform: translateY(-50%) !important;
          overflow: hidden !important;
          padding-left: 0 !important;
          font-size: 0.69rem !important;
          font-weight: 900 !important;
          line-height: 1 !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        .header .nav,
        .header .top-nav {
          position: absolute !important;
          left: -1rem !important;
          top: 4.65rem !important;
          width: calc(100vw) !important;
          max-width: none !important;
          height: 2.75rem !important;
          display: flex !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          justify-content: flex-start !important;
          gap: 0.4rem !important;
          margin: 0 !important;
          padding: 0.25rem 1rem 0.15rem !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          transform: none !important;
          -webkit-overflow-scrolling: touch !important;
          scrollbar-width: none !important;
        }
        .header .nav > .pill,
        .header .top-nav > .nav-pill {
          display: inline-flex !important;
          flex: 0 0 auto !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.15rem !important;
          height: 2.35rem !important;
          min-height: 0 !important;
          padding: 0 0.72rem !important;
          font-size: 0.95rem !important;
          line-height: 1 !important;
          white-space: nowrap !important;
        }
      }

    </style>
  </head>
  <body>
    <header class="header">
      <div class="header-inner">
        <a href="./hanxue-luopan-home.html" aria-label="韩学罗盘">
          <img class="logo" src="./public/korea-link-logo.gif" alt="韩学罗盘" />
        </a>
        <div class="header-title">韩国大学库</div>
        <nav class="nav" aria-label="main navigation">
                    <a class="pill pink active" href="./universities.html">&#38889;&#22269;&#22823;&#23398;&#24211; <span class="nav-suffix">&#65288;&#30452;&#21319;&#65289;</span></a>
          <a class="pill mint" href="./application.html">&#22269;&#20869;+&#38889;&#22269;&#39033;&#30446;</a>
          <a class="pill green" href="./topik.html">&#38889;&#35821;(TOPIK)</a>
          <a class="pill yellow" href="./cost.html">&#30041;&#23398;&#36153;&#29992; <span class="nav-suffix">&#65288;&#22870;&#23398;&#37329;&#65289;</span></a>
          <a class="pill yellow" href="./exchange-rate.html">&#27719;&#29575;</a>
        </nav>
      </div>
    </header>
    <main class="wrap">
      <section class="university-panel">
        <div class="university-toolbox">
        <div class="category-controls" aria-label="大学列表分类">
          <div class="filter-top-row">
            <div class="major-controls" aria-label="基础和地区筛选">
              <button class="category-button" type="button" data-filter="all" aria-pressed="true">全部</button>
              <button class="category-button" type="button" data-filter="national" aria-pressed="false">国立</button>
              <button class="category-button" type="button" data-filter="private" aria-pressed="false">私立</button>
              ${zoneButtons}
            </div>
            <div class="major-controls tier-controls" aria-label="学校等级筛选">
              ${tierButtons}
            </div>
          </div>
          <div class="filter-bottom-row" aria-label="专业方向筛选和学校搜索">
            <div class="major-controls" aria-label="专业方向筛选">
              ${majorButtons}
            </div>
            <label class="school-search">
              <span class="sr-only">学校搜索</span>
              <input id="school-search" type="search" placeholder="搜索：当前入库韩国96所高校" aria-label="学校搜索" autocomplete="off" />
              <button class="school-search-clear" type="button" aria-label="清空学校搜索">x</button>
            </label>
          </div>
        </div>
        </div>
        <p class="result-count" aria-live="polite"><span id="visible-school-count"></span></p>
        <table>
          <colgroup>
            <col style="width: 24.4%" />
            <col style="width: 10.2%" />
            <col style="width: 5.9%" />
            <col style="width: 7.7%" />
            <col style="width: 37.6%" />
            <col style="width: 14.2%" />
          </colgroup>
          <thead>
            <tr>
              <th>学校</th>
              <th>学校等级</th>
              <th>城市</th>
              <th>类型</th>
              <th>方向参考</th>
              <th><span>学生数 <span class="student-head-note">(外国人)</span></span></th>
            </tr>
          </thead>
          <tbody>
            ${universities.map(rowHtml).join("\n")}
          </tbody>
        </table>
      </section>
      <script>
        (() => {
          const buttons = Array.from(document.querySelectorAll(".category-button"));
          const rows = Array.from(document.querySelectorAll("tbody tr.university-row"));
          const tbody = document.querySelector("tbody");
          const searchInput = document.querySelector("#school-search");
          const searchClear = document.querySelector(".school-search-clear");
          const visibleCount = document.querySelector("#visible-school-count");
          const caseSummaries = ${JSON.stringify(caseSummaries)};
          const schoolProfiles = ${JSON.stringify(schoolProfiles)};
          const caseBarColor = "#d8d6cf";
          const caseHighlightColor = "#ffe07a";
          const zoneOrder = new Map(${JSON.stringify(zones.map((zone, index) => [zone.key, index]))});
          const tierOrder = new Map([["T1", 1], ["T2", 2], ["T3", 3], ["T4", 4], ["T5", 5]]);
          let detailRow = null;
          let expandedSlug = null;
          let expandedDetailType = null;
          let currentFilter = "all";

          function htmlEscape(value) {
            return String(value ?? "")
              .replaceAll("&", "&amp;")
              .replaceAll("<", "&lt;")
              .replaceAll(">", "&gt;")
              .replaceAll('"', "&quot;");
          }

          function formatPercent(value) {
            const number = Number(value || 0);
            return \`\${number.toFixed(number % 1 === 0 ? 0 : 1)}%\`;
          }

          function formatAverageGpa(value) {
            return typeof value === "number" ? \`\${value.toFixed(1)}/100\` : "暂无";
          }

          function compact(value, limit = 48) {
            const text = String(value ?? "");
            return text.length > limit ? \`\${text.slice(0, limit)}...\` : text;
          }

          function topSignal(items) {
            const mostCommon = [...(items || [])].sort((a, b) => b.count - a.count)[0];
            return mostCommon ? \`\${mostCommon.label} \${formatPercent(mostCommon.percent)}\` : "暂无";
          }

          function miniChartLabel(title, label) {
            const text = String(label || "");
            if (title === "TOPIK分布") return text.replace(/^TOPIK\\s*/, "");
            if (title === "雅思分布") {
              const score = text.replace(/^雅思\s*/, "");
              return /^\\d+(?:\\.\\d+)?$/.test(score) ? score + "分" : score.replace("雅思", "");
            }
            return text;
          }

          function isKnownChartItem(label) {
            return !/(未注明|不详|暂无|unknown)/i.test(String(label || ""));
          }

          function highlightItemKey(items) {
            return [...(items || [])]
              .filter((item) => isKnownChartItem(item.label))
              .sort((a, b) => b.count - a.count || b.percent - a.percent)[0]?.key;
          }

          function resultStackColor(label) {
            if (label === "录取") return caseHighlightColor;
            if (label === "拒绝") return "#fffefb";
            if (label === "混合") return "#ffd0d8";
            return "#eeeae0";
          }

          function clearDetail() {
            if (detailRow) detailRow.remove();
            detailRow = null;
            expandedSlug = null;
            expandedDetailType = null;
            rows.forEach((row) => row.querySelector(".university-toggle")?.setAttribute("aria-expanded", "false"));
            rows.forEach((row) => row.querySelector(".school-info-toggle")?.setAttribute("aria-expanded", "false"));
          }

          function renderBars(title, items) {
            const highlightedKey = highlightItemKey(items);
            return \`<section class="case-chart"><div class="case-chart-head"><h3>\${htmlEscape(title)}</h3><span aria-hidden="true">↗</span></div><div class="case-bars">\${(items || []).slice(0, 6).map((item) => \`<div class="case-bar-row"><div class="case-bar-meta"><strong>\${htmlEscape(miniChartLabel(title, item.label))}</strong><span>\${item.count} / \${formatPercent(item.percent)}</span></div><div class="case-bar-track"><span style="width:\${Math.max(item.percent, item.count > 0 ? 4 : 0)}%;background:\${item.key === highlightedKey ? caseHighlightColor : caseBarColor}"></span></div></div>\`).join("")}</div></section>\`;
          }

          function renderResultStack(items) {
            return \`<div class="case-field case-result-field"><span>申请结果</span><div class="case-result-stack">\${(items || []).map((item) => \`<span style="flex-basis:\${item.percent}%;background:\${resultStackColor(item.label)}">\${item.percent >= 12 ? \`\${htmlEscape(item.label)} \${item.count}\` : ""}</span>\`).join("")}</div></div>\`;
          }

          function renderCase(admissionCase) {
            const tone = admissionCase.resultKey === "admitted" ? "case-admitted" : admissionCase.resultKey === "rejected" ? "case-rejected" : "case-mixed";
            return \`<li class="case-snapshot"><div><span class="\${tone}">\${htmlEscape(admissionCase.result)}</span><span>\${htmlEscape(admissionCase.entryYear)}</span><span>\${htmlEscape(admissionCase.topik)}</span></div><strong>\${htmlEscape(admissionCase.major)}</strong><p>\${htmlEscape(admissionCase.highSchoolType)} / \${htmlEscape(admissionCase.gpa)} / \${htmlEscape(compact(admissionCase.coreStrength))}</p></li>\`;
          }

          function renderPanel(row) {
            const slug = row.dataset.schoolSlug;
            const schoolName = row.dataset.schoolName;
            const summary = caseSummaries[slug];
            if (!summary || summary.caseCount === 0) {
              return \`<section class="case-panel"><p>\${htmlEscape(schoolName)} 暂无整理好的公开案例图表。</p></section>\`;
            }
            return \`<section class="case-panel" aria-label="\${htmlEscape(schoolName)}案例图表"><div class="case-summary-grid"><div class="case-field"><span>样本量</span><strong class="case-count-value">\${summary.caseCount}例</strong></div><div class="case-field"><span>录取人平均GPA</span><strong>\${formatAverageGpa(summary.admittedAverageGpa)}</strong></div><div class="case-field"><span>TOPIK 主等级段</span><strong>\${htmlEscape(topSignal(summary.topikDistribution))}</strong></div>\${renderResultStack(summary.resultDistribution)}</div><div class="case-charts">\${renderBars("TOPIK分布", summary.topikDistribution)}\${renderBars("\\u96C5\\u601D\\u5206\\u5E03", summary.ieltsDistribution)}\${renderBars("高中背景", summary.highSchoolDistribution)}\${renderBars("入学年份", summary.yearDistribution)}</div><ul class="case-snapshots">\${summary.representativeCases.map(renderCase).join("")}</ul><p class="case-panel-note">公开案例存在样本偏差，只适合做申请画像参考，不等于学校官方录取概率。</p></section>\`;
          }

          function renderSchoolInfoPanel(row) {
            const slug = row.dataset.schoolSlug;
            const profile = schoolProfiles[slug];
            if (!profile) return \`<section class="case-panel"><p>\${htmlEscape(row.dataset.schoolName)} 学校信息待补。</p></section>\`;
            const titleLine = [profile.nameKr, profile.nameEn].filter(Boolean).join(" · ");
            const photo = profile.campusImage
              ? \`<figure class="school-info-photo-frame"><img class="school-info-photo" src="\${htmlEscape(profile.campusImage)}" alt="\${htmlEscape(profile.name)}校园" loading="lazy" style="object-position:\${htmlEscape(profile.imagePosition)}" /></figure>\`
              : "";
            const officialWebsiteLabel = profile.logoImage
              ? \`<img class="school-info-logo" src="\${htmlEscape(profile.logoImage)}" alt="\${htmlEscape(profile.name)}校徽" loading="lazy" />\`
              : "官网";
            const officialWebsite = profile.officialWebsite
              ? \`<a class="school-info-link\${profile.logoImage ? " school-info-logo-link" : ""}" href="\${htmlEscape(profile.officialWebsite)}" target="_blank" rel="noopener noreferrer">\${officialWebsiteLabel}</a>\`
              : "<span>资料待补</span>";

            return \`<section class="school-info-panel\${profile.campusImage ? "" : " is-no-photo"}" aria-label="\${htmlEscape(profile.name)}学校信息">\${photo}<div class="school-info-table"><h3>\${htmlEscape(profile.name)}\${titleLine ? \`<small>\${htmlEscape(titleLine)}</small>\` : ""}</h3><div class="school-info-cell">学校类型</div><div class="school-info-cell">\${htmlEscape(profile.type)}</div><div class="school-info-cell">地理位置</div><div class="school-info-cell">\${htmlEscape(profile.city)}</div><div class="school-info-cell">成立时间</div><div class="school-info-cell">\${htmlEscape(profile.founded)}</div><div class="school-info-cell">学生数</div><div class="school-info-cell">\${htmlEscape(profile.students)}\${profile.internationalStudents ? \`<small>\${htmlEscape(profile.internationalStudents)}</small>\` : ""}</div><div class="school-info-cell">参考层级</div><div class="school-info-cell">\${htmlEscape(profile.tier)}</div><div class="school-info-cell">学校官网</div><div class="school-info-cell school-info-logo-cell">\${officialWebsite}</div></div><div class="school-info-intro"><h3>\${htmlEscape(profile.name)}介绍</h3><p>\${htmlEscape(profile.intro)}</p><p><strong>重点方向：</strong>\${htmlEscape(profile.focus)}</p><em>学校简介用于快速了解合作院校，申请判断仍需结合官方招生简章、项目合同和最新费用说明。</em></div></section>\`;
          }

          function toggleDetail(row, detailType) {
            const slug = row.dataset.schoolSlug;
            if (expandedSlug === slug && expandedDetailType === detailType) {
              clearDetail();
              return;
            }

            clearDetail();
            expandedSlug = slug;
            expandedDetailType = detailType;
            row.querySelector(detailType === "case" ? ".university-toggle" : ".school-info-toggle")?.setAttribute("aria-expanded", "true");
            detailRow = document.createElement("tr");
            detailRow.className = "case-detail-row";
            detailRow.innerHTML = \`<td colspan="6">\${detailType === "info" ? renderSchoolInfoPanel(row) : renderPanel(row)}</td>\`;
            row.after(detailRow);
          }

          function rowVisible(row, filter) {
            const type = row.dataset.type || "";
            const zones = (row.dataset.zones || "").split(" ");
            const majorTags = (row.dataset.majorTags || "").split(" ");
            const [kind, value] = filter.split(":");
            if (filter === "all" || filter === "region") return true;
            if (filter === "national") return type.includes("国立") || type.includes("公立");
            if (filter === "private") return type.includes("私立");
            if (kind === "zone") return zones.includes(value);
            if (kind === "tier") return row.dataset.tier === value;
            if (kind === "major") return majorTags.includes(value);
            return true;
          }

          function normalizeSearchText(value) {
            return String(value || "").trim().toLocaleLowerCase();
          }

          function rowMatchesSearch(row) {
            const query = normalizeSearchText(searchInput?.value);
            if (!query) return true;
            return normalizeSearchText(row.dataset.searchText || row.dataset.schoolName || "").includes(query);
          }

          function sortRows(filter) {
            return [...rows].sort((a, b) => {
              if (filter === "region" || filter.startsWith("zone:")) {
                const zoneCompare =
                  (zoneOrder.get(a.dataset.primaryZone) ?? 999) -
                  (zoneOrder.get(b.dataset.primaryZone) ?? 999);
                if (zoneCompare !== 0) return zoneCompare;
              }
              const tierCompare =
                (tierOrder.get(a.dataset.tier) ?? 99) -
                (tierOrder.get(b.dataset.tier) ?? 99);
              if (tierCompare !== 0) return tierCompare;
              return Number(a.dataset.order) - Number(b.dataset.order);
            });
          }

          function applyFilter(filter) {
            clearDetail();
            currentFilter = filter;
            buttons.forEach((button) => {
              button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
            });

            let shown = 0;
            sortRows(filter).forEach((row) => {
              const isVisible = rowVisible(row, filter) && rowMatchesSearch(row);
              row.hidden = !isVisible;
              if (isVisible) shown += 1;
              tbody.appendChild(row);
            });
            if (visibleCount) visibleCount.textContent = "";
            searchClear?.classList.toggle("is-visible", Boolean(searchInput?.value));
          }

          buttons.forEach((button) => {
            button.addEventListener("click", () => applyFilter(button.dataset.filter));
          });

          searchInput?.addEventListener("input", () => applyFilter(currentFilter));
          searchClear?.addEventListener("click", () => {
            if (!searchInput) return;
            searchInput.value = "";
            searchInput.focus();
            applyFilter(currentFilter);
          });

          tbody.addEventListener("click", (event) => {
            const infoToggle = event.target.closest(".school-info-toggle");
            if (infoToggle) {
              const row = infoToggle.closest(".university-row");
              if (row && !row.hidden) toggleDetail(row, "info");
              return;
            }

            const toggle = event.target.closest(".university-toggle");
            if (!toggle) return;
            const row = toggle.closest(".university-row");
            if (row && !row.hidden) toggleDetail(row, "case");
          });

          applyFilter("all");
        })();
      </script>
    </main>
    <button class="back-to-top-button" type="button" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" aria-label="Back to top">
      <img src="./public/top.webp" alt="" aria-hidden="true" />
    </button>
  </body>
</html>
`;

writeFileSync(new URL("universities.html", root), html, "utf8");
