export type SourceType =
  | "official"
  | "school"
  | "government"
  | "community"
  | "commercial"
  | "estimate"
  | "pending";

export type HomeMetric = {
  label: string;
  value: string;
  note?: string;
  sourceType: SourceType;
  sourceUrl?: string;
  updatedAt: string;
};

export type HomeEntry = {
  title: string;
  description: string;
  href: string;
  category: string;
  sourceType: SourceType;
  actionLabel: string;
  status: "available" | "planned";
};

export type UpdateNotice = {
  label: string;
  updatedAt: string;
  description: string;
};

export type TrustItem = {
  type: SourceType;
  title: string;
  description: string;
};

const studyInKoreaStatsUrl =
  "https://www.studyinkorea.go.kr/ko/why/koreaStatistics.do";

export const sourceLabels: Record<SourceType, string> = {
  official: "官方",
  school: "学校",
  government: "政府",
  community: "经验",
  commercial: "合作",
  estimate: "估算",
  pending: "待核验"
};

export const latestUpdate: UpdateNotice = {
  label: "最近更新",
  updatedAt: "2026-05",
  description: "官方来源优先，费用使用人民币估算，经验信息与官方信息分离展示。"
};

export const homeMetrics: HomeMetric[] = [
  {
    label: "韩国高等教育外国留学生",
    value: "253,434",
    note: "Study in Korea 2025统计",
    sourceType: "official",
    sourceUrl: studyInKoreaStatsUrl,
    updatedAt: "2025-04"
  },
  {
    label: "中国学生在韩规模",
    value: "76,541",
    note: "约30.2%",
    sourceType: "official",
    sourceUrl: studyInKoreaStatsUrl,
    updatedAt: "2025-04"
  },
  {
    label: "韩国大学索引",
    value: "400+",
    note: "用于后续大学库扩展",
    sourceType: "pending",
    updatedAt: "2026-05"
  },
  {
    label: "首批大学库",
    value: "50所",
    note: "中国学生常查，不作为绝对排名",
    sourceType: "estimate",
    updatedAt: "2026-05"
  },
  {
    label: "费用展示",
    value: "人民币",
    note: "学费、住宿、生活费均标注估算",
    sourceType: "estimate",
    updatedAt: "2026-05"
  },
  {
    label: "数据原则",
    value: "分层标注",
    note: "官方优先 / 经验参考分离",
    sourceType: "official",
    sourceUrl: studyInKoreaStatsUrl,
    updatedAt: "2026-05"
  }
];

export const homeEntries: HomeEntry[] = [
  {
    title: "韩国大学地图",
    description: "从地区、城市和学校位置理解韩国大学分布，再进入学校库比较。",
    href: "/korea-university-map",
    category: "地区地图",
    sourceType: "government",
    actionLabel: "查看学校地图",
    status: "available"
  },
  {
    title: "韩国大学库",
    description: "比较韩国大学的城市、类型、T档、专业方向、案例和语言要求。",
    href: "/universities",
    category: "学校比较",
    sourceType: "school",
    actionLabel: "查看学校列表",
    status: "available"
  },
  {
    title: "国内+韩国项目",
    description: "按本科、插班、研究生、语学院拆申请时间线、材料清单和关键截止日。",
    href: "/application",
    category: "时间线+材料",
    sourceType: "pending",
    actionLabel: "查看规划入口",
    status: "planned"
  },
  {
    title: "留学费用（奖学金）",
    description: "估算学费、住宿、生活费，并整理政府、学校和TOPIK奖学金线索。",
    href: "/cost",
    category: "人民币预算",
    sourceType: "estimate",
    actionLabel: "查看规划入口",
    status: "planned"
  },
  {
    title: "韩语(TOPIK)",
    description: "查询等级、费用、考点、备考路线和大学申请语言要求。",
    href: "/topik",
    category: "语言成绩",
    sourceType: "official",
    actionLabel: "查看规划入口",
    status: "planned"
  }
];

export const trustItems: TrustItem[] = [
  {
    type: "official",
    title: "官方",
    description: "韩国官方留学平台、TOPIK报名系统、政府公开统计。"
  },
  {
    type: "school",
    title: "学校",
    description: "大学国际处、招生简章、奖学金与宿舍页面。"
  },
  {
    type: "estimate",
    title: "估算",
    description: "人民币预算、生活费、租房等会标注估算口径。"
  },
  {
    type: "community",
    title: "经验",
    description: "学生经验只作为参考，不写成官方承诺。"
  },
  {
    type: "pending",
    title: "待核验",
    description: "未确认的信息先降级展示，等待后续更新。"
  }
];

