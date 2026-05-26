"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { label: "汇率", href: "/exchange-rate", color: "bg-[#ffe07a]" },
  { label: "韩国概况", href: "/korea-overview", color: "bg-[#a4d4c5]" },
  { label: "关于我们", href: "/about", color: "bg-[#ffd0d8]" }
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-10 bg-paper px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
      <div className="flex min-h-16 items-center justify-between gap-3 lg:min-h-20">
        <Link className="flex items-center" href="/" aria-label="韩学罗盘" onClick={() => setIsOpen(false)}>
          <Image
            alt="韩学罗盘"
            className="h-16 w-16 object-contain sm:h-20 sm:w-20 lg:h-20 lg:w-20"
            height={144}
            priority
            src="/hanxue-luopan-logo.png"
            width={144}
          />
        </Link>
        <nav className="hidden items-center gap-3 md:flex" aria-label="主导航">
          {navItems.map((item) => (
            <Link
              className={`rounded-full border border-ink px-3 py-1.5 text-lg font-semibold leading-none text-ink transition hover:bg-paper focus:bg-paper focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper active:bg-paper lg:px-4 lg:py-2 lg:text-xl ${item.color}`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          className="inline-flex size-12 items-center justify-center rounded-full border border-ink bg-paper text-ink transition hover:bg-[#71d39b] focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper md:hidden"
          type="button"
          aria-label={isOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>
      {isOpen ? (
        <nav className="md:hidden" aria-label="移动端导航">
          <div className="mt-4 grid gap-2">
            {navItems.map((item) => (
              <Link
                className={`rounded-full border border-ink px-3 py-2 text-sm font-semibold leading-none text-ink transition hover:bg-paper focus:bg-paper focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper active:bg-paper ${item.color}`}
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

