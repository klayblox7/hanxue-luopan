import rawAdmissionCases from "./admission-cases.json";

export type AdmissionResultKey = "admitted" | "rejected" | "mixed" | "unknown";

export type AdmissionCase = {
  id: string;
  sourceRow: number;
  schoolName: string;
  schoolSlug?: string | null;
  schoolTier: string;
  major: string;
  highSchoolType: string;
  gpa: string;
  gpaPercent?: number | null;
  topik: string;
  topikLevel?: number | null;
  ielts: string;
  gaokao: string;
  coreStrength: string;
  entryYear: string;
  entryYearNumber?: number | null;
  result: string;
  resultKey: AdmissionResultKey;
  synthetic?: boolean;
  sourceStatus?: string;
  generationBasis?: string;
};

export type DistributionItem = {
  key: string;
  label: string;
  count: number;
  percent: number;
};

export type SchoolCaseOption = {
  key: string;
  label: string;
  count: number;
  admitRate: number;
  schoolTier: string;
  schoolSlug?: string | null;
};

export type AdmissionCaseSummary = {
  caseCount: number;
  admittedCount: number;
  rejectedCount: number;
  mixedCount: number;
  admitRate: number;
  admittedAverageGpa: number | null;
  resultDistribution: DistributionItem[];
  topikDistribution: DistributionItem[];
  ieltsDistribution: DistributionItem[];
  highSchoolDistribution: DistributionItem[];
  yearDistribution: DistributionItem[];
  majorDistribution: DistributionItem[];
  representativeCases: AdmissionCase[];
};

export const admissionCases = rawAdmissionCases as AdmissionCase[];

const resultLabels: Record<AdmissionResultKey, string> = {
  admitted: "录取",
  rejected: "拒绝",
  mixed: "混合",
  unknown: "未注明"
};

const resultOrder: AdmissionResultKey[] = ["admitted", "rejected", "mixed", "unknown"];

function percent(count: number, total: number) {
  return total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
}

function matchesSchool(admissionCase: AdmissionCase, schoolKey: string) {
  return admissionCase.schoolSlug === schoolKey || admissionCase.schoolName === schoolKey;
}

function sortRecentCases(a: AdmissionCase, b: AdmissionCase) {
  const yearCompare = (b.entryYearNumber ?? 0) - (a.entryYearNumber ?? 0);
  if (yearCompare !== 0) return yearCompare;
  const resultCompare = resultOrder.indexOf(a.resultKey) - resultOrder.indexOf(b.resultKey);
  if (resultCompare !== 0) return resultCompare;
  return a.sourceRow - b.sourceRow;
}

function representativeCaseSet(cases: AdmissionCase[]) {
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

function toDistribution(
  cases: AdmissionCase[],
  getValue: (admissionCase: AdmissionCase) => string,
  options: { limit?: number; order?: string[] } = {}
): DistributionItem[] {
  const counts = new Map<string, number>();

  for (const admissionCase of cases) {
    const label = getValue(admissionCase).trim() || "未注明";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const orderMap = new Map((options.order ?? []).map((label, index) => [label, index]));
  const items = [...counts.entries()]
    .map(([label, count]) => ({
      key: label,
      label,
      count,
      percent: percent(count, cases.length)
    }))
    .sort((a, b) => {
      const orderA = orderMap.get(a.label);
      const orderB = orderMap.get(b.label);
      if (orderA !== undefined || orderB !== undefined) return (orderA ?? 999) - (orderB ?? 999);
      return b.count - a.count || a.label.localeCompare(b.label, "zh-Hans-CN");
    });

  return typeof options.limit === "number" ? items.slice(0, options.limit) : items;
}

function topikLabel(admissionCase: AdmissionCase) {
  if (typeof admissionCase.topikLevel === "number") {
    return admissionCase.topikLevel === 0 ? "无TOPIK" : `TOPIK ${admissionCase.topikLevel}级`;
  }

  return admissionCase.topik || "未注明";
}

function highSchoolLabel(admissionCase: AdmissionCase) {
  const label = admissionCase.highSchoolType.trim();
  return label === "省重点/重点高中" || label === "省重点高中" ? "省重点" : label;
}

function averageGpa(cases: AdmissionCase[]) {
  const values = cases
    .map((admissionCase) => admissionCase.gpaPercent)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  return values.length > 0 ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : null;
}

export function getAdmissionCasesForSchool(schoolKey: string) {
  return admissionCases.filter((admissionCase) => matchesSchool(admissionCase, schoolKey)).sort(sortRecentCases);
}

export function getSchoolCaseOptions(): SchoolCaseOption[] {
  const grouped = new Map<string, AdmissionCase[]>();

  for (const admissionCase of admissionCases) {
    const key = admissionCase.schoolSlug ?? admissionCase.schoolName;
    grouped.set(key, [...(grouped.get(key) ?? []), admissionCase]);
  }

  return [...grouped.entries()]
    .map(([key, cases]) => {
      const firstCase = cases[0];
      const admittedCount = cases.filter((admissionCase) => admissionCase.resultKey === "admitted").length;

      return {
        key,
        label: firstCase.schoolName,
        count: cases.length,
        admitRate: percent(admittedCount, cases.length),
        schoolTier: firstCase.schoolTier,
        schoolSlug: firstCase.schoolSlug
      };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-Hans-CN"));
}

export function getAdmissionCaseSummary(schoolKey?: string): AdmissionCaseSummary {
  const cases = schoolKey ? getAdmissionCasesForSchool(schoolKey) : [...admissionCases];
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
    majorDistribution: toDistribution(cases, (admissionCase) => admissionCase.major, { limit: 6 }),
    representativeCases: representativeCaseSet(cases)
  };
}
