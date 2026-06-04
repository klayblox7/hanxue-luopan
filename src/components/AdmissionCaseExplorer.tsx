"use client";

import { BarChart3, Database, Table2 } from "lucide-react";

import {
  admissionCases,
  getAdmissionCaseSummary,
  getSchoolCaseOptions,
  type AdmissionCase,
  type DistributionItem,
  type SchoolCaseOption
} from "@/data/admissionCases";

type AdmissionCaseExplorerProps = {
  selectedSchoolKey: string;
  onSelectedSchoolKeyChange: (schoolKey: string) => void;
};

const schoolOptions = getSchoolCaseOptions();
const allCaseSummary = getAdmissionCaseSummary();
const schoolOptionByKey = new Map(schoolOptions.map((option) => [option.key, option]));

const barColors = ["bg-[#ffe07a]", "bg-[#71d39b]", "bg-[#ffd0d8]", "bg-[#b8a4ed]", "bg-[#ffb084]", "bg-[#a4d4c5]"];

function formatPercent(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

function compactText(value: string, maxLength = 46) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function schoolTierCode(tier: string) {
  return tier.match(/^T[1-5]/)?.[0] ?? tier;
}

function optionLabel(option: SchoolCaseOption) {
  return `${schoolTierCode(option.schoolTier)} ${option.label} ${option.count}例`;
}

function topDistributionLabel(items: DistributionItem[]) {
  const mostCommon = [...items].sort((a, b) => b.count - a.count)[0];

  return mostCommon ? `${mostCommon.label} ${formatPercent(mostCommon.percent)}` : "暂无";
}

function DistributionBars({ compact = false, items, title }: { compact?: boolean; items: DistributionItem[]; title: string }) {
  return (
    <section className={`grid gap-3 rounded-lg border border-ink bg-paper p-3 ${compact ? "min-h-0" : "min-h-[13rem]"}`}>
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-black">{title}</h4>
        <BarChart3 size={16} aria-hidden="true" />
      </div>

      <div className={`grid ${compact ? "gap-3 sm:grid-cols-2" : "gap-2"}`}>
        {items.slice(0, 6).map((item, index) => (
          <div className="grid gap-1" key={`${title}-${item.key}`}>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="min-w-0 truncate font-bold">{item.label}</span>
              <span className="shrink-0 text-muted">
                {item.count} / {formatPercent(item.percent)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full border border-ink bg-surface">
              <div
                className={`h-full rounded-full ${barColors[index % barColors.length]}`}
                data-testid="case-chart-bar"
                style={{ width: `${Math.max(item.percent, item.count > 0 ? 4 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResultStack({ items }: { items: DistributionItem[] }) {
  return (
    <section className="grid gap-3 rounded-lg border border-ink bg-paper p-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-black">申请结果</h4>
        <Table2 size={16} aria-hidden="true" />
      </div>

      <div className="flex h-9 overflow-hidden rounded-full border border-ink bg-surface">
        {items.map((item, index) => (
          <div
            className={`${barColors[index % barColors.length]} grid place-items-center text-xs font-black text-ink`}
            key={item.key}
            style={{ flexBasis: `${item.percent}%` }}
            title={`${item.label} ${item.count}例`}
          >
            {item.percent >= 12 ? item.label : null}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-surface px-2 py-1 text-xs font-bold"
            key={item.key}
          >
            <span className={`h-2.5 w-2.5 rounded-full border border-ink ${barColors[index % barColors.length]}`} />
            {item.label} {item.count}
          </span>
        ))}
      </div>
    </section>
  );
}

function CaseSnapshot({ admissionCase }: { admissionCase: AdmissionCase }) {
  const resultClass =
    admissionCase.resultKey === "admitted"
      ? "bg-[#71d39b]"
      : admissionCase.resultKey === "rejected"
        ? "bg-[#ffd0d8]"
        : "bg-[#ffe07a]";

  return (
    <li className="grid gap-2 rounded-lg border border-ink bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border border-ink px-2 py-1 text-xs font-black ${resultClass}`}>
          {admissionCase.result}
        </span>
        <span className="rounded-full border border-ink bg-paper px-2 py-1 text-xs font-bold">{admissionCase.entryYear}</span>
        <span className="rounded-full border border-ink bg-paper px-2 py-1 text-xs font-bold">{admissionCase.topik}</span>
      </div>
      <p className="text-sm font-black leading-snug">{admissionCase.major}</p>
      <p className="text-xs leading-5 text-muted">
        {admissionCase.highSchoolType} / {admissionCase.gpa} / {compactText(admissionCase.coreStrength)}
      </p>
    </li>
  );
}

export function getDefaultCaseSchoolKey() {
  return schoolOptions[0]?.key ?? "";
}

export function AdmissionCaseExplorer({
  selectedSchoolKey,
  onSelectedSchoolKeyChange
}: AdmissionCaseExplorerProps) {
  const selectedOption = schoolOptionByKey.get(selectedSchoolKey) ?? schoolOptions[0];
  const summary = getAdmissionCaseSummary(selectedOption?.key);

  if (!selectedOption) return null;

  return (
    <section className="grid gap-3 rounded-lg border border-ink bg-surface p-3 sm:gap-4 sm:p-4" aria-label="案例库透视">
      <div className="grid gap-3 xl:grid-cols-4 xl:items-stretch">
        <label className="grid gap-1 text-[0.85rem] font-extrabold">
          <span>学校</span>
          <select
            className="min-w-0 border-2 border-[#9f1d1d] bg-paper px-3 py-2 text-[0.85rem] font-black"
            value={selectedOption.key}
            onChange={(event) => onSelectedSchoolKeyChange(event.target.value)}
          >
            {schoolOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {optionLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-2 sm:grid-cols-3 xl:col-span-3">
          <div className="grid gap-1 text-[0.85rem] font-extrabold">
            <p>样本量</p>
            <strong className="grid min-h-[2.35rem] items-center border border-ink bg-paper px-3 py-2 text-[0.85rem] font-black leading-tight">
              {summary.caseCount}
            </strong>
          </div>
          <div className="grid gap-1 text-[0.85rem] font-extrabold">
            <p>公开案例录取率</p>
            <strong className="grid min-h-[2.35rem] items-center border border-ink bg-paper px-3 py-2 text-[0.85rem] font-black leading-tight">
              {formatPercent(summary.admitRate)}
            </strong>
          </div>
          <div className="grid gap-1 text-[0.85rem] font-extrabold">
            <p>常见语言线索</p>
            <strong className="grid min-h-[2.35rem] items-center border border-ink bg-paper px-3 py-2 text-[0.85rem] font-black leading-tight">
              {topDistributionLabel(summary.topikDistribution)}
            </strong>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ResultStack items={summary.resultDistribution} />
        <DistributionBars compact title="TOPIK分布" items={summary.topikDistribution} />
        <DistributionBars compact title="高中背景" items={summary.highSchoolDistribution} />
        <DistributionBars compact title="入学年份" items={summary.yearDistribution} />
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-black">近期案例</h3>
          <span className="text-xs font-bold text-muted">来源：1400.xlsx / 公开案例整理</span>
        </div>
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {summary.representativeCases.map((admissionCase) => (
            <CaseSnapshot admissionCase={admissionCase} key={admissionCase.id} />
          ))}
        </ul>
      </div>

      <div className="flex justify-start sm:justify-end">
        <span className="inline-flex items-center gap-2 rounded-full border border-ink bg-[#ffe07a] px-3 py-1.5 text-xs font-black">
          <Database size={14} aria-hidden="true" />
          {allCaseSummary.caseCount}条案例
        </span>
      </div>

      <p className="text-xs italic leading-5 text-muted">
        公开案例存在样本偏差，只适合做申请画像参考，不等于学校官方录取概率。
      </p>
    </section>
  );
}

export const admissionCaseCount = admissionCases.length;
