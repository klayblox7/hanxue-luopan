export type FilmFormat = "wide" | "vertical";

export const FILM_FPS = 30;
export const WIDE_DURATION_FRAMES = FILM_FPS * 45;
export const VERTICAL_DURATION_FRAMES = FILM_FPS * 25;
export const SHORT_CN_DURATION_FRAMES = FILM_FPS * 15;

export type SceneTiming = {
  start: number;
  end: number;
};

export const timings: Record<FilmFormat, Record<string, SceneTiming>> = {
  wide: {
    opening: { start: 0, end: 300 },
    problem: { start: 240, end: 540 },
    product: { start: 470, end: 910 },
    proof: { start: 820, end: 1160 },
    finale: { start: 1085, end: WIDE_DURATION_FRAMES }
  },
  vertical: {
    opening: { start: 0, end: 170 },
    problem: { start: 130, end: 300 },
    product: { start: 260, end: 540 },
    proof: { start: 500, end: 660 },
    finale: { start: 620, end: VERTICAL_DURATION_FRAMES }
  }
};

export const palette = {
  paper: "#f8f8f5",
  warmPaper: "#f5f3ed",
  surface: "#ffffff",
  ink: "#0a0a0a",
  greenDark: "#073f2d",
  green: "#0b6a4a",
  mint: "#a4d4c5",
  softGreen: "#dff3dc",
  yellow: "#ffe07a",
  pink: "#ffd0d8",
  lavender: "#b8a4ed",
  coral: "#ff6b5a",
  peach: "#ffb084",
  muted: "#6a6a6a"
};

export const assetPaths = {
  hero: "mobile-mini-program/home-hero-a5-2-source.png",
  introA: "mobile-mini-program/mobile-intro-a1.png",
  introB: "mobile-mini-program/mobile-intro-a3.png",
  appPreview: "mobile-mini-program/home-hero-mobile-clean.png",
  koreaMap: "korea-admin-map.svg",
  seoulMap: "maps/sgis-kostat-2020-seoul-sigungu.svg",
  campus: [
    "campus-images/korea-university.webp",
    "campus-images/yonsei-university.webp",
    "campus-images/hanyang-university.webp",
    "campus-images/chung-ang-university.webp",
    "campus-images/kaist.jpg",
    "campus-images/hongik-university.webp"
  ],
  logos: [
    "school-logos/korea-university.png",
    "school-logos/yonsei-university.png",
    "school-logos/hanyang-university.png",
    "school-logos/chung-ang-university.png",
    "school-logos/kaist.svg"
  ],
  categoryIcons: [
    "mobile-mini-program/icon-universities.png",
    "mobile-mini-program/icon-topik.png",
    "mobile-mini-program/icon-cost.png",
    "mobile-mini-program/icon-application.png",
    "mobile-mini-program/icon-exchange-budget-99.png"
  ]
};

export const recommendationCards = [
  {
    name: "Korea University",
    city: "Seoul",
    tag: "Business / Media",
    score: 94,
    color: palette.yellow,
    logo: assetPaths.logos[0]
  },
  {
    name: "Yonsei University",
    city: "Seoul",
    tag: "Global / Language",
    score: 91,
    color: palette.pink,
    logo: assetPaths.logos[1]
  },
  {
    name: "Hanyang University",
    city: "Seoul",
    tag: "Engineering",
    score: 88,
    color: palette.mint,
    logo: assetPaths.logos[2]
  },
  {
    name: "Chung-Ang University",
    city: "Seoul",
    tag: "Film / Arts",
    score: 84,
    color: palette.lavender,
    logo: assetPaths.logos[3]
  },
  {
    name: "KAIST",
    city: "Daejeon",
    tag: "Science / AI",
    score: 81,
    color: palette.peach,
    logo: assetPaths.logos[4]
  }
];

export const chineseRecommendationCards = [
  {
    name: "高丽大学",
    city: "首尔",
    tag: "经营 / 传媒",
    score: 94,
    color: palette.yellow,
    logo: assetPaths.logos[0]
  },
  {
    name: "延世大学",
    city: "首尔",
    tag: "国际化 / 语言",
    score: 91,
    color: palette.pink,
    logo: assetPaths.logos[1]
  },
  {
    name: "汉阳大学",
    city: "首尔",
    tag: "工科 / AI",
    score: 88,
    color: palette.mint,
    logo: assetPaths.logos[2]
  },
  {
    name: "中央大学",
    city: "首尔",
    tag: "传媒 / 艺术",
    score: 84,
    color: palette.lavender,
    logo: assetPaths.logos[3]
  },
  {
    name: "KAIST",
    city: "大田",
    tag: "理工 / 研究",
    score: 81,
    color: palette.peach,
    logo: assetPaths.logos[4]
  }
];

export const chineseDecisionSignals = ["均分82", "TOPIK 3", "商科方向", "预算可控", "首尔优先", "案例参考"];

export const decisionSignals = [
  "GPA 82/100",
  "TOPIK 3",
  "Business major",
  "Seoul preferred",
  "Public source",
  "RMB budget",
  "Dormitory",
  "Admission cases",
  "Scholarship",
  "Application route"
];

export const proofStats = [
  { label: "University data", value: "90+", color: palette.yellow },
  { label: "Decision modules", value: "6", color: palette.mint },
  { label: "Evidence first", value: "Official", color: palette.pink },
  { label: "Shortlist output", value: "Top 5", color: palette.lavender }
];
