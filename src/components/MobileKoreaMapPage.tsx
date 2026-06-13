"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CampusImage } from "@/components/CampusImage";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { koreaMapRegions, type KoreaMapRegionKey } from "@/data/korea-map-regions";
import { getUniversityTier } from "@/data/universityTiers";
import { universities, type University } from "@/data/universities";

type RegionFilter = {
  id: "all" | "seoul" | "chungcheong" | "gyeongsang" | "jeolla" | "gangwon-jeju";
  label: string;
  keywords: string[];
};

type MapRegionGroup = {
  id: Exclude<RegionFilter["id"], "all">;
  color: string;
  regionKeys: KoreaMapRegionKey[];
};

const regionFilters: RegionFilter[] = [
  { id: "all", label: "全部", keywords: [] },
  { id: "seoul", label: "首尔圈", keywords: ["首尔", "仁川", "水原", "城南", "龙仁", "高阳", "安山", "富川", "议政府", "杨州"] },
  { id: "chungcheong", label: "忠清/大田", keywords: ["大田", "世宗", "清州", "天安", "牙山", "公州", "论山", "锦山", "镇川"] },
  { id: "gyeongsang", label: "庆尚/釜山", keywords: ["釜山", "大邱", "蔚山", "庆山", "金海", "昌原", "浦项", "庆州", "龟尾", "安东"] },
  { id: "jeolla", label: "全罗/光州", keywords: ["光州", "全州", "群山", "益山", "罗州", "顺天", "完州"] },
  { id: "gangwon-jeju", label: "江原/济州", keywords: ["春川", "原州", "高城", "济州"] }
];

const mapRegionGroups: MapRegionGroup[] = [
  {
    id: "seoul",
    color: "#71d39b",
    regionKeys: ["seoul", "gyeonggi"]
  },
  {
    id: "gangwon-jeju",
    color: "#b8a4ed",
    regionKeys: ["gangwon", "jeju"]
  },
  {
    id: "chungcheong",
    color: "#ffe07a",
    regionKeys: ["chungbuk", "chungnam"]
  },
  {
    id: "gyeongsang",
    color: "#ffb084",
    regionKeys: ["gyeongbuk", "gyeongnam"]
  },
  {
    id: "jeolla",
    color: "#ffd0d8",
    regionKeys: ["jeonbuk", "jeonnam"]
  }
];

const mapVerticalNudge = 16;
const desktopMapOffset = { x: 74, y: mapVerticalNudge };
const jejuInset = { x: 261, y: 222 + mapVerticalNudge, width: 64.6, height: 40.8, pathX: 188.5, pathY: -31.5 + mapVerticalNudge };
const regionPinPositions: Record<Exclude<RegionFilter["id"], "all">, { x: number; y: number }> = {
  seoul: { x: 196, y: 63 + mapVerticalNudge },
  chungcheong: { x: 224, y: 124 + mapVerticalNudge },
  gyeongsang: { x: 288, y: 177 + mapVerticalNudge },
  jeolla: { x: 202, y: 190 + mapVerticalNudge },
  "gangwon-jeju": { x: 292, y: 70 + mapVerticalNudge }
};
const mapRegionByKey = new Map(koreaMapRegions.map((region) => [region.key, region]));

function matchesRegion(city: string, filter: RegionFilter) {
  if (filter.id === "all") return true;
  return filter.keywords.some((keyword) => city.includes(keyword));
}

function getRegionById(id: RegionFilter["id"]) {
  return regionFilters.find((filter) => filter.id === id) ?? regionFilters[0];
}

function DetailMetric({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-ink/15 bg-[#fffaf0] px-3 py-2">
      <p className="text-[0.68rem] font-black text-muted">{label}</p>
      <p className="mt-1 text-[0.92rem] font-black leading-tight text-ink">{value || "资料待补"}</p>
    </div>
  );
}

function SelectedRegionPin({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true" className="pointer-events-none" data-testid="selected-region-pin">
      <path
        d={`M ${x} ${y + 8.1} C ${x - 8.3} ${y} ${x - 7} ${y - 9.7} ${x} ${y - 9.7} C ${x + 7} ${y - 9.7} ${x + 8.3} ${y} ${x} ${y + 8.1} Z`}
        fill="#b91c1c"
        filter="drop-shadow(0 5px 7px rgba(10, 10, 10, 0.28))"
        stroke="#7f1d1d"
        strokeLinejoin="round"
        strokeWidth={1.15}
      />
      <circle cx={x} cy={y - 3.7} fill="#fffefb" r={3.8} />
    </g>
  );
}

function MapSchoolDetailSheet({ school, onClose }: { school: University; onClose: () => void }) {
  const tier = getUniversityTier(school.nameCn);

  return (
    <div className="fixed inset-0 z-50 bg-ink/35 px-3 pb-3 pt-[12dvh] md:hidden" onClick={onClose}>
      <section
        aria-label={school.nameCn}
        aria-modal="true"
        className="ml-auto flex max-h-[84dvh] w-full max-w-[26rem] flex-col overflow-hidden rounded-t-2xl border border-ink bg-[#f5f3ed] shadow-[0_-18px_46px_rgba(10,10,10,0.22)]"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink/10 bg-surface px-4 py-3">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#0b6a4a]">School detail</p>
            <h2 className="mt-1 text-2xl font-black leading-tight">{school.nameCn}</h2>
            <p className="mt-1 truncate text-xs font-bold text-muted">
              {school.nameKr} · {school.nameEn}
            </p>
          </div>
          <button
            aria-label="关闭"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-ink bg-paper text-ink"
            type="button"
            onClick={onClose}
          >
            <X size={18} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4">
          <CampusImage
            className="h-44 w-full rounded-xl border border-ink bg-surface object-cover"
            name={school.nameCn}
            slug={school.slug}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {[tier, school.city, school.type].map((item) => (
              <span className="rounded-full border border-ink bg-surface px-3 py-1 text-xs font-black" key={item}>
                {item}
              </span>
            ))}
          </div>
          <section className="mt-3 rounded-xl border border-ink bg-surface p-3">
            <h3 className="text-sm font-black">学校方向</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">{school.focus}</p>
          </section>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <DetailMetric label="学生数" value={school.totalStudents} />
            <DetailMetric label="外国学生" value={school.foreignStudents} />
            <DetailMetric label="宿舍容量" value={school.dormitoryCapacity} />
            <DetailMetric label="宿舍覆盖" value={school.dormitoryRate} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ink bg-[#71d39b] px-3 text-sm font-black text-ink" href="/universities">
              进入大学库
            </Link>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ink bg-[#ffe07a] px-3 text-sm font-black text-ink" href="/application">
              申请路线
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function MobileKoreaMapPage() {
  const [activeRegionId, setActiveRegionId] = useState<RegionFilter["id"]>("all");
  const [search, setSearch] = useState("");
  const [selectedSchoolSlug, setSelectedSchoolSlug] = useState<string | null>(null);
  const activeRegion = getRegionById(activeRegionId);
  const activePin = activeRegionId === "all" ? null : regionPinPositions[activeRegionId];

  const regionStats = useMemo(
    () =>
      regionFilters
        .filter((filter) => filter.id !== "all")
        .map((filter) => {
          const schools = universities.filter((school) => matchesRegion(school.city, filter));

          return {
            id: filter.id,
            label: filter.label,
            count: schools.length
          };
        }),
    []
  );

  const activeStat =
    activeRegionId === "all"
      ? {
          label: "全部地区",
          count: universities.length
        }
      : regionStats.find((stat) => stat.id === activeRegionId) ?? regionStats[0];

  const visibleSchools = useMemo(() => {
    const query = search.trim().toLowerCase();

    return universities
      .filter((school) => matchesRegion(school.city, activeRegion))
      .filter((school) => {
        if (!query) return true;
        return `${school.nameCn} ${school.nameEn} ${school.city} ${school.focus}`.toLowerCase().includes(query);
      })
      .slice(0, 12);
  }, [activeRegion, search]);
  const selectedSchool = selectedSchoolSlug ? universities.find((school) => school.slug === selectedSchoolSlug) : undefined;

  return (
    <section className="min-h-screen bg-[#f5f3ed] pb-[calc(6rem+env(safe-area-inset-bottom))] text-ink md:hidden" aria-label="韩国大学地图移动版">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-[#f5f3ed]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.08em] text-[#0b6a4a]">KOREA UNIVERSITY LINK</p>
            <h1 className="truncate text-2xl font-black leading-none">韩国大学地图</h1>
          </div>
        </div>
      </header>

      <main className="px-3 py-4">
        <section
          className="rounded-none border border-ink bg-surface p-2 shadow-[0_12px_28px_rgba(10,10,10,0.08)]"
          data-testid="mobile-map-distribution-panel"
        >
          <div className="flex items-end justify-between gap-3">
            <div className="shrink-0">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#0b6a4a]">Distribution</p>
              <h2 className="text-xl font-black leading-tight">地图分布</h2>
            </div>
            <label
              className="mb-0.5 flex h-10 w-1/2 min-w-0 items-center gap-2 rounded-xl border border-ink bg-surface px-3 text-xs font-black text-muted"
              data-testid="map-inline-search"
            >
              <Search size={16} strokeWidth={2.4} aria-hidden="true" className="shrink-0" />
              <span className="sr-only">搜索学校或城市</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-ink outline-none placeholder:text-muted"
                placeholder="搜索"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedSchoolSlug(null);
                }}
              />
            </label>
          </div>

          <div className="relative mt-3">
            <svg
              className="mx-auto block h-[22.1rem] w-full rounded-none border border-ink bg-[#eef1e9]"
              data-testid="korea-region-map"
              role="img"
              aria-label="韩国大学地图分布"
              preserveAspectRatio="xMidYMid meet"
              viewBox="120 0 245 300"
            >
              {mapRegionGroups.map((group) => {
                const stat = regionStats.find((item) => item.id === group.id);
                const selected = activeRegionId === group.id;
                const fill = selected ? group.color : activeRegionId === "all" ? "#fffefb" : "#faf8f0";

                return (
                  <g
                    aria-label={`选择${stat?.label ?? group.id}地图区域，${stat?.count ?? 0}所学校`}
                    aria-pressed={selected}
                    key={group.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer outline-none transition-opacity focus-visible:opacity-80"
                    onClick={() => {
                      setActiveRegionId(group.id);
                      setSelectedSchoolSlug(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveRegionId(group.id);
                        setSelectedSchoolSlug(null);
                      }
                    }}
                  >
                    {group.id === "gangwon-jeju" ? (
                      <rect
                        data-testid="jeju-inset"
                        fill={selected ? "#f1e8ff" : "#fffefb"}
                        height={jejuInset.height}
                        rx={0}
                        stroke={selected ? "#0a0a0a" : "#c7beb0"}
                        strokeWidth={selected ? 1.1 : 0.8}
                        vectorEffect="non-scaling-stroke"
                        width={jejuInset.width}
                        x={jejuInset.x}
                        y={jejuInset.y}
                      />
                    ) : null}
                    {group.regionKeys.flatMap((regionKey) => {
                      const region = mapRegionByKey.get(regionKey);
                      const transform =
                        regionKey === "jeju"
                          ? `translate(${jejuInset.pathX} ${jejuInset.pathY})`
                          : `translate(${desktopMapOffset.x} ${desktopMapOffset.y})`;
                      return (
                        region?.features.map((feature) => (
                          <path
                            data-region-key={regionKey}
                            d={feature.path}
                            fill={fill}
                            key={`${group.id}-${regionKey}-${feature.name}`}
                            stroke={selected ? "#0a0a0a" : "#c7beb0"}
                            strokeLinejoin="round"
                            strokeWidth={selected ? 1.2 : 0.8}
                            transform={transform}
                            vectorEffect="non-scaling-stroke"
                          />
                        )) ?? []
                      );
                    })}
                  </g>
                );
              })}
              {activePin ? <SelectedRegionPin x={activePin.x} y={activePin.y} /> : null}
            </svg>

            <div
              data-testid="selected-region-summary"
              className="pointer-events-none absolute right-3 top-3 grid justify-items-end gap-1"
            >
              <p className="rounded-md border border-ink bg-[#faf8f0] px-2.5 py-1 text-xs font-black leading-none">{activeStat.label}</p>
              <strong className="rounded-md border border-ink bg-[#ffe07a] px-2.5 py-1 text-xs font-black leading-none">
                {activeStat.count}所
              </strong>
            </div>
          </div>
        </section>

        <section className="mt-4">
          <div className="grid gap-3">
            {visibleSchools.map((school) => (
              <article className="rounded-xl border border-ink bg-surface p-3" key={school.slug} aria-label={`${school.nameCn} ${school.city} ${school.focus}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[0.96rem] font-black leading-tight">{school.nameCn}</h3>
                    <p className="mt-1 text-xs font-bold text-muted">{school.nameKr} · {school.nameEn}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-ink bg-[#ffe07a] px-2 py-0.5 text-xs font-black">
                    {getUniversityTier(school.nameCn)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-black text-ink">
                  {school.city} / {school.type}
                </p>
                <div className="mt-2 flex items-end justify-between gap-3" data-testid="map-school-card-action-row">
                  <p className="min-w-0 text-sm font-normal italic leading-5 text-muted">{school.focus}</p>
                  <button
                    className="inline-flex min-h-[2.05rem] w-[7.75rem] shrink-0 items-center justify-center rounded-lg border border-ink bg-[#eef8df] px-2.5 text-[0.78rem] font-black"
                    type="button"
                    onClick={() => setSelectedSchoolSlug(school.slug)}
                  >
                    学校详情
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <MobileBottomNav activeTab="map" />
      {selectedSchool ? <MapSchoolDetailSheet school={selectedSchool} onClose={() => setSelectedSchoolSlug(null)} /> : null}
    </section>
  );
}
