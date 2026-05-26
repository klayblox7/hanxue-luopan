import { ArrowRight } from "lucide-react";

import { HomeEntryCard } from "@/components/HomeEntryCard";
import { SiteHeader } from "@/components/SiteHeader";
import { homeEntries } from "@/data/home";

const copy = {
  brand: "\u97e9\u5b66\u7f57\u76d8",
  footerRule: "\u5b98\u65b9\u4f18\u5148",
  footerRuleEnd: "\u7ecf\u9a8c\u53c2\u8003\u5206\u79bb"
};

export default function Home() {
  return (
    <main id="top" className="flex h-screen min-h-screen flex-col overflow-hidden bg-paper text-ink">
      <SiteHeader />

      <section id="entries" aria-label="\u4fe1\u606f\u5165\u53e3" className="mt-auto shrink-0 scroll-mt-40 bg-paper">
        <div className="border-t border-ink">
          {homeEntries.map((entry) => (
            <HomeEntryCard entry={entry} key={entry.title} />
          ))}
        </div>
      </section>

      <footer className="shrink-0 border-t border-ink bg-paper px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[92rem] flex-col gap-3 text-sm text-ink sm:flex-row sm:items-center sm:justify-between">
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
