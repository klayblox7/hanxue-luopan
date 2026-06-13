import { LegacyDesktopFrame } from "@/components/LegacyDesktopFrame";
import { MobileServicePage } from "@/components/MobileServicePage";

export default function KoreanLearningPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <MobileServicePage page="korean-learning" />
      <LegacyDesktopFrame src="/korean-learning.html" title="韩语(TOPIK)" />
    </main>
  );
}
