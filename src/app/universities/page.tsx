import type { Metadata } from "next";

import { LegacyDesktopFrame } from "@/components/LegacyDesktopFrame";
import { MobileUniversitiesApp } from "@/components/MobileUniversitiesApp";

export const metadata: Metadata = {
  title: "韩国大学库｜KOREA UNIVERSITY LINK",
  description: "整理韩国大学的学校层级、地区、类型、方向标签和申请参考。"
};

export default function UniversitiesPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <MobileUniversitiesApp />
      <LegacyDesktopFrame src="/universities.html" title="韩国大学库" />
    </main>
  );
}
