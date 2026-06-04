import type { Metadata } from "next";

import { DetailPageContainer } from "@/components/DetailPageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { UniversitiesDirectory } from "@/components/UniversitiesDirectory";

export const metadata: Metadata = {
  title: "韩国大学库｜韩学罗盘",
  description: "整理韩国大学50校的学校等级、地区、类型、方向标签和学生规模。"
};

export default function UniversitiesPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader pageTitle="韩国大学库" />

      <DetailPageContainer className="pb-12 pt-4 lg:pt-6">
        <UniversitiesDirectory />
      </DetailPageContainer>
    </main>
  );
}
