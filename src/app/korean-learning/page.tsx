import { DetailPageContainer } from "@/components/DetailPageContainer";
import { MobileServicePage } from "@/components/MobileServicePage";
import { SiteHeader } from "@/components/SiteHeader";

export default function KoreanLearningPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <MobileServicePage page="korean-learning" />

      <div className="hidden md:block">
        <SiteHeader pageTitle="韩语(TOPIK)" />
      </div>

      <DetailPageContainer className="hidden pb-10 pt-4 md:block lg:pb-14 lg:pt-7">
        <div className="mt-5 rounded-lg border border-ink bg-surface p-6">
          <p className="max-w-3xl text-base leading-8 text-muted">从零基础到TOPIK 6级的学习路线将在这里扩展。</p>
        </div>
      </DetailPageContainer>
    </main>
  );
}
