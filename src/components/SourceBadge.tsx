import type { SourceType } from "@/data/home";
import { sourceLabels } from "@/data/home";

const badgeStyles: Record<SourceType, string> = {
  official: "border-[#1a3a3a]/20 bg-[#a4d4c5]/45 text-[#1a3a3a]",
  school: "border-[#b8a4ed]/50 bg-[#b8a4ed]/35 text-[#33245f]",
  government: "border-[#1a3a3a]/20 bg-[#a4d4c5]/45 text-[#1a3a3a]",
  community: "border-[#e8b94a]/45 bg-[#e8b94a]/30 text-[#5f4300]",
  commercial: "border-[#ff4d8b]/35 bg-[#ff4d8b]/20 text-[#7a1738]",
  estimate: "border-[#ffb084]/45 bg-[#ffb084]/35 text-[#6b3117]",
  pending: "border-[#ebe6d6] bg-[#f5f0e0] text-[#6a6a6a]"
};

type SourceBadgeProps = {
  type: SourceType;
  detail?: string;
};

export function SourceBadge({ type, detail }: SourceBadgeProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none ${badgeStyles[type]}`}
    >
      <span>{sourceLabels[type]}</span>
      {detail ? <span className="truncate text-[11px] opacity-80">{detail}</span> : null}
    </span>
  );
}

