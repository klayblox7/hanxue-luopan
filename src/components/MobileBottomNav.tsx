import { BookOpenCheck, Calculator, GraduationCap, Home, MapPinned, type LucideIcon } from "lucide-react";
import Link from "next/link";

export type MobileBottomTabId = "home" | "map" | "universities" | "cost" | "topik";

const mobileBottomTabs: Array<{
  id: MobileBottomTabId;
  label: string;
  href: string;
  icon: LucideIcon;
}> = [
  { id: "home", label: "首页", href: "/", icon: Home },
  { id: "map", label: "大学地图", href: "/korea-university-map", icon: MapPinned },
  { id: "universities", label: "大学库", href: "/universities", icon: GraduationCap },
  { id: "cost", label: "费用", href: "/cost", icon: Calculator },
  { id: "topik", label: "TOPIK", href: "/topik", icon: BookOpenCheck }
];

export function MobileBottomNav({ activeTab }: { activeTab?: MobileBottomTabId }) {
  return (
    <nav
      className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[406px] -translate-x-1/2 rounded-[1.35rem] border border-ink/10 bg-surface px-2 pb-[calc(0.65rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_12px_38px_rgba(10,10,10,0.18)]"
      aria-label="移动端底部导航"
    >
      <div className="grid grid-cols-5 items-end">
        {mobileBottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`grid min-w-0 justify-items-center gap-1 text-[0.66rem] font-black leading-tight ${
                isActive ? "text-[#0b6a4a]" : "text-[#9b9b9b]"
              }`}
              href={tab.href}
              key={tab.id}
            >
              <span className="grid size-8 place-items-center">
                <Icon size={25} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <span className="max-w-full truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
