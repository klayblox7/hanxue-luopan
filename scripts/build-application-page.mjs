import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const markdownPath = process.argv[2] || "E:/360MoveData/Users/49676/Desktop/\u7f51\u7ad9/x+x.md";
const outputPath = process.argv[3] || path.join(projectRoot, "application.html");

const md = fs.readFileSync(markdownPath, "utf8");
const universitySource = fs.readFileSync(path.join(projectRoot, "src/data/universities.ts"), "utf8");
const tierSource = fs.readFileSync(path.join(projectRoot, "src/data/universityTiers.ts"), "utf8");
const partnerProfilePath = path.join(projectRoot, "src/data/partner-school-profiles.json");
const partnerProfileSource = fs.existsSync(partnerProfilePath)
  ? JSON.parse(fs.readFileSync(partnerProfilePath, "utf8"))
  : [];

const regionOrder = ["华北", "东北", "华东", "华中", "华南", "西南", "西北", "综合"];
const modeOrder = ["2+2", "1+3", "3+1", "3+2", "2+3", "4+0"];

const regionRules = [
  [/北京|天津|河北|山西|内蒙古|中国传媒大学/, "华北"],
  [/辽宁|吉林|长春|黑龙江|大连|沈阳/, "东北"],
  [/上海|江苏|苏州|南京|浙江|杭州|安徽|福建|江西|南昌|山东|青岛|烟台|威海|济南|潍坊|德州|聊城|临沂|泰山/, "华东"],
  [/河南|郑州|平顶山|湖北|武汉|湖南|长沙|中南|中国地质大学（武汉）/, "华中"],
  [/广东|广州|广西|南宁|海南|海口|集美|厦门/, "华南"],
  [/四川|成都|重庆|云南|贵州|贵阳|西华师范/, "西南"],
  [/陕西|西安|宁夏|甘肃|新疆|青海/, "西北"],
];

const majorRules = [
  ["艺术/设计", /艺术|设计|美术|视觉|动画|珠宝|音乐|舞蹈|表演|美妆|美容|服装|作品集|戏剧|播音|主持/],
  ["传媒/影视", /传媒|媒体|传播|影视|影像|编导|播音|主持|文化产业|游戏|多媒体/],
  ["商科/经管", /经营|经管|工商|管理|国际经济|贸易|会计|金融|市场|商务|电子商务|电商|财务/],
  ["计算机/AI", /计算机|人工智能|AI|IT|信息安全|软件|数字媒体技术|Cyber/],
  ["工科/理工", /工科|工程|机械|电气|电子|汽车|建筑|包装|材料|化工|航空|民航|船舶|技术|制造|光学/],
  ["语言/教育", /韩语|朝鲜语|国语国文|英语|外语|中文|教育|学前|语言/],
  ["酒店/旅游", /酒店|旅游|观光|餐饮|航空服务|空中乘务|乘务|休闲/],
  ["医学/护理", /护理|医学|医疗|康复|口腔|眼视光|医学影像技术|生物医学/],
  ["体育/社科", /体育|社会|法律|政治|心理|外交|法学/],
  ["自然科学/生命", /生物|生命|化学|物理|数学|园林|食品|理科|自然科学/],
];

function cleanHeading(value) {
  return value
    .replace(/^#+\s*/, "")
    .replace(/\\\./g, ".")
    .trim();
}

function modeFromHeading(value) {
  const match = value.match(/(\d\+\d)/);
  return match?.[1] || "其他";
}

function inferRegion(section, school) {
  const sectionText = section || "";
  if (/华北/.test(sectionText)) return "华北";
  if (/华东/.test(sectionText)) return "华东";
  if (/华中/.test(sectionText)) return "华中";
  if (/华南/.test(sectionText) && !/西南/.test(sectionText)) return "华南";
  if (/西南/.test(sectionText) && !/华南/.test(sectionText)) return "西南";
  if (/西北/.test(sectionText)) return "西北";
  for (const [pattern, region] of regionRules) {
    if (pattern.test(school)) return region;
  }
  if (/华南/.test(sectionText) && /西南/.test(sectionText)) return "综合";
  return "综合";
}

function inferMajors(text) {
  const tags = majorRules.filter(([, pattern]) => pattern.test(text)).map(([tag]) => tag);
  return tags.length ? tags : ["综合项目"];
}

function fieldValue(fields, name) {
  return fields[name]?.trim() || "资料待核对";
}

const domesticFeeKey = "国内费用";
const koreaFeeKey = "韩方费用";
const feeReferenceSource = {
  id: "费用参考",
  url: "https://liuxuekorea.ytu.edu.cn/zsjz.htm",
};

function feeLooksPending(value) {
  const text = String(value || "").trim();
  return !text || /待学校|待校|待公布|校方公布标准|官方标准执行/.test(text);
}

function feeHasConcreteAmount(value) {
  return /(\d+(?:\.\d+)?\s*万|\d{4,}\s*元)/.test(String(value || ""));
}

function isVocationalProject(project) {
  return (
    /3\+2|2\+3/.test(project.mode) ||
    /职业|专科|技术学院|高等专科学校|专科部/.test(`${project.chinaSchool} ${project.modeTitle}`)
  );
}

function domesticFeeFallback(project) {
  if (isVocationalProject(project)) {
    return "公开资料参考：同类专科/高职分段项目国内阶段约 1.8-3.2 万元 / 年；住宿费、教材费和项目管理费按国内院校当年简章执行";
  }
  if (project.mode === "4+0") {
    return "公开资料参考：国内全程就读/校际合作项目常见约 2.2-5.8 万元 / 年；如含短期赴韩交流，相关服务费另按校方说明执行";
  }
  return "公开资料参考：同类本科分段项目国内阶段约 2.2-5.8 万元 / 年；住宿费、教材费和项目管理费按国内院校当年简章执行";
}

function koreaFeeFallback(project) {
  const partners = project.koreaPartners || [];
  const types = partners.map((partner) => String(partner.type || "")).join(" ");
  const hasNational = /国立|公立/.test(types);
  const hasPrivate = /私立/.test(types) || partners.some((partner) => !/国立|公立/.test(String(partner.type || "")));
  if (project.mode === "4+0") {
    return "公开资料参考：如自愿赴韩交流或插班，韩方学费按录取院校与专业执行；国立约 2-3 万元 / 年，私立约 3.2-6 万元 / 年";
  }
  if (hasNational && !hasPrivate) {
    return "公开资料参考：韩方国立/公立大学学费约 2-3 万元 / 年；理工、艺术、医学类通常高于人文社科类";
  }
  if (hasNational && hasPrivate) {
    return "公开资料参考：韩方国立大学约 2-3 万元 / 年，私立大学约 3.2-6 万元 / 年；按最终录取院校和专业结算";
  }
  return "公开资料参考：韩方私立大学学费约 3.2-6 万元 / 年；艺术、设计、医学等专业通常高于普通人文社科专业";
}

function ensureFeeReferenceSource(project) {
  if (!project.sources.some((source) => source.url === feeReferenceSource.url)) {
    project.sources.push(feeReferenceSource);
  }
}

function supplementFeeFields(project) {
  let supplemented = false;
  if (feeLooksPending(project.fields[domesticFeeKey])) {
    project.fields[domesticFeeKey] = domesticFeeFallback(project);
    supplemented = true;
  }
  if (feeLooksPending(project.fields[koreaFeeKey]) || !feeHasConcreteAmount(project.fields[koreaFeeKey])) {
    project.fields[koreaFeeKey] = koreaFeeFallback(project);
    supplemented = true;
  }
  if (supplemented) ensureFeeReferenceSource(project);
}

function extractSources(text) {
  const urls = [];
  const pattern = /\[\((\d+)\)\]\((https?:\/\/[^)]+)\)/g;
  let match;
  while ((match = pattern.exec(text))) {
    urls.push({ id: match[1], url: match[2] });
  }
  return urls;
}

function stripMarkdownLinks(text) {
  return text.replace(/\[\((\d+)\)\]\((https?:\/\/[^)]+)\)/g, "[$1]");
}

function sourceField(block, fieldName) {
  return block.match(new RegExp(`${fieldName}:\\s*"([^"]*)"`))?.[1] || "";
}

function normalizeSchoolName(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/^韩国国立/, "")
    .replace(/^韩国/, "")
    .replace(/^国立/, "")
    .replace(/女子大学校$/, "女子大学")
    .replace(/大学校$/, "大学");
}

function fallbackSchoolName(value) {
  return String(value || "")
    .replace(/^韩国/, "")
    .replace(/女子大学校$/, "女子大学")
    .replace(/大学校$/, "大学")
    .trim();
}

const universityRecords = [...universitySource.matchAll(/\{\s*no:\s*\d+,[\s\S]*?\n\s*\}/g)]
  .map(([block]) => ({
    slug: sourceField(block, "slug"),
    nameCn: sourceField(block, "nameCn"),
    nameKr: sourceField(block, "nameKr"),
    nameEn: sourceField(block, "nameEn"),
    city: sourceField(block, "city"),
    type: sourceField(block, "type"),
    focus: sourceField(block, "focus"),
    totalStudents: sourceField(block, "totalStudents"),
    foreignStudents: sourceField(block, "foreignStudents"),
  }))
  .filter((item) => item.slug && item.nameCn);

const tierProfiles = new Map(
  [...tierSource.matchAll(/^\s*"([^"]+)":\s*\{\s*tier:\s*"(T[1-5])",\s*note:\s*"([^"]+)"/gm)].map(
    ([, nameCn, tier, note]) => [nameCn, { tier, note }],
  ),
);

const universitiesBySlug = new Map(universityRecords.map((item) => [item.slug, item]));
const universitiesByName = new Map();
const staticHomePath = path.join(projectRoot, "hanxue-luopan-home.html");
const schoolFactsBySlug = new Map();

if (fs.existsSync(staticHomePath)) {
  const staticHomeSource = fs.readFileSync(staticHomePath, "utf8");
  const factBlock = staticHomeSource.match(/const schoolFactBySlug = \{([\s\S]*?)\n\s*\};/)?.[1] || "";
  for (const [, slug, founded, students, foreignStudents, officialUrl] of factBlock.matchAll(
    /"([^"]+)":\s*schoolFact\("([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)"\)/g,
  )) {
    schoolFactsBySlug.set(slug, { founded, students, foreignStudents, officialUrl });
  }
}

function localAssetPath(folder, slug) {
  if (!slug) return "";
  for (const ext of [".webp", ".jpg", ".png", ".svg", ".jpeg"]) {
    const candidate = path.join(projectRoot, "public", folder, `${slug}${ext}`);
    if (fs.existsSync(candidate)) return `public/${folder}/${slug}${ext}`;
  }
  return "";
}

function campusAssetPath(slug) {
  return localAssetPath("campus-images", slug);
}

function logoAssetPath(slug) {
  return localAssetPath("school-logos", slug);
}

function withPeopleSuffix(value) {
  if (!value) return "";
  return /人$/.test(value) ? value : `${value}人`;
}

function foundedLabel(value) {
  if (!value) return "";
  return /年$/.test(value) ? value : `${value}年`;
}

function addUniversityAlias(alias, university) {
  const key = normalizeSchoolName(alias);
  if (key && university) universitiesByName.set(key, university);
}

for (const university of universityRecords) {
  addUniversityAlias(university.nameCn, university);
}

const partnerAliasTargets = [
  ["釜山国立大学", "pusan-national-university"],
  ["国立釜山大学", "pusan-national-university"],
  ["釜庆国立大学", "pukyong-national-university"],
  ["国立釜庆大学", "pukyong-national-university"],
  ["江原国立大学", "kangwon-national-university"],
  ["国立江原大学", "kangwon-national-university"],
  ["忠北国立大学", "chungbuk-national-university"],
  ["国立忠北大学", "chungbuk-national-university"],
  ["国立全北大学", "jeonbuk-national-university"],
  ["全北国立大学", "jeonbuk-national-university"],
  ["首尔产业大学", "seoultech"],
  ["大韩航空大学", "korea-aerospace-university"],
  ["弘益大学", "hongik-university"],
  ["弘毅大学", "hongik-university"],
];

for (const [alias, slug] of partnerAliasTargets) {
  addUniversityAlias(alias, universitiesBySlug.get(slug));
}

const supplementalPartnerCities = new Map([
  ["白石大学", "天安"],
  ["百济艺术大学", "完州"],
  ["朝鲜大学", "光州"],
  ["大邱大学", "庆山"],
  ["大田大学", "大田"],
  ["大真大学", "抱川"],
  ["东西大学", "釜山"],
  ["东新大学", "罗州"],
  ["釜山外国语大学", "釜山"],
  ["高丽 Cyber 大学", "首尔"],
  ["公州国立大学", "公州/天安/礼山"],
  ["国立公州大学", "公州/天安/礼山"],
  ["光州女子大学", "光州"],
  ["国立安东大学", "安东"],
  ["国立群山大学", "群山"],
  ["韩世大学", "军浦"],
  ["湖南大学", "光州"],
  ["济州观光大学", "济州"],
  ["建阳大学", "论山/大田"],
  ["京东大学", "杨州/原州/高城"],
  ["京畿大学", "水原/首尔"],
  ["龙仁大学", "龙仁"],
  ["牧园大学", "大田"],
  ["南部大学", "光州"],
  ["培材大学", "大田"],
  ["清州大学", "清州"],
  ["庆南大学", "昌原"],
  ["庆星大学", "釜山"],
  ["庆一大学", "庆山"],
  ["庆云大学", "龟尾"],
  ["庆州大学", "庆州"],
  ["全州大学", "全州"],
  ["首尔艺术大学", "安山"],
  ["首尔综合艺术大学", "首尔"],
  ["水原大学", "华城"],
  ["顺天大学", "顺天"],
  ["松源大学", "光州"],
  ["同德女子大学", "首尔"],
  ["西京大学", "首尔"],
  ["新罗大学", "釜山"],
  ["信韩大学", "议政府/东豆川"],
  ["永进专门大学", "大邱"],
  ["又石大学", "完州/镇川"],
  ["又松大学", "大田"],
  ["中部大学", "锦山/高阳"],
]);

const supplementalOfficialUrls = new Map([
  ["白石大学", "http://www.bu.ac.kr/"],
  ["百济艺术大学", "https://www.paekche.ac.kr/"],
  ["朝鲜大学", "https://www.chosun.ac.kr/"],
  ["大邱大学", "http://daegu.ac.kr/"],
  ["大田大学", "http://www.dju.ac.kr/"],
  ["大真大学", "http://www.daejin.ac.kr/"],
  ["东西大学", "http://uni.dongseo.ac.kr/eng/"],
  ["东新大学", "http://www.dsu.ac.kr/cms/"],
  ["釜山外国语大学", "https://www.bufs.ac.kr/"],
  ["高丽 Cyber 大学", "https://www.cuk.edu/"],
  ["公州国立大学", "http://www.kongju.ac.kr/"],
  ["国立公州大学", "http://www.kongju.ac.kr/"],
  ["光州女子大学", "https://www.kwu.ac.kr/"],
  ["国立安东大学", "https://www.andong.ac.kr/"],
  ["国立群山大学", "http://www.kunsan.ac.kr/"],
  ["韩世大学", "http://www.hansei.ac.kr/"],
  ["湖南大学", "https://www.honam.ac.kr/"],
  ["济州观光大学", "https://www.jtu.ac.kr/"],
  ["建阳大学", "http://www.konyang.ac.kr/"],
  ["京东大学", "https://www.kduniv.ac.kr/"],
  ["京畿大学", "http://www.kyonggi.ac.kr/"],
  ["龙仁大学", "http://www.yongin.ac.kr/"],
  ["牧园大学", "https://www.mokwon.ac.kr/"],
  ["南部大学", "https://www.nambu.ac.kr/"],
  ["培材大学", "http://www.pcu.ac.kr/"],
  ["清州大学", "http://www.cju.ac.kr/"],
  ["庆南大学", "http://www.kyungnam.ac.kr/"],
  ["庆星大学", "http://ks.ac.kr/"],
  ["庆一大学", "https://www.kiu.ac.kr/"],
  ["庆云大学", "https://www.ikw.ac.kr/"],
  ["庆州大学", "https://sgu.ac.kr/"],
  ["全州大学", "http://www.jj.ac.kr/"],
  ["首尔艺术大学", "https://www.seoularts.ac.kr/"],
  ["首尔综合艺术大学", "https://www.sac.ac.kr/"],
  ["水原大学", "http://www.suwon.ac.kr/"],
  ["顺天大学", "http://www.sunchon.ac.kr/"],
  ["松源大学", "https://www.songwon.ac.kr/"],
  ["同德女子大学", "http://www.dongduk.ac.kr/"],
  ["西京大学", "https://www.seokyeong.ac.kr/"],
  ["新罗大学", "http://www.silla.ac.kr/"],
  ["信韩大学", "https://www.shinhan.ac.kr/"],
  ["永进专门大学", "http://www.yju.ac.kr/"],
  ["又石大学", "https://www.woosuk.ac.kr/"],
  ["又松大学", "http://www.wsu.ac.kr/"],
  ["中部大学", "https://www.joongbu.ac.kr/"],
]);

const supplementalPartnerProfiles = new Map();

for (const profile of partnerProfileSource) {
  if (!profile?.name) continue;
  supplementalPartnerProfiles.set(profile.name, {
    ...(supplementalPartnerProfiles.get(profile.name) || {}),
    slug: profile.slug,
    nameKr: profile.nameKr,
    nameEn: profile.nameEn,
    city: profile.city,
    type: profile.type,
    focus: profile.focus,
    founded: profile.founded,
    totalStudents: profile.totalStudents,
    foreignStudents: profile.foreignStudents,
    campusImage: profile.campusImage,
    imagePosition: profile.imagePosition,
    intro: profile.intro || profile.extract,
    sourceUrl: profile.wikiUrl || profile.wikidataUrl,
    officialUrl: profile.officialUrl || "",
    logoImage: profile.logoImage || "",
  });
}

function tierForSchool(displayName) {
  return tierProfiles.get(displayName)?.tier || "T4";
}

function displayLabelWithTier(displayName, suffix = false, city = "") {
  if (suffix) return displayName;
  return `${tierForSchool(displayName)} ${displayName}${city ? ` (${city})` : ""}`;
}

function partnerSlug(displayName) {
  return `partner-${Array.from(normalizeSchoolName(displayName) || "school")
    .map((char) => char.codePointAt(0).toString(36))
    .join("-")
    .slice(0, 80)}`;
}

function resolvePartnerSchool(rawName) {
  const raw = String(rawName || "").trim();
  const university = universitiesByName.get(normalizeSchoolName(raw));
  if (university) {
    const supplemental = supplementalPartnerProfiles.get(university.nameCn) || {};
    const facts = schoolFactsBySlug.get(university.slug) || {};
    return {
      raw,
      displayName: university.nameCn,
      displayLabel: displayLabelWithTier(university.nameCn, false, university.city),
      tier: tierForSchool(university.nameCn),
      city: supplemental.city || university.city,
      slug: university.slug,
      nameKr: supplemental.nameKr || university.nameKr,
      nameEn: supplemental.nameEn || university.nameEn,
      type: supplemental.type || university.type,
      focus: supplemental.focus || university.focus,
      totalStudents: supplemental.totalStudents || university.totalStudents || withPeopleSuffix(facts.students),
      foreignStudents: supplemental.foreignStudents || university.foreignStudents || withPeopleSuffix(facts.foreignStudents),
      founded: supplemental.founded || foundedLabel(facts.founded),
      campusImage: supplemental.campusImage || campusAssetPath(university.slug),
      imagePosition: supplemental.imagePosition || "center",
      intro: supplemental.intro || "",
      officialUrl: supplemental.officialUrl || facts.officialUrl || supplementalOfficialUrls.get(university.nameCn) || "",
      logoImage: supplemental.logoImage || logoAssetPath(university.slug),
      known: true,
    };
  }
  const displayName = fallbackSchoolName(raw);
  const supplemental = supplementalPartnerProfiles.get(displayName) || {};
  const city = supplemental.city || supplementalPartnerCities.get(displayName) || "";
  const slug = supplemental.slug || partnerSlug(displayName);
  return {
    raw,
    displayName,
    displayLabel: displayLabelWithTier(displayName, false, city),
    tier: tierForSchool(displayName),
    city,
    slug,
    nameKr: supplemental.nameKr || "",
    nameEn: supplemental.nameEn || "",
    type: supplemental.type || "",
    focus: supplemental.focus || "",
    totalStudents: supplemental.totalStudents || "",
    foreignStudents: supplemental.foreignStudents || "",
    founded: supplemental.founded || "",
    campusImage: supplemental.campusImage || campusAssetPath(slug),
    imagePosition: supplemental.imagePosition || "center",
    intro: supplemental.intro || "",
    officialUrl: supplemental.officialUrl || supplementalOfficialUrls.get(displayName) || "",
    logoImage: supplemental.logoImage || logoAssetPath(slug),
    known: Boolean(supplemental.slug),
  };
}

function parsePartnerSchools(value) {
  const text = String(value || "").trim();
  if (!text) return [];
  const suffixMatch = text.match(/(\u7b49\s*\d+\s*\u4f59\u6240\u9662\u6821.*)$/);
  const main = suffixMatch ? text.slice(0, suffixMatch.index).replace(/[\u3001\uff0c,\s]+$/, "") : text;
  const parts = main.split(/[\u3001\uff0c,]/).map((item) => item.trim()).filter(Boolean);
  const partners = parts.map(resolvePartnerSchool);
  if (suffixMatch) {
    partners.push({
      raw: suffixMatch[1].trim(),
      displayName: suffixMatch[1].trim(),
      displayLabel: suffixMatch[1].trim(),
      tier: "",
      slug: "",
      known: false,
      suffix: true,
    });
  }
  return partners.length ? partners : [resolvePartnerSchool(text)];
}

function slugify(value, index) {
  return `program-${index + 1}-${Array.from(value)
    .map((char) => char.codePointAt(0).toString(36))
    .join("-")
    .slice(0, 80)}`;
}

function parseProjects(source) {
  const lines = source.split(/\r?\n/);
  const projects = [];
  let currentMode = "";
  let currentModeTitle = "";
  let currentSection = "";
  let current = null;

  function pushCurrent() {
    if (!current) return;
    const blob = [
      current.chinaSchool,
      current.koreaSchools,
      current.section,
      current.modeTitle,
      ...Object.values(current.fields),
    ].join(" ");
    const majorText = [
      current.fields["专业设置"],
      current.chinaSchool,
      current.koreaSchools,
    ].join(" ");
    current.region = inferRegion(current.section, current.chinaSchool);
    current.majorTags = inferMajors(majorText);
    current.sources = extractSources(blob);
    current.koreaPartners = parsePartnerSchools(current.koreaSchools);
    supplementFeeFields(current);
    for (const key of Object.keys(current.fields)) current.fields[key] = stripMarkdownLinks(current.fields[key]);
    projects.push(current);
    current = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/^###\s+/.test(line)) {
      pushCurrent();
      currentModeTitle = cleanHeading(line);
      currentMode = modeFromHeading(currentModeTitle);
      currentSection = "";
      continue;
    }
    if (/^####\s+/.test(line)) {
      pushCurrent();
      currentSection = cleanHeading(line);
      continue;
    }
    if (/^#####\s+/.test(line)) {
      pushCurrent();
      const title = cleanHeading(line);
      const [chinaSchool, koreaSchools = "韩国合作大学"] = title.split(/\s*(?:↔|→|->|－|-)\s*/);
      current = {
        title,
        chinaSchool: chinaSchool.trim(),
        koreaSchools: koreaSchools.trim(),
        mode: currentMode || "其他",
        modeTitle: currentModeTitle || "项目",
        section: currentSection || "综合项目",
        fields: {},
      };
      continue;
    }
    if (!current) continue;
    const bullet = line.match(/^\*\s+\*\*([^*]+)\*\*[:：]\s*(.*)$/);
    if (bullet) {
      current.fields[bullet[1].trim()] = bullet[2].trim();
    }
  }
  pushCurrent();

  return projects
    .filter((item) => modeOrder.includes(item.mode))
    .map((item, index) => ({ ...item, slug: slugify(item.chinaSchool, index), order: index + 1 }))
    .sort((a, b) => {
      const regionCompare = regionOrder.indexOf(a.region) - regionOrder.indexOf(b.region);
      if (regionCompare !== 0) return regionCompare;
      const modeCompare = modeOrder.indexOf(a.mode) - modeOrder.indexOf(b.mode);
      if (modeCompare !== 0) return modeCompare;
      return a.order - b.order;
    })
    .map((item, index) => ({ ...item, order: index + 1 }));
}

const projects = parseProjects(md);
const allMajorTags = [...new Set(projects.flatMap((item) => item.majorTags))].filter((tag) => tag !== "综合项目");
const usedRegions = regionOrder.filter((region) => projects.some((item) => item.region === region));

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function jsonForScript(value) {
  return JSON.stringify(value).replaceAll("</", "<\\/");
}

function filterButton({ filter, label, cls = "" }, pressed = false) {
  return `<button class="category-button ${cls}" type="button" data-filter="${esc(filter)}" aria-pressed="${pressed}">${esc(label)}</button>`;
}

const majorColorClass = new Map([
  ["艺术/设计", "major-art"],
  ["传媒/影视", "major-media"],
  ["商科/经管", "major-business"],
  ["计算机/AI", "major-computer"],
  ["工科/理工", "major-engineering"],
  ["语言/教育", "major-language"],
  ["酒店/旅游", "major-tourism"],
  ["医学/护理", "major-medical"],
]);

const modeButtons = modeOrder
  .filter((mode) => projects.some((item) => item.mode === mode))
  .map((mode) => filterButton({ filter: `mode:${mode}`, label: mode, cls: "mode-filter" }))
  .join("\n");

const regionButtons = usedRegions
  .map((region) => filterButton({ filter: `region:${region}`, label: region, cls: "region-filter" }))
  .join("\n");

const majorButtons = allMajorTags
  .map((tag) => filterButton({ filter: `major:${tag}`, label: tag, cls: `major-filter ${majorColorClass.get(tag) || ""}` }))
  .join("\n");

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>国内+韩国项目库｜韩学罗盘</title>
    <style>
      :root {
        --paper: #fbfbf8;
        --surface: #fffefb;
        --ink: #0a0a0a;
        --muted: #6d6a62;
        --panel: #f0eee6;
        --yellow: #ffe07a;
        --mint: #a4d4c5;
        --pink: #ffd0d8;
        --green: #71d39b;
        --peach: #ffb084;
        --coral: #ff6b5a;
      }

      * { box-sizing: border-box; }

      html {
        overflow-y: scroll;
        scrollbar-gutter: stable;
      }

      body {
        margin: 0;
        background: var(--paper);
        color: var(--ink);
        font-family:
          "Microsoft YaHei UI", "Microsoft YaHei", "微软雅黑", "PingFang SC", "Noto Sans CJK SC",
          "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, "MS Gothic", "Malgun Gothic", Inter,
          system-ui, -apple-system, sans-serif;
      }

      a { color: inherit; text-decoration: none; }
      button, input { font: inherit; }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .header {
        position: sticky;
        top: 0;
        z-index: 50;
        padding: 1rem 4rem;
        background: var(--paper);
        border-bottom: 1px solid var(--ink);
      }

      .header-inner {
        display: grid;
        min-height: 5rem;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 1rem;
      }

      .logo {
        display: block;
        width: 6.5rem;
        height: 5rem;
        object-fit: contain;
      }

      .header-title {
        min-width: 12rem;
        overflow: hidden;
        padding-left: 1rem;
        font-size: clamp(1.11rem, 1.92vw, 2.1rem);
        font-weight: 900;
        line-height: 1;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .nav {
        display: flex;
        max-width: min(72rem, calc(100vw - 11rem));
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        justify-content: flex-end;
      }

      .pill,
      .category-button,
      .source-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--ink);
        border-radius: 999px;
        color: var(--ink);
        font-weight: 800;
        line-height: 1;
        white-space: nowrap;
      }

      .pill {
        padding: 0.45rem 0.72rem;
        font-size: 0.95rem;
        background: #ffffff;
      }

      .pink { background: var(--pink); }
      .green { background: var(--green); }
      .yellow { background: var(--yellow); }
      .mint { background: var(--mint); }
      .peach { background: var(--peach); }

      .pill { background: #ffffff; }
      .pill.pink.active,
      .pill.pink:hover,
      .pill.pink:focus { background: var(--pink); }
      .pill.green.active,
      .pill.green:hover,
      .pill.green:focus { background: var(--green); }
      .pill.yellow.active,
      .pill.yellow:hover,
      .pill.yellow:focus { background: var(--yellow); }
      .pill.mint.active,
      .pill.mint:hover,
      .pill.mint:focus { background: var(--mint); }
      .pill.peach.active,
      .pill.peach:hover,
      .pill.peach:focus { background: var(--peach); }
      .nav-suffix { font-size: 0.85em; font-style: italic; font-weight: 400; }

      .wrap {
        width: calc(100% - 25rem);
        margin: 0 auto;
        padding: 1.05rem 0 5rem;
      }

      .page-head {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1.4rem;
      }

      h1 {
        margin: 0;
        font-size: clamp(2.4rem, 5vw, 4.4rem);
        font-weight: 900;
        line-height: 1;
        letter-spacing: 0;
      }

      .lead {
        max-width: 56rem;
        margin: 0.9rem 0 0;
        color: var(--muted);
        font-size: 0.98rem;
        line-height: 1.7;
      }

      .summary {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        border: 1px solid var(--ink);
        background: var(--surface);
      }

      .metric {
        min-width: 9rem;
        border-right: 1px solid var(--ink);
        padding: 0.78rem 1rem;
      }

      .metric:last-child { border-right: 0; }
      .metric span {
        color: var(--muted);
        font-size: 0.72rem;
        font-weight: 800;
      }
      .metric strong {
        display: block;
        margin-top: 0.42rem;
        font-size: 1.35rem;
        line-height: 1;
      }

      .toolbox {
        display: grid;
        gap: 0.75rem;
        margin-top: 1.25rem;
      }

      .filter-top-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 1rem;
      }

      .filter-bottom-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(12rem, 12.775rem);
        align-items: start;
        gap: 1rem;
      }

      .category-controls,
      .major-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
      }

      .mode-controls {
        justify-self: end;
      }

      .category-button {
        background: var(--panel);
        cursor: pointer;
        font-size: 0.82rem;
        padding: 0.52rem 0.88rem;
      }

      .category-button[aria-pressed="true"] {
        background: var(--yellow);
        outline: 2px solid var(--ink);
        outline-offset: 2px;
      }

      .mode-filter { background: #e6f7f7; }
      .major-filter { background: #f1f1ee; }
      .major-filter.major-art,
      .major-filter.major-media { background: var(--pink); }
      .major-filter.major-business { background: var(--yellow); }
      .major-filter.major-computer,
      .major-filter.major-engineering { background: var(--mint); }
      .major-filter.major-language { background: #d9cdf6; }
      .major-filter.major-tourism { background: var(--peach); }
      .major-filter.major-medical { background: #b7dbc6; }

      .search {
        width: 100%;
        height: 2.45rem;
        border: 0.7px solid var(--ink);
        border-radius: 6px;
        background: var(--surface);
        padding: 0 0.9rem;
        color: var(--ink);
        font-size: 0.82rem;
        font-style: italic;
        font-weight: 400;
        outline: none;
      }

      .search::placeholder {
        color: var(--muted);
        font-style: italic;
        font-weight: 400;
        opacity: 1;
      }
      .search:focus {
        border-color: var(--ink);
        box-shadow: 0 0 0 1px var(--ink);
      }

      .result-line {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 1.15rem;
        color: var(--muted);
        font-size: 0.82rem;
        font-weight: 800;
      }

      table {
        width: 100%;
        margin-top: 1.632rem;
        border: 1px solid var(--ink);
        border-collapse: collapse;
        background: var(--surface);
        font-size: 0.84rem;
        table-layout: fixed;
      }

      th,
      td {
        border-bottom: 1px solid var(--ink);
        padding: 0.95rem 1rem;
        text-align: left;
        vertical-align: top;
        word-break: keep-all;
        overflow-wrap: anywhere;
      }

      th {
        background: var(--panel);
        font-size: 0.93rem;
        font-weight: 900;
      }

      tbody tr:last-child td { border-bottom: 0; }

      tbody td[data-label="地区"] {
        font-size: 110.4%;
        font-weight: 400;
      }

      .school-toggle {
        display: block;
        width: 100%;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 900;
        line-height: 1.25;
        text-align: left;
        text-decoration: none;
      }

      .school-toggle:hover,
      .school-toggle[aria-expanded="true"] { color: inherit; }

      .school-toggle-arrow {
        display: inline-block;
        margin-left: 0.05em;
        font-size: 70%;
        font-weight: 400;
        line-height: 1;
        vertical-align: middle;
      }

      .partner-school-list {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.2rem;
        font-size: 110.4%;
        font-weight: 400;
        line-height: 1.55;
      }

      .partner-school-link,
      .partner-school-name {
        font-weight: 400;
      }

      .partner-school-link,
      .partner-school-name {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        column-gap: 0.45rem;
        row-gap: 0.18rem;
        color: inherit;
        font-family: inherit;
        font-size: inherit;
        font-style: inherit;
        line-height: 1.35;
      }

      .partner-school-link {
        border: 0;
        background: transparent;
        cursor: pointer;
        padding: 0;
        text-align: left;
        text-decoration: none;
      }

      .partner-school-link:hover,
      .partner-school-link[aria-expanded="true"] {
        color: inherit;
      }

      .partner-school-link:hover .partner-info-label,
      .partner-school-link:focus .partner-info-label,
      .partner-school-link[aria-expanded="true"] .partner-info-label {
        background: #e2f3cf;
      }

      .partner-school-link:focus-visible {
        outline: 2px solid var(--ink);
        outline-offset: 2px;
      }

      .partner-tier {
        font-size: 85%;
        font-weight: 900;
      }

      .partner-info-label {
        display: inline-flex;
        min-height: 1.25rem;
        align-items: center;
        justify-content: center;
        border: 1px solid #a8aca2;
        background: #eef8df;
        color: var(--ink);
        padding: 0.12rem 0.72rem;
        font-size: 0.72rem;
        font-weight: 900;
        line-height: 1;
      }

      .school-subtitle {
        display: block;
        margin-top: 0.55rem;
        color: var(--muted);
        font-size: 0.76rem;
        line-height: 1.45;
      }

      .mode-badge,
      .tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--ink);
        border-radius: 999px;
        font-size: 0.74rem;
        font-weight: 900;
        line-height: 1;
      }

      .mode-badge {
        background: #e6f7f7;
        padding: 0.38rem 0.62rem;
      }

      .tag {
        margin: 0.12rem 0.16rem 0.12rem 0;
        padding: 0.32rem 0.52rem;
        background: #f1f1ee;
      }

      .tag.major-art,
      .tag.major-media { background: var(--pink); }
      .tag.major-business { background: var(--yellow); }
      .tag.major-computer,
      .tag.major-engineering { background: var(--mint); }
      .tag.major-language { background: #d9cdf6; }
      .tag.major-tourism { background: var(--peach); }
      .tag.major-medical { background: #b7dbc6; }

      .detail-row td {
        padding: 0;
        background: #f6f4ed;
      }

      .program-panel {
        display: grid;
        grid-template-columns: 1.1fr 1fr;
        gap: 0;
        border-top: 0;
      }

      .panel-block {
        border-right: 1px solid var(--ink);
        padding: 1.1rem;
      }

      .panel-block:last-child { border-right: 0; }

      .panel-block h2 {
        margin: 0 0 0.9rem;
        font-size: 1.02rem;
        line-height: 1.25;
      }

      .fact-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
      }

      .fact {
        border: 1px solid var(--ink);
        background: var(--surface);
        padding: 0.75rem;
      }

      .fact span {
        display: block;
        color: var(--ink);
        font-size: 0.792rem;
        font-weight: 900;
      }

      .fact p {
        margin: 0.48rem 0 0;
        font-size: 0.82rem;
        line-height: 1.55;
      }

      .source-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-top: 0.9rem;
      }

      .source-link {
        background: var(--surface);
        padding: 0.34rem 0.56rem;
        font-size: 0.72rem;
      }

      .source-note {
        margin: 0.9rem 0 0;
        color: var(--muted);
        font-size: 0.78rem;
        font-style: italic;
        line-height: 1.6;
      }

      .school-profile {
        display: grid;
        grid-template-columns: minmax(12rem, 1.31fr) minmax(16rem, 1.35fr) minmax(20rem, 2.04fr);
        gap: 0.9rem;
        border: 1px solid var(--ink);
        background: var(--panel);
        padding: 0.95rem;
      }

      .profile-campus {
        display: grid;
        align-self: start;
        width: 100%;
        height: 22rem;
        min-height: 12rem;
        place-items: center;
        border: 1px solid var(--ink);
        background: #4a77c7;
        color: var(--surface);
        font-size: 1rem;
        font-weight: 900;
        letter-spacing: 0;
        overflow: hidden;
        text-align: center;
      }

      .profile-campus-image {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .profile-facts,
      .profile-intro {
        border: 1px solid #aaa69d;
        background: var(--surface);
      }

      .profile-facts {
        display: grid;
        grid-template-rows: auto 1fr;
        align-self: start;
        height: 22rem;
        min-height: 22rem;
      }

      .profile-heading {
        border-bottom: 1px solid #aaa69d;
        background: #f1f1ee;
        padding: 0.62rem 0.8rem;
        text-align: center;
      }

      .profile-heading h2 {
        margin: 0;
        font-size: 0.92rem;
        line-height: 1.3;
      }

      .profile-heading small {
        display: block;
        margin-top: 0.18rem;
        color: var(--muted);
        font-size: 0.68rem;
        font-weight: 800;
      }

      .profile-info-grid {
        display: grid;
        grid-template-rows: repeat(6, minmax(0, 1fr));
        min-height: 0;
      }

      .profile-info-row {
        display: grid;
        grid-template-columns: 47% 53%;
        min-height: 0;
        border-bottom: 1px solid #aaa69d;
      }

      .profile-info-row:last-child { border-bottom: 0; }

      .profile-tier-row {
        border-bottom: 1px solid var(--ink);
      }

      .profile-info-row span,
      .profile-info-row strong {
        display: grid;
        align-items: center;
        padding: 0.55rem 0.8rem;
        font-size: 0.82rem;
        line-height: 1.35;
      }

      .profile-info-row span {
        border-right: 1px solid #aaa69d;
        font-weight: 800;
        text-align: center;
      }

      .profile-info-row strong {
        font-weight: 900;
        text-align: center;
      }

      .profile-info-row small {
        font-weight: 400;
      }

      .profile-logo-cell {
        display: grid;
        place-items: center;
        min-width: 0;
      }

      .profile-logo-link,
      .profile-website-link {
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
        color: var(--ink);
        text-decoration: none;
      }

      .profile-logo-image {
        display: block;
        width: auto;
        max-width: min(8.2rem, 84%);
        height: auto;
        max-height: 2.35rem;
        object-fit: contain;
      }

      .profile-website-link {
        font-size: 0.8rem;
        font-weight: 900;
      }

      .profile-website-pending {
        color: var(--muted);
        font-size: 0.74rem;
        font-weight: 800;
      }

      .profile-intro-body {
        display: grid;
        min-height: 9.85rem;
        align-content: center;
        gap: 0.72rem;
        padding: 1rem 1.1rem;
      }

      .profile-intro-body p {
        margin: 0;
        font-size: 0.86rem;
        line-height: 1.75;
      }

      .profile-note {
        color: var(--muted);
        font-size: 0.72rem !important;
        font-style: italic;
      }

      .case-panel {
        display: grid;
        gap: 1rem;
        border: 1px solid var(--ink);
        background: var(--panel);
        padding: 1rem;
      }

      .case-summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.75rem;
      }

      .case-field {
        display: grid;
        gap: 0.3rem;
        font-size: 0.85rem;
        font-weight: 800;
      }

      .case-field strong {
        display: grid;
        min-height: 2.35rem;
        align-items: center;
        border: 1px solid var(--ink);
        background: var(--paper);
        padding: 0.55rem 0.65rem;
        font-size: 0.85rem;
        line-height: 1.1;
      }

      .case-count-value {
        color: #9f1d1d;
      }

      .case-charts {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.75rem;
        align-items: start;
      }

      .case-chart,
      .case-snapshot {
        border: 1px solid var(--ink);
        background: var(--paper);
        padding: 0.85rem;
      }

      .case-chart-head,
      .case-bar-meta {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .case-chart h3 {
        margin: 0;
        font-size: 0.9rem;
      }

      .case-bars {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.825rem;
        margin-top: 0.75rem;
      }

      .case-bar-meta {
        font-size: 0.72rem;
      }

      .case-bar-meta strong {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .case-bar-meta span {
        flex-shrink: 0;
      }

      .case-bar-track {
        height: 0.65rem;
        overflow: hidden;
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: var(--surface);
      }

      .case-bar-track span {
        display: block;
        height: 100%;
        border-radius: 999px;
      }

      .case-result-stack {
        display: flex;
        height: 2.25rem;
        overflow: hidden;
        border: 1px solid var(--ink);
        background: var(--surface);
      }

      .case-result-stack span {
        display: grid;
        place-items: center;
        font-size: 0.72rem;
        font-weight: 900;
      }

      .case-result-stack span + span {
        border-left: 1px solid var(--ink);
      }

      .case-snapshots {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .case-snapshot {
        display: grid;
        gap: 0.7rem;
      }

      .case-snapshot div {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }

      .case-snapshot strong {
        font-size: 0.9rem;
      }

      .case-snapshot p {
        margin: 0;
        color: var(--ink);
        font-size: 0.78rem;
        line-height: 1.55;
      }

      .case-snapshot span {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--ink);
        border-radius: 999px;
        padding: 0.35rem 0.58rem;
        font-size: 0.72rem;
        font-weight: 900;
      }

      .case-admitted { background: var(--green); }
      .case-rejected { background: var(--pink); }
      .case-mixed { background: var(--yellow); }

      .case-panel-note {
        margin: 0;
        color: var(--muted);
        font-size: 0.78rem;
        font-style: italic;
        line-height: 1.6;
        text-align: right;
      }

      .empty {
        border: 1px solid var(--ink);
        border-top: 0;
        background: var(--surface);
        padding: 2rem;
        text-align: center;
        font-weight: 900;
      }

      @media (max-width: 1180px) {
        .wrap { width: calc(100% - 4rem); }
        .page-head { justify-content: stretch; }
        .summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .metric:nth-child(2) { border-right: 0; }
      }

      /* Fixed desktop shortcut navigation */
      @media (min-width: 721px) {
        .header .header-inner {
          display: grid;
          grid-template-columns: 6.5rem minmax(0, 1fr) auto;
        }

        .nav {
          position: absolute;
          top: 2.3rem;
          right: 4rem;
          width: min(53rem, calc(100vw - 13rem));
          max-width: none;
          flex-wrap: nowrap;
          justify-content: flex-end;
          justify-self: end;
        }

        .nav > .pill {
          flex: 0 0 auto;
          height: 2.35rem;
          min-height: 0;
          padding: 0;
          white-space: nowrap;
        }

        .nav > .pill:nth-child(1) { width: 11.4rem; }
        .nav > .pill:nth-child(2) { width: 9.4rem; }
        .nav > .pill:nth-child(3) { width: 10.6rem; }
        .nav > .pill:nth-child(4) { width: 12.4rem; }
        .nav > .pill:nth-child(5) { width: 5.6rem; }
      }

      @media (max-width: 980px) {
        .header { padding: 0.85rem 1rem; }
        .header-inner {
          min-height: auto;
          grid-template-columns: auto 1fr;
        }
        .logo {
        display: block;
          width: 4.9rem;
          height: 3.75rem;
        }
        .header-title {
          min-width: 0;
          padding-left: 0;
          font-size: 0.69rem;
        }
        .nav {
          grid-column: 1 / -1;
          max-width: none;
          margin: 0 -1rem;
          padding: 0.25rem 1rem 0.15rem;
          flex-wrap: nowrap;
          justify-content: flex-start;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .nav::-webkit-scrollbar { display: none; }
        .pill { font-size: 0.82rem; }
        .wrap {
          width: calc(100% - 2rem);
          padding-top: 1rem;
        }
        h1 { font-size: 2.35rem; }
        .filter-top-row { grid-template-columns: 1fr; }
        .filter-bottom-row { grid-template-columns: 1fr; }
        .mode-controls { justify-self: start; }
        .search { width: 100%; }
        .category-controls,
        .major-controls {
          flex-wrap: nowrap;
          margin: 0 -1rem;
          padding: 0.18rem 1rem 0.5rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .category-controls::-webkit-scrollbar,
        .major-controls::-webkit-scrollbar { display: none; }
        table,
        thead,
        tbody,
        th,
        td,
        tr { display: block; }
        thead { display: none; }
        table {
          border-bottom: 0;
          font-size: 0.82rem;
        }
        tbody tr.program-row {
          border-bottom: 1px solid var(--ink);
        }
        td {
          display: grid;
          grid-template-columns: 7rem minmax(0, 1fr);
          gap: 1rem;
          border-bottom: 1px solid #cfcbc1;
          padding: 0.78rem 0.9rem;
        }
        td:last-child { border-bottom: 0; }
        td::before {
          content: attr(data-label);
          color: var(--muted);
          font-size: 0.72rem;
          font-weight: 900;
        }
        .detail-row td {
          display: block;
        }
        .detail-row td::before { content: none; }
        .program-panel {
          grid-template-columns: 1fr;
        }
        .school-profile {
          grid-template-columns: 1fr;
        }
        .profile-campus {
          height: 14rem;
          min-height: 10rem;
        }
        .panel-block {
          border-right: 0;
          border-bottom: 1px solid var(--ink);
        }
        .panel-block:last-child { border-bottom: 0; }
        .fact-grid,
        .case-summary-grid,
        .case-charts,
        .case-snapshots {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 560px) {
        .summary { grid-template-columns: 1fr; }
        .metric,
        .metric:nth-child(2) {
          border-right: 0;
          border-bottom: 1px solid var(--ink);
        }
        .metric:last-child { border-bottom: 0; }
        td { grid-template-columns: 5.8rem minmax(0, 1fr); }
      }






    
      /* header-lock: keep page headers aligned across every module */
      .nav-suffix {
        font-size: 0.85em;
        font-style: italic;
        font-weight: 400;
      }

      @media (min-width: 721px) {
        .header {
          padding: 1rem 4rem;
        }
        .header .header-inner {
          display: grid;
          min-height: 5rem;
          grid-template-columns: 6.5rem minmax(0, 1fr) auto;
          align-items: center;
          gap: 1rem;
        }
        .header .logo,
        .header img.logo {
          width: 6.5rem;
          height: 5rem;
          object-fit: contain;
        }
        .header .header-title {
          min-width: 12rem;
          overflow: hidden;
          padding-left: 1rem;
          font-size: clamp(1.11rem, 1.92vw, 2.1rem);
          font-weight: 900;
          line-height: 1;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .header .nav,
        .header .top-nav {
          position: absolute;
          top: 2.3rem;
          right: 4rem;
          width: min(53rem, calc(100vw - 13rem));
          max-width: none;
          flex-wrap: nowrap;
          justify-content: flex-end;
          justify-self: end;
        }
        .header .nav > .pill,
        .header .top-nav > .nav-pill {
          flex: 0 0 auto;
          height: 2.35rem;
          min-height: 0;
          padding: 0;
          white-space: nowrap;
        }
        .header .nav > .pill:nth-child(1),
        .header .top-nav > .nav-pill:nth-child(1) { width: 11.4rem; }
        .header .nav > .pill:nth-child(2),
        .header .top-nav > .nav-pill:nth-child(2) { width: 9.4rem; }
        .header .nav > .pill:nth-child(3),
        .header .top-nav > .nav-pill:nth-child(3) { width: 10.6rem; }
        .header .nav > .pill:nth-child(4),
        .header .top-nav > .nav-pill:nth-child(4) { width: 12.4rem; }
        .header .nav > .pill:nth-child(5),
        .header .top-nav > .nav-pill:nth-child(5) { width: 5.6rem; }
      }

      @media (max-width: 980px) {
        .header {
          padding: 0.85rem 1rem;
        }
        .header .header-inner {
          min-height: auto;
          grid-template-columns: auto 1fr;
        }
        .header .logo,
        .header img.logo {
          width: 4.9rem;
          height: 3.75rem;
        }
        .header .header-title {
          min-width: 0;
          padding-left: 0;
          font-size: 0.69rem;
        }
        .header .nav,
        .header .top-nav {
          grid-column: 1 / -1;
          position: static;
          width: auto;
          max-width: none;
          margin: 0 -1rem;
          padding: 0.25rem 1rem 0.15rem;
          flex-wrap: nowrap;
          justify-content: flex-start;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
      }

    
      /* header-lock-pill: normalize nav pill height across modules */
      .header .nav > .pill,
      .header .top-nav > .nav-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.15rem;
        font-size: 0.95rem;
        line-height: 1;
      }

      @media (max-width: 980px) {
        .header .nav > .pill,
        .header .top-nav > .nav-pill {
          flex: 0 0 auto;
          height: 2.35rem;
          min-height: 0;
          padding: 0 0.72rem;
          white-space: nowrap;
        }
      }

    
      /* final-header-lock: absolute header geometry, based on application/cost pages */
      .nav-suffix {
        font-size: 0.85em !important;
        font-style: italic !important;
        font-weight: 400 !important;
      }

      @media (min-width: 981px) {
        .header {
          position: sticky !important;
          top: 0 !important;
          height: 7.05rem !important;
          min-height: 7.05rem !important;
          padding: 1rem 4rem !important;
          box-sizing: border-box !important;
        }
        .header .header-inner {
          position: relative !important;
          display: block !important;
          width: 100% !important;
          max-width: none !important;
          height: 5rem !important;
          min-height: 5rem !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .header .logo,
        .header img.logo {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 6.5rem !important;
          height: 5rem !important;
          object-fit: contain !important;
        }
        .header .header-title {
          position: absolute !important;
          left: 8.5rem !important;
          top: 50% !important;
          width: calc(100vw - 18rem) !important;
          min-width: 0 !important;
          max-width: none !important;
          transform: translateY(-50%) !important;
          overflow: hidden !important;
          padding-left: 0 !important;
          font-size: clamp(1.11rem, 1.92vw, 2.1rem) !important;
          font-weight: 900 !important;
          line-height: 1 !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        .header .nav,
        .header .top-nav {
          position: absolute !important;
          top: 50% !important;
          right: 0 !important;
          width: 53rem !important;
          max-width: calc(100vw - 13rem) !important;
          height: 2.35rem !important;
          transform: translateY(-50%) !important;
          display: flex !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 0.5rem !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
          scrollbar-width: auto !important;
        }
        .header .nav > .pill,
        .header .top-nav > .nav-pill {
          display: inline-flex !important;
          flex: 0 0 auto !important;
          box-sizing: border-box !important;
          align-items: center !important;
          justify-content: center !important;
          gap: normal !important;
          height: 2.35rem !important;
          min-height: 0 !important;
          padding: 0 !important;
          font-size: 0.95rem !important;
          line-height: 1 !important;
          white-space: nowrap !important;
        }
        .header .nav > .pill:nth-child(1),
        .header .top-nav > .nav-pill:nth-child(1) { width: 11.4rem !important; }
        .header .nav > .pill:nth-child(2),
        .header .top-nav > .nav-pill:nth-child(2) { width: 9.4rem !important; }
        .header .nav > .pill:nth-child(3),
        .header .top-nav > .nav-pill:nth-child(3) { width: 10.6rem !important; }
        .header .nav > .pill:nth-child(4),
        .header .top-nav > .nav-pill:nth-child(4) { width: 12.4rem !important; }
        .header .nav > .pill:nth-child(5),
        .header .top-nav > .nav-pill:nth-child(5) { width: 5.6rem !important; }
      }

      @media (max-width: 980px) {
        .header {
          height: 9.25rem !important;
          min-height: 9.25rem !important;
          padding: 0.85rem 1rem !important;
          box-sizing: border-box !important;
        }
        .header .header-inner {
          position: relative !important;
          display: block !important;
          height: 4.25rem !important;
          min-height: 4.25rem !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .header .logo,
        .header img.logo {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 4.9rem !important;
          height: 3.75rem !important;
          object-fit: contain !important;
        }
        .header .header-title {
          position: absolute !important;
          left: 5.95rem !important;
          top: 1.9rem !important;
          width: calc(100vw - 7rem) !important;
          min-width: 0 !important;
          transform: translateY(-50%) !important;
          overflow: hidden !important;
          padding-left: 0 !important;
          font-size: 0.69rem !important;
          font-weight: 900 !important;
          line-height: 1 !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        .header .nav,
        .header .top-nav {
          position: absolute !important;
          left: -1rem !important;
          top: 4.65rem !important;
          width: calc(100vw) !important;
          max-width: none !important;
          height: 2.75rem !important;
          display: flex !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          justify-content: flex-start !important;
          gap: 0.4rem !important;
          margin: 0 !important;
          padding: 0.25rem 1rem 0.15rem !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          transform: none !important;
          -webkit-overflow-scrolling: touch !important;
          scrollbar-width: none !important;
        }
        .header .nav > .pill,
        .header .top-nav > .nav-pill {
          display: inline-flex !important;
          flex: 0 0 auto !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.15rem !important;
          height: 2.35rem !important;
          min-height: 0 !important;
          padding: 0 0.72rem !important;
          font-size: 0.95rem !important;
          line-height: 1 !important;
          white-space: nowrap !important;
        }
      }

    </style>
  </head>
  <body>
    <header class="header">
      <div class="header-inner">
        <a href="./hanxue-luopan-home.html" aria-label="韩学罗盘">
          <img class="logo" src="./public/korea-link-logo.gif" alt="韩学罗盘" />
        </a>
        <div class="header-title">&#22269;&#20869;+&#38889;&#22269;&#39033;&#30446;&#24211;</div>
        <nav class="nav" aria-label="main navigation">
                    <a class="pill pink" href="./universities.html">&#38889;&#22269;&#22823;&#23398;&#24211; <span class="nav-suffix">&#65288;&#30452;&#21319;&#65289;</span></a>
          <a class="pill mint active" href="./application.html">&#22269;&#20869;+&#38889;&#22269;&#39033;&#30446;</a>
          <a class="pill green" href="./topik.html">&#38889;&#35821;(TOPIK)</a>
          <a class="pill yellow" href="./cost.html">&#30041;&#23398;&#36153;&#29992; <span class="nav-suffix">&#65288;&#22870;&#23398;&#37329;&#65289;</span></a>
          <a class="pill yellow" href="./exchange-rate.html">&#27719;&#29575;</a>
        </nav>
      </div>
    </header>

    <main class="wrap">
      <section class="toolbox" aria-label="project filters">
        <div class="filter-top-row">
          <div class="category-controls region-controls">
            ${filterButton({ filter: "all", label: "全部" }, true)}
            ${regionButtons}
          </div>
          <div class="category-controls mode-controls">
            ${modeButtons}
          </div>
        </div>
        <div class="filter-bottom-row">
          <div class="major-controls" aria-label="major filters">
            ${majorButtons}
          </div>
          <label>
            <span class="sr-only">学校搜索</span>
            <input class="search" id="school-search" type="search" placeholder="搜索：当前入库韩国96所高校" aria-label="学校搜索" autocomplete="off" />
          </label>
        </div>
      </section>

      <table>
        <colgroup>
          <col style="width: 19.55%" />
          <col style="width: 11.15%" />
          <col style="width: 23.15%" />
          <col style="width: 12.15%" />
          <col style="width: 34%" />
        </colgroup>
        <thead>
          <tr>
            <th>中国学校</th>
            <th>地区</th>
            <th>韩国合作学校</th>
            <th>模式</th>
            <th>专业方向</th>
          </tr>
        </thead>
        <tbody id="program-body"></tbody>
      </table>
      <div class="empty" id="empty-state" hidden>&#27809;&#26377;&#25214;&#21040;&#21305;&#37197;&#30340;&#39033;&#30446;&#12290;</div>
    </main>

    <script src="./admission-case-summaries.js"></script>
    <script>
      const programs = ${jsonForScript(projects)};
      const caseSummaries = window.admissionCaseSummaries || {};

      (() => {
        const tbody = document.querySelector("#program-body");
        const buttons = Array.from(document.querySelectorAll(".category-button"));
        const emptyState = document.querySelector("#empty-state");
        const searchInput = document.querySelector("#school-search");
        const activeFilters = {
          regions: new Set(),
          modes: new Set(),
          majors: new Set()
        };
        let detailRow = null;
        let expandedSlug = null;

        const majorClass = new Map([
          ["艺术/设计", "major-art"],
          ["传媒/影视", "major-media"],
          ["商科/经管", "major-business"],
          ["计算机/AI", "major-computer"],
          ["工科/理工", "major-engineering"],
          ["语言/教育", "major-language"],
          ["酒店/旅游", "major-tourism"],
          ["医学/护理", "major-medical"],
        ]);
        const caseBarColor = "#d8d6cf";
        const caseHighlightColor = "#ffe07a";

        function htmlEscape(value) {
          return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");
        }

        function tagMarkup(tags) {
          return tags.map((tag) => '<span class="tag ' + (majorClass.get(tag) || "") + '">' + htmlEscape(tag) + '</span>').join("");
        }

        function partnerInfoMarkup() {
          return '<span class="partner-info-label">学校信息</span>';
        }

        function partnerNameMarkup(partner) {
          return htmlEscape(partner.displayName || partner.displayLabel || "\u97e9\u56fd\u5927\u5b66");
        }

        function partnerLabelMarkup(partner) {
          if (partner.suffix) return htmlEscape(partner.displayLabel || partner.displayName);
          const label = partnerNameMarkup(partner) + partnerInfoMarkup();
          if (!partner.tier) return label;
          return '<span class="partner-tier">' + htmlEscape(partner.tier) + '</span> ' + label;
        }

        function partnerMarkup(partners) {
          return '<span class="partner-school-list">' + (partners || []).map((partner) => {
            const label = partnerLabelMarkup(partner);
            if (partner.slug && !partner.suffix) {
              return '<button class="partner-school-link" type="button" aria-expanded="false" data-school-slug="' + htmlEscape(partner.slug) + '" data-school-name="' + htmlEscape(partner.displayName) + '">' + label + '</button>';
            }
            return '<span class="partner-school-name">' + label + '</span>';
          }).join("") + '</span>';
        }

        function shortFee(program) {
          const domestic = program.fields["国内费用"] || "";
          const korea = program.fields["韩方费用"] || "";
          const pendingFee = "\u8D44\u6599\u5F85\u6838\u5BF9";
          const text = domestic && domestic !== pendingFee ? domestic : korea;
          return text && text !== pendingFee ? text : "\u8D39\u7528\u53C2\u8003\u5F85\u6838\u5BF9";
        }

        function compact(value, limit = 42) {
          const text = String(value || "").trim();
          return text.length > limit ? text.slice(0, limit).replace(/[，,；;、\\s]+$/, "") + "..." : text;
        }

        function cleanFactText(value) {
          return String(value || "\u8D44\u6599\u5F85\u6838\u5BF9")
            .replace(/\\[(\\d+)\\]/g, "")
            .replace(/\\s+/g, " ")
            .trim();
        }

        function summarizeMajor(value) {
          const items = cleanFactText(value)
            .split(/[、，,；;\\/]/)
            .map((item) => item.trim())
            .filter(Boolean);
          if (!items.length) return "\u8D44\u6599\u5F85\u6838\u5BF9";
          const shown = items.slice(0, 4).join("\u3001");
          return items.length > 4 ? shown + "\u7B49" : shown;
        }

        function summarizeMode(value) {
          const text = cleanFactText(value);
          const mode = text.match(/\\d\\+\\d/)?.[0];
          const detail = text.match(/（([^）]+)）/)?.[1] || text.match(/\\(([^)]+)\\)/)?.[1] || "";
          if (mode && detail) return mode + "\uFF1A" + compact(detail.replace(/\u672C\u79D1\u5C42\u6B21/g, "\u672C\u79D1"), 28);
          return compact(text, 32);
        }

        function summarizeDomesticFee(value) {
          const text = cleanFactText(value);
          if (!text) return "\u8D44\u6599\u5F85\u6838\u5BF9";
          if (/公开资料参考/.test(text)) {
            const amount = text.match(/约\\s*[\\d.]+(?:-[\\d.]+)?\\s*万元\\s*\\/\\s*年/)?.[0];
            if (amount) {
              if (/专科|高职/.test(text)) return "同类专科/高职：" + amount;
              if (/国内全程|校际合作/.test(text)) return "国内全程/合作项目：" + amount;
              return "同类本科项目：" + amount;
            }
          }
          const tuition = text.match(/学费\\s*[^，,；;。)]*/)?.[0];
          const dorm = text.match(/住(?:宿|宿费)\\s*[^，,；;。)]*/)?.[0];
          const parts = [tuition, dorm].filter(Boolean);
          return parts.length ? compact(parts.join("\uFF1B"), 44) : compact(text, 38);
        }

        function summarizeKoreaFee(value) {
          const text = cleanFactText(value);
          if (!text) return "\u8D44\u6599\u5F85\u6838\u5BF9";
          if (/公开资料参考/.test(text)) {
            if (/国立约\\s*[\\d.]+(?:-[\\d.]+)?\\s*万元\\s*\\/\\s*年.*私立约\\s*[\\d.]+(?:-[\\d.]+)?\\s*万元\\s*\\/\\s*年/.test(text)) {
              const national = text.match(/国立约\\s*[\\d.]+(?:-[\\d.]+)?\\s*万元\\s*\\/\\s*年/)?.[0];
              const priv = text.match(/私立约\\s*[\\d.]+(?:-[\\d.]+)?\\s*万元\\s*\\/\\s*年/)?.[0];
              return compact([national, priv].filter(Boolean).join("\uFF1B"), 42);
            }
            const amount = text.match(/约\\s*[\\d.]+(?:-[\\d.]+)?\\s*万元\\s*\\/\\s*年/)?.[0];
            if (amount) {
              if (/国立|公立/.test(text)) return "韩方国立/公立：" + amount;
              if (/私立/.test(text)) return "韩方私立：" + amount;
              return "韩方参考学费：" + amount;
            }
          }
          const amounts = [...text.matchAll(/(?:约|为)?[\\d.]+(?:-[\\d.]+)?\\s*万?元\\s*\\/\\s*(?:学期|年)/g)].map((match) => match[0]);
          if (amounts.length) {
            const prefix = /文史|人文|理工|艺术/.test(text) ? "\u6309\u4E13\u4E1A\u533A\u5206\uFF1A" : "\u53C2\u8003\u5B66\u8D39\uFF1A";
            return compact(prefix + amounts.slice(0, 2).join("\u3001"), 42);
          }
          if (/奖学金|减免|勤工/.test(text)) return "\u5B66\u8D39\u4EE5\u5B98\u65B9\u4E3A\u51C6\uFF1B\u53EF\u5173\u6CE8\u5956\u5B66\u91D1";
          return compact(text, 38);
        }

        function summarizeRequirements(value) {
          const text = cleanFactText(value);
          if (!text) return "\u8D44\u6599\u5F85\u6838\u5BF9";
          const parts = [];
          if (/高中毕业生|同等学力/.test(text)) parts.push("\u9AD8\u4E2D/\u540C\u7B49\u5B66\u529B");
          if (/专科毕业生|三年制专科/.test(text)) parts.push("\u4E13\u79D1\u6BD5\u4E1A");
          if (/高考成绩/.test(text)) parts.push("\u9AD8\u8003\u8FBE\u6807");
          if (/面试|笔试|能力测试/.test(text)) parts.push("\u6821\u8003/\u9762\u8BD5");
          const topik = text.match(/TOPIK\\s*\\d\\s*级/);
          if (topik) parts.push("\u8D74\u97E9\u524D" + topik[0].replace(/\\s+/g, " "));
          return parts.length ? parts.slice(0, 4).join("\uFF1B") : compact(text, 40);
        }

        function summarizeCertificate(value) {
          const text = cleanFactText(value);
          if (!text) return "\u8D44\u6599\u5F85\u6838\u5BF9";
          if (/学士学位证/.test(text) && /中留服认证|留学服务中心|认证/.test(text)) return "\u97E9\u65B9\u5B66\u58EB\u5B66\u4F4D\uFF1B\u53EF\u529E\u4E2D\u7559\u670D\u8BA4\u8BC1";
          if (!/学士学位证/.test(text) && /毕业证|学位证/.test(text) && /韩国/.test(text)) return "\u4E2D\u65B9\u6BD5\u4E1A/\u5B66\u4F4D\uFF1B\u97E9\u65B9\u8BC1\u4E66\u770B\u8BFE\u7A0B";
          if (/中留服认证|留学服务中心|认证/.test(text)) return "\u53EF\u529E\u4E2D\u7559\u670D\u8BA4\u8BC1";
          return compact(text, 38);
        }

        function summarizeFact(label, value) {
          if (label === "\u4E13\u4E1A\u8BBE\u7F6E") return summarizeMajor(value);
          if (label === "\u57F9\u517B\u6A21\u5F0F") return summarizeMode(value);
          if (label === "\u56FD\u5185\u8D39\u7528") return summarizeDomesticFee(value);
          if (label === "\u97E9\u65B9\u8D39\u7528") return summarizeKoreaFee(value);
          if (label === "\u7533\u8BF7\u6761\u4EF6") return summarizeRequirements(value);
          if (label === "\u8BC1\u4E66\u8BF4\u660E") return summarizeCertificate(value);
          return compact(cleanFactText(value), 42);
        }

        function formatPercent(value) {
          const number = Number(value || 0);
          return number.toFixed(number % 1 === 0 ? 0 : 1) + "%";
        }

        function formatAverageGpa(value) {
          return typeof value === "number" ? value.toFixed(1) + "/100" : "暂无";
        }

        function topSignal(items) {
          const mostCommon = [...(items || [])].sort((a, b) => b.count - a.count)[0];
          return mostCommon ? mostCommon.label + " " + formatPercent(mostCommon.percent) : "暂无";
        }

        function miniChartLabel(title, label) {
          const text = String(label || "");
          if (title === "TOPIK\u5206\u5E03") return text.replace(/^TOPIK\\s*/, "");
          return text;
        }

        function isKnownChartItem(label) {
          return !/(未提供|未注明|暂无|unknown)/i.test(String(label || ""));
        }

        function highlightItemKey(items) {
          return [...(items || [])]
            .filter((item) => isKnownChartItem(item.label))
            .sort((a, b) => b.count - a.count || b.percent - a.percent)[0]?.key;
        }

        function resultStackColor(label) {
          if (label === "录取") return caseHighlightColor;
          if (label === "拒绝") return "#fffefb";
          if (label === "混合") return "#ffd0d8";
          return "#eeeae0";
        }

        function renderBars(title, items) {
          const highlightedKey = highlightItemKey(items);
          return '<section class="case-chart"><div class="case-chart-head"><h3>' + htmlEscape(title) + '</h3><span>↗</span></div><div class="case-bars">' + (items || []).slice(0, 6).map((item) => {
            const width = Math.max(item.percent, item.count > 0 ? 4 : 0);
            const color = item.key === highlightedKey ? caseHighlightColor : caseBarColor;
            return '<div class="case-bar-row"><div class="case-bar-meta"><strong>' + htmlEscape(miniChartLabel(title, item.label)) + '</strong><span>' + item.count + ' / ' + formatPercent(item.percent) + '</span></div><div class="case-bar-track"><span style="width:' + width + '%;background:' + color + '"></span></div></div>';
          }).join("") + '</div></section>';
        }

        function renderResultStack(items) {
          return '<div class="case-field case-result-field"><span>申请结果</span><div class="case-result-stack">' + (items || []).map((item) => {
            const label = item.percent >= 12 ? htmlEscape(item.label) + ' ' + item.count : "";
            return '<span style="flex-basis:' + item.percent + '%;background:' + resultStackColor(item.label) + '">' + label + '</span>';
          }).join("") + '</div></div>';
        }

        function renderAdmissionCase(admissionCase) {
          const tone = admissionCase.resultKey === "admitted" ? "case-admitted" : admissionCase.resultKey === "rejected" ? "case-rejected" : "case-mixed";
          return '<li class="case-snapshot"><div><span class="' + tone + '">' + htmlEscape(admissionCase.result) + '</span><span>' + htmlEscape(admissionCase.entryYear) + '</span><span>' + htmlEscape(admissionCase.topik) + '</span></div><strong>' + htmlEscape(admissionCase.major) + '</strong><p>' + htmlEscape(admissionCase.highSchoolType) + ' / ' + htmlEscape(admissionCase.gpa) + ' / ' + htmlEscape(compact(admissionCase.coreStrength, 48)) + '</p></li>';
        }

        function hasBrokenText(value) {
          return /\\?{2,}/.test(String(value || ""));
        }

        function profileIntroFallback(name, city, founded, type, focus) {
          const unknownFounded = "\u8d44\u6599\u5f85\u6838\u5bf9";
          const genericFocus = "\u5408\u4f5c\u9879\u76ee\u76f8\u5173\u4e13\u4e1a";
          const foundedPhrase = founded === unknownFounded
            ? "\u6210\u7acb\u65f6\u95f4\u4ee5\u5b66\u6821\u5b98\u65b9\u6700\u65b0\u62ab\u9732\u4e3a\u51c6"
            : "\u6210\u7acb\u65f6\u95f4\u4e3a" + founded;
          const focusPhrase = focus === genericFocus
            ? "\u5408\u4f5c\u9879\u76ee\u76f8\u5173\u4e13\u4e1a\u65b9\u5411"
            : focus + "\u65b9\u5411";
          return name + "\u4f4d\u4e8e" + city + "\uff0c" + foundedPhrase + "\uff0c\u662f\u4e00\u6240" + type + "\u9662\u6821\u3002\u8be5\u6821\u5728\u672c\u9879\u76ee\u5e93\u4e2d\u4e3b\u8981\u7528\u4e8e" + focusPhrase + "\u7684\u5339\u914d\u53c2\u8003\uff0c\u5efa\u8bae\u7ed3\u5408\u9879\u76ee\u6a21\u5f0f\u3001\u97e9\u8bed\u8981\u6c42\u3001\u5b66\u8d39\u4e0e\u6240\u5728\u57ce\u5e02\u751f\u6d3b\u6210\u672c\u4e00\u8d77\u5224\u65ad\u662f\u5426\u9002\u5408\u7533\u8bf7\u3002";
        }

        function schoolProfile(partner) {
          const name = partner.displayName || partner.name || "\u97e9\u56fd\u5927\u5b66";
          const city = partner.city || "\u97e9\u56fd";
          const type = partner.type || (partner.known ? "\u97e9\u56fd\u9ad8\u6821" : "\u8d44\u6599\u5f85\u6838\u5bf9");
          const focus = partner.focus || "\u5408\u4f5c\u9879\u76ee\u76f8\u5173\u4e13\u4e1a";
          const totalStudents = partner.totalStudents || "\u8d44\u6599\u5f85\u6838\u5bf9";
          const foreignStudents = partner.foreignStudents || "\u8d44\u6599\u5f85\u6838\u5bf9";
          const founded = partner.founded || "\u8d44\u6599\u5f85\u6838\u5bf9";
          const fallbackIntro = profileIntroFallback(name, city, founded, type, focus);
          const intro = partner.intro && !hasBrokenText(partner.intro) ? partner.intro : fallbackIntro;
          return {
            name,
            nameKr: partner.nameKr || "",
            nameEn: partner.nameEn || "",
            city,
            type,
            tier: partner.tier || "T4",
            focus,
            totalStudents,
            foreignStudents,
            founded,
            intro,
            campusImage: partner.campusImage || "",
            imagePosition: partner.imagePosition || "center",
            officialUrl: partner.officialUrl || "",
            sourceUrl: partner.sourceUrl || "",
            logoImage: partner.logoImage || "",
          };
        }

        function renderUniversityPanel(partner) {
          const profile = schoolProfile(partner);
          const subtitle = [profile.nameKr, profile.nameEn].filter(Boolean).join(" \u00b7 ");
          const campusMedia = profile.campusImage
            ? '<img class="profile-campus-image" src="' + htmlEscape(profile.campusImage) + '" alt="' + htmlEscape(profile.name) + '\u6821\u56ed\u56fe\u7247" loading="lazy" style="object-position:' + htmlEscape(profile.imagePosition) + '">'
            : '<span>\u6821\u56ed\u56fe\u7247\u5f85\u6838\u5bf9</span>';
          const officialTarget = profile.officialUrl || profile.sourceUrl || "";
          const officialLogo = profile.logoImage
            ? '<img class="profile-logo-image" src="' + htmlEscape(profile.logoImage) + '" alt="' + htmlEscape(profile.name) + '\u5b66\u6821\u6807\u5fd7" loading="lazy">'
            : '<span class="profile-website-pending">\u5b98\u7f51\u5f85\u6838\u5bf9</span>';
          const officialCell = officialTarget
            ? '<a class="' + (profile.logoImage ? 'profile-logo-link' : 'profile-website-link') + '" href="' + htmlEscape(officialTarget) + '" target="_blank" rel="noopener">' + officialLogo + '</a>'
            : officialLogo;
          return '<section class="school-profile" aria-label="' + htmlEscape(profile.name) + '\u5b66\u6821\u4ecb\u7ecd">' +
            '<div class="profile-campus">' + campusMedia + '</div>' +
            '<div class="profile-facts">' +
            '<div class="profile-heading"><h2>' + htmlEscape(profile.name) + '</h2>' + (subtitle ? '<small>' + htmlEscape(subtitle) + '</small>' : '') + '</div>' +
            '<div class="profile-info-grid">' +
            '<div class="profile-info-row"><span>\u5b66\u6821\u7c7b\u578b</span><strong>' + htmlEscape(profile.type) + '</strong></div>' +
            '<div class="profile-info-row"><span>\u5730\u7406\u4f4d\u7f6e</span><strong>' + htmlEscape(profile.city) + '</strong></div>' +
            '<div class="profile-info-row"><span>\u6210\u7acb\u65f6\u95f4</span><strong>' + htmlEscape(profile.founded) + '</strong></div>' +
            '<div class="profile-info-row"><span>\u5b66\u751f\u6570</span><strong>' + htmlEscape(profile.totalStudents) + '<br><small>\u5916\u56fd\u4eba ' + htmlEscape(profile.foreignStudents) + '</small></strong></div>' +
            '<div class="profile-info-row profile-tier-row"><span>\u53c2\u8003\u5c42\u7ea7</span><strong>' + htmlEscape(profile.tier) + '</strong></div>' +
            '<div class="profile-info-row profile-logo-row"><span>\u5b66\u6821\u5b98\u7f51</span><strong class="profile-logo-cell">' + officialCell + '</strong></div>' +
            '</div></div>' +
            '<div class="profile-intro">' +
            '<div class="profile-heading"><h2>' + htmlEscape(profile.name) + '\u4ecb\u7ecd</h2></div>' +
            '<div class="profile-intro-body"><p>' + htmlEscape(profile.intro) + '</p><p><strong>\u91cd\u70b9\u65b9\u5411\uff1a</strong>' + htmlEscape(profile.focus) + '</p><p class="profile-note">\u5b66\u6821\u7b80\u4ecb\u7528\u4e8e\u5feb\u901f\u4e86\u89e3\u5408\u4f5c\u9662\u6821\uff0c\u7533\u8bf7\u5224\u65ad\u4ecd\u9700\u7ed3\u5408\u5b98\u65b9\u62db\u751f\u7b80\u7ae0\u3001\u9879\u76ee\u5408\u540c\u548c\u6700\u65b0\u8d39\u7528\u8bf4\u660e\u3002</p></div>' +
            '</div>' +
            '</section>';
        }

        function renderRow(program) {
          const tr = document.createElement("tr");
          const partnerSearch = (program.koreaPartners || []).map((partner) => [partner.raw, partner.displayName, partner.displayLabel, partner.tier].join(" ")).join(" ");
          tr.className = "program-row";
          tr.dataset.slug = program.slug;
          tr.dataset.mode = program.mode;
          tr.dataset.region = program.region;
          tr.dataset.majors = program.majorTags.join(" ");
          tr.dataset.search = [program.chinaSchool, program.koreaSchools, partnerSearch, program.mode, program.region, program.section, program.majorTags.join(" "), Object.values(program.fields).join(" ")].join(" ").toLowerCase();
          tr.innerHTML =
            '<td data-label="中国学校"><button class="school-toggle" type="button" aria-expanded="false">' + htmlEscape(program.chinaSchool) + '<span class="school-toggle-arrow" aria-hidden="true">↗</span></button></td>' +
            '<td data-label="地区">' + htmlEscape(program.region) + '</td>' +
            '<td data-label="韩国合作学校">' + partnerMarkup(program.koreaPartners) + '</td>' +
            '<td data-label="模式"><span class="mode-badge">' + htmlEscape(program.mode) + '</span></td>' +
            '<td data-label="专业方向">' + tagMarkup(program.majorTags) + '</td>';
          return tr;
        }

        function renderPanel(program) {
          const partnerNames = (program.koreaPartners || [])
            .map((partner) => (partner.displayName || partner.raw || "\u97E9\u56FD\u5927\u5B66") + (partner.city ? " (" + partner.city + ")" : ""))
            .join(" ") || program.koreaSchools;
          const field = (name) => program.fields?.[name] || "";
          const sources = (program.sources || []).length
            ? '<div class="source-list">' + program.sources.map((source) => '<a class="source-link" href="' + htmlEscape(source.url) + '" target="_blank" rel="noreferrer">\u6765\u6E90 ' + htmlEscape(source.id) + '</a>').join("") + '</div>'
            : '<div class="source-list"><span class="source-link">\u6765\u6E90\u5F85\u8865\u5145</span></div>';
          const sourceNote = '<p class="source-note">\u8D39\u7528\u4E3A\u7F51\u7EDC\u516C\u5F00\u4FE1\u606F\u6574\u7406\uFF0C\u4EC5\u4F9B\u53C2\u8003\uFF1B\u5177\u4F53\u6536\u8D39\u6807\u51C6\u3001\u7F34\u8D39\u65F6\u95F4\u53CA\u5956\u5B66\u91D1/\u51CF\u514D\u89C4\u5219\uFF0C\u8BF7\u4EE5\u5B66\u6821\u6700\u65B0\u5B98\u65B9\u89C4\u5B9A\u4E3A\u51C6\u3002</p>';
          return '<section class="program-panel" aria-label="' + htmlEscape(program.chinaSchool) + ' \u9879\u76EE\u8BE6\u60C5">' +
            '<div class="panel-block"><h2>' + htmlEscape(program.chinaSchool) + ' \u2192 ' + htmlEscape(partnerNames) + '</h2>' +
            '<div class="fact-grid">' +
            '<div class="fact"><span>\u4E13\u4E1A\u8BBE\u7F6E</span><p>' + htmlEscape(summarizeFact("\u4E13\u4E1A\u8BBE\u7F6E", field("\u4E13\u4E1A\u8BBE\u7F6E"))) + '</p></div>' +
            '<div class="fact"><span>\u57F9\u517B\u6A21\u5F0F</span><p>' + htmlEscape(summarizeFact("\u57F9\u517B\u6A21\u5F0F", program.modeTitle || program.mode)) + '</p></div>' +
            '<div class="fact"><span>\u56FD\u5185\u8D39\u7528</span><p>' + htmlEscape(summarizeFact("\u56FD\u5185\u8D39\u7528", field("\u56FD\u5185\u8D39\u7528"))) + '</p></div>' +
            '<div class="fact"><span>\u97E9\u65B9\u8D39\u7528</span><p>' + htmlEscape(summarizeFact("\u97E9\u65B9\u8D39\u7528", field("\u97E9\u65B9\u8D39\u7528"))) + '</p></div>' +
            '</div></div>' +
            '<div class="panel-block"><h2>\u7533\u8BF7\u4E0E\u8BC1\u4E66</h2>' +
            '<div class="fact-grid">' +
            '<div class="fact"><span>\u7533\u8BF7\u6761\u4EF6</span><p>' + htmlEscape(summarizeFact("\u7533\u8BF7\u6761\u4EF6", field("\u7533\u8BF7\u6761\u4EF6"))) + '</p></div>' +
            '<div class="fact"><span>\u8BC1\u4E66\u8BF4\u660E</span><p>' + htmlEscape(summarizeFact("\u8BC1\u4E66\u8BF4\u660E", field("\u8BC1\u4E66\u8BF4\u660E"))) + '</p></div>' +
            '</div>' + sources + sourceNote + '</div>' +
            '</section>';
        }

        function clearDetail() {
          if (detailRow) detailRow.remove();
          detailRow = null;
          expandedSlug = null;
          tbody.querySelectorAll(".school-toggle").forEach((button) => button.setAttribute("aria-expanded", "false"));
          tbody.querySelectorAll(".partner-school-link").forEach((button) => button.setAttribute("aria-expanded", "false"));
        }

        function toggleDetail(row, program) {
          const key = "program:" + program.slug;
          if (expandedSlug === key) {
            clearDetail();
            return;
          }
          clearDetail();
          expandedSlug = key;
          row.querySelector(".school-toggle")?.setAttribute("aria-expanded", "true");
          detailRow = document.createElement("tr");
          detailRow.className = "detail-row";
          detailRow.innerHTML = '<td colspan="5">' + renderPanel(program) + '</td>';
          row.after(detailRow);
        }

        function togglePartnerDetail(row, partner, button) {
          const key = "partner:" + partner.slug + ":" + row.dataset.slug;
          if (expandedSlug === key) {
            clearDetail();
            return;
          }
          clearDetail();
          expandedSlug = key;
          button.setAttribute("aria-expanded", "true");
          detailRow = document.createElement("tr");
          detailRow.className = "detail-row";
          detailRow.innerHTML = '<td colspan="5">' + renderUniversityPanel(partner) + '</td>';
          row.after(detailRow);
        }

        function hasActiveFilters() {
          return activeFilters.regions.size > 0 || activeFilters.modes.size > 0 || activeFilters.majors.size > 0;
        }

        function matchesFilter(program) {
          if (!hasActiveFilters()) return true;
          if (activeFilters.regions.size > 0 && !activeFilters.regions.has(program.region)) return false;
          if (activeFilters.modes.size > 0 && !activeFilters.modes.has(program.mode)) return false;
          if (activeFilters.majors.size > 0) {
            const matchesMajor = program.majorTags.some((tag) => activeFilters.majors.has(tag));
            if (!matchesMajor) return false;
          }
          return true;
        }

        function updateFilterButtons() {
          buttons.forEach((button) => {
            const filter = button.dataset.filter || "all";
            const [kind, value] = filter.split(":");
            const isPressed =
              filter === "all"
                ? !hasActiveFilters()
                : (kind === "region" && activeFilters.regions.has(value)) ||
                  (kind === "mode" && activeFilters.modes.has(value)) ||
                  (kind === "major" && activeFilters.majors.has(value));
            button.setAttribute("aria-pressed", String(isPressed));
          });
        }

        function toggleFilter(filter) {
          if (filter === "all") {
            activeFilters.regions.clear();
            activeFilters.modes.clear();
            activeFilters.majors.clear();
            return;
          }
          const [kind, value] = filter.split(":");
          const target =
            kind === "region" ? activeFilters.regions : kind === "mode" ? activeFilters.modes : kind === "major" ? activeFilters.majors : null;
          if (!target) return;
          target.has(value) ? target.delete(value) : target.add(value);
        }

        function normalizeSearchText(value) {
          return String(value || "").trim().toLocaleLowerCase();
        }

        function matchesSearch(row) {
          const query = normalizeSearchText(searchInput?.value);
          if (!query) return true;
          return normalizeSearchText(row.dataset.search).includes(query);
        }

        const rows = programs.map((program) => {
          const row = renderRow(program);
          row.querySelector(".school-toggle").addEventListener("click", () => toggleDetail(row, program));
          row.querySelectorAll(".partner-school-link").forEach((button) => {
            button.addEventListener("click", () => {
              const partner = program.koreaPartners.find((item) => item.slug === button.dataset.schoolSlug) || {
                slug: button.dataset.schoolSlug,
                displayName: button.dataset.schoolName,
              };
              togglePartnerDetail(row, partner, button);
            });
          });
          tbody.appendChild(row);
          return { row, program };
        });

        function applyFilters() {
          clearDetail();
          updateFilterButtons();
          let visible = 0;
          for (const item of rows) {
            const show = matchesFilter(item.program) && matchesSearch(item.row);
            item.row.hidden = !show;
            if (show) visible += 1;
          }
          emptyState.hidden = visible !== 0;
        }

        buttons.forEach((button) => {
          button.addEventListener("click", () => {
            toggleFilter(button.dataset.filter || "all");
            applyFilters();
          });
        });

        searchInput?.addEventListener("input", applyFilters);

        applyFilters();
      })();
    </script>
  </body>
</html>
`;

fs.writeFileSync(outputPath, html, "utf8");
console.log(`Wrote ${projects.length} x+x projects to ${outputPath}`);
