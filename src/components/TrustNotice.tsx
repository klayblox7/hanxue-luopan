import { ShieldCheck } from "lucide-react";

import { trustItems } from "@/data/home";

import { SourceBadge } from "./SourceBadge";

export function TrustNotice() {
  return (
    <section
      className="scroll-mt-24 rounded-3xl border border-ink bg-paper p-6 md:p-8"
      id="trust"
      aria-labelledby="trust-title"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-mint/45 text-ocean">
              <ShieldCheck size={21} aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-ocean">数据可信度设计</p>
          </div>
          <h2 id="trust-title" className="mt-4 text-2xl font-semibold tracking-normal text-ink">
            先区分来源，再做留学决策
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            奖学金、TOPIK要求、学费和住宿费用每年可能变化。韩学罗盘会把官方信息、学校信息、人民币估算和学生经验分层标注，避免把参考信息写成确定结论。
          </p>
        </div>
        <div className="rounded-2xl border border-ink bg-[#ffe07a] p-4 text-sm leading-7 text-ink md:max-w-sm">
          申请前请以学校当年官方招生简章、国际处页面和TOPIK报名系统为准。
        </div>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {trustItems.map((item) => (
          <article key={item.type} className="rounded-2xl border border-ink bg-surface p-4">
            <SourceBadge type={item.type} />
            <h3 className="mt-4 text-base font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

