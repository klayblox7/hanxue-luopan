import type { Metadata } from "next";

import { BackToTopButton } from "@/components/BackToTopButton";

import "./globals.css";

export const metadata: Metadata = {
  title: "韩学罗盘｜韩国留学大学库、TOPIK考试、费用和申请路线",
  description:
    "面向中国学生的韩国留学决策平台，整理韩国大学、TOPIK考试、奖学金、人民币预算和申请路线。",
  keywords: [
    "韩国留学",
    "韩国大学申请",
    "TOPIK考试",
    "韩国留学费用",
    "韩国大学奖学金",
    "韩国留学自申"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <BackToTopButton />
      </body>
    </html>
  );
}

