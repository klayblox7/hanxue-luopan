"use client";

import { BadgeCheck, MapPin, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";

import { MobileBottomNav } from "@/components/MobileBottomNav";
import { buildMobileUniversities, UniversitySheet } from "@/components/MobileUniversitiesApp";
import { koreaMapRegions, type KoreaMapRegionKey } from "@/data/korea-map-regions";
import { getUniversityTier, type UniversityTier } from "@/data/universityTiers";
import { universities } from "@/data/universities";

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

type TierFilter = "all" | UniversityTier;

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

const tierFilters: Array<{ value: TierFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "T1", label: "T1" },
  { value: "T2", label: "T2" },
  { value: "T3", label: "T3" },
  { value: "T4", label: "T4" },
  { value: "T5", label: "T5" }
];

const mapVerticalNudge = 16;
const mapHorizontalNudge = -70;
const desktopMapOffset = { x: 74, y: mapVerticalNudge };
const jejuInset = { x: 261, y: 222 + mapVerticalNudge, width: 64.6, height: 40.8, pathX: 188.5, pathY: -31.5 + mapVerticalNudge };
const mobileMapContentTransform = `translate(${mapHorizontalNudge} 0) translate(242.5 150) scale(0.85 1) translate(-242.5 -150)`;
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

export function MobileKoreaMapPage() {
  const [activeRegionId, setActiveRegionId] = useState<RegionFilter["id"]>("all");
  const [activeTierFilter, setActiveTierFilter] = useState<TierFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedSchoolSlug, setSelectedSchoolSlug] = useState<string | null>(null);
  const [selectedCaseSchoolSlug, setSelectedCaseSchoolSlug] = useState<string | null>(null);
  const activeRegion = getRegionById(activeRegionId);
  const activePin = activeRegionId === "all" ? null : regionPinPositions[activeRegionId];
  const mobileSchools = useMemo(() => buildMobileUniversities(), []);
  const mobileSchoolsBySlug = useMemo(() => new Map(mobileSchools.map((school) => [school.slug, school])), [mobileSchools]);

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
      .filter((school) => activeTierFilter === "all" || getUniversityTier(school.nameCn) === activeTierFilter)
      .filter((school) => {
        if (!query) return true;
        return `${school.nameCn} ${school.nameEn} ${school.city} ${school.focus}`.toLowerCase().includes(query);
      });
  }, [activeRegion, activeTierFilter, search]);
  const selectedSchool = selectedSchoolSlug ? mobileSchoolsBySlug.get(selectedSchoolSlug) : undefined;
  const selectedCaseSchool = selectedCaseSchoolSlug ? mobileSchoolsBySlug.get(selectedCaseSchoolSlug) : undefined;

  const selectTierFilter = (tier: TierFilter) => {
    setActiveTierFilter(tier);
    setSelectedSchoolSlug(null);
    setSelectedCaseSchoolSlug(null);
  };

  return (
    <section className="mobile-app-shell mx-auto min-h-screen w-full max-w-[430px] bg-[#f5f3ed] pb-[calc(6rem+env(safe-area-inset-bottom))] text-ink md:hidden" aria-label="韩国大学地图移动版">
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
              className="mx-auto block h-[17.7rem] w-full rounded-none border border-ink bg-[#eef1e9]"
              data-testid="korea-region-map"
              role="img"
              aria-label="韩国大学地图分布"
              preserveAspectRatio="xMidYMid meet"
              viewBox="120 0 245 300"
            >
              <g data-testid="korea-map-content" transform={mobileMapContentTransform}>
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
              </g>
            </svg>

            <div
              data-testid="selected-region-summary"
              className="pointer-events-none absolute right-8 top-7 grid justify-items-end gap-1.5"
            >
              <p className="w-[5.8rem] rounded-md border border-ink bg-[#faf8f0] px-3 py-1 text-center text-[0.77rem] font-black leading-none">{activeStat.label}</p>
              <strong className="w-[5.8rem] rounded-md border border-ink bg-[#ffe07a] px-3 py-1 text-center text-[0.77rem] font-black leading-none" data-testid="selected-region-count">
                {visibleSchools.length}所
              </strong>
            </div>

            <div
              aria-label="学校等级筛选"
              className="absolute right-8 top-[5.7rem] z-20 w-[5.8rem] rounded-lg border border-ink bg-[#faf8f0]/95 p-1.5 shadow-[0_8px_18px_rgba(10,10,10,0.08)]"
              data-testid="map-tier-filter"
            >
              <p className="text-center text-[0.58rem] font-black leading-none text-muted">学校等级</p>
              <div className="mt-1.5 grid grid-cols-2 gap-[0.24rem]" data-testid="map-tier-filter-grid">
                {tierFilters.map((filter) => (
                  <button
                    aria-pressed={activeTierFilter === filter.value}
                    className={`h-[2.36rem] min-h-0 min-w-0 rounded-md border border-ink text-[0.66rem] font-black leading-none transition active:translate-y-0.5 ${
                      activeTierFilter === filter.value ? "bg-[#71d39b]" : "bg-surface"
                    }`}
                    key={filter.value}
                    type="button"
                    onClick={() => selectTierFilter(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4">
          <div className="grid gap-3">
            {visibleSchools.map((school) => {
              const mobileSchool = mobileSchoolsBySlug.get(school.slug);
              const tier = mobileSchool?.tier ?? getUniversityTier(school.nameCn);
              const caseCount = mobileSchool?.caseCount ?? 0;

              return (
                <article
                  className="max-w-full overflow-hidden rounded-xl border border-ink bg-surface p-3 shadow-[0_8px_24px_rgba(10,10,10,0.07)]"
                  key={school.slug}
                  aria-label={`${school.nameCn} ${school.city} ${school.focus}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-[1.18rem] font-black leading-tight">{school.nameCn}</h3>
                      <p className="mt-0.5 truncate text-[0.71rem] font-bold text-muted">{school.nameKr} · {school.nameEn}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-ink bg-[#ffe07a] px-2 py-0.5 text-[0.83rem] font-black">{tier}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-ink/45 bg-paper px-2 py-0.5 text-[0.71rem] font-black">
                      <MapPin size={12} strokeWidth={2.4} aria-hidden="true" />
                      {school.city}
                    </span>
                    <span className="rounded-full border border-ink/45 bg-paper px-2 py-0.5 text-[0.71rem] font-black">{school.type}</span>
                    <span className="rounded-full border border-ink/45 bg-[#e6f7f7] px-2 py-0.5 text-[0.71rem] font-black">{caseCount}案例</span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-[0.83rem] font-bold leading-5 text-muted">{school.focus}</p>

                  <div className="mt-2 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 pt-1.5" data-testid="map-school-card-action-row">
                    <button
                      className="inline-flex min-h-[2rem] min-w-0 items-center justify-center gap-1 overflow-hidden rounded-lg bg-[#dff3dc] px-1.5 text-center text-[0.78rem] font-black leading-tight text-[#004c3f] shadow-[0_4px_10px_rgba(0,98,65,0.08)]"
                      style={{
                        boxShadow:
                          "inset 0 0 0 0.6px rgba(0, 98, 65, 0.58), 0 4px 10px rgba(0, 98, 65, 0.08)"
                      }}
                      type="button"
                      onClick={() => {
                        setSelectedCaseSchoolSlug(null);
                        setSelectedSchoolSlug(school.slug);
                      }}
                    >
                      学校详情
                      <BadgeCheck size={14} strokeWidth={2.4} aria-hidden="true" />
                    </button>
                    <button
                      className="inline-flex min-h-[2rem] min-w-0 items-center justify-center gap-1 overflow-hidden rounded-lg border border-ink bg-[#ffd0d8] px-1.5 text-center text-[0.78rem] font-black leading-tight"
                      type="button"
                      onClick={() => {
                        setSelectedSchoolSlug(null);
                        setSelectedCaseSchoolSlug(school.slug);
                      }}
                    >
                      案例画像
                      <UsersRound size={14} strokeWidth={2.4} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <MobileBottomNav activeTab="map" />
      {selectedSchool ? (
        <UniversitySheet
          mode="info"
          school={selectedSchool}
          onClose={() => setSelectedSchoolSlug(null)}
          onShowCases={() => {
            setSelectedSchoolSlug(null);
            setSelectedCaseSchoolSlug(selectedSchool.slug);
          }}
        />
      ) : null}
      {selectedCaseSchool ? (
        <UniversitySheet
          mode="case"
          school={selectedCaseSchool}
          onClose={() => setSelectedCaseSchoolSlug(null)}
          onShowCases={() => setSelectedCaseSchoolSlug(selectedCaseSchool.slug)}
        />
      ) : null}
    </section>
  );
}
