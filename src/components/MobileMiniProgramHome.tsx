"use client";

import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Calculator,
  FileCheck2,
  GraduationCap,
  Home,
  QrCode,
  UserRound
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  getMobilePlannerResult,
  mobileHomeActions,
  mobileRouteTracks,
  type MobileBudgetLevel,
  type MobileRouteId
} from "@/data/mobileHome";

const routeTone: Record<MobileRouteId, string> = {
  undergraduate: "bg-[#ffd0d8]",
  transfer: "bg-[#ffb084]",
  graduate: "bg-[#b8a4ed]",
  language: "bg-[#71d39b]"
};

const bottomTabs = [
  { label: "首页", href: "/", icon: Home, active: true },
  { label: "大学", href: "/universities", icon: GraduationCap },
  { label: "规划", href: "/application", icon: QrCode, featured: true },
  { label: "费用", href: "/cost", icon: Calculator },
  { label: "我的", href: "/application", icon: UserRound }
];

export function MobileMiniProgramHome() {
  const [topikLevel, setTopikLevel] = useState(0);
  const [budgetLevel, setBudgetLevel] = useState<MobileBudgetLevel>("medium");
  const [activeRoute, setActiveRoute] = useState<MobileRouteId>("undergraduate");
  const selectedRoute = mobileRouteTracks.find((track) => track.id === activeRoute) ?? mobileRouteTracks[0];
  const plannerResult = useMemo(
    () => getMobilePlannerResult({ topikLevel, budgetLevel, route: activeRoute }),
    [activeRoute, budgetLevel, topikLevel]
  );

  return (
    <section className="min-h-screen bg-[#f5f3ed] pb-[calc(5.8rem+env(safe-area-inset-bottom))] md:hidden" aria-label="KOREA UNIVERSITY LINK移动端小程序首页">
      <div className="relative min-h-[21.4rem] overflow-hidden bg-[#073f2d] px-6 pb-20 pt-10 text-[#fbfbf8]">
        <Image
          alt="韩国留学小程序首页横幅"
          className="object-cover object-center opacity-85"
          fill
          priority
          sizes="100vw"
          src="/mobile-mini-program/home-hero.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#073f2d]/95 via-[#073f2d]/58 to-[#f5f3ed]" />
        <div className="relative z-10">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.08em] text-[#d8efe4]">KOREA UNIVERSITY LINK</p>
          <p className="mt-10 text-[1.02rem] font-bold leading-none text-[#e9fff5]">Hi, 准留学生</p>
          <h1 className="mt-3 text-[3.05rem] font-black leading-[0.98] tracking-normal">韩国大学通</h1>
          <p className="mt-3 max-w-[18rem] text-[0.9rem] font-bold leading-6 text-[#e7f2ec]">
            选学校、看TOPIK、算预算、排申请路线，一屏进入。
          </p>
        </div>
      </div>

      <div className="-mt-14 px-4">
        <div className="relative z-20 rounded-2xl bg-surface p-4 shadow-[0_16px_44px_rgba(10,10,10,0.14)]">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-[#fffaf0] px-4 py-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.08em] text-[#0b5a40]">Official first</p>
              <p className="mt-1 text-lg font-black leading-tight text-ink">官方优先，经验分离</p>
            </div>
            <Link className="rounded-full bg-ink px-4 py-2 text-sm font-black text-surface" href="/universities">
              开始
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-y-5">
            {mobileHomeActions.map((action) => (
              <Link className="grid justify-items-center gap-2 text-center text-ink" href={action.href} key={action.href}>
                <span className="relative flex size-[4.7rem] items-center justify-center">
                  <Image
                    alt={action.iconAlt}
                    className="rounded-2xl object-contain"
                    height={76}
                    src={action.iconSrc}
                    width={76}
                  />
                </span>
                <span>
                  <strong className="block text-[0.95rem] font-black leading-none">{action.title}</strong>
                  <span className="mt-1 block text-[0.68rem] font-bold leading-4 text-muted">{action.detail}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-2xl bg-surface p-4 shadow-[0_10px_30px_rgba(10,10,10,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black leading-none">现在先做哪一步</h2>
          <BadgeCheck size={21} strokeWidth={2.35} aria-hidden="true" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="grid gap-1 text-[0.75rem] font-black text-ink">
            TOPIK等级
            <select
              className="h-11 rounded-lg border border-ink bg-surface px-3 text-base font-bold text-ink"
              value={topikLevel}
              onChange={(event) => setTopikLevel(Number(event.target.value))}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((level) => (
                <option value={level} key={level}>
                  {level === 0 ? "暂无" : `${level}级`}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-[0.75rem] font-black text-ink">
            预算
            <select
              className="h-11 rounded-lg border border-ink bg-surface px-3 text-base font-bold text-ink"
              value={budgetLevel}
              onChange={(event) => setBudgetLevel(event.target.value as MobileBudgetLevel)}
            >
              <option value="low">尽量低</option>
              <option value="medium">中等</option>
              <option value="high">较充足</option>
            </select>
          </label>
        </div>

        <article className="mt-3 rounded-xl border border-ink/20 bg-[#fffaf0] p-3">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-ink bg-[#ffe07a]">
              <FileCheck2 size={18} strokeWidth={2.4} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-black leading-tight">{plannerResult.title}</h3>
              <p className="mt-1 text-[0.82rem] font-bold leading-5 text-muted">{plannerResult.description}</p>
            </div>
          </div>
          <Link
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-ink bg-[#71d39b] px-4 text-sm font-black text-ink"
            href={plannerResult.href}
          >
            {plannerResult.actionLabel}
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </article>
      </div>

      <div className="mx-4 mt-4 rounded-2xl bg-surface p-4 shadow-[0_10px_30px_rgba(10,10,10,0.08)]">
        <h2 className="text-xl font-black leading-none">申请路线</h2>
        <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="申请路线选择">
          {mobileRouteTracks.map((track) => {
            const isActive = track.id === activeRoute;

            return (
              <button
                aria-pressed={isActive}
                className={`min-h-10 flex-none rounded-full border border-ink px-4 text-sm font-black text-ink transition active:translate-y-0.5 ${
                  isActive ? routeTone[track.id] : "bg-surface"
                }`}
                key={track.id}
                type="button"
                onClick={() => setActiveRoute(track.id)}
              >
                {track.label}
              </button>
            );
          })}
        </div>

        <article className="mt-3 rounded-xl border border-ink/20 bg-[#fffaf0] p-3">
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-ink ${routeTone[selectedRoute.id]}`}>
              <BookOpen size={17} strokeWidth={2.35} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg font-black leading-tight">{selectedRoute.label}路线</h3>
              <p className="mt-1 text-[0.83rem] font-bold leading-5 text-muted">{selectedRoute.summary}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {selectedRoute.checkpoints.map((checkpoint) => (
              <span
                className="flex min-h-[3.2rem] items-center justify-center rounded-lg border border-ink/35 bg-paper px-2 text-center text-[0.75rem] font-black leading-4 text-ink"
                key={checkpoint}
              >
                {checkpoint}
              </span>
            ))}
          </div>
        </article>
      </div>

      <div className="mx-4 mt-4 grid gap-2">
        <h2 className="text-xl font-black leading-none">信息信任规则</h2>
        <div className="grid gap-2">
          {[
            ["官方", "TOPIK、政府统计、公开报名信息优先"],
            ["学校", "招生简章、国际处、奖学金页面优先"],
            ["估算", "人民币预算会标注口径，不写成承诺"]
          ].map(([title, detail]) => (
            <div className="flex items-center gap-3 rounded-lg border border-ink bg-surface px-3 py-3" key={title}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-ink bg-[#ffd0d8] text-xs font-black">
                {title.slice(0, 1)}
              </span>
              <p className="text-[0.8rem] font-bold leading-5 text-muted">
                <strong className="mr-2 text-ink">{title}</strong>
                {detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      <nav
        className="fixed inset-x-3 bottom-3 z-40 rounded-[1.35rem] border border-ink/10 bg-surface px-3 pb-[calc(0.65rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_12px_38px_rgba(10,10,10,0.18)] md:hidden"
        aria-label="移动端底部导航"
      >
        <div className="grid grid-cols-5 items-end">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <Link
                className={`grid justify-items-center gap-1 text-[0.72rem] font-black ${tab.active || tab.featured ? "text-[#0b6a4a]" : "text-[#9b9b9b]"}`}
                href={tab.href}
                key={tab.label}
              >
                <span
                  className={
                    tab.featured
                      ? "-mt-8 grid size-16 place-items-center rounded-full border-[5px] border-[#f5f3ed] bg-[#00754a] text-surface shadow-[0_10px_24px_rgba(0,117,74,0.32)]"
                      : "grid size-8 place-items-center"
                  }
                >
                  <Icon size={tab.featured ? 30 : 25} strokeWidth={2.2} aria-hidden="true" />
                </span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </section>
  );
}
