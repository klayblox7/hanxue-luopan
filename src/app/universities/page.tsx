import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";
import { SourceBadge } from "@/components/SourceBadge";
import { universities } from "@/data/universities";

export const metadata: Metadata = {
  title: "中国学生常查的韩国大学50校｜韩学罗盘",
  description:
    "整理中国学生常查的韩国大学50校，展示中文名、韩文名、英文名、城市、类型和优势方向。"
};

const typeCounts = universities.reduce<Record<string, number>>((counts, university) => {
  counts[university.type] = (counts[university.type] ?? 0) + 1;
  return counts;
}, {});

const cityHighlights = ["首尔", "釜山", "大田", "大邱", "光州", "仁川"];

export default function UniversitiesPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          className="inline-flex min-h-11 items-center rounded-xl border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink transition hover:border-ocean hover:bg-panel focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 focus:ring-offset-paper"
          href="/"
        >
          返回首页
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.78fr_0.22fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-ocean">韩国大学库</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-normal text-ink sm:text-5xl">
              中国学生常查的韩国大学50校
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
              这里整理的是申请韩国留学时经常被查询的学校基础名单，不是“中国学生最多”排名，也不代表学校官方排序。后续会继续补充TOPIK要求、奖学金、费用和详情页来源。
            </p>
          </div>
          <aside className="rounded-2xl bg-peach/45 p-4 shadow-sm ring-1 ring-line">
            <p className="text-xs font-semibold uppercase tracking-normal text-ocean">Data status</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{universities.length}</p>
            <p className="mt-1 text-sm text-muted">所学校 · 更新 2026-05</p>
            <div className="mt-4">
              <SourceBadge type="pending" detail="基础名单" />
            </div>
          </aside>
        </div>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="学校类型统计">
          {Object.entries(typeCounts).map(([type, count]) => (
            <article className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line" key={type}>
              <p className="text-sm text-muted">{type}</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{count}所</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-2xl bg-surface p-4 ring-1 ring-line" aria-label="城市提示">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink">常见城市</span>
            {cityHighlights.map((city) => (
              <span
                className="rounded-full border border-line bg-paper px-3 py-2 text-sm text-soft"
                key={city}
              >
                {city}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-8 hidden overflow-x-auto rounded-2xl bg-surface shadow-data ring-1 ring-line lg:block">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="border-b border-line bg-panel text-xs font-semibold uppercase tracking-normal text-muted">
              <tr>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">学校</th>
                <th className="px-4 py-3">城市</th>
                <th className="px-4 py-3">类型</th>
                <th className="px-4 py-3">方向参考</th>
              </tr>
            </thead>
            <tbody>
              {universities.map((university) => (
                <tr className="border-b border-line transition last:border-b-0 hover:bg-panel" key={university.slug}>
                  <td className="px-4 py-4 font-semibold text-ocean">{university.no}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink">{university.nameCn}</p>
                    <p className="mt-1 text-xs text-muted">
                      {university.nameKr} · {university.nameEn}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-soft">{university.city}</td>
                  <td className="px-4 py-4 text-soft">{university.type}</td>
                  <td className="max-w-sm px-4 py-4 leading-6 text-muted">{university.focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-8 grid gap-4 lg:hidden" aria-label="移动端学校列表">
          {universities.map((university) => (
            <article className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-line" key={university.slug}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-lavender/45 text-sm font-semibold text-ink">
                  {university.no}
                </span>
                <SourceBadge type={university.sourceType} detail={university.updatedAt} />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-ink">{university.nameCn}</h2>
              <p className="mt-1 text-sm text-muted">
                {university.nameKr} · {university.nameEn}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-line bg-paper px-3 py-2 text-sm text-soft">
                  {university.city}
                </span>
                <span className="rounded-full border border-line bg-paper px-3 py-2 text-sm text-soft">
                  {university.type}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">{university.focus}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

