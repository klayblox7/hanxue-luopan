import { assetPath } from "@/data/assetPath";

type LegacyDesktopFrameProps = {
  src: string;
  title: string;
};

export function LegacyDesktopFrame({ src, title }: LegacyDesktopFrameProps) {
  const desktopSrc = process.env.NEXT_PUBLIC_BASE_PATH
    ? assetPath(`/legacy/${src.replace(/^\//, "")}`)
    : assetPath(src);

  return (
    <section className="hidden min-h-screen bg-paper md:block" aria-label={`${title} desktop html`}>
      <iframe className="h-screen w-full border-0" src={desktopSrc} title={title} />
    </section>
  );
}
