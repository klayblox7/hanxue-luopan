"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { type HomeEntry } from "@/data/home";

const primaryLinks: HeaderLink[] = [
  { href: "/korea-university-map", label: "\u97e9\u56fd\u5927\u5b66\u5730\u56fe" },
  { href: "/universities", label: "\u97e9\u56fd\u5927\u5b66\u5e93", suffix: " \uff08\u76f4\u5347\uff09" },
  { href: "/application", label: "\u56fd\u5185+\u97e9\u56fd\u9879\u76ee" },
  { href: "/cost", label: "\u7559\u5b66\u8d39\u7528", suffix: " \uff08\u5956\u5b66\u91d1\uff09" },
  { href: "/topik", label: "\u97e9\u8bed(TOPIK)" }
];

const shortcutActiveColors: Record<string, string> = {
  "/": "bg-[#b8a4ed]",
  "/korea-university-map": "bg-[#b8a4ed]",
  "/universities": "bg-[#ffd0d8]",
  "/topik": "bg-[#71d39b]",
  "/cost": "bg-[#ffe07a]",
  "/application": "bg-[#a4d4c5]"
};

const shortcutHoverColors: Record<string, string> = {
  "/": "hover:bg-[#b8a4ed] focus:bg-[#b8a4ed] active:bg-[#b8a4ed]",
  "/korea-university-map": "hover:bg-[#b8a4ed] focus:bg-[#b8a4ed] active:bg-[#b8a4ed]",
  "/universities": "hover:bg-[#ffd0d8] focus:bg-[#ffd0d8] active:bg-[#ffd0d8]",
  "/topik": "hover:bg-[#71d39b] focus:bg-[#71d39b] active:bg-[#71d39b]",
  "/cost": "hover:bg-[#ffe07a] focus:bg-[#ffe07a] active:bg-[#ffe07a]",
  "/application": "hover:bg-[#a4d4c5] focus:bg-[#a4d4c5] active:bg-[#a4d4c5]"
};

function isActiveHref(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/topik") return pathname === "/topik" || pathname === "/korean-learning";
  return pathname === href;
}

type HeaderLink = {
  label: string;
  href: string;
  suffix?: string;
};

type SiteHeaderProps = {
  pageTitle?: string;
  shortcuts?: HomeEntry[];
};

function linkClass(href: string, active: boolean, mobile = false) {
  const activeColor = shortcutActiveColors[href] ?? "bg-surface";
  const hoverColor = shortcutHoverColors[href] ?? "hover:bg-surface focus:bg-surface active:bg-surface";
  const desktopWidth =
    {
      "/universities": "md:w-[11.4rem]",
      "/korea-university-map": "md:w-[9.5rem]",
      "/application": "md:w-[9.4rem]",
      "/topik": "md:w-[10.6rem]",
      "/cost": "md:w-[12.4rem]"
    }[href] ?? "md:w-[8.8rem]";
  const sizeClass = mobile
    ? "min-h-10 flex-none px-3 text-[0.82rem]"
    : `h-[2.35rem] flex-none px-0 text-[0.95rem] ${desktopWidth}`;

  return `inline-flex box-border items-center justify-center gap-0 rounded-full border border-ink font-extrabold leading-none text-ink transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${sizeClass} ${
    active ? activeColor : `bg-surface ${hoverColor}`
  }`;
}

export function SiteHeader({ pageTitle }: SiteHeaderProps) {
  const pathname = usePathname();
  const desktopLinks = primaryLinks;
  const mobileLinks: HeaderLink[] = [{ href: "/", label: "\u9996\u9875" }, ...desktopLinks];

  return (
    <header className="sticky top-0 z-50 border-b border-ink bg-paper px-3 py-2 sm:px-6 md:relative md:px-6 lg:px-16 lg:py-4">
      <div className="mx-auto flex max-w-[92rem] items-center gap-3 md:grid md:min-h-16 md:max-w-none md:grid-cols-[6.5rem_minmax(0,1fr)_auto] md:gap-4 lg:min-h-20">
        <Link className="flex shrink-0 items-center" href="/" aria-label="KOREA UNIVERSITY LINK">
          <Image
            alt="KOREA UNIVERSITY LINK"
            className="block h-12 w-[4.9rem] object-contain sm:h-16 sm:w-[5.25rem] lg:h-20 lg:w-[6.5rem]"
            height={178}
            priority
            src="/hanxue-luopan-tiger-logo.webp?v=logo4"
            unoptimized
            width={228}
          />
        </Link>

        <div className="min-w-0 flex-1 md:hidden">
          <p className="truncate text-[0.7875rem] font-black leading-none text-ink">
            {pageTitle ?? "KOREA UNIVERSITY LINK"}
          </p>
        </div>

        <div className="hidden min-w-0 md:block">
          {pageTitle ? (
            <p className="truncate pl-4 text-[1.40625rem] font-black leading-none text-ink lg:text-[2.25rem]">
              {pageTitle}
            </p>
          ) : null}
        </div>

        <div className="hidden min-w-0 justify-self-end md:absolute md:right-6 md:top-[2.3rem] md:block lg:right-16">
          <nav
            className="flex w-[53rem] max-w-[calc(100vw-13rem)] flex-nowrap items-center justify-end gap-2"
            aria-label="主导航"
          >
            {desktopLinks.map((item) => {
              const active = isActiveHref(pathname, item.href);
              return (
                <Link
                  className={linkClass(item.href, active)}
                  href={item.href}
                  key={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  {item.suffix ? <span className="text-[0.85em] font-normal italic">{item.suffix}</span> : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <nav
        className="no-scrollbar -mx-3 mt-2 flex gap-2 overflow-x-auto px-3 pb-1 md:hidden"
        aria-label="移动端导航"
      >
        {mobileLinks.map((item) => {
          const active = isActiveHref(pathname, item.href);
          return (
            <Link
              className={linkClass(item.href, active, true)}
              href={item.href}
              key={item.href}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
              {item.suffix ? <span className="text-[0.85em] font-normal italic">{item.suffix}</span> : null}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
