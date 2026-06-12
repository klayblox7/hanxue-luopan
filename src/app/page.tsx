import { ArrowRight } from "lucide-react";

import { AdmissionsRecommender } from "@/components/AdmissionsRecommender";
import { KoreaStudyMap } from "@/components/KoreaStudyMap";
import { MobileMiniProgramHome } from "@/components/MobileMiniProgramHome";
import { SiteHeader } from "@/components/SiteHeader";

const copy = {
  brand: "KOREA UNIVERSITY LINK",
  footerRule: "\u5b98\u65b9\u4f18\u5148",
  footerRuleEnd: "\u7ecf\u9a8c\u53c2\u8003\u5206\u79bb"
};

export default function Home() {
  return (
    <main id="top" className="flex min-h-screen flex-col bg-paper text-ink">
      <div className="hidden md:block">
        <SiteHeader />
      </div>

      <MobileMiniProgramHome />

      <div className="hidden md:block">
        <KoreaStudyMap />
        <AdmissionsRecommender />
      </div>

      <footer className="hidden shrink-0 border-t border-ink bg-paper py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:block">
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
