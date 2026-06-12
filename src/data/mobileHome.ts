export type MobileRouteId = "undergraduate" | "transfer" | "graduate" | "language";
export type MobileBudgetLevel = "low" | "medium" | "high";

export type MobileHomeAction = {
  title: string;
  detail: string;
  href: string;
  source: string;
  iconSrc: string;
  iconAlt: string;
};

export type MobileRouteTrack = {
  id: MobileRouteId;
  label: string;
  summary: string;
  checkpoints: string[];
  href: string;
};

export type MobilePlannerInput = {
  topikLevel: number;
  budgetLevel: MobileBudgetLevel;
  route: MobileRouteId;
};

export type MobilePlannerResult = {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
};

export const mobileHomeActions: MobileHomeAction[] = [
  {
    title: "韩国大学库",
    detail: "城市、专业、语言要求",
    href: "/universities",
    source: "学校",
    iconSrc: "/mobile-mini-program/icon-universities.png",
    iconAlt: "韩国大学库图标"
  },
  {
    title: "TOPIK考试",
    detail: "等级、报名、备考路线",
    href: "/topik",
    source: "官方",
    iconSrc: "/mobile-mini-program/icon-topik.png",
    iconAlt: "TOPIK考试图标"
  },
  {
    title: "留学费用",
    detail: "学费、住宿、人民币估算",
    href: "/cost",
    source: "估算",
    iconSrc: "/mobile-mini-program/icon-cost.png",
    iconAlt: "留学费用图标"
  },
  {
    title: "申请路线",
    detail: "材料、时间线、项目选择",
    href: "/application",
    source: "待核验",
    iconSrc: "/mobile-mini-program/icon-application.png",
    iconAlt: "申请路线图标"
  },
  {
    title: "汇率参考",
    detail: "韩元到人民币",
    href: "/exchange-rate",
    source: "参考",
    iconSrc: "/mobile-mini-program/icon-exchange.png",
    iconAlt: "汇率参考图标"
  }
];

export const mobileRouteTracks: MobileRouteTrack[] = [
  {
    id: "undergraduate",
    label: "本科",
    summary: "先看高中成绩、TOPIK和目标城市，再决定冲刺、匹配和保底学校。",
    checkpoints: ["高中均分", "TOPIK成绩", "材料时间线"],
    href: "/application"
  },
  {
    id: "transfer",
    label: "插班",
    summary: "确认已修学分、专业延续性和学校是否开放插班名额。",
    checkpoints: ["学分证明", "专业匹配", "可申请年级"],
    href: "/application"
  },
  {
    id: "graduate",
    label: "研究生",
    summary: "把研究计划、教授方向、语言证明和奖学金线索放在同一张清单里。",
    checkpoints: ["研究计划", "教授套磁", "奖学金"],
    href: "/application"
  },
  {
    id: "language",
    label: "语学院",
    summary: "按开学期、城市、学费和后续升学目标选择语学院路线。",
    checkpoints: ["开学期", "城市预算", "升学衔接"],
    href: "/korean-learning"
  }
];

export function getMobilePlannerResult(input: MobilePlannerInput): MobilePlannerResult {
  if (input.topikLevel < 3) {
    return {
      title: "先补TOPIK",
      description: "多数本科和研究生路线至少需要TOPIK 3级以上。先确认目标等级，再倒排备考时间。",
      href: "/topik",
      actionLabel: "看TOPIK路线"
    };
  }

  if (input.budgetLevel === "low") {
    return {
      title: "先算预算",
      description: "预算敏感时优先看国公立、地方城市、宿舍和奖学金，再进入学校比较。",
      href: "/cost",
      actionLabel: "估算人民币预算"
    };
  }

  if (input.route === "graduate") {
    return {
      title: "先定导师方向",
      description: "研究生申请更依赖研究计划和教授方向。先整理专业关键词，再筛学校。",
      href: "/application",
      actionLabel: "看研究生路线"
    };
  }

  if (input.route === "language") {
    return {
      title: "先定语学院城市",
      description: "语学院路线先看城市预算、开学期和后续升学衔接，避免只按学校名气选择。",
      href: "/korean-learning",
      actionLabel: "看韩语学习"
    };
  }

  return {
    title: "开始选校",
    description: "语言和预算已有基础，可以先比较学校，再回到申请材料和奖学金清单。",
    href: "/universities",
    actionLabel: "进入大学库"
  };
}
