import { ExternalLink } from "lucide-react";

import type { HomeMetric } from "@/data/home";

import { SourceBadge } from "./SourceBadge";

type MetricCardProps = {
  metric: HomeMetric;
};

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <article className="flex min-h-44 flex-col justify-between rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line transition hover:bg-paper hover:shadow-data">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-medium leading-6 text-muted">{metric.label}</h3>
          <SourceBadge type={metric.sourceType} />
        </div>
        <p className="mt-4 break-words text-3xl font-semibold tracking-normal text-ink">
          {metric.value}
        </p>
        {metric.note ? <p className="mt-2 text-sm leading-6 text-muted">{metric.note}</p> : null}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted">
        <span>更新 {metric.updatedAt}</span>
        {metric.sourceUrl ? (
          <a
            className="inline-flex items-center gap-1 font-semibold text-ocean hover:text-ink"
            href={metric.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            来源
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        ) : (
          <span>参考</span>
        )}
      </div>
    </article>
  );
}

