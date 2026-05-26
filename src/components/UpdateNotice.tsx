import { CalendarDays } from "lucide-react";

import type { UpdateNotice as UpdateNoticeType } from "@/data/home";

type UpdateNoticeProps = {
  notice: UpdateNoticeType;
};

export function UpdateNotice({ notice }: UpdateNoticeProps) {
  return (
    <aside className="flex flex-col gap-3 rounded-full border border-ink bg-paper px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ink bg-[#71d39b] text-ink">
          <CalendarDays size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">{notice.label}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{notice.description}</p>
        </div>
      </div>
      <time className="rounded-full border border-ink bg-[#ffd0d8] px-3 py-2 text-sm font-semibold text-ink" dateTime={notice.updatedAt}>
        {notice.updatedAt}
      </time>
    </aside>
  );
}

