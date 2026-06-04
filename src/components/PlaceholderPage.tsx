import Link from "next/link";

import { DetailPageContainer } from "@/components/DetailPageContainer";
import { SiteHeader } from "@/components/SiteHeader";

type PlaceholderPageProps = {
  title: string;
  description: string;
  id?: string;
};

export function PlaceholderPage({ title, description, id }: PlaceholderPageProps) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <SiteHeader pageTitle={title} />
      <DetailPageContainer className="pb-10 pt-4 lg:pb-14 lg:pt-7" id={id}>
        <div className="flex justify-end">
          <Link
            className="inline-flex min-h-10 items-center rounded-full border border-ink bg-paper px-4 py-2 text-sm font-bold transition hover:bg-[#71d39b] focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper"
            href="/"
          >
            返回首页
          </Link>
        </div>
        <div className="mt-5 rounded-lg border border-ink bg-surface p-4 sm:mt-8 sm:p-6">
          <p className="max-w-3xl text-base leading-8 text-muted">{description}</p>
        </div>
      </DetailPageContainer>
    </main>
  );
}
