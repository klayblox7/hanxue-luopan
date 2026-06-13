import {
  recommendUniversities,
  type BudgetLevel,
  type HighSchoolTier,
  type IntendedMajor,
  type SchoolTypePreference
} from "./recommendations";
import { assetPath } from "./assetPath";
import { getUniversityTier } from "./universityTiers";

export type MobileRouteId = "undergraduate" | "transfer" | "graduate" | "language";
export type MobileBudgetLevel = "low" | "medium" | "high";

export type MobileHomeAction = {
  title: string;
  detail: string;
  href: string;
  source: string;
  imageSrc: string;
  imageAlt: string;
  tone: string;
  mark: string;
  filters: string[];
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

export type MobileRecommendationInput = {
  gpaPercent: number;
  highSchoolTier: HighSchoolTier;
  topikLevel: number;
  intendedMajor: IntendedMajor;
  preferredRegion: string;
  budgetLevel: BudgetLevel;
  schoolTypePreference: SchoolTypePreference;
};

export type MobileRecommendationResult = {
  schoolSlug: string;
  schoolNameCn: string;
  city: string;
  schoolType: string;
  tier: string;
  category: string;
  reason: string;
  caution: string;
};

const mobileRecommendationCategoryLabels = {
  stable: "较有希望",
  match: "适合申请",
  reach: "冲刺申请",
  prepare_first: "先补条件",
  verify: "需确认"
};

export const mobileHomeActions: MobileHomeAction[] = [
  {
    title: "韩国大学地图",
    detail: "地区、城市、学校位置",
    href: "/korea-university-map",
    source: "地图",
    imageSrc: assetPath("/mobile-mini-program/category-map-transparent.png"),
    imageAlt: "韩国大学地图分类图",
    tone: "bg-[#b8a4ed]",
    mark: "图",
    filters: ["地区", "城市", "院校位置"]
  },
  {
    title: "韩国大学库",
    detail: "城市、专业、语言要求",
    href: "/universities",
    source: "学校",
    imageSrc: assetPath("/mobile-mini-program/category-universities-transparent.png"),
    imageAlt: "韩国大学库分类图",
    tone: "bg-[#ffd0d8]",
    mark: "大",
    filters: ["城市", "类型", "专业", "T档"]
  },
  {
    title: "国内+韩国项目",
    detail: "1+3、2+2等",
    href: "/application",
    source: "路线",
    imageSrc: assetPath("/mobile-mini-program/category-application-clean.png"),
    imageAlt: "国内+韩国项目分类图",
    tone: "bg-[#a4d4c5]",
    mark: "项",
    filters: ["路径", "材料", "时间线"]
  },
  {
    title: "留学费用",
    detail: "学费、住宿、预算",
    href: "/cost",
    source: "估算",
    imageSrc: assetPath("/mobile-mini-program/category-cost-clean.png"),
    imageAlt: "留学费用分类图",
    tone: "bg-[#ffe07a]",
    mark: "费",
    filters: ["城市", "学校类型", "专业", "奖学金"]
  },
  {
    title: "韩语",
    detail: "TOPIK、报名、备考",
    href: "/topik",
    source: "官方",
    imageSrc: assetPath("/mobile-mini-program/category-topik-clean.png"),
    imageAlt: "韩语分类图",
    tone: "bg-[#71d39b]",
    mark: "韩",
    filters: ["当前等级", "目标等级", "备考时间"]
  },
  {
    title: "汇率换算",
    detail: "人民币、韩元、预算",
    href: "/exchange-rate",
    source: "汇率",
    imageSrc: assetPath("/mobile-mini-program/category-exchange-transparent.png"),
    imageAlt: "汇率换算分类图",
    tone: "bg-[#ffd0d8]",
    mark: "汇",
    filters: ["人民币", "韩元", "预算参考"]
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

export function getMobileRecommendationResults(input: MobileRecommendationInput): MobileRecommendationResult[] {
  return recommendUniversities({
    age: 18,
    gpaPercent: input.gpaPercent,
    highSchoolTier: input.highSchoolTier,
    gradeRankBand: "top_25",
    gaokaoStrength: "not_submitted",
    topikLevel: input.topikLevel,
    intendedMajor: input.intendedMajor,
    preferredRegion: input.preferredRegion,
    budgetLevel: input.budgetLevel,
    schoolTypePreference: input.schoolTypePreference,
    languageTrack: "korean"
  })
    .slice(0, 5)
    .map((result) => ({
      schoolSlug: result.schoolSlug,
      schoolNameCn: result.schoolNameCn,
      city: result.city,
      schoolType: result.schoolType,
      tier: getUniversityTier(result.schoolNameCn),
      category: mobileRecommendationCategoryLabels[result.category],
      reason: result.reasons.slice(1, 3).join(" / "),
      caution: result.cautions[0] ?? "请以学校最新招生简章为准。"
    }));
}
