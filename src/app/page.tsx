import { ArrowRight, Calculator, FileCheck2, GraduationCap, Route, SearchCheck } from "lucide-react";
import Link from "next/link";

import { AdmissionsRecommender } from "@/components/AdmissionsRecommender";
import { KoreaStudyMap } from "@/components/KoreaStudyMap";
import { SiteHeader } from "@/components/SiteHeader";
import { homeEntries } from "@/data/home";

const copy = {
  brand: "\u97e9\u5b66\u7f57\u76d8",
  footerRule: "\u5b98\u65b9\u4f18\u5148",
  footerRuleEnd: "\u7ecf\u9a8c\u53c2\u8003\u5206\u79bb"
};

const mobileHomeLinks = [
  {
    title: "韩国大学库",
    detail: "50校比较",
    href: "/universities",
    color: "bg-[#ffd0d8]",
    icon: GraduationCap
  },
  {
    title: "韩语(TOPIK)",
    detail: "备考路线",
    href: "/topik",
    color: "bg-[#71d39b]",
    icon: FileCheck2
  },
  {
    title: "留学费用",
    detail: "人民币预算",
    href: "/cost",
    color: "bg-[#ffe07a]",
    icon: Calculator
  },
  {
    title: "\u56fd\u5185+\u97e9\u56fd\u9879\u76ee",
    detail: "项目路线",
    href: "/application",
    color: "bg-[#a4d4c5]",
    icon: Route
  },
  {
    title: "报考流程",
    detail: "申请顺序",
    href: "/agency-check",
    color: "bg-[#ffb084]",
    icon: SearchCheck
  },
  {
    title: "汇率",
    detail: "韩元参考",
    href: "/exchange-rate",
    color: "bg-[#b8a4ed]",
    icon: ArrowRight
  }
];

function HomeMobileIndex() {
  return (
    <section className="border-b border-ink bg-paper px-3 py-3 md:hidden" aria-label="移动端主入口">
      <div className="grid grid-cols-2 gap-2">
        {mobileHomeLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              className="grid min-h-[6.1rem] content-between rounded-lg border border-ink bg-surface p-3 text-ink transition active:translate-y-0.5"
              href={item.href}
              key={item.href}
            >
              <span className={`flex size-9 items-center justify-center rounded-full border border-ink ${item.color}`}>
                <Icon size={17} strokeWidth={2.4} aria-hidden="true" />
              </span>
              <span>
                <strong className="block text-[0.98rem] font-black leading-tight">{item.title}</strong>
                <span className="mt-1 block text-xs font-bold text-muted">{item.detail}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main id="top" className="flex min-h-screen flex-col bg-paper text-ink">
      <SiteHeader shortcuts={homeEntries} />

      <HomeMobileIndex />

      <KoreaStudyMap />

      <AdmissionsRecommender />

      <footer className="shrink-0 border-t border-ink bg-paper py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="detail-page-container flex flex-col gap-3 text-sm text-ink sm:flex-row sm:items-center sm:justify-between">
          <span>
            {copy.brand} {"\u00a9"} 2026
          </span>
          <span className="inline-flex items-center gap-2">
            {copy.footerRule}
            <ArrowRight size={14} aria-hidden="true" />
            {copy.footerRuleEnd}
          </span>
        </div>
      </footer>
    </main>
  );
}
