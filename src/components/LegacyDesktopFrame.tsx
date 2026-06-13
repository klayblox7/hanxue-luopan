import { assetPath } from "@/data/assetPath";

type LegacyDesktopFrameProps = {
  src: string;
  title: string;
};

export function LegacyDesktopFrame({ src, title }: LegacyDesktopFrameProps) {
  return (
    <section className="hidden min-h-screen bg-paper md:block" aria-label={`${title} desktop html`}>
      <iframe className="h-screen w-full border-0" src={assetPath(src)} title={title} />
    </section>
  );
}
