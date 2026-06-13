import type { Metadata } from "next";

import { MobileKoreaMapPage } from "@/components/MobileKoreaMapPage";

export const metadata: Metadata = {
  title: "韩国大学地图｜KOREA UNIVERSITY LINK",
  description: "按韩国地区、城市和学校分布进入韩国大学筛选。"
};

export default function KoreaUniversityMapPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <MobileKoreaMapPage />
    </main>
  );
}
