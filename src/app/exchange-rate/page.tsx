import { DetailPageContainer } from "@/components/DetailPageContainer";
import { MobileServicePage } from "@/components/MobileServicePage";
import { SiteHeader } from "@/components/SiteHeader";

export default function ExchangeRatePage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <MobileServicePage page="exchange" />

      <div className="hidden md:block">
        <SiteHeader pageTitle="汇率" />
      </div>

      <DetailPageContainer className="hidden pb-10 pt-4 md:block lg:pb-14 lg:pt-7">
        <div className="mt-5 rounded-lg border border-ink bg-surface p-6">
          <p className="max-w-3xl text-base leading-8 text-muted">
            人民币与韩元汇率入口后续会接入实时或定期更新的参考数据。
          </p>
        </div>
      </DetailPageContainer>
    </main>
  );
}
