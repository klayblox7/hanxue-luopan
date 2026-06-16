import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { Metadata } from "next";

import { LegacyDesktopFrame } from "@/components/LegacyDesktopFrame";
import { MobileServicePage, type ApplicationProgram } from "@/components/MobileServicePage";

export const metadata: Metadata = {
  title: "国内+韩国项目｜KOREA UNIVERSITY LINK",
  description: "国内+韩国合作项目、模式、费用、申请条件和合作院校参考。"
};

function readApplicationPrograms() {
  const candidates = [
    path.join(process.cwd(), "public", "application.html"),
    path.join(process.cwd(), "application.html")
  ];
  const htmlPath = candidates.find((candidate) => existsSync(candidate));
  if (!htmlPath) return undefined;

  try {
    const html = readFileSync(htmlPath, "utf8");
    const match = html.match(/const programs = (\[[\s\S]*?\]);\s*const caseSummaries/);
    if (!match?.[1]) return undefined;
    const parsed = JSON.parse(match[1]) as ApplicationProgram[];
    const programs = parsed.filter((program) => program.slug && program.chinaSchool && program.koreaSchools);
    return programs.length ? programs : undefined;
  } catch {
    return undefined;
  }
}

export default function ApplicationPage() {
  const applicationPrograms = readApplicationPrograms();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <MobileServicePage applicationPrograms={applicationPrograms} page="application" />
      <LegacyDesktopFrame src="/application.html" title="国内+韩国项目" />
    </main>
  );
}
