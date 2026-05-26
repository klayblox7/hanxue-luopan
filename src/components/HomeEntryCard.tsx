import {
  ArrowUpRight,
  BookOpen,
  Calculator,
  FileCheck2,
  GraduationCap,
  Landmark,
  Route,
  SearchCheck
} from "lucide-react";
import Link from "next/link";

import type { HomeEntry } from "@/data/home";

const entryVisuals = {
  "/universities": {
    icon: GraduationCap,
    sticker: "bg-[#ffd0d8] text-ink rotate-[-7deg]",
    hover: "hover:bg-[#ffc2df]",
    action: "50\u6821\u6bd4\u8f83"
  },
  "/topik": {
    icon: FileCheck2,
    sticker: "bg-[#71d39b] text-ink rotate-[7deg]",
    hover: "hover:bg-[#c8f1d7]",
    action: "TOPIK\u8def\u7ebf"
  },
  "/cost": {
    icon: Calculator,
    sticker: "bg-[#ffe07a] text-ink rotate-[-4deg]",
    hover: "hover:bg-[#ffe88d]",
    action: "\u5e74\u9884\u7b97\u4f30\u7b97"
  },
  "/korean-learning": {
    icon: BookOpen,
    sticker: "bg-[#b8a4ed] text-ink rotate-[8deg]",
    hover: "hover:bg-[#d8c9ff]",
    action: "\u96f6\u57fa\u7840\u52306\u7ea7"
  },
  "/scholarships": {
    icon: Landmark,
    sticker: "bg-[#ffb084] text-ink rotate-[-7deg]",
    hover: "hover:bg-[#ffc09c]",
    action: "\u5956\u5b66\u91d1\u7ebf\u7d22"
  },
  "/application": {
    icon: Route,
    sticker: "bg-[#a4d4c5] text-ink rotate-[5deg]",
    hover: "hover:bg-[#b7e1d5]",
    action: "\u7533\u8bf7\u8def\u5f84"
  },
  "/application#agency-check": {
    icon: SearchCheck,
    sticker: "bg-[#ff6b5a] text-paper rotate-[-6deg]",
    hover: "hover:bg-[#ff8b7e]",
    action: "\u81ea\u7533\u5224\u65ad"
  }
};

type HomeEntryCardProps = {
  entry: HomeEntry;
};

export function HomeEntryCard({ entry }: HomeEntryCardProps) {
  const visual = entryVisuals[entry.href as keyof typeof entryVisuals] ?? entryVisuals["/application"];
  const Icon = visual.icon ?? ArrowUpRight;
  const entryId = `entry-${entry.href.replace(/[^a-z-]/g, "").replace(/^-/, "") || "planned"}`;
  const articleClassName =
    `entry-row group relative z-[1] min-h-[2.75rem] overflow-visible border-y border-ink bg-paper px-0 transition-colors duration-150 group-hover:z-20 sm:min-h-[3.4rem] lg:min-h-[4.05rem] ${visual.hover}`;

  const content = (
    <article id={entryId} className={articleClassName}>
      <div className="entry-copy flex min-h-[2.75rem] w-max min-w-full items-start gap-x-6 pl-3 pr-28 pt-2.5 pb-2 sm:min-h-[3.4rem] sm:gap-x-7 sm:pl-5 sm:pt-2.5 sm:pb-2 lg:min-h-[4.05rem] lg:pl-8 lg:pr-44 lg:pt-3 lg:pb-2">
        <div className="min-w-0 shrink-0">
          <h3 className="whitespace-nowrap text-[1.48rem] font-bold leading-none tracking-normal text-ink sm:text-[2.13rem] lg:text-[2.48rem]">
            {entry.title}
          </h3>
        </div>

        <span
          aria-disabled={entry.status === "planned" ? "true" : undefined}
          className="entry-pill mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink bg-paper px-3 py-1.5 text-[0.53rem] font-bold leading-none text-ink transition group-hover:bg-paper sm:mt-1.5 sm:text-[0.6rem]"
        >
          {visual.action}
          <ArrowUpRight size={11} aria-hidden="true" />
        </span>
      </div>

      <span
        aria-hidden="true"
        className={`entry-sticker pointer-events-none absolute right-8 top-2 hidden size-16 items-center justify-center rounded-[1.1rem] border border-ink opacity-0 shadow-data transition duration-200 md:flex lg:size-20 ${visual.sticker}`}
      >
        <Icon size={32} strokeWidth={2.2} />
      </span>
    </article>
  );

  if (entry.status === "available") {
    return (
      <Link
        className="entry-shell block focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper"
        href={entry.href}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="entry-shell cursor-default" aria-disabled="true">
      {content}
    </div>
  );
}
