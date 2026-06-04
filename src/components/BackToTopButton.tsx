"use client";

export function BackToTopButton() {
  return (
    <button
      aria-label="回到顶部"
      className="fixed bottom-6 right-6 z-[70] inline-flex min-h-10 items-center justify-center rounded-full border border-ink bg-[#ffe07a] px-4 py-2 text-sm font-black leading-none text-ink transition hover:bg-[#ffec9f] focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper active:bg-[#ffd75f] sm:bottom-8 sm:right-8"
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      回到顶部 ↑
    </button>
  );
}
