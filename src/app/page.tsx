import { LegacyDesktopFrame } from "@/components/LegacyDesktopFrame";
import { MobileMiniProgramHome } from "@/components/MobileMiniProgramHome";

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-paper text-ink">
      <MobileMiniProgramHome />
      <LegacyDesktopFrame src="/hanxue-luopan-home.html" title="KOREA UNIVERSITY LINK" />
    </main>
  );
}
