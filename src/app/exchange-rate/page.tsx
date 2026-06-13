import { LegacyDesktopFrame } from "@/components/LegacyDesktopFrame";
import { MobileServicePage } from "@/components/MobileServicePage";

export default function ExchangeRatePage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <MobileServicePage page="exchange" />
      <LegacyDesktopFrame src="/exchange-rate.html" title="汇率参考" />
    </main>
  );
}
