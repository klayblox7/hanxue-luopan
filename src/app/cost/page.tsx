import type { Metadata } from "next";

import { MobileServicePage } from "@/components/MobileServicePage";

export const metadata: Metadata = {
  title: "留学费用｜KOREA UNIVERSITY LINK",
  description: "韩国留学学费、住宿、生活费、奖学金和人民币预算估算。"
};

export default function CostPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <MobileServicePage page="cost" />
    </main>
  );
}
