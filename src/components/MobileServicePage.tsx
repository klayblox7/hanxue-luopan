"use client";

import {
  BookOpen,
  Calculator,
  ChevronRight,
  ClipboardList,
  SearchCheck,
  X
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { assetPath, routePath } from "@/data/assetPath";
import partnerSchoolProfiles from "@/data/partner-school-profiles.json";
import { universityAlumniText } from "@/data/universityAlumni";
import { universities } from "@/data/universities";
import { MobileBottomNav, type MobileBottomTabId } from "./MobileBottomNav";
import { buildMobileUniversities, UniversitySheet } from "./MobileUniversitiesApp";

type MobileServicePageId = "topik" | "cost" | "application" | "exchange" | "korean-learning";

type Metric = {
  label: string;
  value: string;
  detail?: string;
};

type ServiceAction = {
  id: string;
  label: string;
  title: string;
  detail: string;
  items: string[];
};

type PageConfig = {
  title: string;
  subtitle: string;
  eyebrow: string;
  activeTab?: MobileBottomTabId;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction: {
    label: string;
    href: string;
  };
  metrics: Metric[];
  actions: ServiceAction[];
};

type MobileReferenceItem = {
  label: string;
  labelAccent?: string;
  value: string;
  detail: string;
};

type MobileReferenceSection = {
  eyebrow: string;
  title: string;
  copy: string;
  items: MobileReferenceItem[];
};

type MobileTopikScoreSegment = {
  level: string;
  range: string;
  toneClass: string;
};

type MobileTopikScoreScale = {
  title: string;
  total: string;
  columns: string;
  segments: MobileTopikScoreSegment[];
};

type MobileTopikExamRow = {
  subject: string;
  time: string;
  count: string;
  score: string;
  isTotal?: boolean;
};

type MobileTopikExamSystem = {
  title: string;
  pill: string;
  rows: MobileTopikExamRow[];
};

type MobileTopikResource = {
  course: string;
  provider: string;
  href: string;
  imageAlt: string;
  imageSrc: string;
  cost: string;
  core: string;
  use: string;
};

type MobileTopikResourceSection = {
  title: string;
  rows: MobileTopikResource[];
};

type MobileCardSurfaceTone = "warm" | "white";

const mobileCardSurfaceClasses: Record<MobileCardSurfaceTone, string> = {
  warm: "rounded-lg border border-ink/25 bg-[#fbfaf4] px-4 py-3 shadow-none",
  white: "rounded-lg border border-ink/25 bg-[#fffefb] px-4 py-3 shadow-none"
};
const mobileCardEyebrowClass = "text-[0.84rem] font-black uppercase tracking-[0.08em] text-[#687365]";

function mobileCardSurfaceClass(tone: MobileCardSurfaceTone) {
  return mobileCardSurfaceClasses[tone];
}

function alternatingMobileCardSurface(index: number, firstTone: MobileCardSurfaceTone = "warm") {
  const nextTone: MobileCardSurfaceTone = firstTone === "warm" ? "white" : "warm";
  return index % 2 === 0 ? firstTone : nextTone;
}

type BudgetCity = "regional" | "seoul";
type BudgetSchool = "public" | "private";
type BudgetMajor = "humanities" | "engineering" | "arts" | "medicine";
type BudgetHousing = "dorm" | "shared" | "studio";
type BudgetRoute = "diy" | "assisted";

type BudgetFormState = {
  city: BudgetCity;
  school: BudgetSchool;
  major: BudgetMajor;
  housing: BudgetHousing;
  route: BudgetRoute;
  scholarship: string;
};

type BudgetEstimate = {
  context: string;
  total: { rmb: string; krw: string; rule: string };
  monthly: { rmb: string; krw: string; rule: string };
  tuition: { rmb: string; krw: string; rule: string };
  setup: { rmb: string; krw: string; rule: string };
};

type TopikTierId = "t1" | "t2" | "t3" | "t4" | "t5";

type TopikPlannerState = {
  current: string;
  tier: TopikTierId;
  season: string;
  hours: string;
};

type TopikPlan = {
  resultTitle: string;
  meaning: string;
  basis: string;
  completionPct: number;
  weeklyGapText: string;
  cumulativeText: string;
  gapTotalText: string;
  targetHoursText: string;
  availableHoursText: string;
  hourGapText: string;
  suggestion: string;
  actions: string[];
  isOnTrack: boolean;
};

type ApplicationPartner = {
  raw?: string;
  displayName?: string;
  displayLabel?: string;
  tier?: string;
  city?: string;
  type?: string;
  focus?: string;
  totalStudents?: string;
  foreignStudents?: string;
  founded?: string;
  intro?: string;
  nameKr?: string;
  nameEn?: string;
  officialUrl?: string;
  logoImage?: string;
  slug?: string;
  campusImage?: string;
  imagePosition?: string;
};

type ApplicationMobileUniversity = ReturnType<typeof buildMobileUniversities>[number];
type ApplicationPartnerSheetMode = "info" | "case";
type ApplicationPartnerSelection = {
  partner: ApplicationPartner;
  mode: ApplicationPartnerSheetMode;
};

export type ApplicationProgram = {
  title: string;
  chinaSchool: string;
  koreaSchools: string;
  mode: string;
  modeTitle?: string;
  section?: string;
  fields: Record<string, string>;
  region: string;
  majorTags: string[];
  sources?: Array<{ id: string; url: string }>;
  koreaPartners?: ApplicationPartner[];
  slug: string;
  order?: number;
};

type PartnerSchoolProfile = {
  name?: string;
  slug?: string;
  nameKr?: string;
  nameEn?: string;
  city?: string;
  type?: string;
  focus?: string;
  totalStudents?: string;
  foreignStudents?: string;
  founded?: string;
  campusImage?: string;
  imagePosition?: string;
  intro?: string;
  logoImage?: string;
  wikiUrl?: string;
};

const universityCampusImages: Record<string, string> = {
  "ajou-university": "public/campus-images/ajou-university.jpg",
  "catholic-university-of-korea": "public/campus-images/catholic-university-of-korea.jpg",
  "chung-ang-university": "public/campus-images/chung-ang-university.webp",
  "chungbuk-national-university": "public/campus-images/chungbuk-national-university.webp",
  "chungnam-national-university": "public/campus-images/chungnam-national-university.jpg",
  "dankook-university": "public/campus-images/dankook-university.webp",
  "dongguk-university": "public/campus-images/dongguk-university.webp",
  "duksung-womens-university": "public/campus-images/duksung-womens-university.jpg",
  "ewha-womans-university": "public/campus-images/ewha-womans-university.webp",
  "gachon-university": "public/campus-images/gachon-university.webp",
  "hankuk-university-of-foreign-studies": "public/campus-images/hankuk-university-of-foreign-studies.jpg",
  "hanyang-university": "public/campus-images/hanyang-university.webp",
  "hongik-university": "public/campus-images/hongik-university.webp",
  "inha-university": "public/campus-images/inha-university.webp",
  "jeju-national-university": "public/campus-images/jeju-national-university.jpg",
  "jeonbuk-national-university": "public/campus-images/jeonbuk-national-university.webp",
  "konkuk-university": "public/campus-images/konkuk-university.webp",
  "kookmin-university": "public/campus-images/kookmin-university.jpg",
  "korea-aerospace-university": "public/campus-images/korea-aerospace-university.webp",
  "korea-university": "public/campus-images/korea-university.webp",
  "kwangwoon-university": "public/campus-images/kwangwoon-university.webp",
  "kyung-hee-university": "public/campus-images/kyung-hee-university.webp",
  "myongji-university": "public/campus-images/myongji-university.webp",
  "sejong-university": "public/campus-images/sejong-university.webp",
  "seoul-national-university": "public/campus-images/seoul-national-university.jpg",
  "seoul-womens-university": "public/campus-images/seoul-womens-university.webp",
  "sogang-university": "public/campus-images/sogang-university.jpg",
  "sookmyung-womens-university": "public/campus-images/sookmyung-womens-university.jpg",
  "soongsil-university": "public/campus-images/soongsil-university.webp",
  "sungkyunkwan-university": "public/campus-images/sungkyunkwan-university.jpg",
  "sungshin-womens-university": "public/campus-images/sungshin-womens-university.jpg",
  "university-of-seoul": "public/campus-images/university-of-seoul.jpg",
  "yonsei-university": "public/campus-images/yonsei-university.webp"
};

function applicationOfficialPartnerUrl(value?: string) {
  const url = value?.trim();
  if (!url || /wikipedia\.org|wikidata\.org/i.test(url)) return undefined;
  return url;
}

const globalApplicationPartners: ApplicationPartner[] = [
  ...(partnerSchoolProfiles as PartnerSchoolProfile[]).map((profile) => ({
    raw: profile.name,
    displayName: profile.name,
    displayLabel: profile.name,
    slug: profile.slug,
    nameKr: profile.nameKr,
    nameEn: profile.nameEn,
    city: profile.city,
    type: profile.type,
    focus: profile.focus,
    totalStudents: profile.totalStudents,
    foreignStudents: profile.foreignStudents,
    founded: profile.founded,
    campusImage: profile.campusImage,
    imagePosition: profile.imagePosition,
    intro: profile.intro,
    logoImage: profile.logoImage,
    officialUrl: applicationOfficialPartnerUrl(profile.wikiUrl)
  })),
  ...universities.map((university) => ({
    raw: university.nameCn,
    displayName: university.nameCn,
    displayLabel: `${university.nameCn} (${university.city})`,
    slug: university.slug,
    nameKr: university.nameKr,
    nameEn: university.nameEn,
    city: university.city,
    type: university.type,
    focus: university.focus,
    totalStudents: university.totalStudents,
    foreignStudents: university.foreignStudents,
    campusImage: universityCampusImages[university.slug],
    imagePosition: "center",
    intro: `${university.nameCn}位于${university.city}，在本项目库中主要用于${university.focus}方向的匹配参考。建议结合项目模式、韩语要求、学费与所在城市生活成本一起判断是否适合申请。`
  }))
];

const pageConfigs: Record<MobileServicePageId, PageConfig> = {
  topik: {
    title: "TOPIK考试",
    subtitle: "先定目标等级，再倒排考试、教材和申请时间。",
    eyebrow: "Language plan",
    activeTab: "topik",
    primaryAction: { label: "看大学要求", href: "/universities" },
    secondaryAction: { label: "排申请路线", href: "/application" },
    metrics: [
      { label: "中国考次", value: "每年2次", detail: "4月 / 10月" },
      { label: "报名费", value: "400元", detail: "以报名系统为准" },
      { label: "目标线", value: "3-6级", detail: "按学校层级调整" }
    ],
    actions: [
      {
        id: "goal",
        label: "目标等级",
        title: "目标等级",
        detail: "用学校层级反推最低语言目标，不要只按现在基础选学校。",
        items: ["T1/T2：TOPIK 5-6更稳", "T3/T4：TOPIK 3-4是基本线", "艺术/热门专业：建议提高一级"]
      },
      {
        id: "exam",
        label: "报名节奏",
        title: "报名节奏",
        detail: "TOPIK成绩出分和学校截止日之间要留出缓冲。",
        items: ["先查目标学校截止日", "考试前2-3个月开始真题", "成绩未出时准备备选学校"]
      },
      {
        id: "study",
        label: "备考材料",
        title: "备考材料",
        detail: "移动版只保留可行动的学习顺序，详细资源放桌面页继续看。",
        items: ["发音/语法打底", "真题限时训练", "写作模板单独整理"]
      }
    ]
  },
  "korean-learning": {
    title: "韩语学习",
    subtitle: "从零基础到TOPIK目标等级的轻量路线。",
    eyebrow: "Study route",
    activeTab: "topik",
    primaryAction: { label: "看TOPIK考试", href: "/topik" },
    secondaryAction: { label: "看申请路线", href: "/application" },
    metrics: [
      { label: "入门", value: "0-2级", detail: "发音语法" },
      { label: "申请", value: "3-4级", detail: "多数路线" },
      { label: "冲刺", value: "5-6级", detail: "热门学校" }
    ],
    actions: [
      {
        id: "basic",
        label: "零基础",
        title: "零基础",
        detail: "先把发音和基础语法做稳，避免后期反复返工。",
        items: ["四十音/收音", "基础语法", "日常听说"]
      },
      {
        id: "middle",
        label: "中级",
        title: "中级",
        detail: "中级阶段开始把学习和申请目标绑定。",
        items: ["TOPIK 3-4", "真题阅读", "学校最低要求"]
      },
      {
        id: "advanced",
        label: "高级",
        title: "高级",
        detail: "高级阶段重点是写作、时间控制和申请材料表达。",
        items: ["TOPIK 5-6", "写作模板", "专业词汇"]
      }
    ]
  },
  cost: {
    title: "留学费用",
    subtitle: "按城市、学校类型和住宿方式估算，不把参考写成承诺。",
    eyebrow: "Budget planner",
    activeTab: "cost",
    primaryAction: { label: "估算学校预算", href: "/universities" },
    secondaryAction: { label: "看汇率参考", href: "/exchange-rate" },
    metrics: [
      { label: "地方国立", value: "7-12万", detail: "预算优先" },
      { label: "地方私立", value: "8-15万", detail: "专业灵活" },
      { label: "首尔私立", value: "14-20万", detail: "生活成本高" }
    ],
    actions: [
      {
        id: "predeparture",
        label: "出发前费用",
        title: "出发前费用",
        detail: "先把出发前现金流列出来，再看第一年学费生活费。",
        items: ["语言 / TOPIK：0.3-1.5万 + 报名费", "材料 / 签证：约1500-5000元", "申请服务：自申0，机构另算"]
      },
      {
        id: "city",
        label: "城市差异",
        title: "城市差异",
        detail: "同样的学校类型，首尔和地方城市的住宿、餐饮差异很大。",
        items: ["首尔住宿更贵", "地方生活成本更低", "宿舍优先申请"]
      },
      {
        id: "saving",
        label: "省钱抓手",
        title: "省钱抓手",
        detail: "真正能影响预算的通常是奖学金、住宿和餐饮。",
        items: ["奖学金25-50%", "校内宿舍或合租", "食堂/做饭降低餐饮"]
      }
    ]
  },
  application: {
    title: "国内+韩国项目",
    subtitle: "按地区、模式、专业和合作院校筛选公开项目。",
    eyebrow: "Application route",
    primaryAction: { label: "先选学校", href: "/universities" },
    secondaryAction: { label: "检查TOPIK", href: "/topik" },
    metrics: [
      { label: "项目", value: "63项", detail: "28保留+35官方" },
      { label: "范围", value: "本科/预科", detail: "不含专科/高职" },
      { label: "核对", value: "模式+费用", detail: "以官方简章为准" }
    ],
    actions: [
      {
        id: "documents",
        label: "材料清单",
        title: "材料清单",
        detail: "先准备所有路线都需要的共通材料。",
        items: ["毕业/在读证明", "成绩单", "护照与照片", "存款证明"]
      },
      {
        id: "agency",
        label: "自申判断",
        title: "自申判断",
        detail: "不要只看费用，重点看自己能不能稳定完成材料和网申。",
        items: ["目标学校少：可自申", "材料复杂：考虑服务", "合同要写清加收项"]
      },
      {
        id: "timeline",
        label: "时间线",
        title: "时间线",
        detail: "申请不是等学校开放才开始，语言和材料要提前倒排。",
        items: ["提前6-12个月定目标", "提前3-6个月备材料", "截止日前留邮寄缓冲"]
      }
    ]
  },
  exchange: {
    title: "汇率参考",
    subtitle: "用来快速换算预算口径，最终以当天银行牌价为准。",
    eyebrow: "Currency helper",
    activeTab: "cost",
    primaryAction: { label: "看费用预算", href: "/cost" },
    secondaryAction: { label: "回到首页", href: "/" },
    metrics: [
      { label: "换算", value: "可编辑", detail: "手动改汇率" },
      { label: "用途", value: "预算估算", detail: "不作承诺" },
      { label: "口径", value: "人民币/韩元", detail: "学校缴费另算" }
    ],
    actions: [
      {
        id: "rate",
        label: "汇率口径",
        title: "汇率口径",
        detail: "不同银行、支付时间和手续费会让实际到账金额不同。",
        items: ["用当天银行牌价", "大额缴费留手续费", "学校收费以韩元原文为准"]
      },
      {
        id: "budget",
        label: "预算换算",
        title: "预算换算",
        detail: "换算只帮助比较预算，不替代正式缴费金额。",
        items: ["学费按学校账单", "住宿按合同金额", "生活费按月预留"]
      },
      {
        id: "warning",
        label: "风险提醒",
        title: "风险提醒",
        detail: "汇率波动会影响申请前准备金和第一年预算。",
        items: ["不要卡最低余额", "分批换汇更稳", "保留付款凭证"]
      }
    ]
  }
};

const todayCnyToKrwRate = 224.18;
const sourceCurrencyRate = 1 / todayCnyToKrwRate;

const budgetFieldLabels = {
  city: { regional: "地方城市", seoul: "首尔圈" },
  school: { public: "国公立", private: "私立" },
  major: { humanities: "人文社科", engineering: "理工", arts: "艺术体育", medicine: "医学类" },
  housing: { dorm: "校内宿舍", shared: "合租/考试院", studio: "校外单间" },
  route: { diy: "DIY自申", assisted: "申请服务" }
} as const;

const budgetSelectOptions = {
  city: [
    { value: "regional", label: "地方城市" },
    { value: "seoul", label: "首尔圈" }
  ],
  school: [
    { value: "public", label: "国公立" },
    { value: "private", label: "私立" }
  ],
  major: [
    { value: "humanities", label: "人文社科" },
    { value: "engineering", label: "理工" },
    { value: "arts", label: "艺术体育" },
    { value: "medicine", label: "医学类" }
  ],
  housing: [
    { value: "dorm", label: "校内宿舍优先" },
    { value: "shared", label: "合租/考试院" },
    { value: "studio", label: "校外单间" }
  ],
  route: [
    { value: "diy", label: "DIY自申" },
    { value: "assisted", label: "购买申请服务" }
  ],
  scholarship: [
    { value: "0", label: "先按无奖算" },
    { value: "0.3", label: "假设减免30%" },
    { value: "0.5", label: "假设减免50%" }
  ]
} satisfies {
  city: Array<{ value: BudgetCity; label: string }>;
  school: Array<{ value: BudgetSchool; label: string }>;
  major: Array<{ value: BudgetMajor; label: string }>;
  housing: Array<{ value: BudgetHousing; label: string }>;
  route: Array<{ value: BudgetRoute; label: string }>;
  scholarship: Array<{ value: string; label: string }>;
};

const defaultBudgetForm: BudgetFormState = {
  city: "seoul",
  school: "private",
  major: "humanities",
  housing: "dorm",
  route: "diy",
  scholarship: "0"
};

const majorTuitionKrw: Record<BudgetMajor, number> = {
  humanities: 6003000,
  engineering: 7277200,
  arts: 7828200,
  medicine: 9843400
};

const seoulPrivateTuitionHighKrw: Record<BudgetMajor, number> = {
  humanities: 5800000 * 2,
  engineering: 7700000 * 2,
  arts: 7800000 * 2,
  medicine: 0
};

const schoolFactor: Record<BudgetSchool, number> = {
  public: 0.72,
  private: 1.08
};

const cityFactor: Record<BudgetCity, number> = {
  regional: 0.92,
  seoul: 1.08
};

const housingMonthly: Record<BudgetCity, Record<BudgetHousing, [number, number]>> = {
  regional: {
    dorm: [900, 1600],
    shared: [1300, 2200],
    studio: [2000, 3400]
  },
  seoul: {
    dorm: [1800, 2400],
    shared: [2500, 3600],
    studio: [3600, 5800]
  }
};

const livingMonthly: Record<BudgetCity, [number, number]> = {
  regional: [1900, 3000],
  seoul: [2600, 4200]
};

const routeSetup: Record<BudgetRoute, [number, number]> = {
  diy: [2500, 7000],
  assisted: [8500, 26000]
};

const insuranceMonthly = Math.round(76390 * sourceCurrencyRate);

const exchangeLivingCostGroups = [
  {
    title: "交通",
    items: [
      { label: "地铁/公交一次", krw: 1550, note: "首尔成人基础段参考" },
      { label: "出租车起步", krw: 4800, note: "首尔普通出租车白天参考" }
    ]
  },
  {
    title: "日常吃喝",
    items: [
      { label: "学生简餐/食堂", krw: [8000, 12000] as [number, number], note: "校园周边一餐" },
      { label: "咖啡一杯", krw: [4500, 6000] as [number, number], note: "连锁/校园咖啡店" }
    ]
  },
  {
    title: "文化娱乐",
    items: [
      { label: "电影普通票", krw: [14000, 15000] as [number, number], note: "影院和时段会变" },
      { label: "小剧场/演出", krw: [30000, 80000] as [number, number], note: "座位和剧目差异大" }
    ]
  },
  {
    title: "通讯/生活",
    items: [
      { label: "手机月套餐", krw: [33000, 69000] as [number, number], note: "留学生常见SIM/流量" },
      { label: "便利店小食", krw: [1500, 5000] as [number, number], note: "水、饭团、零食参考" }
    ]
  },
  {
    title: "到韩初期",
    items: [
      { label: "交通卡工本费", krw: [3000, 5000] as [number, number], note: "T-money等卡片费用" },
      { label: "证件照/复印", krw: [10000, 20000] as [number, number], note: "办卡、入学材料常用" }
    ]
  },
  {
    title: "学习/行政",
    items: [
      { label: "教材/二手书", krw: [15000, 40000] as [number, number], note: "按课程和新旧浮动" },
      { label: "医院普通门诊", krw: [10000, 30000] as [number, number], note: "保险后个人负担参考" }
    ]
  }
];

const mobileCostReferenceSections = [
  {
    eyebrow: "Cost Mix",
    title: "费用构成分析",
    copy: "",
    items: [
      { label: "学费", value: "约25-45%", detail: "常见2-7万/年，专业和学校差异最大" },
      { label: "住宿费", value: "约20-35%", detail: "宿舍最稳，校外单间波动更大" },
      { label: "生活费", value: "约20-30%", detail: "首尔圈明显高于地方城市" }
    ]
  },
  {
    eyebrow: "Scenario",
    title: "不同场景预算",
    copy: "",
    items: [
      { label: "地方国立", value: "7-11万", detail: "预算优先，适合重视性价比" },
      { label: "地方私立", value: "9-15万", detail: "专业选择更灵活，生活费相对可控" },
      { label: "首尔私立", value: "12-18万", detail: "资源集中，但住宿和生活成本高" },
      { label: "艺术/医学", value: "12.5-22万", detail: "材料费、实验费和作品集另算" }
    ]
  },
  {
    eyebrow: "Before Korea",
    title: "出发前现金",
    copy: "",
    items: [
      { label: "院校申请费", value: "300-900元/所", detail: "申请几所算几笔，退款规则要看学校" },
      { label: "韩语/TOPIK", value: "0.3-1.5万", detail: "课程、教材另加TOPIK约400元/次" },
      { label: "签证/公证/快递", value: "0.1-0.4万", detail: "补寄、加急、翻译认证都会增加" }
    ]
  }
];

const mobileApplicationChannels = [
  {
    title: "韩国高校官方直申",
    tag: "性价比",
    detail: "申请性价比最高，流程透明，但对个人材料整理、韩语和时间管理要求高。"
  },
  {
    title: "语学院过渡申请",
    tag: "稳妥型",
    detail: "先补语言与适应节奏，再衔接本科申请，适合TOPIK暂时不稳的学生。"
  },
  {
    title: "专业留学中介",
    tag: "托管型",
    detail: "覆盖选校、文书、面试和材料节点，适合时间紧或需要系统支持的家庭。"
  }
];

const mobileSelfAgencyProfile = [
  { label: "成绩", title: "学业中上", detail: "72-82分，想冲更高排名。" },
  { label: "预算", title: "重视性价比", detail: "8-12万/年，成本可控。" },
  { label: "语言", title: "韩语学习力强", detail: "语言能力可叠加专业优势。" },
  { label: "目标", title: "方向明确", detail: "关注韩国文化、AI、传媒等。" }
];

const mobileSelfAgencyCompare = [
  {
    label: "直申（DIY）",
    value: "性价比",
    detail: "省中介服务费，直接看院校官方信息；但要求韩语能力和时间管理。"
  },
  {
    label: "中介申请",
    value: "托管型",
    detail: "全流程托管，节省时间；需支付服务费并甄别机构资质。"
  }
];

const mobileTopikReferenceSections = [
  {
    eyebrow: "Study Hours",
    title: "TOPIK学习量阶梯",
    copy: "",
    items: [
      { label: "TOPIK1 - 约100小时", labelAccent: "(约3个月)", value: "入门", detail: "发音、助词、基础句型闭环" },
      { label: "TOPIK3 - 约350小时", labelAccent: "(约10个月)", value: "本科起点", detail: "进入TOPIK II，阅读速度开始重要" },
      { label: "TOPIK4 - 约600小时", labelAccent: "(约17个月)", value: "安全线", detail: "多数本科申请更稳，要配真题和写作" },
      { label: "TOPIK5 - 约900小时", labelAccent: "(约25个月)", value: "T1主申", detail: "热门学校和奖学金更建议冲到这个段位" }
    ]
  },
  {
    eyebrow: "Apply Line",
    title: "本科申请TOPIK线",
    copy: "",
    items: [
      { label: "T1目标", value: "5-6级", detail: "SKY/成均馆/汉阳/KAIST，热门专业再看6级" },
      { label: "T2目标", value: "4-5级", detail: "庆熙、中央、梨花、西江、釜山等更稳" },
      { label: "T3/T4目标", value: "3-4级", detail: "可申请面更宽，但专业要求仍要核对" },
      { label: "T5/过渡", value: "2-3级", detail: "可看语学院或低门槛路线，别硬冲" }
    ]
  }
];

const mobileTopikExamSystems: MobileTopikExamSystem[] = [
  {
    title: "1-2级入门考试",
    pill: "TOPIK I",
    rows: [
      { subject: "听力", time: "40分钟", count: "30题", score: "100分" },
      { subject: "阅读", time: "60分钟", count: "40题", score: "100分" },
      { subject: "合计", time: "100分钟", count: "70题", score: "200分", isTotal: true }
    ]
  },
  {
    title: "3-6级留学主战场",
    pill: "TOPIK II",
    rows: [
      { subject: "听力", time: "60分钟", count: "50题", score: "100分" },
      { subject: "写作", time: "50分钟", count: "4题", score: "100分" },
      { subject: "阅读", time: "70分钟", count: "50题", score: "100分" },
      { subject: "合计", time: "180分钟", count: "104题", score: "300分", isTotal: true }
    ]
  }
];

const mobileTopikScoreScales: MobileTopikScoreScale[] = [
  {
    title: "TOPIK I",
    total: "总分 200",
    columns: "1.35fr 1fr 1fr",
    segments: [
      { level: "未合格", range: "0-79", toneClass: "bg-[#f1f1ee]" },
      { level: "1级", range: "80-139", toneClass: "bg-[#c7ddd5]" },
      { level: "2级", range: "140-200", toneClass: "bg-[#b7dbc6]" }
    ]
  },
  {
    title: "TOPIK II",
    total: "总分 300",
    columns: "2fr 0.7fr 0.9fr 0.9fr 1.15fr",
    segments: [
      { level: "未合格", range: "0-119", toneClass: "bg-[#f1f1ee]" },
      { level: "3级", range: "120-149", toneClass: "bg-[#c7ddd5]" },
      { level: "4级", range: "150-189", toneClass: "bg-[#f2e4a3]" },
      { level: "5级", range: "190-229", toneClass: "bg-[#f4c6aa]" },
      { level: "6级", range: "230-300", toneClass: "bg-[#f2aaa1]" }
    ]
  }
];

const mobileTopikResourceSections: MobileTopikResourceSection[] = [
  {
    title: "免费网课资源",
    rows: [
      {
        course: "《全400集自学韩语全套教程》",
        provider: "言趣教育",
        href: "https://www.bilibili.com/video/BV1PXrxYZEjy/",
        imageAlt: "《全400集自学韩语全套教程》",
        imageSrc: "/topik-resources/yanqu-400-cover.webp",
        cost: "0元",
        core: "发音/语法/听读/TOPIK题型",
        use: "适合0基础到高级，作为长期主线课。"
      },
      {
        course: "《2024最新自学韩语全套教程》",
        provider: "Candy韩语学姐",
        href: "https://www.yanquedu.com/korean-teacher/37.html",
        imageAlt: "《2024最新自学韩语全套教程》",
        imageSrc: "/topik-resources/candy-cover.webp",
        cost: "0元",
        core: "发音到高级，短课节奏轻",
        use: "适合零基础入门，或备考时间充裕的学生。"
      },
      {
        course: "《TOPIK历年真题解析》",
        provider: "真题解析课程",
        href: "https://www.bilibili.com/video/BV1eM4y1L7jV/",
        imageAlt: "《TOPIK历年真题解析》",
        imageSrc: "/topik-resources/topik-zhenti-cover.webp",
        cost: "0元",
        core: "听读写真题思路与陷阱",
        use: "适合强化和冲刺阶段，配合真题训练。"
      },
      {
        course: "《TOPIK听力/阅读核心技巧》",
        provider: "养乐多老师",
        href: "https://www.qtfm.cn/channels/232472/",
        imageAlt: "《TOPIK听力/阅读核心技巧》",
        imageSrc: "/topik-resources/yangleduo-cover.webp",
        cost: "0元",
        core: "听读定位、得分点、高频考点",
        use: "适合短期冲刺，或真题训练阶段补弱项。"
      }
    ]
  },
  {
    title: "付费网课资源",
    rows: [
      {
        course: "TOPIK 冲刺班",
        provider: "沪江网校",
        href: "https://class.hujiang.com/category/134752",
        imageAlt: "TOPIK 冲刺班",
        imageSrc: "/topik-resources/topik-zhenti-cover.webp",
        cost: "369元起",
        core: "真题讲练、技巧、作文批改、模考",
        use: "适合考前冲刺、需要写作批改和稳定反馈的学生。"
      },
      {
        course: "韩语 TOPIK 直播课",
        provider: "新东方",
        href: "https://www.koolearn.com/product/c_27_207302.html",
        imageAlt: "韩语 TOPIK 直播课",
        imageSrc: "/topik-resources/candy-cover.webp",
        cost: "2599元",
        core: "基础到冲刺，督学、答疑、批改",
        use: "适合想从基础到考试系统推进，且有学习规划需求的学生。"
      },
      {
        course: "TOPIK 中级写作直播班",
        provider: "牙牙韩语",
        href: "https://www.diliushixian.com/course/info/185.html",
        imageAlt: "TOPIK 中级写作直播班",
        imageSrc: "/topik-resources/yangleduo-cover.webp",
        cost: "4000元",
        core: "中级写作框架、句子批改、结构",
        use: "适合 TOPIK 中级写作薄弱、需要专项提分的考生。"
      }
    ]
  },
  {
    title: "系统学习基础教材",
    rows: [
      {
        course: "《延世韩国语》",
        provider: "延世大学韩国语学堂",
        href: "https://item.jd.com/12318319.html",
        imageAlt: "《延世韩国语》",
        imageSrc: "/topik-resources/jd-yonsei-korean.webp",
        cost: "39元起",
        core: "6册体系，词汇语法听读写完整",
        use: "最适合作为系统学习主教材。"
      },
      {
        course: "《首尔大学韩国语》",
        provider: "首尔大学语言教育院",
        href: "https://item.jd.com/11652455.html",
        imageAlt: "《首尔大学韩国语》",
        imageSrc: "/topik-resources/jd-snu-korean.webp",
        cost: "42元起",
        core: "场景口语+语法，配听力音频",
        use: "适合初学者辅助学习，尤其是口语场景补充。"
      },
      {
        course: "《新标准韩国语》",
        provider: "韩国外国语大学语言教育院",
        href: "https://item.jd.com/12950977.html",
        imageAlt: "《新标准韩国语》",
        imageSrc: "/topik-resources/jd-standard-korean.webp",
        cost: "35元起",
        core: "题型+语言运用，语法解析更细",
        use: "适合自学考生，或语法理解困难的学生。"
      }
    ]
  },
  {
    title: "TOPIK 考试专项教材",
    rows: [
      {
        course: "TOPIK 官方教程及真题集",
        provider: "国立国际教育院",
        href: "https://item.jd.com/12706601.html",
        imageAlt: "TOPIK 官方教程及真题集",
        imageSrc: "/topik-resources/jd-topik-official.webp",
        cost: "45元起",
        core: "命题逻辑、限时模考、错题分析",
        use: "冲刺阶段必练，优先级最高。"
      },
      {
        course: "《新韩国语能力考试考前对策》",
        provider: "TOPIK专项教研资料",
        href: "https://item.jd.com/13029458.html",
        imageAlt: "《新韩国语能力考试考前对策》",
        imageSrc: "/topik-resources/jd-topik-strategy.webp",
        cost: "45元起",
        core: "分级技巧、备考策略、全真模拟",
        use: "适合考前1-3个月专项强化。"
      },
      {
        course: "TOPIK 词汇/语法/阅读/写作",
        provider: "专项备考教材",
        href: "https://item.jd.com/14227433.html",
        imageAlt: "TOPIK 词汇/语法/阅读/写作",
        imageSrc: "/topik-resources/jd-topik-vocab.webp",
        cost: "45元起",
        core: "词汇语法阅读写作，高频考点解析",
        use: "适合强化阶段查缺补漏，尤其是写作和高级语法。"
      }
    ]
  }
];

const topikTierMap: Record<
  TopikTierId,
  { target: number; stretch: number; label: string; name: string }
> = {
  t1: { target: 5, stretch: 6, label: "T1", name: "SKY/成均馆等" },
  t2: { target: 4, stretch: 5, label: "T2", name: "庆熙/中央/梨花/西江/釜山等" },
  t3: { target: 3, stretch: 4, label: "T3", name: "外大/东国/建国/国民等" },
  t4: { target: 3, stretch: 4, label: "T4", name: "中坚私立/特色院校" },
  t5: { target: 2, stretch: 3, label: "T5", name: "保底/语学院过渡" }
};

const topikLevelHours: Record<number, number> = { 0: 0, 1: 100, 2: 200, 3: 350, 4: 600, 5: 900, 6: 1200 };

const topikTimeProfiles: Record<number, { label: string; daily: string }> = {
  6: { label: "高中保守", daily: "每天0.5-0.8小时" },
  9: { label: "高中日常", daily: "每天0.8-1.3小时" },
  14: { label: "高中积极", daily: "每天约1.5小时" },
  20: { label: "假期集中", daily: "每天约3小时" },
  28: { label: "全力冲刺", daily: "每天约4小时" }
};

const topikSeasonOptions = [
  { value: "3", applyMonths: 0, label: "26年9月入学（主申请窗已基本结束）" },
  { value: "9", applyMonths: 3, label: "27年3月入学（约3个月申请准备）" },
  { value: "15", applyMonths: 9, label: "27年9月入学（约9个月申请准备）" },
  { value: "21", applyMonths: 15, label: "28年3月入学（约15个月申请准备）" }
];

const defaultTopikPlanner: TopikPlannerState = {
  current: "0",
  tier: "t1",
  season: "9",
  hours: "9"
};

function wanNumber(value: number) {
  const decimals = value >= 100000 ? 1 : 2;
  const scale = 10 ** decimals;
  const amount = Math.round(((value / 10000) + Number.EPSILON) * scale) / scale;
  return amount.toFixed(decimals).replace(/\.0$/, "");
}

function addThousandsSeparator(value: string) {
  const [integer, decimal] = value.split(".");
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimal ? `${formattedInteger}.${decimal}` : formattedInteger;
}

function formatKrwAmount(value: number) {
  return `${value.toLocaleString("zh-CN")}韩元`;
}

function formatCnyAmount(value: number) {
  return `${value.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}元`;
}

function formatLivingCostKrw(value: number | [number, number]) {
  if (Array.isArray(value)) {
    return `${formatKrwAmount(value[0])}-${formatKrwAmount(value[1])}`;
  }

  return formatKrwAmount(value);
}

function formatLivingCostCny(value: number | [number, number]) {
  if (Array.isArray(value)) {
    return `约 ${formatCnyAmount(value[0] * sourceCurrencyRate)}-${formatCnyAmount(value[1] * sourceCurrencyRate)}`;
  }

  return `约 ${formatCnyAmount(value * sourceCurrencyRate)}`;
}

function averageRmbWan(range: [number, number]) {
  return `${wanNumber((range[0] + range[1]) / 2)}万`;
}

function averageKrwWanFromRmb(range: [number, number]) {
  return `${addThousandsSeparator(wanNumber(((range[0] + range[1]) / 2) / sourceCurrencyRate))}万韩元`;
}

function calculateBudgetEstimate(input: BudgetFormState): BudgetEstimate {
  const scholarshipRate = Number(input.scholarship);
  const tuitionBase = majorTuitionKrw[input.major] * schoolFactor[input.school] * cityFactor[input.city] * sourceCurrencyRate;
  const tuitionHighBase =
    input.city === "seoul" && input.school === "private"
      ? Math.max(tuitionBase * 1.12, seoulPrivateTuitionHighKrw[input.major] * sourceCurrencyRate)
      : tuitionBase * 1.12;
  const tuitionLow = tuitionBase * 0.92 * (1 - scholarshipRate);
  const tuitionHigh = tuitionHighBase * (1 - scholarshipRate);
  const housingRange = housingMonthly[input.city][input.housing];
  const livingRange = livingMonthly[input.city];
  const monthlyLow = housingRange[0] + livingRange[0] + insuranceMonthly;
  const monthlyHigh = housingRange[1] + livingRange[1] + insuranceMonthly;
  const setupRange = routeSetup[input.route];

  const annualHousingLow = housingRange[0] * 12;
  const annualHousingHigh = housingRange[1] * 12;
  const annualLivingLow = (livingRange[0] + insuranceMonthly) * 12;
  const annualLivingHigh = (livingRange[1] + insuranceMonthly) * 12;
  const totalLow = tuitionLow + annualHousingLow + annualLivingLow + setupRange[0];
  const totalHigh = tuitionHigh + annualHousingHigh + annualLivingHigh + setupRange[1];
  const scholarshipText = scholarshipRate ? `假设减免${Math.round(scholarshipRate * 100)}%` : "无奖学金假设";

  return {
    context: `${budgetFieldLabels.city[input.city]}${budgetFieldLabels.school[input.school]}，${budgetFieldLabels.major[input.major]}，${budgetFieldLabels.housing[input.housing]}，${budgetFieldLabels.route[input.route]}，${scholarshipText}`,
    total: {
      rmb: averageRmbWan([totalLow, totalHigh]),
      krw: averageKrwWanFromRmb([totalLow, totalHigh]),
      rule: `净学费 + ${budgetFieldLabels.housing[input.housing]}12个月 + 生活/保险12个月 + ${budgetFieldLabels.route[input.route]}前期现金`
    },
    monthly: {
      rmb: averageRmbWan([monthlyLow, monthlyHigh]),
      krw: averageKrwWanFromRmb([monthlyLow, monthlyHigh]),
      rule: `${budgetFieldLabels.housing[input.housing]}月预算 + ${budgetFieldLabels.city[input.city]}生活费 + NHIS保险`
    },
    tuition: {
      rmb: averageRmbWan([tuitionLow, tuitionHigh]),
      krw: averageKrwWanFromRmb([tuitionLow, tuitionHigh]),
      rule: `${budgetFieldLabels.major[input.major]}基准学费 + ${budgetFieldLabels.school[input.school]}系数 + ${budgetFieldLabels.city[input.city]}系数 + ${scholarshipText}`
    },
    setup: {
      rmb: averageRmbWan(setupRange),
      krw: averageKrwWanFromRmb(setupRange),
      rule: input.route === "assisted" ? "申请服务费 + 签证材料 + TOPIK + 快递/公证" : "签证材料 + TOPIK + 快递 + 公证"
    }
  };
}

function realisticByTopikLevel(level: number) {
  if (level >= 5) return { label: "T1目标可保留", tier: "TOPIK 5+ / T1可保留", copy: "可保T1；54题和专业热度另算。" };
  if (level >= 4) return { label: "T2/T3更稳", tier: "TOPIK 4 / T2-T3", copy: "T2/T3主申更稳；T1冲刺或延期。" };
  if (level >= 3) return { label: "建议调整到T3/T4", tier: "TOPIK 3 / T3-T4", copy: "T3/T4主申，T2冲刺。" };
  if (level >= 2) return { label: "先保T5或语学院", tier: "TOPIK 2 / T5-语学院", copy: "先保TOPIK I，再看语学院或延期。" };
  return { label: "先延期或打基础", tier: "TOPIK 1以下 / 先打基础", copy: "先补发音、语法和听读。" };
}

function findAchievableTopikLevel(hours: number) {
  return Object.keys(topikLevelHours).reduce((level, key) => {
    const nextLevel = Number(key);
    return topikLevelHours[nextLevel] <= hours ? nextLevel : level;
  }, 0);
}

function formatHours(hours: number) {
  return `约${Math.round(hours)}小时`;
}

function formatWeekly(hours: number) {
  if (!Number.isFinite(hours)) return "无法计算";
  return `约${Math.ceil(hours)}小时/周`;
}

function calculateTopikPlan(input: TopikPlannerState): TopikPlan {
  const current = Number(input.current);
  const tier = topikTierMap[input.tier];
  const season = topikSeasonOptions.find((option) => option.value === input.season) ?? topikSeasonOptions[1];
  const monthsAvailable = Math.max(0, season.applyMonths);
  const weeklyHours = Number(input.hours);
  const profile = topikTimeProfiles[weeklyHours];
  const target = Math.max(tier.target, current >= tier.target ? current : tier.target);
  const currentHours = topikLevelHours[current] || 0;
  const targetHours = topikLevelHours[target] || 0;
  const remainingHours = Math.max(0, targetHours - currentHours);
  const weeksAvailable = monthsAvailable > 0 ? monthsAvailable * 4.33 : 0;
  const availableHours = Math.round(weeklyHours * weeksAvailable);
  const totalReachableHours = currentHours + availableHours;
  const gapHours = Math.max(0, targetHours - totalReachableHours);
  const isOnTrack = gapHours === 0;
  const requiredWeekly = weeksAvailable > 0 ? remainingHours / weeksAvailable : Infinity;
  const completionPct = targetHours > 0 ? Math.max(0, Math.min(100, Math.round((totalReachableHours / targetHours) * 100))) : 100;
  const weeklyGap = Number.isFinite(requiredWeekly) ? Math.max(0, Math.ceil(requiredWeekly - weeklyHours)) : 0;
  const achievableLevel = findAchievableTopikLevel(totalReachableHours);
  const realistic = realisticByTopikLevel(achievableLevel);
  const targetLine = `TOPIK ${target}`;
  const reachableLine = achievableLevel === 0 ? "TOPIK 1以下" : `TOPIK ${achievableLevel}`;
  const currentLabel = current === 0 ? "0基础" : `TOPIK ${current}附近`;
  const hasApplicationWindow = monthsAvailable > 0;
  const insistAction =
    !hasApplicationWindow ? "主申请窗口已基本结束：优先查补录、语学院或下一入学季。" :
    remainingHours === 0 ? "确认成绩有效期。" :
    requiredWeekly > weeklyHours ? `坚持${tier.label}：${formatWeekly(requiredWeekly)}或延期。` :
    `保持${profile.label}，提前报名。`;
  const adjustAction = achievableLevel >= tier.target ? `保${tier.label}，冲TOPIK ${tier.stretch}。` : `现实：${realistic.tier}`;
  const writingAction = target >= 5 ? "54题每周一篇批改，核对报名。" : target >= 4 ? "先诊断51-53题，核对报名。" : "先稳TOPIK I听读，核对报名。";

  return {
    resultTitle: isOnTrack ? `目标可达，按${tier.label}推进` : realistic.label,
    meaning: hasApplicationWindow
      ? `${profile.label}，申请前${monthsAvailable}个月约${availableHours}小时；预计到${reachableLine}。`
      : `${profile.label}，按主申请截止计算已无完整准备窗；预计仍在${reachableLine}。`,
    basis: `${tier.label}安全线${targetLine}约${targetHours}小时；当前${currentLabel}，差${remainingHours}小时。已按申请截止倒推。`,
    completionPct,
    weeklyGapText: weeklyGap > 0 ? `约${weeklyGap}小时/周` : "无缺口",
    cumulativeText: formatHours(totalReachableHours),
    gapTotalText: gapHours > 0 ? formatHours(gapHours) : "已覆盖",
    targetHoursText: formatHours(targetHours),
    availableHoursText: formatHours(availableHours),
    hourGapText: formatHours(gapHours),
    suggestion: isOnTrack ? `按${tier.label}目标推进，当前时间规划可以覆盖安全线。` : realistic.copy,
    actions: [insistAction, adjustAction, writingAction],
    isOnTrack
  };
}

const fallbackApplicationPrograms: ApplicationProgram[] = [
  {
    title: "北京外国语大学 ↔ 韩国国立全北大学",
    chinaSchool: "北京外国语大学",
    koreaSchools: "韩国国立全北大学",
    mode: "2+2",
    modeTitle: "1. 2+2 模式（国内 2 年 + 韩国 2 年，本科层次）",
    section: "华北地区",
    fields: {
      专业设置: "经营学、国语国文、英语英文、媒体传播、心理学、法国非洲学",
      国内费用: "学费 52000 元 / 年，住宿费 15000-22000 元 / 年，另有 25000 元 / 年的申请服务费（不含第三方签证、材料翻译等费用）",
      韩方费用: "韩国国立全北大学的学费按专业有所区分，人文社科类专业学费约为 1 万元 / 学期，理工类专业约为 1.2 万元 / 学期，艺术类专业标准稍高",
      申请条件: "招生对象为应往届高中毕业生或同等学力者；要求高考成绩达本省本科线，或通过学校自主组织的综合能力笔试 + 综合素质面试；无强制韩语基础要求，但入学后需接受密集型韩语强化培训，赴韩前需达到 TOPIK 3 级及以上水平",
      证书说明: "韩国国立全北大学学士学位证，该学历证书可直接在中国教育部留学服务中心办理认证。"
    },
    region: "华北",
    majorTags: ["传媒/影视", "商科/经管", "语言/教育", "体育/社科"],
    sources: [{ id: "101", url: "https://www.bwpx.com/info/1062/4596.htm" }],
    koreaPartners: [
      {
        displayName: "全北大学",
        displayLabel: "T3 全北大学 (全州)",
        tier: "T3",
        city: "全州",
        campusImage: "public/campus-images/jeonbuk-national-university.webp",
        imagePosition: "center"
      }
    ],
    slug: "program-1-gev-fjg-hli-h6l-rn1-hlz-i1y",
    order: 1
  },
  {
    title: "天津外国语大学 ↔ 韩国首尔女子大学、祥明大学",
    chinaSchool: "天津外国语大学",
    koreaSchools: "韩国首尔女子大学、祥明大学",
    mode: "2+2",
    modeTitle: "1. 2+2 模式（国内 2 年 + 韩国 2 年，本科层次）",
    section: "华北地区",
    fields: {
      专业设置: "韩语、国际经济与贸易、视觉传达设计、文化产业管理",
      国内费用: "32000 元 / 年",
      韩方费用: "3.2-4.5 万元 / 学年",
      申请条件: "招生对象为高中毕业生，要求高考成绩达本省本科线；入学后需完成校内韩语强化课程，赴韩前置阶段需达到 TOPIK 3 级及以上水平",
      证书说明: "韩国合作大学学士学位证，可正常办理中留服认证。"
    },
    region: "华北",
    majorTags: ["艺术/设计", "传媒/影视", "商科/经管", "语言/教育"],
    sources: [{ id: "118", url: "http://www.51yishuqiao.com/school/666/detail?id=18875" }],
    koreaPartners: [
      {
        displayName: "首尔女子大学",
        displayLabel: "T4 首尔女子大学 (首尔)",
        tier: "T4",
        city: "首尔",
        campusImage: "public/campus-images/seoul-womens-university.webp",
        imagePosition: "center"
      },
      {
        displayName: "祥明大学",
        displayLabel: "T4 祥明大学 (首尔/天安)",
        tier: "T4",
        city: "首尔/天安",
        campusImage: "public/campus-images/sangmyung-university.webp",
        imagePosition: "center"
      }
    ],
    slug: "program-2-hm1-lk5-hli-h6l-rn1-hlz-i1y",
    order: 2
  },
  {
    title: "河北外国语大学 ↔ 韩国世宗大学、嘉泉大学",
    chinaSchool: "河北外国语大学",
    koreaSchools: "韩国世宗大学、嘉泉大学",
    mode: "2+2",
    modeTitle: "1. 2+2 模式（国内 2 年 + 韩国 2 年，本科层次）",
    section: "华北地区",
    fields: {
      专业设置: "韩语、学前教育、航空服务、艺术设计、电子商务",
      国内费用: "公开资料参考：同类本科分段项目国内阶段约 2.2-5.8 万元 / 年；住宿费、教材费和项目管理费按国内院校当年简章执行",
      韩方费用: "公开资料参考：韩方私立大学学费约 3.2-6 万元 / 年；艺术、设计、医学等专业通常高于普通人文社科专业",
      申请条件: "招生对象为应往届高中毕业生或同等学力者，学校采用资质审核 + 综合面试的自主招生录取模式，无硬性高考分数要求；学生入学后需完成校内韩语强化课程，赴韩前需达到 TOPIK 3 级及以上水平",
      证书说明: "韩国合作大学学士学位证，可正常办理中留服认证。"
    },
    region: "华北",
    majorTags: ["艺术/设计", "商科/经管", "工科/理工", "语言/教育", "酒店/旅游"],
    sources: [
      { id: "118", url: "http://www.51yishuqiao.com/school/666/detail?id=18875" },
      { id: "费用参考", url: "https://liuxuekorea.ytu.edu.cn/zsjz.htm" }
    ],
    koreaPartners: [
      {
        displayName: "世宗大学",
        displayLabel: "T2 世宗大学 (首尔)",
        tier: "T2",
        city: "首尔",
        campusImage: "public/campus-images/sejong-university.webp",
        imagePosition: "center"
      },
      {
        displayName: "嘉泉大学",
        displayLabel: "T3 嘉泉大学 (城南)",
        tier: "T3",
        city: "城南",
        campusImage: "public/campus-images/gachon-university.webp",
        imagePosition: "center top"
      }
    ],
    slug: "program-3-lgz-gev-hli-h6l-rn1-hlz-i1y",
    order: 3
  }
];

function compactText(value: string, limit = 42) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit).replace(/[，,；;、\s]+$/, "")}...` : text;
}

function cleanApplicationText(value?: string) {
  return String(value || "资料待核对")
    .replace(/\[(\d+)\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function summarizeApplicationMajor(value?: string) {
  const items = cleanApplicationText(value)
    .split(/[、，,；;\/]/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (!items.length) return "资料待核对";
  const shown = items.slice(0, 4).join("、");
  return items.length > 4 ? `${shown}等` : shown;
}

function summarizeApplicationMode(value?: string) {
  return cleanApplicationText(value);
}

function summarizeApplicationDomesticFee(value?: string) {
  const text = cleanApplicationText(value);
  if (!text) return "资料待核对";
  if (/(没有列出|未列|以.+收费通知为准|以.+缴费通知为准)/.test(text) && !/[\d,]+(?:\s*[~～-]\s*[\d,]+)?\s*元/.test(text)) {
    return compactText(text, 82);
  }
  if (/公开资料参考/.test(text)) {
    const amount = text.match(/约\s*[\d,.]+(?:\s*[~～-]\s*[\d,.]+)?\s*万元\s*\/\s*年/)?.[0];
    if (amount) {
      if (/专科|高职/.test(text)) return `同类专科/高职：${amount}`;
      if (/国内全程|校际合作/.test(text)) return `国内全程/合作项目：${amount}`;
      return `同类本科项目：${amount}`;
    }
  }
  const tuition =
    text.match(/(?:学费|课程费)\s*[\d,]+(?:\s*[~～-]\s*[\d,]+)?\s*元\s*\/\s*(?:人\s*\/\s*)?(?:学年|学期|年)/)?.[0] ||
    text.match(/(?:学费|课程费)\s*[^；;。)]*/)?.[0];
  const dorm = text.match(/住(?:宿|宿费)\s*[^；;。)]*/)?.[0];
  const applicationFee = text.match(/(?:国外院校申请费及管理费|申请\/海外服务|申请服务费)\s*[\d,]+(?:\s*[~～-]\s*[\d,]+)?\s*元(?:\s*\/\s*人)?/)?.[0];
  const halfYearCaveat = /0\.5年制未见官方单列/.test(text) ? "0.5年制未见官方单列" : "";
  const parts = [tuition, dorm, applicationFee, halfYearCaveat].filter(Boolean);
  return parts.length ? compactText(parts.join("；"), halfYearCaveat ? 72 : 82) : compactText(text, 38);
}

function summarizeApplicationKoreaFee(value?: string) {
  const text = cleanApplicationText(value);
  if (!text) return "资料待核对";
  if (/公开资料参考/.test(text)) {
    const national = text.match(/国立约\s*[\d,.]+(?:\s*[~～-]\s*[\d,.]+)?\s*万元\s*\/\s*年/)?.[0];
    const priv = text.match(/私立约\s*[\d,.]+(?:\s*[~～-]\s*[\d,.]+)?\s*万元\s*\/\s*年/)?.[0];
    if (national || priv) return compactText([national, priv].filter(Boolean).join("；"), 42);
    const amount = text.match(/约\s*[\d,.]+(?:\s*[~～-]\s*[\d,.]+)?\s*万元\s*\/\s*年/)?.[0];
    if (amount) {
      if (/国立|公立/.test(text)) return `韩方国立/公立：${amount}`;
      if (/私立/.test(text)) return `韩方私立：${amount}`;
      return `韩方参考学费：${amount}`;
    }
  }
  if (/未列固定韩方金额|未列统一韩方金额|按.*专业学费表收费|按.*本校专业学费表收费/.test(text)) {
    return compactText(text, 118);
  }
  const koreaTuition = text.match(/[^；;。]*学费[^；;。]*/)?.[0]?.trim();
  const koreaDorm = text.match(/[^；;。]*(?:公寓|住宿)[^；;。]*/)?.[0]?.trim();
  const koreaLiving = text.match(/[^；;。]*生活费[^；;。]*/)?.[0]?.trim();
  const koreaMeal = text.match(/[^；;。]*(?:食堂|每餐)[^；;。]*/)?.[0]?.trim();
  if (koreaTuition || koreaDorm || koreaLiving || koreaMeal) {
    return compactText(Array.from(new Set([koreaTuition, koreaDorm, koreaLiving, koreaMeal].filter(Boolean))).join("；"), 96);
  }
  const amounts = [...text.matchAll(/(?:约|为)?\s*[\d,]+(?:\s*[~～-]\s*[\d,]+)?\s*万?元\s*\/\s*(?:人\s*\/\s*)?(?:学期|学年|年)/g)].map((match) =>
    match[0].trim()
  );
  if (amounts.length) return compactText(`参考学费：${amounts.slice(0, 2).join("、")}`, 42);
  if (/奖学金|减免|勤工/.test(text)) return "学费以官方为准；可关注奖学金";
  return compactText(text, 38);
}

function summarizeApplicationRequirements(value?: string) {
  const text = cleanApplicationText(value);
  if (!text) return "资料待核对";
  return text;
}

function summarizeApplicationCertificate(value?: string) {
  const text = cleanApplicationText(value);
  if (!text) return "资料待核对";
  return text;
}

function summarizeApplicationFact(label: string, value?: string) {
  if (label === "专业设置") return summarizeApplicationMajor(value);
  if (label === "培养模式") return summarizeApplicationMode(value);
  if (label === "国内费用") return summarizeApplicationDomesticFee(value);
  if (label === "韩方费用") return summarizeApplicationKoreaFee(value);
  if (label === "申请条件") return summarizeApplicationRequirements(value);
  if (label === "证书说明") return summarizeApplicationCertificate(value);
  return compactText(cleanApplicationText(value), 42);
}

function publicApplicationAssetPath(value?: string) {
  if (!value) return "";
  const normalized = value.startsWith("public/") ? `/${value.slice("public/".length)}` : value.startsWith("/") ? value : `/${value}`;
  return assetPath(normalized);
}

function applicationPartnerName(partner?: ApplicationPartner) {
  return partner?.displayName || partner?.raw || partner?.displayLabel || "韩国合作大学";
}

function mergeApplicationPartnerDetails(base: ApplicationPartner, override: ApplicationPartner): ApplicationPartner {
  const merged: ApplicationPartner = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value != null && value !== "") {
      (merged as Record<string, unknown>)[key] = value;
    }
  }
  return merged;
}

function normalizeApplicationPartnerName(value?: string) {
  return String(value || "")
    .replace(/[（(][^）)]*[）)]/g, "")
    .replace(/^[Tt]\d+\s*/, "")
    .replace(/韩国|国立|國立/g, "")
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "")
    .trim();
}

function applicationPartnerList(program: ApplicationProgram) {
  const explicit = cleanApplicationText(program.fields["合作院校"]);
  const names = explicit && explicit !== "资料待核对" ? explicit : program.koreaSchools;
  return names
    .replace(/韩国名校\s*\d+所/g, "")
    .split(/[、，,；;]/)
    .map((item) =>
      item
        .replace(/^韩国/, "")
        .replace(/[（(][^）)]*[）)]/g, "")
        .replace(/等\d+余?所$/, "")
        .replace(/等$/, "")
        .trim()
    )
    .filter(Boolean);
}

function applicationPartnerForName(name: string, partners?: ApplicationPartner[], fallbackPartners?: ApplicationPartner[]) {
  const target = normalizeApplicationPartnerName(name);
  if (!target) return undefined;
  const findPartner = (items?: ApplicationPartner[]) =>
    items?.find((partner) => {
      const candidates = [partner.displayName, partner.raw, partner.displayLabel, partner.nameKr, partner.nameEn, applicationPartnerName(partner)];
      return candidates.some((candidate) => {
        const normalized = normalizeApplicationPartnerName(candidate);
        return normalized.length > 1 && (normalized === target || normalized.includes(target) || target.includes(normalized));
      });
    });
  const matchedPartner = findPartner(partners);
  const fallbackPartner = findPartner(fallbackPartners?.filter((partner) => partner !== matchedPartner));
  if (matchedPartner && fallbackPartner) return mergeApplicationPartnerDetails(fallbackPartner, matchedPartner);
  return matchedPartner || fallbackPartner;
}

function applicationUniversityForPartner(
  partner: ApplicationPartner,
  bySlug: Map<string, ApplicationMobileUniversity>,
  byName: Map<string, ApplicationMobileUniversity>
) {
  if (partner.slug) {
    const bySlugMatch = bySlug.get(partner.slug);
    if (bySlugMatch) return bySlugMatch;
  }

  const candidates = [partner.displayName, partner.raw, partner.displayLabel, partner.nameKr, partner.nameEn, applicationPartnerName(partner)];
  for (const candidate of candidates) {
    const normalized = normalizeApplicationPartnerName(candidate);
    if (!normalized) continue;
    const byNameMatch = byName.get(normalized);
    if (byNameMatch) return byNameMatch;
  }
  return undefined;
}

function applicationPartnerFallback(name: string): ApplicationPartner {
  const displayName = cleanApplicationText(name) || "韩国合作大学";
  return {
    raw: displayName,
    displayName,
    displayLabel: displayName,
    focus: "合作项目相关专业",
    intro: `${displayName}是该项目公开列出的韩国合作院校；当前大学库详细资料仍在补充，申请前请以学校官网、项目简章和录取通知为准。`
  };
}

function applicationProgramInstanceKey(program: ApplicationProgram) {
  return [
    program.slug,
    program.order != null ? `order:${program.order}` : "",
    program.mode,
    program.title || `${program.chinaSchool}-${program.koreaSchools}`
  ]
    .filter(Boolean)
    .join("|");
}

function applicationPartnerHeader(program: ApplicationProgram) {
  const explicit = cleanApplicationText(program.fields["合作院校"]);
  const items = applicationPartnerList(program);
  if (/韩国.*\d+余?所/.test(program.koreaSchools)) return program.koreaSchools;
  if (explicit && explicit !== "资料待核对" && items.length === 1) return program.koreaSchools;
  if ((explicit && explicit !== "资料待核对") || /名校|多所/.test(program.koreaSchools)) {
    return `韩国名校 ${items.length || "多"}所`;
  }
  if (program.koreaPartners?.length) {
    return program.koreaPartners.map((item) => item.displayName || item.raw || item.displayLabel).filter(Boolean).join("、");
  }
  return program.koreaSchools;
}

function MetricTile({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-lg border border-ink/15 bg-[#fffaf0] px-3 py-2">
      <p className="text-[0.68rem] font-black text-muted">{metric.label}</p>
      <p className="mt-1 text-[1.02rem] font-black leading-tight text-ink">{metric.value}</p>
      {metric.detail ? <p className="mt-1 text-[0.68rem] font-bold text-muted">{metric.detail}</p> : null}
    </div>
  );
}

function ApplicationProgramCard({
  expanded,
  onPartnerOpen,
  onToggle,
  partnerLookup,
  program
}: {
  expanded: boolean;
  onPartnerOpen: (partner: ApplicationPartner) => void;
  onToggle: () => void;
  partnerLookup: ApplicationPartner[];
  program: ApplicationProgram;
}) {
  const partner = program.koreaPartners?.find((item) => item.campusImage);
  const imageSrc = publicApplicationAssetPath(partner?.campusImage);
  const partnerName = applicationPartnerName(partner);
  const partnerNames = applicationPartnerHeader(program);
  const partnerList = applicationPartnerList(program);
  const shouldShowPartnerList = partnerList.length > 1 || Boolean(program.fields["合作院校"]) || /名校|多所/.test(program.koreaSchools);

  return (
    <article className="w-full max-w-full overflow-hidden rounded-xl border border-ink bg-surface p-3 shadow-[0_6px_18px_rgba(10,10,10,0.06)]" data-testid="application-program-card">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <h3>
            <button
              aria-expanded={expanded}
              className="inline-flex max-w-full items-center gap-1 break-words text-left text-[1.05rem] font-black leading-tight text-ink"
              type="button"
              onClick={onToggle}
            >
              {program.chinaSchool}
              <ChevronRight className={`shrink-0 transition ${expanded ? "rotate-90" : ""}`} size={15} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </h3>
          <p className="mt-1 break-words text-[0.78rem] font-semibold leading-5 text-muted">合作：{partnerNames}</p>
        </div>
        <div className="flex shrink-0 items-start gap-2" data-testid="application-program-card-meta">
          <span className="mt-1 max-w-[4.1rem] truncate text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#0b6a4a]" data-testid="application-program-card-region">
            {program.region}
          </span>
          <span className="max-w-[4.9rem] shrink-0 rounded-full border border-ink bg-[#ffe07a] px-2 py-1 text-center text-[0.72rem] font-black leading-tight">{program.mode}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {program.majorTags.slice(0, 4).map((tag) => (
          <span className="max-w-full rounded-full border border-[#9fd5ee] bg-[#eaf7ff] px-2 py-1 text-[0.68rem] font-black leading-tight" key={tag}>
            {tag}
          </span>
        ))}
      </div>

      {expanded ? (
        <div className="mt-3 grid gap-3 border-t border-ink/10 pt-3">
          <dl className="grid gap-2">
            {[
              ["专业设置", summarizeApplicationFact("专业设置", program.fields["专业设置"])],
              ["培养模式", summarizeApplicationFact("培养模式", program.modeTitle || program.mode)],
              ["国内费用", summarizeApplicationFact("国内费用", program.fields["国内费用"])],
              ["韩方费用", summarizeApplicationFact("韩方费用", program.fields["韩方费用"])]
            ].map(([label, value]) => (
              <div className="min-w-0 rounded-lg border border-ink/15 bg-[#fffaf0] p-2.5" key={label}>
                <dt className="text-xs font-black text-muted">{label}</dt>
                <dd className="mt-1 break-words text-[0.78rem] font-semibold leading-5 text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          {shouldShowPartnerList ? (
            <div className="rounded-lg border border-ink/15 bg-paper p-3" data-testid="application-partner-list-card">
              <p className="text-xs font-black text-muted">合作院校</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {partnerList.map((name) => {
                  const listedPartner = applicationPartnerForName(name, program.koreaPartners, partnerLookup) || applicationPartnerFallback(name);
                  const chipClassName =
                    "inline-flex min-h-0 max-w-full items-center justify-center whitespace-nowrap rounded-full border border-[#b7d8a8] bg-[#eff8e6] px-2 py-1 text-[0.68rem] font-black leading-tight text-ink";
                  return (
                    <button
                      aria-label={`打开${name}学校信息`}
                      className={`${chipClassName} transition hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0a000]`}
                      key={`${program.slug}-${name}`}
                      type="button"
                      onClick={() => onPartnerOpen(listedPartner)}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {imageSrc && partner ? (
            <div className="relative h-36 w-full overflow-hidden rounded-lg border border-ink/20 bg-paper" data-testid="application-campus-photo">
              <Image
                alt={`${partnerName}校园图片`}
                className="h-full w-full object-cover"
                height={256}
                src={imageSrc}
                style={{ objectFit: "cover", objectPosition: partner.imagePosition || "center", width: "100%" }}
                width={420}
              />
              <div className="absolute inset-x-0 bottom-0 border-t border-[#f8f8f5]/15 bg-[rgba(10,10,10,0.48)] px-3 py-1 text-[#f8f8f5]" data-testid="application-campus-caption">
                <button
                  aria-label={`${[partnerName, partner.city, partner.tier, "学校信息"].filter(Boolean).join(" ")}`}
                  className="flex min-h-[30px] w-full min-w-0 items-center justify-between gap-2 text-left leading-none"
                  type="button"
                  onClick={() => onPartnerOpen(partner)}
                >
                  <span className="min-w-0 truncate text-[0.8rem] font-black leading-none">
                    {partnerName}
                    {partner.city ? <span className="font-bold text-[#f8f8f5]/85"> · {partner.city}</span> : null}
                  </span>
                  {partner.tier ? (
                    <span className="shrink-0 rounded-full border border-[#f8f8f5]/80 bg-[#ffe07a] px-2 py-0.5 text-[0.68rem] font-black leading-none text-ink">
                      {partner.tier}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
          ) : null}
          <div className="grid gap-2">
            {[
              ["申请条件", summarizeApplicationFact("申请条件", program.fields["申请条件"])],
              ["证书说明", summarizeApplicationFact("证书说明", program.fields["证书说明"])]
            ].map(([label, value]) => (
              <div className="rounded-lg border border-ink/15 bg-paper p-3" key={label}>
                <p className="text-xs font-black text-muted">{label}</p>
                <p className="mt-1 break-words text-[0.79rem] font-semibold leading-[1.25rem] text-ink">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(program.sources || []).slice(0, 2).map((source) => (
              <a
                className="max-w-full rounded-full border border-ink bg-surface px-3 py-1.5 text-xs font-black text-ink"
                href={source.url}
                key={`${program.slug}-${source.id}`}
                rel="noreferrer"
                target="_blank"
              >
                来源 {source.id}
              </a>
            ))}
          </div>
          <p className="rounded-lg border border-ink/15 bg-[#fffaf0] p-3 text-[0.7rem] font-medium leading-5 text-muted">
            以上来自公开信息整理，申请前仍要核对学校最新简章和项目合同。
          </p>
        </div>
      ) : null}
    </article>
  );
}

function ApplicationPartnerDialog({ onClose, partner }: { onClose: () => void; partner: ApplicationPartner }) {
  const name = applicationPartnerName(partner);
  const meta = [partner.tier, partner.city, partner.type].filter(Boolean);
  const campusSrc = publicApplicationAssetPath(partner.campusImage);
  const logoSrc = publicApplicationAssetPath(partner.logoImage);
  const alumni = universityAlumniText(partner.slug || "");

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 px-3 pb-3 pt-[10dvh] lg:landscape:hidden xl:hidden" onClick={onClose}>
      <section
        aria-label={`${name}学校信息`}
        aria-modal="true"
        className="mx-auto flex max-h-[86dvh] w-full max-w-[26rem] flex-col overflow-hidden rounded-t-2xl border border-ink bg-[#f5f3ed] shadow-[0_-18px_46px_rgba(10,10,10,0.24)]"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink/10 bg-surface px-4 py-3">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#0b6a4a]">大学库学校信息</p>
            <h2 className="mt-1 break-words text-2xl font-black leading-tight">{name}</h2>
            {partner.nameKr || partner.nameEn ? <p className="mt-1 break-words text-xs font-bold text-muted">{[partner.nameKr, partner.nameEn].filter(Boolean).join(" · ")}</p> : null}
          </div>
          <button
            aria-label="关闭学校信息"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink bg-paper text-ink"
            type="button"
            onClick={onClose}
          >
            <X size={17} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-3 overflow-y-auto px-4 py-4">
          {campusSrc ? (
            <Image
              alt={`${name}校园图片`}
              className="h-40 w-full rounded-xl border border-ink bg-surface object-cover"
              height={256}
              src={campusSrc}
              style={{ objectPosition: partner.imagePosition || "center" }}
              width={420}
            />
          ) : null}

          <div className="flex flex-wrap gap-2">
            {meta.map((item) => (
              <span className="rounded-full border border-ink bg-surface px-3 py-1 text-xs font-black" key={item}>
                {item}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MetricTile metric={{ label: "学生数", value: partner.totalStudents || "资料待补" }} />
            <MetricTile metric={{ label: "外国学生", value: partner.foreignStudents || "资料待补" }} />
            <MetricTile metric={{ label: "成立时间", value: partner.founded || "资料待补" }} />
            <MetricTile metric={{ label: "参考层级", value: partner.tier || "资料待补" }} />
          </div>

          {partner.focus || partner.intro || alumni ? (
            <section className="rounded-xl border border-ink/15 bg-surface p-3">
              {partner.focus ? (
                <div className="flex items-start justify-between gap-3">
                  <h3 className="shrink-0 text-sm font-black">重点方向</h3>
                  <p className="min-w-0 flex-1 text-right text-[0.78rem] font-semibold leading-5 text-muted">{partner.focus}</p>
                </div>
              ) : null}
              <div className="mt-3 border-t border-ink/10 pt-3">
                <h3 className="text-sm font-black">校友名单</h3>
                <p className="mt-2 border-t border-ink/20 pt-2 text-[0.78rem] font-normal leading-5 text-muted">{alumni}</p>
              </div>
              {partner.intro ? <p className="mt-3 border-t border-ink/10 pt-3 text-[0.78rem] font-medium leading-6 text-muted">{partner.intro}</p> : null}
            </section>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <a className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ink bg-[#ffe07a] px-3 text-sm font-black text-ink" href={routePath("/universities")}>
              打开大学库
            </a>
            {partner.officialUrl ? (
              <a
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ink bg-[#fff4bd] px-3 text-sm font-black text-ink"
                href={partner.officialUrl}
                rel="noreferrer"
                target="_blank"
              >
                学校官网
              </a>
            ) : logoSrc ? (
              <span className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ink bg-surface px-3 text-sm font-black text-ink">学校资料</span>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function ApplicationFilterSheet({
  majorFilter,
  majorOptions,
  modeFilter,
  modeOptions,
  onClose,
  onReset,
  regionFilter,
  regionOptions,
  resultCount,
  setMajorFilter,
  setModeFilter,
  setRegionFilter
}: {
  majorFilter: string;
  majorOptions: string[];
  modeFilter: string;
  modeOptions: string[];
  onClose: () => void;
  onReset: () => void;
  regionFilter: string;
  regionOptions: string[];
  resultCount: number;
  setMajorFilter: (value: string) => void;
  setModeFilter: (value: string) => void;
  setRegionFilter: (value: string) => void;
}) {
  const groups = [
    ["地区", regionOptions, regionFilter, setRegionFilter],
    ["模式", modeOptions, modeFilter, setModeFilter],
    ["专业", majorOptions, majorFilter, setMajorFilter]
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-ink/35 px-3 pb-3 pt-[12dvh] lg:landscape:hidden xl:hidden" onClick={onClose}>
      <section
        aria-label="项目筛选"
        aria-modal="true"
        className="mx-auto flex max-h-[82dvh] w-full max-w-[26rem] flex-col overflow-hidden rounded-t-2xl border border-ink bg-[#f5f3ed] shadow-[0_-18px_46px_rgba(10,10,10,0.22)]"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink/10 bg-surface px-4 py-3">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#0b6a4a]">Project filters</p>
            <h2 className="mt-1 text-2xl font-black leading-tight">项目筛选</h2>
          </div>
          <button className="rounded-full border border-ink bg-paper px-3 py-1.5 text-xs font-black" type="button" onClick={onReset}>
            重置
          </button>
        </div>

        <div className="grid gap-4 overflow-y-auto px-4 py-4">
          {groups.map(([label, options, current, setter]) => (
            <section key={label}>
              <h3 className="text-sm font-black leading-tight">{label}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {options.map((option) => (
                  <button
                    aria-pressed={current === option}
                    className={`min-h-9 rounded-full border border-ink px-3 text-xs font-black leading-tight ${
                      current === option ? "bg-[#b8a4ed]" : "bg-surface"
                    }`}
                    key={`${label}-${option}`}
                    type="button"
                    onClick={() => setter(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="border-t border-ink/10 bg-surface p-3">
          <button className="min-h-11 w-full rounded-xl border border-ink bg-[#71d39b] px-3 text-sm font-black" type="button" onClick={onClose}>
            查看{resultCount}个项目
          </button>
        </div>
      </section>
    </div>
  );
}

function MobileApplicationProjects({ initialPrograms }: { initialPrograms?: ApplicationProgram[] }) {
  const programs = initialPrograms?.length ? initialPrograms : fallbackApplicationPrograms;
  const [regionFilter, setRegionFilter] = useState("全部");
  const [modeFilter, setModeFilter] = useState("全部");
  const [majorFilter, setMajorFilter] = useState("全部");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [expandedProgramKey, setExpandedProgramKey] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<ApplicationPartnerSelection | null>(null);
  const partnerLookup = useMemo(
    () => [...globalApplicationPartners, ...programs.flatMap((program) => program.koreaPartners || [])],
    [programs]
  );
  const mobileUniversities = useMemo(() => buildMobileUniversities(), []);
  const mobileUniversityBySlug = useMemo(() => new Map(mobileUniversities.map((school) => [school.slug, school])), [mobileUniversities]);
  const mobileUniversityByName = useMemo(() => {
    const schoolsByName = new Map<string, ApplicationMobileUniversity>();
    for (const school of mobileUniversities) {
      for (const name of [school.nameCn, school.nameKr, school.nameEn]) {
        const normalized = normalizeApplicationPartnerName(name);
        if (normalized) schoolsByName.set(normalized, school);
      }
    }
    return schoolsByName;
  }, [mobileUniversities]);

  const regionOptions = useMemo(() => ["全部", ...Array.from(new Set(programs.map((program) => program.region).filter(Boolean)))], [programs]);
  const modeOptions = useMemo(() => ["全部", ...Array.from(new Set(programs.map((program) => program.mode).filter(Boolean)))], [programs]);
  const majorOptions = useMemo(
    () => ["全部", ...Array.from(new Set(programs.flatMap((program) => program.majorTags))).filter(Boolean).slice(0, 10)],
    [programs]
  );

  const filteredPrograms = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return programs.filter((program) => {
      if (regionFilter !== "全部" && program.region !== regionFilter) return false;
      if (modeFilter !== "全部" && program.mode !== modeFilter) return false;
      if (majorFilter !== "全部" && !program.majorTags.includes(majorFilter)) return false;
      if (!keyword) return true;
      const haystack = [
        program.chinaSchool,
        program.koreaSchools,
        program.mode,
        program.region,
        program.section,
        program.majorTags.join(" "),
        Object.values(program.fields).join(" ")
      ].join(" ").toLowerCase();
      return haystack.includes(keyword);
    });
  }, [majorFilter, modeFilter, programs, query, regionFilter]);

  const shownPrograms = filteredPrograms.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(6);
    setExpandedProgramKey((current) => (current && filteredPrograms.some((program) => applicationProgramInstanceKey(program) === current) ? current : null));
  }, [filteredPrograms]);

  useEffect(() => {
    if (!selectedPartner) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPartner(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedPartner]);

  const resetApplicationFilters = () => {
    setRegionFilter("全部");
    setModeFilter("全部");
    setMajorFilter("全部");
  };

  const openApplicationPartner = (partner: ApplicationPartner) => {
    const enrichedPartner = applicationPartnerForName(applicationPartnerName(partner), [partner], partnerLookup) || partner;
    setSelectedPartner({ partner: enrichedPartner, mode: "info" });
  };

  const selectedUniversity = selectedPartner
    ? applicationUniversityForPartner(selectedPartner.partner, mobileUniversityBySlug, mobileUniversityByName)
    : undefined;
  const filterSummary = [regionFilter, modeFilter, majorFilter].filter((item) => item !== "全部").join(" · ") || "全部项目";

  return (
    <section className="w-full max-w-full overflow-hidden" aria-label="国内+韩国项目库" data-testid="mobile-application-projects">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#0b6a4a]">Project database</p>
          <h2 className="mt-1 text-lg font-black leading-tight">国内+韩国项目库</h2>
        </div>
        <span className="shrink-0 rounded-full border border-ink bg-[#a4d4c5] px-3 py-1 text-xs font-black">
          {programs.length}项
        </span>
      </div>

      <label className="mt-4 flex min-h-11 items-center gap-2 rounded-xl border border-ink bg-paper px-3">
        <SearchCheck size={17} strokeWidth={2.4} aria-hidden="true" />
        <input
          aria-label="项目搜索"
          className="min-w-0 flex-1 bg-transparent text-sm font-black outline-none placeholder:text-muted"
          placeholder="搜索学校 / 专业 / 城市"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <button
        className="mt-3 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-ink bg-surface px-3 text-left"
        type="button"
        onClick={() => setIsFilterSheetOpen(true)}
      >
        <span className="inline-flex items-center gap-2 text-sm font-black">
          <ClipboardList size={17} strokeWidth={2.4} aria-hidden="true" />
          筛选项目
        </span>
        <span className="min-w-0 truncate text-xs font-bold text-muted">{filterSummary}</span>
      </button>

      <div className="mt-3 border-t border-ink/10 pt-3">
        <p className="text-2xl font-black leading-none">{filteredPrograms.length}个项目</p>
      </div>

      <div className="mt-3 grid gap-3">
        {shownPrograms.map((program) => {
          const programKey = applicationProgramInstanceKey(program);
          return (
            <ApplicationProgramCard
              expanded={expandedProgramKey === programKey}
              key={programKey}
              partnerLookup={partnerLookup}
              program={program}
              onPartnerOpen={openApplicationPartner}
              onToggle={() => setExpandedProgramKey((current) => (current === programKey ? null : programKey))}
            />
          );
        })}
      </div>

      {filteredPrograms.length > visibleCount ? (
        <button
          className="mt-3 min-h-11 w-full rounded-xl border border-ink bg-paper px-3 text-sm font-black"
          type="button"
          onClick={() => setVisibleCount((current) => current + 6)}
        >
          查看更多项目
        </button>
      ) : null}

      {isFilterSheetOpen ? (
        <ApplicationFilterSheet
          majorFilter={majorFilter}
          majorOptions={majorOptions}
          modeFilter={modeFilter}
          modeOptions={modeOptions}
          regionFilter={regionFilter}
          regionOptions={regionOptions}
          resultCount={filteredPrograms.length}
          setMajorFilter={setMajorFilter}
          setModeFilter={setModeFilter}
          setRegionFilter={setRegionFilter}
          onClose={() => setIsFilterSheetOpen(false)}
          onReset={resetApplicationFilters}
        />
      ) : null}
      {selectedPartner ? (
        selectedUniversity ? (
          <UniversitySheet
            ariaLabel={`${selectedUniversity.nameCn}学校信息`}
            closeLabel="关闭学校信息"
            mode={selectedPartner.mode}
            school={selectedUniversity}
            onClose={() => setSelectedPartner(null)}
            onShowCases={() => setSelectedPartner((current) => (current ? { ...current, mode: "case" } : current))}
          />
        ) : (
          <ApplicationPartnerDialog partner={selectedPartner.partner} onClose={() => setSelectedPartner(null)} />
        )
      ) : null}
    </section>
  );
}

function ExchangeCalculator() {
  const [cny, setCny] = useState("1");
  const [krw, setKrw] = useState("1000");
  const [rate, setRate] = useState(String(todayCnyToKrwRate));
  const result = useMemo(() => {
    const cnyValue = Number(cny);
    const rateValue = Number(rate);
    if (!Number.isFinite(cnyValue) || !Number.isFinite(rateValue)) return 0;
    return Math.round(cnyValue * rateValue);
  }, [cny, rate]);
  const reverseResult = useMemo(() => {
    const krwValue = Number(krw);
    const rateValue = Number(rate);
    if (!Number.isFinite(krwValue) || !Number.isFinite(rateValue) || rateValue === 0) return 0;
    return krwValue / rateValue;
  }, [krw, rate]);

  return (
    <section className="rounded-xl border border-ink bg-surface p-4 shadow-[0_8px_24px_rgba(10,10,10,0.07)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black leading-tight">快速换算</h2>
        <Calculator size={21} strokeWidth={2.4} aria-hidden="true" />
      </div>
      <p className="mt-2 text-sm font-bold text-muted">按当天银行牌价改汇率</p>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <label className="grid gap-1 text-xs font-black">
          人民币金额
          <input
            aria-label="人民币金额"
            className="h-11 min-w-0 rounded-lg border border-ink bg-paper px-3 text-base font-black"
            inputMode="decimal"
            value={cny}
            onChange={(event) => setCny(event.target.value)}
          />
        </label>
        <span className="pb-3 text-sm font-black">×</span>
        <label className="grid gap-1 text-xs font-black">
          韩元/人民币
          <input
            aria-label="韩元人民币汇率"
            className="h-11 min-w-0 rounded-lg border border-ink bg-paper px-3 text-base font-black"
            inputMode="decimal"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
          />
        </label>
      </div>
      <div className="mt-3 rounded-lg border border-ink bg-[#ffe07a] px-3 py-2 text-center text-[0.95rem] font-black leading-6">约 {result.toLocaleString("zh-CN")} 韩元</div>
      <div className="mt-3 border-t border-[#0b6a4a]/30 pt-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <label className="grid gap-1 text-xs font-black">
            韩元金额
            <input
              aria-label="韩元金额"
              className="h-11 min-w-0 rounded-lg border border-ink bg-paper px-3 text-base font-black"
              inputMode="decimal"
              value={krw}
              onChange={(event) => setKrw(event.target.value)}
            />
          </label>
          <span className="pb-3 text-sm font-black">÷</span>
          <label className="grid gap-1 text-xs font-black">
            韩元/人民币
            <input
              aria-label="反向韩元人民币汇率"
              className="h-11 min-w-0 rounded-lg border border-ink bg-paper px-3 text-base font-black"
              inputMode="decimal"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </label>
        </div>
        <div className="mt-3 rounded-lg border border-ink bg-[#e8f7d9] px-3 py-2 text-center text-[0.95rem] font-black leading-6">
          约 {reverseResult.toLocaleString("zh-CN", { maximumFractionDigits: 2 })} 人民币
        </div>
      </div>
    </section>
  );
}

function ExchangeLifeCostGuide() {
  return (
    <section className="mt-4 rounded-xl border border-ink bg-surface p-4 shadow-[0_8px_24px_rgba(10,10,10,0.07)]">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#0b6a4a]">Korea Daily Money</p>
      <h2 className="mt-1 text-xl font-black leading-tight">韩国日常价格感</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-muted">按今日参考汇率折算，帮助先建立预算感觉，实际以现场价格为准。</p>
      <div className="mt-3 grid gap-3">
        {exchangeLivingCostGroups.map((group) => (
          <div className="rounded-lg border border-ink/15 bg-[#fffaf0] p-3" key={group.title}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-black leading-tight">{group.title}</h3>
              <span className="rounded-full border border-ink bg-[#e8f7d9] px-2.5 py-1 text-[0.68rem] font-black">参考</span>
            </div>
            <div className="mt-2 grid gap-2">
              {group.items.map((item) => (
                <div className="grid grid-cols-[1fr_auto] gap-3 border-t border-ink/10 pt-2" key={item.label}>
                  <div>
                    <p className="text-sm font-black leading-5">{item.label}</p>
                    <p className="mt-0.5 text-[0.72rem] font-medium leading-4 text-muted">{item.note}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black leading-5">{formatLivingCostKrw(item.krw)}</p>
                    <p className="mt-0.5 text-[0.72rem] font-bold leading-4 text-[#0b6a4a]">{formatLivingCostCny(item.krw)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[0.72rem] font-medium leading-5 text-muted">餐饮、演出和打车价格会因城市、商圈、时段变化；大额换汇和缴费前再核对银行/支付平台汇率。</p>
    </section>
  );
}

function SelfAgencyProfileCard() {
  return (
    <section
      className={`mt-4 ${mobileCardSurfaceClass("warm")}`}
      data-testid="mobile-self-agency-profile-card"
    >
      <p className={mobileCardEyebrowClass}>Profile</p>
      <h2 className="mt-1 text-[0.98rem] font-black leading-tight">留韩学生画像</h2>
      <div className="mt-2 grid gap-1.5">
        {mobileSelfAgencyProfile.map((item) => (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-ink/15 pt-2" key={item.label}>
            <div className="min-w-0">
              <p className="text-[0.84rem] font-black leading-5">{item.title}</p>
              <p className="mt-0.5 text-[0.72rem] font-medium leading-4 text-muted">{item.detail}</p>
            </div>
            <p className="self-center max-w-[6.6rem] text-right text-[0.84rem] font-black leading-5 text-[#0b6a4a]">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ApplicationChannelGuide() {
  return (
    <section className="mt-4 grid gap-3" aria-label="直申与中介申请判断">
      <section
        className={mobileCardSurfaceClass("warm")}
        data-testid="mobile-apply-channel-card"
      >
        <p className={mobileCardEyebrowClass}>Apply Channel</p>
        <h2 className="mt-1 text-[0.98rem] font-black leading-tight">三大核心申请渠道</h2>
        <div className="mt-2 grid gap-1.5">
          {mobileApplicationChannels.map((channel) => (
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-ink/15 pt-2" key={channel.title}>
              <div className="min-w-0">
                <p className="text-[0.84rem] font-black leading-5">{channel.title}</p>
                <p className="mt-0.5 text-[0.72rem] font-medium leading-4 text-muted">{channel.detail}</p>
              </div>
              <p className="self-center max-w-[6.6rem] text-right text-[0.84rem] font-black leading-5 text-[#0b6a4a]">{channel.tag}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={mobileCardSurfaceClass("white")} data-testid="mobile-diy-agency-card">
        <p className={mobileCardEyebrowClass}>DIY vs Agency</p>
        <h2 className="mt-1 text-[0.98rem] font-black leading-tight">直申 vs 中介申请</h2>
        <div className="mt-2 grid gap-1.5">
          {mobileSelfAgencyCompare.map((item) => (
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-ink/15 pt-2" key={item.label}>
              <div className="min-w-0">
                <p className="text-[0.84rem] font-black leading-5">{item.label}</p>
                <p className="mt-0.5 text-[0.72rem] font-medium leading-4 text-muted">{item.detail}</p>
              </div>
              <p className="self-center max-w-[6.6rem] text-right text-[0.84rem] font-black leading-5 text-[#0b6a4a]">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function MobileReferenceSections({
  ariaLabel,
  firstTone = "warm",
  sections
}: {
  ariaLabel: string;
  firstTone?: MobileCardSurfaceTone;
  sections: MobileReferenceSection[];
}) {
  return (
    <section className="mt-4 grid gap-3" aria-label={ariaLabel}>
      {sections.map((section, index) => (
        <section
          className={mobileCardSurfaceClass(alternatingMobileCardSurface(index, firstTone))}
          data-testid="mobile-reference-card"
          key={section.title}
        >
          <p className={mobileCardEyebrowClass}>{section.eyebrow}</p>
          <h2 className="mt-1 text-[0.98rem] font-black leading-tight">{section.title}</h2>
          {section.copy ? <p className="mt-2 text-xs font-medium leading-5 text-muted">{section.copy}</p> : null}
          <div className="mt-2 grid gap-1.5">
            {section.items.map((item) => (
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-ink/15 pt-2" key={item.label}>
                <div className="min-w-0">
                  <p className="text-[0.84rem] font-black leading-5">
                    {item.label}
                    {item.labelAccent ? <span className="ml-1 text-[#8b1e1e]">{item.labelAccent}</span> : null}
                  </p>
                  <p className="mt-0.5 text-[0.72rem] font-medium leading-4 text-muted">{item.detail}</p>
                </div>
                <p className="self-center max-w-[6.6rem] text-right text-[0.84rem] font-black leading-5 text-[#0b6a4a]">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}

function mobileTopikExamCellClass(row: MobileTopikExamRow, cellIndex: number, rowIndex: number, rowCount: number) {
  const rightBorder = cellIndex === 3 ? "" : "border-r border-ink";
  const bottomBorder = rowIndex === rowCount - 1 ? "" : "border-b border-ink";
  const tone = row.isTotal
    ? "bg-[#f1f1ee] font-black"
    : cellIndex === 1
      ? "bg-[#fff3b8] font-semibold"
      : cellIndex === 3
        ? "bg-[#d5eddf] font-semibold"
        : "bg-[#fffefb] font-semibold";

  return `flex min-h-10 items-center justify-center px-1.5 py-2 text-center text-[0.72rem] leading-tight ${tone} ${rightBorder} ${bottomBorder}`;
}

function MobileTopikExamSystem() {
  const headers = ["科目", "时间", "题数", "分值"];

  return (
    <section
      className={`mt-4 ${mobileCardSurfaceClass("warm")}`}
      data-testid="mobile-topik-exam-system"
    >
      <p className="text-[0.66rem] font-black uppercase tracking-[0.08em] text-[#687365]">Exam System</p>
      <h2 className="mt-1 text-[0.98rem] font-black leading-tight">考试系统地图</h2>
      <div className="mt-3 grid gap-3">
        {mobileTopikExamSystems.map((system) => (
          <article className="rounded-lg border border-ink/15 bg-[#fffaf0] p-3" key={system.pill}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="min-w-0 text-[0.94rem] font-black leading-tight">{system.title}</h3>
              <span className="shrink-0 rounded-full border border-ink bg-[#f1f1ee] px-2 py-1 text-[0.68rem] font-black leading-none">
                {system.pill}
              </span>
            </div>
            <div className="mt-3 overflow-hidden rounded-md border border-ink">
              <div className="grid grid-cols-[0.82fr_1fr_0.9fr_0.9fr]">
                {headers.map((header, index) => (
                  <div
                    className={`flex min-h-10 items-center justify-center border-b border-ink bg-[#f1f1ee] px-1.5 py-2 text-center text-[0.72rem] font-black leading-tight ${
                      index === headers.length - 1 ? "" : "border-r border-ink"
                    }`}
                    key={`${system.pill}-${header}`}
                  >
                    {header}
                  </div>
                ))}
                {system.rows.flatMap((row, rowIndex) =>
                  [row.subject, row.time, row.count, row.score].map((value, cellIndex) => (
                    <div
                      className={mobileTopikExamCellClass(row, cellIndex, rowIndex, system.rows.length)}
                      key={`${system.pill}-${row.subject}-${cellIndex}`}
                    >
                      {value}
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobileTopikScoreLevels() {
  return (
    <section
      className="mt-4 rounded-lg border border-ink/25 bg-[#fbfaf4] px-4 py-3 shadow-none"
      data-testid="mobile-topik-score-levels"
    >
      <p className={mobileCardEyebrowClass}>Score Levels</p>
      <h2 className="mt-1 text-[0.98rem] font-black leading-tight">分数怎么变成等级</h2>
      <div className="mt-3 grid gap-3">
        {mobileTopikScoreScales.map((scale) => (
          <article className="rounded-lg border border-ink/15 bg-[#fffaf0] p-3" key={scale.title}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[0.94rem] font-black leading-none">{scale.title}</h3>
              <span className="shrink-0 rounded-full border border-ink bg-[#f1f1ee] px-2 py-1 text-[0.68rem] font-black leading-none">
                {scale.total}
              </span>
            </div>
            <div
              className="mt-3 grid overflow-hidden rounded-md border border-ink"
              style={{ gridTemplateColumns: scale.columns }}
            >
              {scale.segments.map((segment, index) => (
                <div
                  className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-center leading-tight ${segment.toneClass} ${
                    index === scale.segments.length - 1 ? "" : "border-r border-ink"
                  }`}
                  key={`${scale.title}-${segment.level}`}
                >
                  <span className="text-[0.76rem] font-black">{segment.level}</span>
                  <span className="text-[0.64rem] font-medium text-ink">{segment.range}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobileTopikResources() {
  const headers = ["课程", "图片", "费用", "核心内容"];

  return (
    <section
      className={`mt-4 ${mobileCardSurfaceClass("white")}`}
      data-testid="mobile-topik-resources"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={mobileCardEyebrowClass}>Resources</p>
          <h2 className="mt-1 text-[0.98rem] font-black leading-tight">网课与教材资源</h2>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <span className="rounded-full border border-ink bg-[#d8f3e7] px-2 py-1 text-[0.66rem] font-black leading-none text-[#0b6a4a]">免费</span>
          <span className="rounded-full border border-ink bg-[#fff3b8] px-2 py-1 text-[0.66rem] font-black leading-none text-[#7a5a00]">付费</span>
          <span className="rounded-full border border-ink bg-[#f5cad3] px-2 py-1 text-[0.66rem] font-black leading-none text-[#7b2235]">教材</span>
        </div>
      </div>
      <p className="mt-2 text-[0.72rem] font-medium leading-5 text-muted">完整资源表，已压缩到移动端宽度内</p>
      <div className="mt-3 overflow-hidden rounded-md border border-ink bg-[#fffaf0]">
        <div className="grid w-full grid-cols-[1.24fr_2.4rem_0.46fr_1.45fr]">
          {headers.map((header, index) => (
            <div
              className={`flex min-h-[2.5rem] items-center border-b border-ink bg-[#f5cad3] px-1 py-2 text-[0.68rem] font-black leading-tight ${
                index === headers.length - 1 ? "" : "border-r border-ink"
              }`}
              key={header}
            >
              {header}
            </div>
          ))}
        </div>
        {mobileTopikResourceSections.map((section) => (
          <div key={section.title}>
            <div className="border-b border-ink bg-[#f1f1ee] px-2 py-2 text-[0.78rem] font-black leading-tight">
              {section.title}
            </div>
            {section.rows.map((resource) => (
              <div
                className="grid min-h-[3rem] w-full grid-cols-[1.24fr_2.4rem_0.46fr_1.45fr] border-b border-ink last:border-b-0"
                data-testid="mobile-topik-resource-row"
                key={`${section.title}-${resource.course}`}
              >
                <div className="min-w-0 border-r border-ink px-1 py-2.5 text-[0.7rem] font-semibold leading-[1.35]">
                  <span className="block break-words font-black">{resource.course}</span>
                  <span className="mt-1 block break-words text-[0.6rem] font-semibold leading-[1.3] text-muted">{resource.provider}</span>
                </div>
                <div className="flex min-w-0 items-center justify-center border-r border-ink px-1 py-2.5">
                  <a
                    aria-label={resource.course}
                    className="relative block size-8 overflow-hidden border border-ink/40 bg-white transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0b6a4a]"
                    href={resource.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Image
                      alt={resource.imageAlt}
                      className="object-contain"
                      fill
                      sizes="32px"
                      src={assetPath(resource.imageSrc)}
                    />
                  </a>
                </div>
                <div className="flex min-w-0 items-start border-r border-ink px-1 py-2.5 text-[0.64rem] font-black leading-tight text-[#0b6a4a]">
                  <span className="break-words">{resource.cost}</span>
                </div>
                <div className="min-w-0 px-1 py-2.5 text-[0.68rem] font-semibold leading-[1.25] text-ink">
                  <span className="break-words">{resource.core}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function BudgetResultTile({ label, item }: { label: string; item: { rmb: string; krw: string; rule: string } }) {
  return (
    <div className="rounded-lg border border-ink/15 bg-[#fffaf0] p-3">
      <p className="text-xs font-black text-muted">{label}</p>
      <div className="mt-1 flex flex-wrap items-end gap-2" data-testid="budget-result-amount-row">
        <p className="text-lg font-black leading-tight text-ink">{item.rmb}</p>
        <p className="mb-0.5 min-w-[5.9rem] rounded bg-[#f7fbf3] px-1.5 py-0.5 text-center text-[0.68rem] font-black leading-none text-[#25443a] shadow-[inset_0_0_0_1px_rgba(0,98,65,0.16)]" data-testid="budget-result-krw">
          {item.krw}
        </p>
      </div>
      <p className="mt-2 text-[0.7rem] font-medium leading-4 text-muted">{item.rule}</p>
    </div>
  );
}

function BudgetEstimator() {
  const [formState, setFormState] = useState<BudgetFormState>(defaultBudgetForm);
  const [status, setStatus] = useState<"idle" | "loading" | "result">("idle");
  const [estimate, setEstimate] = useState<BudgetEstimate | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const updateField = <K extends keyof BudgetFormState>(field: K, value: BudgetFormState[K]) => {
    clearTimer();
    setStatus("idle");
    setEstimate(null);
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const runEstimate = () => {
    clearTimer();
    setStatus("loading");
    setEstimate(null);
    timerRef.current = setTimeout(() => {
      setEstimate(calculateBudgetEstimate(formState));
      setStatus("result");
      timerRef.current = null;
    }, 1500);
  };

  const resetEstimate = () => {
    clearTimer();
    setFormState(defaultBudgetForm);
    setStatus("idle");
    setEstimate(null);
  };

  return (
    <section
      className="rounded-[1.1rem] border-2 border-[#0b6a4a] bg-[#f4fbef] p-5 shadow-[0_14px_36px_rgba(11,106,74,0.16)] ring-1 ring-[#0b6a4a]/10"
      aria-label="韩国留学费用估算"
      data-testid="mobile-primary-tool-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#0b6a4a]">AI budget</p>
          <h2 className="mt-1 text-xl font-black leading-tight">韩国留学费用估算</h2>
          <p className="mt-1 text-xs font-medium leading-5 text-muted">按城市、学校、专业、住宿等估算。</p>
        </div>
        <a
          href={routePath("/exchange-rate")}
          aria-label="汇率参考"
          className="relative mt-3 flex w-16 shrink-0 flex-col items-center justify-center gap-0.5 overflow-visible rounded-lg transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b6a4a]"
          data-testid="mobile-budget-card-icon"
        >
          <Image
            src={assetPath("/mobile-mini-program/icon-exchange-budget-99.png")}
            alt="汇率换算图标"
            width={256}
            height={244}
            className="h-[3.8rem] w-[4rem] object-contain"
            priority={false}
          />
        </a>
      </div>

      <form
        className="mt-4 grid grid-cols-2 gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          runEstimate();
        }}
      >
        <label className="grid gap-1 text-[0.74rem] font-semibold text-ink">
          城市
          <select
            className="h-11 truncate rounded-lg border border-ink bg-paper px-2 text-[0.79rem] font-semibold"
            value={formState.city}
            onChange={(event) => updateField("city", event.target.value as BudgetCity)}
          >
            {budgetSelectOptions.city.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-[0.74rem] font-semibold text-ink">
          学校
          <select
            className="h-11 truncate rounded-lg border border-ink bg-paper px-2 text-[0.79rem] font-semibold"
            value={formState.school}
            onChange={(event) => updateField("school", event.target.value as BudgetSchool)}
          >
            {budgetSelectOptions.school.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-[0.74rem] font-semibold text-ink">
          专业
          <select
            className="h-11 truncate rounded-lg border border-ink bg-paper px-2 text-[0.79rem] font-semibold"
            value={formState.major}
            onChange={(event) => updateField("major", event.target.value as BudgetMajor)}
          >
            {budgetSelectOptions.major.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-[0.74rem] font-semibold text-ink">
          住宿
          <select
            className="h-11 rounded-lg border border-ink bg-paper px-2 text-[0.79rem] font-semibold"
            value={formState.housing}
            onChange={(event) => updateField("housing", event.target.value as BudgetHousing)}
          >
            {budgetSelectOptions.housing.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-[0.74rem] font-semibold text-ink">
          申请
          <select
            className="h-11 rounded-lg border border-ink bg-paper px-2 text-[0.79rem] font-semibold"
            value={formState.route}
            onChange={(event) => updateField("route", event.target.value as BudgetRoute)}
          >
            {budgetSelectOptions.route.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-[0.74rem] font-semibold text-ink">
          奖学金
          <select
            className="h-11 rounded-lg border border-ink bg-paper px-2 text-[0.79rem] font-semibold"
            value={formState.scholarship}
            onChange={(event) => updateField("scholarship", event.target.value)}
          >
            {budgetSelectOptions.scholarship.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <button
          className="min-h-11 rounded-lg border border-ink bg-[#d9ded5] px-3 text-[0.79rem] font-black"
          type="button"
          onClick={resetEstimate}
        >
          还原
        </button>
        <button
          className="min-h-11 rounded-lg bg-[#dff3dc] px-3 text-[0.79rem] font-black text-[#004c3f] shadow-[0_6px_14px_rgba(0,98,65,0.12)] disabled:opacity-60"
          disabled={status === "loading"}
          style={{ boxShadow: "inset 0 0 0 1px #006241, 0 6px 14px rgba(0, 98, 65, 0.12)" }}
          type="submit"
        >
          {status === "loading" ? "AI计算中" : "费用预估"}
        </button>
      </form>

      {status === "loading" ? (
        <div className="mt-4 rounded-xl border border-ink/20 bg-[#fffaf0] p-4" role="status">
          <p className="text-base font-black">AI正在分析留学费用</p>
          <p className="mt-1 text-xs font-medium leading-5 text-muted">正在匹配城市、学校类型、专业和申请方式，请稍等...</p>
        </div>
      ) : null}

      {status === "result" && estimate ? (
        <div className="mt-4 grid gap-3" aria-live="polite">
          <section
            className="rounded-xl bg-[#dff3dc] p-4"
            data-testid="budget-total-card"
            style={{ boxShadow: "inset 0 0 0 1px #006241, 0 10px 22px rgba(0, 98, 65, 0.14)" }}
          >
            <p className="text-xs font-black text-[#006241]">第一年总预算</p>
            <div className="mt-1 flex flex-wrap items-end gap-3" data-testid="budget-total-amount-row">
              <p className="text-3xl font-black leading-none text-[#004c3f]">{estimate.total.rmb}</p>
              <p className="mb-0.5 min-w-[8.8rem] rounded-md bg-[#f7fbf3] px-2 py-1 text-center text-xs font-black leading-none text-[#25443a] shadow-[inset_0_0_0_1px_rgba(0,98,65,0.16)]" data-testid="budget-total-krw">
                {estimate.total.krw}
              </p>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#25443a]">{estimate.context}</p>
          </section>
          <div className="grid grid-cols-2 gap-2">
            <BudgetResultTile label="大学学费" item={estimate.tuition} />
            <BudgetResultTile label="住宿+生活" item={estimate.monthly} />
            <div className="col-span-2">
              <BudgetResultTile label="出发前费用" item={estimate.setup} />
            </div>
          </div>
          <p className="rounded-lg border border-ink/15 bg-paper p-3 text-[0.72rem] font-medium leading-5 text-muted">
            预算为参考区间均值，请重新核对学校官网、宿舍通知、签证材料和银行实时汇率。
          </p>
        </div>
      ) : null}
    </section>
  );
}

function TopikAiPlanner() {
  const [formState, setFormState] = useState<TopikPlannerState>(defaultTopikPlanner);
  const [status, setStatus] = useState<"idle" | "loading" | "result">("idle");
  const [plan, setPlan] = useState<TopikPlan | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const updateField = <K extends keyof TopikPlannerState>(field: K, value: TopikPlannerState[K]) => {
    clearTimer();
    setStatus("idle");
    setPlan(null);
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const runPlanner = () => {
    clearTimer();
    setStatus("loading");
    setPlan(null);
    timerRef.current = setTimeout(() => {
      setPlan(calculateTopikPlan(formState));
      setStatus("result");
      timerRef.current = null;
    }, 1500);
  };

  const resetPlanner = () => {
    clearTimer();
    setFormState(defaultTopikPlanner);
    setStatus("idle");
    setPlan(null);
  };

  return (
    <section
      className="w-full max-w-full overflow-hidden rounded-[1.1rem] border-2 border-[#0b6a4a] bg-[#f4fbef] p-5 shadow-[0_14px_36px_rgba(11,106,74,0.16)] ring-1 ring-[#0b6a4a]/10"
      aria-label="AI TOPIK规划"
      data-testid="mobile-primary-tool-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#0b6a4a]">AI TOPIK</p>
          <h2 className="mt-1 text-xl font-black leading-tight">AI TOPIK 规划</h2>
          <p className="mt-1 text-xs font-medium leading-5 text-muted">按申请截止倒推准备窗，先判断目标是否现实。</p>
        </div>
        <BookOpen size={22} strokeWidth={2.4} aria-hidden="true" />
      </div>

      <form
        className="mt-4 grid min-w-0 grid-cols-2 gap-2 overflow-hidden"
        onSubmit={(event) => {
          event.preventDefault();
          runPlanner();
        }}
      >
        <label className="grid min-w-0 gap-1 text-[0.74rem] font-semibold text-ink">
          现在水平
          <select
            className="h-11 w-full min-w-0 max-w-full truncate rounded-lg border border-ink bg-paper px-2 text-[0.79rem] font-semibold"
            value={formState.current}
            onChange={(event) => updateField("current", event.target.value)}
          >
            <option value="0">0基础 / 刚学发音</option>
            <option value="1">TOPIK 1 附近</option>
            <option value="2">TOPIK 2 附近</option>
            <option value="3">TOPIK 3 附近</option>
            <option value="4">TOPIK 4 附近</option>
            <option value="5">TOPIK 5 附近</option>
            <option value="6">TOPIK 6 附近</option>
          </select>
        </label>

        <label className="grid min-w-0 gap-1 text-[0.74rem] font-semibold text-ink">
          目标学校
          <select
            className="h-11 w-full min-w-0 max-w-full truncate rounded-lg border border-ink bg-paper px-2 text-[0.79rem] font-semibold"
            value={formState.tier}
            onChange={(event) => updateField("tier", event.target.value as TopikTierId)}
          >
            {(Object.keys(topikTierMap) as TopikTierId[]).map((tierId) => (
              <option value={tierId} key={tierId}>
                {topikTierMap[tierId].label} {topikTierMap[tierId].name}
              </option>
            ))}
          </select>
        </label>

        <label className="col-span-2 grid min-w-0 gap-1 text-[0.74rem] font-semibold text-ink">
          入学季
          <select
            className="h-11 w-full min-w-0 max-w-full truncate rounded-lg border border-ink bg-paper px-2 text-[0.79rem] font-semibold"
            value={formState.season}
            onChange={(event) => updateField("season", event.target.value)}
          >
            {topikSeasonOptions.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="col-span-2 grid min-w-0 gap-1 text-[0.74rem] font-semibold text-ink">
          每周时间
          <select
            className="h-11 w-full min-w-0 max-w-full truncate rounded-lg border border-ink bg-paper px-2 text-[0.79rem] font-semibold"
            value={formState.hours}
            onChange={(event) => updateField("hours", event.target.value)}
          >
            {Object.keys(topikTimeProfiles).map((hours) => (
              <option value={hours} key={hours}>
                每周{hours}小时
              </option>
            ))}
          </select>
        </label>

        <button
          className="min-h-11 rounded-lg border border-ink bg-[#d9ded5] px-3 text-sm font-black"
          type="button"
          onClick={resetPlanner}
        >
          还原
        </button>
        <button
          className="min-h-11 rounded-lg bg-[#dff3dc] px-3 text-sm font-black text-[#0b6a4a] shadow-[0_6px_14px_rgba(0,98,65,0.12)] disabled:opacity-60"
          disabled={status === "loading"}
          style={{ boxShadow: "inset 0 0 0 1px #006241, 0 6px 14px rgba(0, 98, 65, 0.12)" }}
          type="submit"
        >
          {status === "loading" ? "AI分析中" : "AI规划"}
        </button>
      </form>

      {status === "loading" ? (
        <div className="mt-4 rounded-xl border border-ink/20 bg-[#fffaf0] p-4" role="status">
          <p className="text-base font-black">AI正在分析TOPIK目标</p>
          <p className="mt-1 text-xs font-medium leading-5 text-muted">正在匹配当前水平、目标学校、申请窗口和每周时间，请稍等...</p>
        </div>
      ) : null}

      {status === "result" && plan ? (
        <div className="mt-4 grid gap-3" aria-live="polite">
          <section
            className="rounded-xl bg-[#dff3dc] p-4"
            data-testid="topik-result-card"
            style={{ boxShadow: "inset 0 0 0 1px #006241, 0 10px 22px rgba(0, 98, 65, 0.14)" }}
          >
            <p className="text-xs font-black text-[#006241]">现实性判断</p>
            <h3 className="mt-1 text-2xl font-black leading-tight text-[#004c3f]" data-testid="topik-result-title">{plan.resultTitle}</h3>
          </section>

          <div className="grid grid-cols-2 gap-2">
            {[
              ["目标完成率", `${plan.completionPct}%`],
              ["每周缺口", plan.weeklyGapText],
              ["累计学习量", plan.cumulativeText],
              ["目标差额", plan.gapTotalText]
            ].map(([label, value]) => {
              const isTargetGap = label === "目标差额";

              return (
                <div className="rounded-lg border border-ink/15 bg-[#fffaf0] p-3" key={label}>
                  <p className="text-xs font-black text-muted">{label}</p>
                  <p className={`mt-1 text-lg font-black leading-tight ${isTargetGap ? "text-[#8b1e1e]" : "text-ink"}`} data-testid={isTargetGap ? "topik-target-gap" : undefined}>
                    {value}
                  </p>
                </div>
              );
            })}
          </div>

          <section className="rounded-lg border border-ink/15 bg-surface p-3">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold text-muted">
              <span>可用 {plan.availableHoursText}</span>
              <span>目标 {plan.targetHoursText}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full border border-ink/25 bg-[#ebe8de]">
              <div className="h-full rounded-full bg-[#71d39b]" style={{ width: `${plan.completionPct}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-[#8b1e1e]" data-testid="topik-hour-gap">缺口 {plan.hourGapText}</p>
          </section>

          <section className="rounded-lg border border-ink bg-surface p-3">
            <h3 className="text-sm font-black">根据什么算</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-muted">{plan.basis}</p>
          </section>

          <section className="rounded-lg border border-ink bg-surface p-3">
            <h3 className="text-sm font-black">接下来做什么</h3>
            <ol className="mt-2 grid gap-2">
              {plan.actions.map((action, index) => (
                <li className="flex gap-2 text-sm font-medium leading-6 text-muted" key={action}>
                  <span className="grid size-6 shrink-0 place-items-center rounded-full border border-ink bg-[#ffe07a] text-xs font-black text-ink">{index + 1}</span>
                  <span>{action}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function ServiceOverviewBlock({ config }: { config: PageConfig }) {
  return (
    <section className="mt-4" aria-label={`${config.title}页面说明`}>
      <section className="rounded-2xl bg-[#073f2d] p-4 text-surface shadow-[0_12px_30px_rgba(7,63,45,0.22)]">
        <p className="text-[0.7rem] font-black uppercase tracking-[0.08em] text-[#cfe9df]">{config.eyebrow}</p>
        <p className="mt-2 text-[1.05rem] font-black leading-6">{config.subtitle}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {config.metrics.map((metric) => (
            <MetricTile key={metric.label} metric={metric} />
          ))}
        </div>
      </section>
    </section>
  );
}

export function MobileServicePage({ applicationPrograms, page }: { applicationPrograms?: ApplicationProgram[]; page: MobileServicePageId }) {
  const config = pageConfigs[page];

  return (
    <section className="mobile-app-shell mx-auto min-h-screen w-full max-w-[430px] overflow-x-hidden bg-[#f5f3ed] pb-[calc(6rem+env(safe-area-inset-bottom))] text-ink lg:landscape:hidden xl:hidden" aria-label={`${config.title}移动端小程序`}>
      <main className="px-4 pt-4">
        {page === "application" ? (
          <div className="grid gap-4">
            <MobileApplicationProjects initialPrograms={applicationPrograms} />
          </div>
        ) : null}
        {page === "exchange" ? <ExchangeCalculator /> : null}

        {page === "topik" ? (
          <div>
            <TopikAiPlanner />
          </div>
        ) : null}

        {page === "korean-learning" ? (
          <section className="rounded-xl border border-ink bg-surface p-4 shadow-[0_8px_24px_rgba(10,10,10,0.07)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black leading-tight">等级路线</h2>
              <BookOpen size={21} strokeWidth={2.4} aria-hidden="true" />
            </div>
            <div className="mt-3 grid gap-2">
              {["3级：多数路线的起点", "4级：本科/插班更稳", "5-6级：T1/T2和热门专业"].map((item) => (
                <div className="flex items-center gap-3 rounded-lg border border-ink/15 bg-[#fffaf0] p-3 text-sm font-black" key={item}>
                  <SearchCheck size={17} strokeWidth={2.4} aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {page === "cost" ? (
          <div>
            <BudgetEstimator />
          </div>
        ) : null}

        {page === "cost" ? <SelfAgencyProfileCard /> : null}
        {page === "cost" ? <MobileReferenceSections ariaLabel="留学费用移动端补充信息" firstTone="white" sections={mobileCostReferenceSections} /> : null}
        {page === "cost" ? <ApplicationChannelGuide /> : null}
        {page === "topik" ? <MobileReferenceSections ariaLabel="TOPIK移动端补充信息" sections={mobileTopikReferenceSections} /> : null}
        {page === "topik" ? <MobileTopikExamSystem /> : null}
        {page === "topik" ? <MobileTopikScoreLevels /> : null}
        {page === "topik" ? <MobileTopikResources /> : null}
        {page === "exchange" ? <ExchangeLifeCostGuide /> : null}
        {page !== "application" && page !== "exchange" && page !== "cost" && page !== "topik" ? <ServiceOverviewBlock config={config} /> : null}

        {page !== "exchange" && page !== "cost" && page !== "topik" ? (
          <section className="mt-4 rounded-xl border border-ink/25 bg-[#fffaf0] p-4">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 shrink-0 text-[#0b6a4a]" size={19} strokeWidth={2.4} aria-hidden="true" />
              <p className="text-sm font-bold leading-6 text-muted">
                移动版只放决策入口和下一步动作；详细表格、长资源列表和复杂数据保留在桌面版继续查看。
              </p>
            </div>
          </section>
        ) : null}
      </main>

      <MobileBottomNav activeTab={config.activeTab} />
    </section>
  );
}
