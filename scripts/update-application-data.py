from __future__ import annotations

import json
import re
import subprocess
from collections import OrderedDict
from pathlib import Path
from typing import Any

from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
PRIMARY_XLSX_DIR = ROOT / "outputs" / "official_site_expansion_20260617"
ADDITIONAL_XLSX_DIR = ROOT / "outputs" / "additional_korea_programs_20260617"
HTML_TARGETS = [ROOT / "application.html", ROOT / "public" / "application.html"]
KRW_TO_CNY = 0.00447

KOREAN_TEXT_REPLACEMENTS = OrderedDict(
    [
        ("미디어커뮤니케이션", "媒体传播"),
        ("예술디자인", "艺术设计"),
        ("경제경영", "经济经营"),
        ("국제종합관리비", "国际综合管理费"),
        ("입학전형료", "入学选拔费"),
        ("국제예과", "国际预科"),
        ("중외협력", "中外合作"),
        ("생물공정", "生物工程"),
        ("건국대", "建国大学"),
        ("중앙대", "中央大学"),
        ("대구대", "大邱大学"),
        ("고려대", "高丽大学"),
        ("세종캠퍼스", "世宗校区"),
        ("학교공식", "学校官方"),
        ("학교별", "按学校"),
        ("대학별", "按大学"),
        ("유학서비스", "留学服务"),
        ("명문대", "名校"),
        ("미표기", "未标明"),
        ("자체선발", "自主选拔"),
        ("진학형", "升学型"),
        ("특별전형", "特别招生"),
        ("추천권", "推荐名额"),
        ("장학생", "奖学生"),
        ("등록금", "学费"),
        ("장학금", "奖学金"),
        ("학비", "学费"),
        ("유학생", "留学生"),
        ("외국인", "外国人"),
        ("학부", "本科"),
        ("신입", "新生"),
        ("정규", "正规"),
        ("석사", "硕士"),
        ("연계", "衔接"),
        ("공동", "共同"),
        ("양성", "培养"),
        ("지원", "申请"),
        ("추천", "推荐"),
        ("해당", "相关"),
        ("통과", "通过"),
        ("모집", "招生"),
        ("단계", "阶段"),
        ("관리", "管理"),
        ("기준", "标准"),
        ("납부", "缴纳"),
        ("선택", "可选"),
        ("교류", "交流"),
        ("편입", "插班"),
        ("운영", "运行"),
        ("중심", "为主"),
        ("또는", "或"),
        ("공식", "官方"),
        ("추정", "估算"),
        ("혼합", "混合"),
        ("포함", "含"),
        ("유지", "保留"),
        ("추가", "新增"),
        ("상이", "不同"),
        ("전공", "专业"),
        ("예과", "预科"),
        ("별도", "另行"),
        ("필요", "需要"),
        ("확인필요", "需确认"),
        ("확인", "确认"),
        ("참고", "参考"),
        ("없음", "无"),
        ("개월", "个月"),
        ("학기", "学期"),
        ("학년", "学年"),
        ("영어", "英语"),
        ("경영", "经营"),
        ("공학", "工学"),
        ("미디어", "媒体"),
        ("예술", "艺术"),
        ("대학", "大学"),
        ("으로 명시", "明确为"),
        ("항공서비스", "航空服务"),
        ("항공물류", "航空物流"),
        ("자동차전자", "汽车电子"),
        ("한국어", "韩国语"),
        ("韩国어", "韩国语"),
        ("언어강화", "语言强化"),
        ("언어", "语言"),
        ("공공기초과정", "公共基础课程"),
        ("교양과정", "通识课程"),
        ("전문과정", "专业课程"),
        ("학위과정", "学位课程"),
        ("국제본과", "国际本科"),
        ("국제本科", "国际本科"),
        ("중한", "中韩"),
        ("국제반", "国际班"),
        ("본과선", "本科线"),
        ("고려대", "高丽大学"),
        ("고대", "高丽大学"),
        ("전북대", "全北大学"),
        ("연세", "延世"),
        ("성균관", "成均馆"),
        ("한양", "汉阳"),
        ("교내시험으로", "通过校内考试"),
        ("교내시험", "校内考试"),
        ("자율입학시험", "自主入学考试"),
        ("성적표", "成绩单"),
        ("신청비", "申请费"),
        ("유학서비스비", "留学服务费"),
        ("교재", "教材"),
        ("금융", "金融"),
        ("물류", "物流"),
        ("미용", "美容"),
        ("문화", "文化"),
        ("디자인", "设计"),
        ("성인", "成人"),
        ("사이트", "网站"),
        ("센터", "中心"),
        ("인증", "认证"),
        ("상위권", "较高层次"),
        ("명문정향반", "名校定向班"),
        ("명문특", "名校特色"),
        ("협력교는", "合作院校"),
        ("중국어", "中文"),
        ("직고", "职高"),
        ("기교", "技校"),
        ("고교", "高中"),
        ("재학생", "在校生"),
        ("졸업생", "毕业生"),
        ("예정자", "预定者"),
        ("학생까지", "学生也"),
        ("함해", "包括"),
        ("含해", "包括"),
        ("자료는", "资料为"),
        ("조합과", "组合"),
        ("페이지는", "页面"),
        ("한국대", "韩国大学"),
        ("신청형", "申请型"),
        ("에도 있었으나", "中也存在，但"),
        ("계획으로", "计划"),
        ("진학", "升学"),
        ("직행이", "直升"),
        ("아니라", "不是"),
        ("수료", "结业"),
        ("제출", "提交"),
        ("면접", "面试"),
        ("대상", "对象"),
        ("평가", "评价"),
        ("선발", "选拔"),
        ("목표", "目标"),
        ("명시", "标明"),
        ("충족", "满足"),
        ("입학", "入学"),
        ("가능성", "可能性"),
        ("가능", "可"),
        ("수업", "授课"),
        ("요구", "要求"),
        ("낮음", "较低"),
        ("일부", "部分"),
        ("등록", "注册"),
        ("해외", "海外"),
        ("완료", "完成"),
        ("출석", "出勤"),
        ("평균", "平均"),
        ("경로가", "路径"),
        ("경로", "路径"),
        ("구조", "结构"),
        ("구체", "具体"),
        ("조건별", "按条件"),
        ("파트너는", "合作方为"),
        ("이상", "以上"),
        ("학생", "学生"),
        ("이수", "修完"),
        ("표가", "表"),
        ("표와", "表"),
        ("세부", "具体"),
        ("이미지형", "图片型"),
        ("이미지", "图片"),
        ("시간", "时间"),
        ("요강", "简章"),
        ("결업생", "结业生"),
        ("보유", "持有"),
        ("예정", "预定"),
        ("제목", "标题"),
        ("기초", "基础"),
        ("교육", "教育"),
        ("교内语学院时험", "校内语言考试"),
        ("校内语学院时试", "校内语言考试"),
        ("험", "试"),
        ("진입", "进入"),
        ("과정", "课程"),
        ("관련", "相关"),
        ("국공립", "国公立"),
        ("국公立", "国公立"),
        ("국립", "国立"),
        ("일반", "一般"),
        ("메인", "主页"),
        ("대응", "对应"),
        ("本科선", "本科线"),
        ("학업성적", "学业成绩"),
        ("대1", "大一"),
        ("학위", "学位"),
        ("专业으로", "专业"),
        ("성인교육", "成人教育"),
        ("중专", "中专"),
        ("유학", "留学"),
        ("달리", "不同"),
        ("韩国대", "韩国大学"),
        ("직录", "直录"),
        ("협력", "合作"),
        ("여개", "余所"),
        ("구분", "区分"),
        ("대비", "准备"),
        ("완료", "完成"),
        ("졸업", "毕业"),
        ("후", "后"),
        ("반", "班"),
        ("등", "等"),
        ("및", "及"),
        ("내", "内"),
        ("형", "型"),
        ("비", "费"),
        ("표", "表"),
        ("어", "语"),
        ("원", "元"),
        ("선", "线"),
        ("연", "年"),
        ("직", "直"),
        ("대", "大"),
        ("중", "中"),
        ("교", "校"),
        ("전", "前"),
        ("으로", ""),
        ("시", "时"),
        ("됨", "可"),
        ("는", ""),
        ("가", ""),
        ("의", "的"),
        ("자", "者"),
        ("은 ", "为 "),
        ("에 ", "在 "),
    ]
)

VOCATIONAL_MARKERS = (
    "专科",
    "高职",
    "전문대",
    "고직",
    "高等专科",
    "职业学院",
    "职院",
    "专科部",
)

SUPPLEMENT_SCHOOL_NAMES = {
    "四川大学",
    "电子科技大学",
    "西南大学",
    "华南理工大学",
    "山东大学",
    "广州华立学院",
    "济南大学",
    "四川外国语大学",
    "山东理工大学",
    "西安外国语大学",
    "北京外国语大学",
    "南昌大学",
    "中国地质大学（武汉）",
}

REGION_BY_PROVINCE = {
    "北京": "华北",
    "天津": "华北",
    "河北": "华北",
    "山西": "华北",
    "内蒙古": "华北",
    "辽宁": "东北",
    "吉林": "东北",
    "黑龙江": "东北",
    "上海": "华东",
    "江苏": "华东",
    "浙江": "华东",
    "安徽": "华东",
    "福建": "华东",
    "江西": "华东",
    "山东": "华东",
    "河南": "华中",
    "湖北": "华中",
    "湖南": "华中",
    "广东": "华南",
    "广西": "华南",
    "海南": "华南",
    "重庆": "西南",
    "四川": "西南",
    "贵州": "西南",
    "云南": "西南",
    "西藏": "西南",
    "陕西": "西北",
    "甘肃": "西北",
    "青海": "西北",
    "宁夏": "西北",
    "新疆": "西北",
    "西安": "西北",
    "南昌": "华东",
    "武汉": "华中",
    "中国地质大学（武汉）": "华中",
    "电子科技大学": "西南",
    "西南大学": "西南",
    "华南理工大学": "华南",
    "济南": "华东",
}

MAJOR_TAG_PATTERNS = [
    ("传媒/影视", r"传媒|媒体|影视|电影|影像|广播|播音|编导|戏剧|新媒体|传播|音乐|舞蹈|表演"),
    ("艺术/设计", r"艺术|设计|美术|动画|动漫|视觉|珠宝|服装|美容|美妆|舞蹈|音乐"),
    ("商科/经管", r"经济|经营|经管|管理|贸易|金融|工商|市场|商务|会计|财经|物流"),
    ("计算机/AI", r"计算机|软件|人工智能|AI|IT|数据|游戏|多媒体|信息"),
    ("工科/理工", r"工科|工程|机械|电气|电子|汽车|材料|理工|制造|通信|土木"),
    ("语言/教育", r"韩语|朝鲜语|语言|英语|教育|学前|汉语|文学|师范"),
    ("酒店/旅游", r"酒店|旅游|航空|空乘|乘务"),
    ("医学/护理", r"医学|护理|药|康复|医疗"),
    ("体育/社科", r"体育|社会|心理|政治|跆拳道"),
    ("自然科学/生命", r"生物|生命|自然|食品|农|理科"),
]

KOREA_NAME_ALIASES = {
    "高丽": "高丽大学",
    "延世": "延世大学",
    "成均馆": "成均馆大学",
    "汉阳": "汉阳大学",
    "庆熙": "庆熙大学",
    "中央": "中央大学",
    "建国": "建国大学",
    "弘益": "弘益大学",
    "国民": "国民大学",
    "世宗": "世宗大学",
    "釜山": "釜山大学",
    "全北": "全北大学",
    "又石": "又石大学",
    "又松": "又松大学",
    "首尔艺术": "首尔艺术大学",
    "东国": "东国大学",
}


def find_xlsx(folder: Path) -> Path:
    files = sorted(folder.glob("*.xlsx"))
    if not files:
        raise FileNotFoundError(f"No xlsx file found in {folder}")
    return files[0]


def extract_existing_programs() -> list[dict[str, Any]]:
    html = (ROOT / "public" / "application.html").read_text(encoding="utf-8")
    match = re.search(r"const programs = (\[[\s\S]*?\]);\s*const caseSummaries", html)
    if not match:
        raise RuntimeError("Could not locate programs JSON in public/application.html")
    return json.loads(match.group(1))


def extract_legacy_programs() -> list[dict[str, Any]]:
    try:
        result = subprocess.run(
            ["git", "show", "HEAD:public/application.html"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
    except Exception:
        return []
    match = re.search(r"const programs = (\[[\s\S]*?\]);\s*const caseSummaries", result.stdout)
    return json.loads(match.group(1)) if match else []


def normalize(value: Any) -> str:
    return re.sub(r"[\s　·•、,，;；（）()【】\[\]韩国国立]", "", str(value or "")).lower()


def translate_korean_fragments(text: str) -> str:
    for source, target in KOREAN_TEXT_REPLACEMENTS.items():
        text = text.replace(source, target)
    return text


def format_cny_from_krw(amount: float) -> str:
    rounded = int(round((amount * KRW_TO_CNY) / 100) * 100)
    if rounded < 100:
        rounded = int(round(amount * KRW_TO_CNY))
    return f"{rounded:,}"


def convert_krw_to_cny(text: str) -> str:
    def replace_range(match: re.Match[str]) -> str:
        first = float(match.group("first").replace(",", ""))
        second_raw = match.groupdict().get("second")
        period = match.groupdict().get("period") or ""
        first_cny = format_cny_from_krw(first)
        if second_raw:
            second = float(second_raw.replace(",", ""))
            return f"约 {first_cny}~{format_cny_from_krw(second)} 元/{period}（按当前汇率估算）"
        suffix = f"/{period}" if period else ""
        return f"约 {first_cny} 元{suffix}（按当前汇率估算）"

    text = re.sub(
        r"(?P<first>\d[\d,]*)(?:\s*[~～-]\s*(?P<second>\d[\d,]*))?\s*韩元\s*/\s*(?P<period>学期|学年|年|月)",
        replace_range,
        text,
    )
    text = re.sub(r"(?P<first>\d[\d,]*)\s*韩元", replace_range, text)
    text = re.sub(
        r"（按当前汇率估算）\s*[;；]\s*约\s*[\d,]+(?:[~～-][\d,]+)?\s*元/(?:学期|学年|年|月)\s*估算",
        "（按当前汇率估算）",
        text,
    )
    return text.replace("（按当前汇率估算） 估算", "（按当前汇率估算）")


def compact_text(value: Any) -> str:
    text = str(value or "").strip()
    text = text.replace("RMB", "元").replace("KRW", "韩元").replace("USD", "美元")
    replacements = {
        "专科/高职": "职业类",
        "同类专科": "同类职业类",
        "高职": "职业类",
        "专科": "职业类",
        "전문대/본과": "本科及其他学历",
        "전문대": "其他学历",
        "고직": "职业类",
        "추정": "估算",
        "공식": "官方",
        "혼합": "混合",
        "한국": "韩国",
        "중국": "中国",
        "국내": "国内",
        "본과": "本科",
        "학부": "本科",
        "예비": "预备",
        "직통": "直通",
        "어학": "语学院",
        "고졸": "高中毕业",
        "고2": "高二",
        "고3": "高三",
        "동등학력": "同等学历",
        "다수": "多所",
        "명시 없음": "未标明",
        "페이지": "页面",
        "학교": "学校",
        "합격": "合格",
        "방향": "方向",
        "고정": "固定",
        "아님": "不是",
        "기숙사": "住宿",
        "숙박": "住宿",
        "학적등록비": "学籍注册费",
        "교재비": "教材费",
        "학비": "学费",
        "신청": "申请",
        "해외서비스": "海外服务",
        "교재활동": "教材活动",
        "입시 없이 승급 설명": "无需另行参加韩国本科入学考试的升学说明",
        "대응 전공 진학": "对应专业升学",
        "문리": "文理",
        "예체능": "艺体",
        "관련 증명": "相关证明",
        "영어합격": "英语合格",
        "계획외 자율모집": "计划外自主招生",
        "학적 없음": "无中国学籍",
        "학적 등록": "注册学籍",
        "자료로 재확인 가능": "资料可复核",
        "자료": "资料",
        "공립": "公立",
        "사립": "私立",
        "으로 설명": "说明",
        "별도 제시됨": "另列",
        "기존": "原",
        "최신": "最新",
        "저성적/무TOPIK 학생 풀과 관련성이 큼": "与低成绩/无 TOPIK 学生群相关",
        "학년": "学年",
        "학기": "学期",
        "년": "年",
        "약": "约",
        "국내 단계 별도 확인 필요": "国内阶段费用待官方补充",
        "별도 收费标准 페이지 확인 필요": "需另查收费标准页",
        "한국 대학별 상이": "按韩国录取大学与专业执行",
        "한국 대학 공식 기준": "按韩国大学官方标准执行",
    }
    for source, target in replacements.items():
        text = text.replace(source, target)
    text = translate_korean_fragments(text)
    text = convert_krw_to_cny(text)
    return re.sub(r"\s+", " ", text)


def is_vocational(row: tuple[Any, ...]) -> bool:
    text = " ".join(str(item or "") for item in row)
    return any(marker in text for marker in VOCATIONAL_MARKERS)


def infer_region(china_school: str, fallback: str = "") -> str:
    if fallback:
        return fallback
    for prefix, region in sorted(REGION_BY_PROVINCE.items(), key=lambda item: len(item[0]), reverse=True):
        if china_school.startswith(prefix):
            return region
    return "待确认"


def infer_major_tags(*values: Any) -> list[str]:
    text = " ".join(str(value or "") for value in values)
    tags = [tag for tag, pattern in MAJOR_TAG_PATTERNS if re.search(pattern, text, re.I)]
    return tags or ["综合项目"]


def normalize_mode(mode_text: Any) -> str:
    text = str(mode_text or "")
    if "운영" in text or "国内运营" in text or "国内运行" in text or "选择" in text and "交流" in text:
        return "4+0"
    if "0.5/1" in text:
        return "0.5/1+4"
    ordered = ["0.5+0.5+4", "0.5+4.5", "0.5+4", "2.5+1.5", "2+1+1", "1+4", "3+2", "2+2", "3+1", "1+3", "4+0"]
    for mode in ordered:
        if mode in text:
            return mode
    return text.strip() or "待确认"


def mode_title(mode: str, detail: str = "") -> str:
    if detail:
        return compact_text(detail)
    labels = {
        "0.5+0.5+4": "0.5+0.5+4 模式（国内 0.5 年 + 韩国预科 0.5 年 + 韩国本科 4 年）",
        "0.5+4": "0.5+4 模式（国内约 0.5 年 + 韩国本科 4 年）",
        "0.5+4.5": "0.5+4.5 模式（国内 0.5 年 + 韩国语学院/本科约 4.5 年）",
        "0.5/1+4": "0.5/1+4 模式（国内 0.5 至 1 年预备 + 韩国本科阶段）",
        "2.5+1.5": "2.5+1.5 模式（国内 2.5 年 + 韩国 1.5 年）",
        "2+1+1": "2+1+1 模式（国内 2 年 + 韩国语言/专业 2 年）",
        "1+4": "1+4 模式（国内 1 年预备 + 韩国本科 4 年）",
        "1+3": "1+3 模式（国内 1 年 + 韩国 3 年）",
        "2+2": "2+2 模式（国内 2 年 + 韩国 2 年）",
        "3+1": "3+1 模式（国内 3 年 + 韩国 1 年）",
        "3+2": "3+2 模式（国内 3 年 + 韩国 2 年，本科衔接口径）",
        "4+0": "4+0 / 国内运行为主（可自愿申请韩国交流或插班）",
    }
    return labels.get(mode, mode)


def split_sources(*values: Any) -> list[dict[str, str]]:
    urls: OrderedDict[str, str] = OrderedDict()
    for value in values:
        for url in re.findall(r"https?://[^\s；;，,]+", str(value or "")):
            clean_url = url.rstrip(").]。")
            urls.setdefault(clean_url, clean_url)
    sources = []
    for index, url in enumerate(urls, start=1):
        sources.append({"id": "官方" if index == 1 else f"费用{index - 1}", "url": url})
    return sources


def build_profile_lookup(programs: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    lookup: dict[str, dict[str, Any]] = {}
    for program in programs:
        for partner in program.get("koreaPartners") or []:
            names = {
                partner.get("raw"),
                partner.get("displayName"),
                partner.get("displayLabel"),
                partner.get("nameKr"),
                partner.get("nameEn"),
            }
            for name in names:
                if name:
                    lookup[normalize(name)] = partner
    return lookup


def partner_profiles(korea_schools: str, lookup: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    profiles: list[dict[str, Any]] = []
    seen: set[str] = set()
    raw_parts = re.split(r"[;；、,，/]|等", korea_schools)
    for raw in raw_parts:
        name = raw.strip()
        if not name or "多数" in name or "多所" in name or "目标" in name or "具体" in name:
            continue
        if name.startswith("韩国"):
            name = name[2:]
        for alias, full_name in KOREA_NAME_ALIASES.items():
            if alias in name and full_name not in name:
                name = full_name
                break
        key = normalize(name)
        profile = lookup.get(key)
        if not profile:
            for lookup_key, candidate in lookup.items():
                if key and (key in lookup_key or lookup_key in key):
                    profile = candidate
                    break
        if profile and profile.get("slug") not in seen:
            profiles.append(profile)
            seen.add(str(profile.get("slug")))
    return profiles


def clean_korea_schools(value: Any) -> str:
    raw_value = str(value or "")
    text = compact_text(raw_value or "韩国合作大学")
    text = text.replace("건국대", "建国大学").replace("중앙대", "中央大学").replace("고려대", "高丽大学")
    text = text.replace("等", "等").replace("등", "等")
    text = text.replace(" 및 ", "、").replace("; ", "、").replace(";", "、")
    is_direction_note = "方向" in text and ("固定" in text or "不是" in text or "협력교" in raw_value)
    if is_direction_note and "建国大学" in text and "中央大学" in text:
        return "韩国建国大学、韩国中央大学（申请方向参考）"
    return text


def first_existing_base(row: tuple[Any, ...], existing: list[dict[str, Any]]) -> dict[str, Any] | None:
    original_no = row[0]
    china_key = normalize(row[2])
    if isinstance(original_no, int):
        for program in existing:
            if program.get("order") == original_no and normalize(program.get("chinaSchool")) == china_key:
                return program
    partner_key = normalize(row[6])
    for program in existing:
        if normalize(program.get("chinaSchool")) == china_key and (
            not partner_key or partner_key in normalize(program.get("koreaSchools")) or normalize(program.get("koreaSchools")) in partner_key
        ):
            return program
    for program in existing:
        if normalize(program.get("chinaSchool")) == china_key:
            return program
    return None


def strip_source_refs(value: Any) -> str:
    return re.sub(r"\[\d+\]", "", str(value or "")).strip()


def additional_entry_lookup(rows: list[tuple[Any, ...]]) -> dict[str, list[dict[str, str]]]:
    lookup: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        school = str(row[1] or "").strip()
        if not school:
            continue
        lookup.setdefault(normalize(school), []).append(
            {
                "mode": compact_text(row[3]),
                "stage": compact_text(row[4]),
                "entry": compact_text(row[7]),
                "note": compact_text(row[10]),
            }
        )
    return lookup


def pick_additional_info(china_school: str, mode: str, mode_detail: str, lookup: dict[str, list[dict[str, str]]]) -> dict[str, str]:
    candidates = lookup.get(normalize(china_school), [])
    if not candidates:
        return {}
    for candidate in candidates:
        raw_mode = candidate.get("mode", "")
        if mode in raw_mode or mode == normalize_mode(raw_mode) or mode in mode_detail:
            return candidate
    return candidates[0]


def detailed_requirement(
    row: tuple[Any, ...],
    legacy_base: dict[str, Any],
    mode: str,
    mode_detail: str,
    china_school: str,
    additional_info: dict[str, str],
) -> str:
    legacy_text = strip_source_refs((legacy_base.get("fields") or {}).get("申请条件"))
    if legacy_text and "官方招生简章" not in legacy_text:
        return compact_text(legacy_text)
    entry = additional_info.get("entry", "")
    if entry and "OCR需要" not in entry:
        return entry
    note = compact_text(row[18])
    if str(row[0] or "").isdigit() and int(row[0]) >= 1000 and note and "模式별" not in note:
        return note
    if mode == "4+0":
        return f"招生按{china_school}当年普通本科/中外合作办学招生章程执行；通常需达到该校合作专业录取线。赴韩交流或插班另看韩语、课程成绩和韩方录取。"
    if mode in {"0.5+4", "0.5+4.5", "0.5+0.5+4", "0.5/1+4", "1+4"}:
        return "面向高二结业、高三在读、高中毕业或同等学历学生；先完成国内韩语/预科课程，赴韩本科前需达到目标韩国大学的语言、成绩或校内考试要求。"
    if mode == "1+3":
        return "面向高中毕业或同等学历学生；国内1年完成语言与专业衔接课程后，按韩国合作大学录取、学分认定和语言要求进入后续本科阶段。"
    if mode == "2+2":
        return "面向高中毕业或同等学历学生；国内2年完成规定课程后，按韩国合作大学对应专业、课程成绩、韩语或校内测试要求进入后2年本科。"
    if mode == "3+1":
        return "面向高中毕业或同等学历学生；国内3年完成规定课程后，按韩国合作大学插班、学分认定、韩语和专业成绩要求进入韩国阶段。"
    if mode == "3+2":
        return "面向高中毕业或同等学历学生；国内3年完成衔接课程后，按韩国大学插班或本科后段录取要求进入韩国2年阶段。"
    if mode == "2+1+1":
        return "完成国内前2年课程后，需达到韩方语言与专业课要求；韩国阶段通常为1年语言/适应课程加1年专业课程。"
    return "以学校当年招生简章、课程成绩、韩语成绩和韩国大学录取要求为准。"


def detailed_certificate(
    legacy_base: dict[str, Any],
    mode: str,
    china_school: str,
    korea_schools: str,
    additional_info: dict[str, str],
) -> str:
    legacy_text = strip_source_refs((legacy_base.get("fields") or {}).get("证书说明"))
    if legacy_text and "韩国合作大学官方规定" not in legacy_text:
        return compact_text(legacy_text)
    note = additional_info.get("note", "")
    if "无中国学籍" in note or "无中国学籍" in additional_info.get("stage", ""):
        return f"国内阶段为计划外/合作培养课程，不自动取得{china_school}学籍；按项目说明注册韩方学籍，完成韩方课程后取得{compact_text(korea_schools)}相关学位。"
    if mode == "4+0":
        return f"以{china_school}毕业证、学位证为主；赴韩交流、插班或短期课程不等同自动取得韩方学士学位，韩方证书按实际录取与项目合同执行。"
    if mode in {"0.5+4", "0.5+4.5", "0.5+0.5+4", "0.5/1+4", "1+4"}:
        return "国内阶段通常为预科/语言培训结业证明；被韩国大学录取并完成本科课程后，最终取得韩国录取大学学士学位，认证以韩方学位材料为准。"
    if mode in {"1+3", "2+2", "3+1", "3+2", "2+1+1", "2.5+1.5"}:
        return f"完成国内阶段并通过{compact_text(korea_schools)}录取、语言或学分要求后赴韩；完成韩方课程后取得韩国合作大学相应学位或证书。"
    return "最终证书以韩国录取大学、项目合同和中留服认证审核口径为准。"


def build_program_from_primary(
    row: tuple[Any, ...],
    existing: list[dict[str, Any]],
    legacy_existing: list[dict[str, Any]],
    lookup: dict[str, dict[str, Any]],
    entry_lookup: dict[str, list[dict[str, str]]],
    order: int,
) -> dict[str, Any]:
    base = dict(first_existing_base(row, existing) or {})
    legacy_base = dict(first_existing_base(row, legacy_existing) or {})
    china_school = str(row[2] or base.get("chinaSchool") or "").strip()
    korea_schools = clean_korea_schools(row[6] or base.get("koreaSchools") or "韩国合作大学")
    mode_detail = compact_text(row[5] or row[4] or base.get("modeTitle") or base.get("mode"))
    mode = normalize_mode(mode_detail or row[4])
    extra_info = pick_additional_info(china_school, mode, mode_detail, entry_lookup)
    domestic_fee = compact_text(row[8] or base.get("fields", {}).get("国内费用"))
    korea_fee = compact_text(row[11] or base.get("fields", {}).get("韩方费用"))
    fields = dict(base.get("fields") or {})
    fields["专业设置"] = compact_text(row[7] or fields.get("专业设置") or "具体专业以官方简章为准")
    fields["国内费用"] = domestic_fee or "费用待官方补充"
    fields["韩方费用"] = korea_fee or "按韩国录取大学与专业执行"
    fields["申请条件"] = detailed_requirement(row, legacy_base, mode, mode_detail, china_school, extra_info)
    fields["证书说明"] = detailed_certificate(legacy_base, mode, china_school, korea_schools, extra_info)

    profiles = partner_profiles(korea_schools, lookup) or base.get("koreaPartners") or []
    return {
        **base,
        "title": f"{china_school} ↔ {korea_schools}",
        "chinaSchool": china_school,
        "koreaSchools": korea_schools,
        "mode": mode,
        "modeTitle": mode_title(mode, mode_detail),
        "section": "原93复核保留" if row[1] == "유지" else "新增官方项目",
        "fields": fields,
        "region": infer_region(china_school, str(row[3] or "")),
        "majorTags": infer_major_tags(row[7], korea_schools, mode_detail),
        "sources": split_sources(row[14], row[15]),
        "koreaPartners": profiles,
        "slug": base.get("slug") or f"program-official-{order}",
        "order": order,
        "auditStatus": row[1],
        "feeStatus": " / ".join(part for part in [str(row[9] or ""), str(row[12] or "")] if part),
    }


def build_program_from_supplement(
    row: tuple[Any, ...],
    lookup: dict[str, dict[str, Any]],
    order: int,
) -> dict[str, Any]:
    china_school = str(row[1] or "").strip()
    korea_schools = clean_korea_schools(row[2] or "韩国大学")
    mode_raw = compact_text(row[3])
    mode = normalize_mode(mode_raw)
    stage = compact_text(row[4])
    domestic_fee = compact_text(row[5])
    korea_fee = compact_text(row[6])
    entry = compact_text(row[7])
    note = compact_text(row[10])
    profiles = partner_profiles(korea_schools, lookup)
    certificate = "完成国内阶段后，按韩国大学录取、语言或学分要求进入韩国本科/相关阶段；最终证书以韩方大学和项目简章为准。"
    if "직통" in stage or "直通" in stage:
        certificate = "项目说明含韩国本科直通/共同培养口径，最终学位、学籍和认证以韩国大学官方录取及项目合同为准。"
    return {
        "title": f"{china_school} ↔ {korea_schools}",
        "chinaSchool": china_school,
        "koreaSchools": korea_schools,
        "mode": mode,
        "modeTitle": f"{mode_title(mode)}；{stage}" if stage else mode_title(mode, mode_raw),
        "section": "新增官方本科/预科项目",
        "fields": {
            "专业设置": note or stage or "韩国方向本科/预科，具体专业以韩国录取大学为准",
            "国内费用": domestic_fee or "费用待官方补充",
            "韩方费用": korea_fee or "按韩国录取大学与专业执行",
            "申请条件": entry or "以中国学校当年招生简章、韩语成绩和韩方录取要求为准。",
            "证书说明": certificate,
        },
        "region": infer_region(china_school),
        "majorTags": infer_major_tags(stage, note, korea_schools, mode_raw),
        "sources": split_sources(row[9]),
        "koreaPartners": profiles,
        "slug": f"program-supplement-{order}",
        "order": order,
        "auditStatus": "추가/공식",
        "feeStatus": "学校官方候选",
    }


VISIBLE_PROGRAM_STRING_KEYS = ("title", "koreaSchools", "modeTitle", "section", "region", "auditStatus", "feeStatus")
PARTNER_IMAGE_POSITION_OVERRIDES = {
    "inha-university": "center 32%",
    "partner-ggn-smg-hlz-i1y": "center 58%",
    "partner-gjs-noz-hlz-i1y": "center 58%",
}


def clean_display_string(value: Any) -> str:
    text = str(value or "")
    text = text.replace("KRW", "韩元").replace("RMB", "元").replace("USD", "美元")
    text = translate_korean_fragments(text)
    text = convert_krw_to_cny(text)
    return re.sub(r"\s+", " ", text).strip()


def clean_visible_program(program: dict[str, Any]) -> None:
    for key in VISIBLE_PROGRAM_STRING_KEYS:
        if key in program:
            program[key] = clean_display_string(program[key])
    if "mode" in program:
        cleaned_mode = clean_display_string(program["mode"])
        if "运行" in cleaned_mode and ("交流" in cleaned_mode or "插班" in cleaned_mode):
            program["mode"] = "4+0"
            if program.get("modeTitle") == cleaned_mode:
                program["modeTitle"] = "4+0 / 国内运行为主（可自愿申请韩国交流或插班）"
        else:
            program["mode"] = cleaned_mode
    program["majorTags"] = [clean_display_string(tag) for tag in program.get("majorTags", [])]
    fields = program.get("fields") or {}
    program["fields"] = {key: clean_display_string(value) for key, value in fields.items()}
    for partner in program.get("koreaPartners") or []:
        override_position = PARTNER_IMAGE_POSITION_OVERRIDES.get(str(partner.get("slug") or ""))
        if override_position:
            partner["imagePosition"] = override_position


def apply_known_overrides(program: dict[str, Any]) -> None:
    if program.get("chinaSchool") != "中国传媒大学":
        return
    fields = program.setdefault("fields", {})
    program["modeTitle"] = "1+4 韩国国际预科 / 1+3 建国大学方向"
    program["majorTags"] = ["传媒/影视", "艺术/设计", "商科/经管"]
    fields["专业设置"] = "媒体传播、艺术设计、经济经营"
    fields["国内费用"] = "学费 80,000 元/学年；报名费 300 元；学校不收取留学服务费"
    fields["韩方费用"] = "中央大学：约 14,800~22,400 元/学期（按当前汇率估算）"
    fields["申请条件"] = "应往届高中毕业生、同等学力学生及完成高二学业者可报；提交身份证、证件照、学历证明、成绩/作品集，需通过面试、心理测评和韩语语言内测；英语/高考/TOPIK达标可免语言内测。"
    fields["证书说明"] = "国内1学年课程合格获中国传媒大学培训教育结业证书；符合海外大学入学要求后赴韩攻读学位，成绩合格获韩国录取大学学士学位；建国大学方向可按项目说明衔接大二阶段。"


OFFICIAL_DETAIL_OVERRIDES: list[dict[str, Any]] = [
    {
        "chinaSchool": "长春理工大学",
        "koreaIncludes": "大邱大学",
        "fields": {
            "申请条件": "只招收有专业志愿考生；韩方授课教师采用全英文授课，非英语语种考生不宜报考。赴大邱大学2+2或3+1交流，需学习成绩、外语水平达到韩方入学标准，并具备赴韩学习经济能力。",
            "证书说明": "不赴韩则在长春理工大学完成4年，符合要求获中方毕业证和学位证；2+2赴韩且达到中韩双方毕业/学位条件，可获大邱大学学位证书及中方毕业证、学位证；3+1赴韩不获韩方文凭。"
        },
    },
    {
        "chinaSchool": "吉林工程技术师范学院",
        "koreaIncludes": "东新大学",
        "fields": {
            "申请条件": "机械设计制造及其自动化中外合作项目纳入国家普通高等教育招生计划，参加全国普通高考并按学校当年招生录取规定录取；公开项目说明为4+0在校完成培养，未把TOPIK列为录取前置条件。",
            "证书说明": "学生在吉林工程技术师范学院完成4年学习，课程成绩合格并符合学校毕业、学位授予条件后，获得吉林工程技术师范学院本科毕业证书和学士学位证书。"
        },
    },
    {
        "chinaSchool": "南昌理工学院",
        "koreaIncludes": "南部大学",
        "fields": {
            "申请条件": "汽车服务工程项目纳入国家普通高等教育招生计划，按南昌理工学院当年招生章程和省级投档规则录取；培养采取3+1，中韩课程对接、学分互认，赴南部大学1年并取得韩方学位须满足南部大学学位授予条件。",
            "证书说明": "采用3+1培养模式，达到两校毕业要求后，可获得南昌理工学院本科毕业证书、工程学士学位证书及韩国南部大学工学学士学位证书。"
        },
    },
    {
        "chinaSchool": "青岛大学",
        "koreaIncludes": "光云大学",
        "fields": {
            "专业设置": "电子信息工程",
            "申请条件": "项目计划2026年启动招生，年度规模120人，纳入国家普通高等教育招生计划；具体投档、选科/科类、外语和体检等条件以青岛大学当年招生章程及各省招生计划为准，公开获批信息未列TOPIK前置要求。",
            "证书说明": "该项目采用双学位培养模式；学生完成规定课程并达到中韩双方学位授予条件后，证书按青岛大学与韩国光云大学项目培养方案执行。"
        },
    },
    {
        "chinaSchool": "山东农业工程学院",
        "koreaIncludes": "仁荷大学",
        "fields": {
            "申请条件": "机械电子工程项目计划2026年启动招生，每年100人，学制4年，采用4+0双学位培养模式；具体录取批次、选科/科类、投档分数和外语要求以学校当年招生章程及省级招生计划为准，公开新闻未列TOPIK前置要求。",
            "证书说明": "学生完成规定课程并达到双方授予条件后，可同时获得山东农业工程学院本科毕业证书、学士学位证书以及韩国仁荷大学学士学位证书。"
        },
    },
    {
        "chinaSchool": "南京晓庄学院",
        "koreaIncludes": "又松大学",
        "mode": "2+1+1",
        "modeTitle": "2+1+1：前2年南京晓庄学院 + 1年又松大学 + 最后1年回南京晓庄学院",
        "fields": {
            "专业设置": "学前教育",
            "申请条件": "仅通过高考招生进入学前教育中外合作项目，原则上不得随意转入或转出；大一开始学习韩语，又松大学派韩语教师授课；赴又松大学学习前须修完南京晓庄学院前两年的所有规定课程。",
            "证书说明": "顺利完成两校学业后，获得南京晓庄学院本科毕业证书和学士学位证书，以及韩国又松大学学习经历证明。"
        },
    },
    {
        "chinaSchool": "上海工程技术大学",
        "koreaIncludes": "公州大学",
        "fields": {
            "专业设置": "视觉传达设计、产品设计、数字媒体艺术",
            "申请条件": "按上海工程技术大学国际创意设计学院本科招生执行，面向视觉传达设计、产品设计、数字媒体艺术3个本科专业；学生在学期间可选择赴韩国国立公州大学或韩国东西大学交流，须完成规定学业和中韩双方学位授予条件。",
            "证书说明": "完成规定学业和学位授予条件后，可获得上海工程技术大学毕业证书、学位证书，以及韩国国立公州大学或韩国东西大学相应学位证书。"
        },
    },
    {
        "chinaSchool": "山东艺术学院",
        "koreaIncludes": "又松大学",
        "fields": {
            "申请条件": "面向戏剧影视美术设计、数字媒体艺术本科中外合作项目招生，年度招生规模80人；作为艺术类本科项目，具体专业考试、文化课投档、省份计划和录取规则以山东艺术学院当年招生章程及省招办公布为准。",
            "证书说明": "项目公开栏标明办学层次为本科、学士学位、高等学历教育；最终毕业证书和学位授予以山东艺术学院中外合作办学专栏、当年培养方案及项目协议为准。"
        },
    },
    {
        "chinaSchool": "中南财经政法大学",
        "koreaIncludes": "东西大学",
        "fields": {
            "申请条件": "中韩新媒体学院为中南财经政法大学与韩国东西大学合作举办的本科教育项目教学单位，实行3+1中韩双校园培养；下设动画、电影学等本科项目，具体录取批次、艺术类/普通类规则、文化课和专业成绩要求以学校当年本科招生章程及省级招生计划为准。",
            "证书说明": "学生按3+1培养完成规定课程并达到毕业要求，颁发中南财经政法大学普通高等教育本科毕业证书；符合学位授予条件者，颁发中南财经政法大学学士学位，赴韩学习一年且满足韩国东西大学学位授予条件者，韩方学位按项目规定执行。"
        },
    },
    {
        "chinaSchool": "青岛理工大学",
        "koreaIncludes": "光云大学",
        "fields": {
            "申请条件": "建筑学中外合作项目纳入普通高等学校招生统一计划，按各省批次、科类或选科要求录取；项目学制5年，具体录取分数、语种和体检要求以青岛理工大学当年招生章程及招生计划为准。",
            "证书说明": "完成青岛理工大学培养方案并达到毕业、学位条件，获得中方毕业证书和学位证书；符合韩国光云大学相关课程、学分或学位授予条件者，韩方证书按项目规定执行。"
        },
    },
    {
        "chinaSchool": "青岛恒星科技学院",
        "koreaIncludes": "京畿大学",
        "fields": {
            "申请条件": "人工智能本科中外合作项目已获教育部批准并完成验收交流；学校公开稿显示后续将推进招生准备及项目落地，具体录取批次、计划、选科/科类和分数线以青岛恒星科技学院当年招生章程及省招办公布为准，公开稿未列TOPIK前置条件。",
            "证书说明": "项目围绕课程设置、人才培养、教学管理和联合管理机制运行；最终证书以青岛恒星科技学院与韩国京畿大学正式培养方案、合作协议和当年招生文件为准。"
        },
    },
    {
        "chinaSchool": "平顶山学院",
        "koreaIncludes": "庆云大学",
        "fields": {
            "申请条件": "机械电子工程项目学制4年，纳入国家普通高等教育招生计划，每年招生120人；按普通高考录取进入项目。项目学习期间，符合韩方入学要求者可自愿选择赴韩国庆云大学完成学业。",
            "证书说明": "达到平顶山学院培养方案规定学分并符合中方毕业、学位条件，获平顶山学院本科毕业证书和学士学位证书；赴韩并达到韩方学士学位授予条件，经中韩双方审核合格者可获得双方文凭。"
        },
    },
    {
        "chinaSchool": "湖北工业大学",
        "koreaIncludes": "又石大学",
        "mode": "2+2",
        "modeTitle": "2+2：国内2年语言/桥梁/基础课程 + 又石大学2年核心本科课程",
        "fields": {
            "申请条件": "招生对象为应往届高中毕业生或同等学历者；高考总分达生源地本科线或英语单科100分及以上，可免笔试、面试合格录取；雅思4.5、托福55、多邻国60或韩语TOPIK1级及以上也可免笔试；其他考生参加统一笔试和面试。赴又石大学前需完成国内两年规定课程并达到TOPIK3级。",
            "证书说明": "在湖北工业大学学习2年后，完成国内规定课程并达到TOPIK3级，可申请进入韩国又石大学继续学习2年；完成核心专业课程并达到毕业条件，获得韩国又石大学本科学士学位。"
        },
    },
    {
        "chinaSchool": "吉林工程技术师范学院",
        "koreaIncludes": "世翰大学",
        "fields": {
            "申请条件": "动画中外合作项目按吉林工程技术师范学院当年招生计划和录取规则执行；培养包含国内课程、韩方语言/专业衔接和后续专业学习，赴韩阶段须满足韩国世翰大学语言、课程成绩和项目规定。",
            "证书说明": "完成国内阶段并达到韩国世翰大学录取、语言或学分要求后赴韩；最终证书以吉林工程技术师范学院、韩国世翰大学项目培养方案和双方学位授予条件为准。"
        },
    },
    {
        "chinaSchool": "北京外国语大学继续教育学院",
        "matchMode": "0.5+4",
        "fields": {
            "专业设置": "韩国本科申请预备方向：艺术、媒体、经营、金融、物流、美容、汽车电子等；先在北外完成韩语/留学适应课程，再按申请意向选择韩国本科专业",
            "国内费用": "课程费52,000元（官方1+4课程，国内1年）；住宿19,000~23,000元/生/学年；0.5年制页面没有单列课程费，需按北外继续教育学院当年缴费通知执行",
            "韩方费用": "韩国国公立大学学费约15,000~20,000元/年，私立大学约30,000~40,000元/年；首尔大学、延世大学、成均馆大学、中央大学、庆北大学、汉阳大学等录取院校会按本校专业学费表收费",
            "申请条件": "高二结业并通过学业水平考试，或高中毕业及同等学历可报；在北外完成0.5年或1年韩语学习后，达到TOPIK3级或通过韩国语学院/大学校内语言考试，再申请韩国本科。",
            "证书说明": "国内阶段为北外继续教育学院韩国留学课程培训/结业证明；被韩国大学录取并完成4年本科课程后，取得实际录取韩国大学学士学位。"
        },
        "sources": [
            {"id": "费用1", "url": "https://bwpxbm.bfsu.edu.cn/course/022e5d32-540d-11f1-9ab6-0050569a25bb/detail"}
        ],
    },
    {
        "chinaSchool": "北京外国语大学继续教育学院",
        "matchMode": "1+4",
        "fields": {
            "专业设置": "韩国本科申请预备方向：艺术、媒体、经营、金融、物流、美容、汽车电子等；国内1年学习韩语和留学适应课程，韩国阶段按录取大学开放专业选择",
            "国内费用": "课程费52,000元（国内1年）；住宿19,000~23,000元/生/学年",
            "韩方费用": "韩国国公立大学学费约15,000~20,000元/年，私立大学约30,000~40,000元/年；首尔大学、延世大学、成均馆大学、中央大学、庆北大学、汉阳大学等录取院校会按本校专业学费表收费",
            "申请条件": "高二结业并通过学业水平考试，或高中毕业及同等学历可报；在北外完成1年韩语学习后，达到TOPIK3级或通过韩国语学院/大学校内语言考试，再申请韩国本科。",
            "证书说明": "国内阶段为北外继续教育学院韩国留学课程培训/结业证明；被韩国大学录取并完成4年本科课程后，取得实际录取韩国大学学士学位。"
        },
        "sources": [
            {"id": "费用1", "url": "https://bwpxbm.bfsu.edu.cn/course/022e5d32-540d-11f1-9ab6-0050569a25bb/detail"}
        ],
    },
    {
        "chinaSchool": "西南大学",
        "koreaIncludes": "高丽大学",
        "fields": {
            "专业设置": "高丽大学世宗校区本科直通/共同培养方向；国内学习KLIP韩国语、通识与基础教养课程，韩国阶段专业按高丽大学世宗校区当年本科招生专业表选择",
            "国内费用": "西南大学官方招生简章没有列出国内阶段学费数字；报名后以西南大学国际教育中心当年缴费通知或项目合同为准",
            "韩方费用": "高丽大学世宗校区2024学费约4,764,000~7,357,000韩元/学期，折合约21,300~32,900元/学期；具体按高丽大学世宗校区当年专业学费表执行",
            "申请条件": "高中毕业或同等学历可报；在西南大学国内1年全日制学习韩语、KLIP课程和通识/基础教养课程，课程成绩与韩语水平达到高丽大学世宗校区本科入学要求后升入韩国阶段。",
            "证书说明": "国内1年为西南大学国际教育中心韩国语与基础教养课程；通过高丽大学世宗校区录取后赴韩读本科，完成学分和毕业要求后取得高丽大学学士学位。"
        },
    },
    {
        "chinaSchool": "中国地质大学（武汉）",
        "koreaIncludes": "又石大学",
        "fields": {
            "专业设置": "商科类（工商管理、国际贸易、人力资源管理、艺术管理等）、工科类（计算机科学与技术、电子电气工程）、艺体/传媒类（艺术设计、视觉传达设计、体育教育、传媒学、数字媒体艺术等）",
            "国内费用": "报名考试费500元；国内阶段学费34,000元/学年，住宿费6,000~6,500元/年；学杂费以入学须知为准；国际综合管理费由韩方开学时一次性收取，含学分转换、韩语培训、留学申请和回国学历认证服务",
            "韩方费用": "又石大学阶段学费约35,000元/学年，住宿费约5,000~10,000元/学年，生活成本按韩国地方城市实际消费计算",
            "申请条件": "应往届高中毕业生或同等学历者；文理科需达到本科线且英语及格，艺术生需提交艺术考试成绩或作品集，体育生需提交体育类证明；审核后参加中国地质大学（武汉）自主招生笔试和面试，条件优异者可免笔试。",
            "证书说明": "该项目为计划外自主招生，不取得中国地质大学（武汉）学籍；入学注册韩国又石大学学籍，国内2年完成语言、基础及部分专业课程，赴韩2年修满学分后获又石大学学士学位，可申请中留服认证。"
        },
    },
    {
        "chinaSchool": "四川大学",
        "koreaSchools": "韩国大学申请型（校际合作协议框架）",
        "fields": {
            "专业设置": "语言学、新闻广播、心理学、经营/经济金融、会计、计算机/电子电气/机械工学、音乐/舞蹈/影视/美术/设计/体育等方向",
            "韩方费用": "韩国阶段学费由最终录取大学按专业公开学费表收取；四川大学官方简章列出国内学费39,800元/年，但未统一公布韩国各校金额",
            "申请条件": "高二完读、高三在读、高中毕业及同等学历可报；高中毕业生高考达本科线以上或通过川大面试，在读生通过面试；艺术类需达到艺术/文化本科线或通过面试。",
            "证书说明": "国内1年在四川大学学习韩国语、韩国历史文化和留学适应课程；成绩合格并被韩国大学录取后赴韩读本科，毕业后取得实际录取韩国大学学士学位。",
        },
    },
    {
        "chinaSchool": "电子科技大学",
        "matchMode": "0.5+0.5+4",
        "koreaSchools": "韩国高丽大学",
        "fields": {
            "专业设置": "A计划：电子科技大学0.5年 + 高丽大学0.5年预科 + 高丽大学本科4年；适合目标为高丽大学及热门专业预录取学生",
            "韩方费用": "高丽大学预科及本科阶段按高丽大学官方学费标准执行",
            "申请条件": "高二结束、应往届高中毕业生或同等学力、统招三年制专科生及本科生；提交报名表并参加学院面试测评，择优录取。",
            "证书说明": "完成电子科技大学预备课程并达到高丽大学预科/本科入学要求后，进入高丽大学阶段学习；完成本科课程后取得高丽大学相应学位。",
            "合作院校": "高丽大学",
        },
    },
    {
        "chinaSchool": "电子科技大学",
        "matchMode": "1+4",
        "koreaSchools": "韩国目标院校 22所",
        "fields": {
            "专业设置": "B/C计划：电子科技大学1年 + 韩国大学本科4年；覆盖影视表演、美术、服装设计、传媒、经营、经济、酒店观光、翻译、教育、心理学、护理、工科等方向",
            "韩方费用": "按最终录取韩国大学及专业官网标准执行，可关注国内外大学奖学金",
            "申请条件": "高二结束、应往届高中毕业生或同等学力、统招三年制专科生及本科生；提交报名表并参加学院面试测评，择优录取；目标TOPIK4级或韩国大学校内考合格。",
            "证书说明": "完成电子科技大学预备课程后，按B/C计划申请韩国目标院校；被录取并完成本科课程后取得韩国录取大学学士学位。",
            "合作院校": "延世大学、成均馆大学、汉阳大学、庆熙大学、梨花女子大学、中央大学、韩国外国语大学、西江大学、建国大学、东国大学、韩国加图立大学、仁荷大学、弘益大学、延世大学（原州）、岭南大学、嘉泉大学、祥明大学、崇实大学、明知大学、大邱大学、启明大学、西京大学",
        },
    },
    {
        "chinaSchool": "华南理工大学",
        "koreaSchools": "韩国目标名校 3所",
        "fields": {
            "专业设置": "1+4韩国方向，目标升读延世大学、成均馆大学、汉阳大学；韩国阶段可选专业以三校当年开放本科专业和录取结果为准",
            "国内费用": "培训费：非住宿99,000元/年；单间住宿109,800元/年（收费标准2025.3，海外名校本科1+3/4商科/理工科项目）",
            "韩方费用": "延世大学、成均馆大学、汉阳大学本科阶段分别按各校当年国际学生专业学费表收费；华南理工项目页面未列统一韩方金额",
            "申请条件": "学生在华南理工大学完成1年语言强化课程和公共基础课程，韩语水平和学术成绩符合要求后，可获韩国大学本科大一录取。",
            "证书说明": "国内1年完成语言强化和公共基础课程；赴韩完成全日制本科课程并达到要求后，取得韩国录取大学学士学位。",
            "合作院校": "延世大学、成均馆大学、汉阳大学",
        },
    },
    {
        "chinaSchool": "山东大学",
        "koreaSchools": "韩国本科/硕士申请型（校内语言培训后申请）",
        "fields": {
            "专业设置": "韩国语方向：国内0.5年或1年语言强化，达到TOPIK3以上或海外大学校内考试后申请本科/硕士",
            "国内费用": "一年班培训学费30,000元；半年班培训学费18,000元",
            "韩方费用": "韩国语学院约20,000元/6个月；韩国大学学费约20,000~50,000元/年；韩国生活费约30,000~60,000元/年，按最终录取城市、大学和专业执行",
            "申请条件": "高中在校生、高中毕业及同等学历、大学在校生、本科及其他学历毕业生可报；达到TOPIK3以上或通过海外大学校内考试后申请韩国本科/硕士。",
            "证书说明": "国内阶段为山东大学西日韩国际教育项目语言培训；达到语言和韩国大学录取要求后进入韩国本科/硕士阶段，毕业后取得实际录取韩国大学学位。",
        },
    },
    {
        "chinaSchool": "广州华立学院",
        "koreaSchools": "韩国大学申请型/联合培养",
        "fields": {
            "专业设置": "中韩联合培养0.5+4、2+2、3+1国际本科；官网列有保健/形象设计/医疗美容、商科、计算机、教育等方向，最终按就读院校开放专业执行",
            "国内费用": "0.5+4国内0.5年：广州华立学院学费18,000元，项目管理及留学服务费15,000元；3+1/2+2国内阶段按专业方向约19,800~29,800元/年",
            "韩方费用": "韩国大学4年或后续阶段按就读院校官网公布标准收取；广州华立官网未列固定韩方金额",
            "申请条件": "应、往届高中（中职、中专）毕业生以及同等学力者；自主招生，面试入学。部分合作院校开设中文授课专业，语言要求较低。",
            "证书说明": "完成广州华立学院国内阶段课程后，按项目模式申请韩国高校；完成韩方课程后取得就读韩国大学相应学位，认证以韩方学位材料为准。",
        },
    },
    {
        "chinaSchool": "青岛科技大学",
        "koreaIncludes": "中央大学",
        "fields": {
            "韩方费用": "中央大学、世宗大学、光云大学、翰林大学官网当年专业学费标准",
            "申请条件": "应往届高中毕业生及高二结业生；持有或将持有高中毕业证，参加学校统一组织的入学测试；在青岛科技大学学习1年后，韩语达到韩国合作大学要求进入本科。",
            "证书说明": "完成青岛科技大学1年培训课程并达到韩方语言和入学要求后，进入中央大学、世宗大学、光云大学或翰林大学本科阶段；完成课程后获韩国录取大学学士学位。",
            "合作院校": "中央大学、世宗大学、光云大学、翰林大学",
        },
    },
    {
        "chinaSchool": "山东理工大学",
        "koreaSchools": "韩国示例/录取院校 31所",
        "fields": {
            "专业设置": "韩国高校申请型预科，专业按录取大学开放专业执行；官网列出高升本、专升本、本升硕路径",
            "国内费用": "当前官方主页未列2026收费表；校内2019官方简章曾列报名费1,000元、国内半年语言培训费15,000元、材料/签证等手续成本约3,000元，申请前需按山东理工大学韩国留学招生办当年缴费通知复核",
            "韩方费用": "当前官方主页未列各校逐项费用；校内2019官方简章曾列韩国学费约20,000~40,000元/年，部分韩国合作高校可申请学费减免和奖学金",
            "申请条件": "高二会考通过、应往届高中（含中专、职高、技校）、专科、本科毕业生与预毕业生；在山东理工大学学习0.5~1年韩语，达到韩国大学入学标准后进入本科/硕士。",
            "证书说明": "完成国内韩语预科并达到韩国大学入学要求后，进入韩国本科/硕士阶段；修满学分并达到毕业要求后取得韩国高校毕业证书，认证以韩方学位材料为准。",
            "合作院校": "首尔大学、延世大学、高丽大学、成均馆大学、汉阳大学、庆熙大学、世宗大学、釜山大学、中央大学、梨花女子大学、庆北大学、西江大学、亚洲大学、东国大学、仁荷大学、建国大学、韩国外国语大学、全北大学、韩国加图立大学、蔚山大学、首尔市立大学、忠南大学、岭南大学、全南大学、诚信女子大学、檀国大学、江原大学、首尔科学技术大学、国民大学、忠北国立大学、弘益大学",
        },
    },
    {
        "chinaSchool": "西安外国语大学",
        "matchMode": "1+4",
        "koreaSchools": "韩国重点推荐院校 9所",
        "fields": {
            "专业设置": "韩国名校留学预备项目：理工、文科、商科、艺术等方向，专业以韩国录取大学开放专业为准",
            "国内费用": "官方招生页未列国内学费金额；报名流程为初审后缴纳报名费、入学测试合格复审后缴纳学费，需以西安外国语大学国际学院招生办当年收费通知为准",
            "韩方费用": "韩国公立大学学费一般约20,000元/年，私立大学约40,000~50,000元/年；多数学校可按成绩申请30%~50%等学费减免",
            "申请条件": "高二、高中毕业及同等学历可报；学校自主入学考试合格；在西安外国语大学学习1年韩语后申请韩国本科。",
            "证书说明": "国内1年韩语学习后进入韩国高校本科阶段，完成课程后取得韩国录取大学学士学位；学历认证以韩方学位材料为准。",
            "合作院校": "延世大学、高丽大学、成均馆大学、汉阳大学、庆熙大学、弘益大学、西江大学、建国大学、又松大学",
        },
    },
    {
        "chinaSchool": "西安外国语大学",
        "matchMode": "1+3",
        "koreaIncludes": "又松大学",
        "fields": {
            "国内费用": "官方招生页未列国内学费金额；报名流程为初审后缴纳报名费、入学测试合格复审后缴纳学费，需以西安外国语大学国际学院招生办当年收费通知为准",
            "韩方费用": "又松大学后续3年学费按又松大学官方收费标准和录取专业执行；西安外国语大学官方页未列固定韩方金额",
            "申请条件": "高二、应往届高中毕业生或同等学力者；通过西安外国语大学国际学院自主招生考试，成绩合格后复审报名材料并缴费入学。",
            "证书说明": "国内1年学习又松大学指定课程并置换学分，赴又松大学完成剩余3年本科课程；达到毕业条件后获得又松大学本科学士学位。"
        },
    },
    {
        "chinaSchool": "北京外国语大学",
        "koreaSchools": "韩国目标院校 9所",
        "fields": {
            "专业设置": "韩国大学预科班、汉阳大学预录班、弘益大学预录班、国民大学预录班；目标院校含延世大学、高丽大学、成均馆大学、汉阳大学、庆熙大学、中央大学、建国大学、弘益大学、国民大学，专业按录取学校开放专业选择",
            "韩方费用": "延世大学、高丽大学、成均馆大学、汉阳大学、庆熙大学、中央大学、建国大学、弘益大学、国民大学按各校当年国际学生专业学费表收费；北外项目页面未列统一韩方金额",
            "申请条件": "高中毕业、高三在读或同等学历可报；报名后参加项目入学测试；国内完成韩语综合、听力、口语、韩国文化及留学适应课程，TOPIK按韩国大学标准执行。",
            "证书说明": "完成北京外国语大学国内阶段课程并通过考核后获相关结业证明；赴韩完成本科阶段并达到毕业要求后，取得韩国录取大学本科文凭。",
            "合作院校": "延世大学、高丽大学、成均馆大学、汉阳大学、庆熙大学、中央大学、建国大学、弘益大学、国民大学",
        },
    },
    {
        "chinaSchool": "烟台大学",
        "matchMode": "1+4",
        "koreaSchools": "韩国合作院校 40余所",
        "fields": {
            "专业设置": "1+4高中（中专）升本科，专业按韩国合作大学开放专业执行，官网列出社会科学、经营、工科、艺术体育、医学保健等常见专业方向",
            "国内费用": "1年制按烟台大学官方费用表执行；申请材料、公证、护照、签证、机票等另计",
            "韩方费用": "国立大学约20,000~30,000元/年；私立大学约30,000~60,000元/年，部分学校奖学金可减免30%~100%学费",
            "申请条件": "应往届毕业生及最后一年在读生；在烟台大学学习1年韩国语，语言达到韩国大学入学要求后进入合作大学本科。",
            "证书说明": "完成烟台大学1年韩语学习后，进入韩国合作大学本科专业，修满学分取得中国教育部承认的韩国大学本科学历证书/学士学位。",
            "合作院校": "延世大学、高丽大学、成均馆大学、汉阳大学、庆熙大学、国立庆北大学等40余所",
        },
    },
    {
        "chinaSchool": "烟台大学",
        "matchMode": "0.5+4",
        "koreaSchools": "韩国部分合作院校 12所",
        "fields": {
            "专业设置": "0.5+4高中（中专）升本科，专业按韩国录取大学开放专业执行",
            "国内费用": "0.5年制按烟台大学官方费用表执行；申请材料、公证、护照、签证、机票等另计",
            "韩方费用": "国立大学约20,000~30,000元/年；私立大学约30,000~60,000元/年，部分学校奖学金可减免30%~100%学费",
            "申请条件": "应往届毕业生及最后一年在读生；在烟台大学学习半年韩国语后进入本科专业学习，具体以韩方录取要求为准。",
            "证书说明": "完成烟台大学半年韩语学习并达到韩国大学入学要求后，进入韩国本科阶段；修满学分取得韩国录取大学本科学历证书/学士学位。",
            "合作院校": "延世大学、梨花女子大学、檀国大学、西江大学、韩国外国语大学、韩国加图立大学、建国大学、国民大学、国立全北大学、国立忠北大学、崇实大学、淑明女子大学",
        },
    },
    {
        "chinaSchool": "烟台大学",
        "matchMode": "0.5+4.5",
        "koreaIncludes": "成均馆大学",
        "fields": {
            "国内费用": "半年班：学费15,000元、住宿费1,200元、报名费200元、教材费约300元、出国留学服务费6,000元",
            "韩方费用": "成均馆大学2024学年新生第一学期学费：人文/社会/经营5,087,000韩元，影视/服装/工程/电子电气/软件6,606,000韩元，自然/体育5,872,000韩元",
            "申请条件": "应往届高中毕业生；提交高中毕业证、高中成绩单、会考成绩单；达到TOPIK4或成均馆语学院4级班结业可正式录取，TOPIK3经综合评估优秀者也可录取。",
            "证书说明": "烟台大学与成均馆大学本科定向班；语言达标后直入成均馆大学本科课程，修满学分取得成均馆大学本科学历证书/学士学位。",
            "合作院校": "成均馆大学",
        },
    },
    {
        "chinaSchool": "南通大学",
        "koreaSchools": "韩国3+2国际本科对接项目",
        "fields": {
            "专业设置": "韩国3+2国际本科；南通大学继续教育学院2026-04-19官方页面正文仅公开项目标题和图片入口，未在网页文字中列出专业表",
            "国内费用": "南通大学官方网页正文未公开文字版学费、住宿费或项目管理费；页面只给出招生简章图片入口，费用需以该图片版简章、学院后续缴费通知或项目合同为准",
            "韩方费用": "官方网页正文未公开韩国阶段文字版费用；韩国阶段学费、住宿和生活费以实际录取韩国大学的公开收费表及项目合同为准",
            "申请条件": "官方页面确认项目名称为“2026年南通大学韩国3+2国际本科招生简章”；网页文字未列合作院校、专业、录取分数或TOPIK条件，申请时应核对南通大学继续教育学院发布的图片版招生简章。",
            "证书说明": "该条目前只能确认南通大学继续教育学院发布了韩国3+2国际本科招生简章页面；国内、韩国两阶段证书以图片版简章和实际韩国录取大学合同为准。",
        },
    },
    {
        "chinaSchool": "山东工艺美术学院",
        "koreaSchools": "韩国预科对接院校 4所",
        "fields": {
            "专业设置": "设计类、艺术类、综合类方向；延世大学全球精英学部，湖西大学游戏工学/艺术设计/航空服务/IT/韩妆/传媒等，明知大学影像设计/国际商务/建筑/传媒/经营等，建国大学国际通商/文化传媒",
            "国内费用": "官方招生页列出招生计划50人和培训内容，但没有列出国内培训费金额；申请前需向山东工艺美术学院青岛基地确认当年收费",
            "韩方费用": "韩国大学每年学费约20,000~60,000元，可申请韩国大学奖学金",
            "申请条件": "高三艺考生、普通生或高中毕业生；中专/高职高三在读或毕业生；专科在读或毕业生可报。招生计划50人，按报名顺序录取，额满为止。",
            "证书说明": "国内6个月完成韩语、大学申请指导、韩国文化及行前培训；出国前可报考韩国大学本科升学项目，通过后获韩国大学录取通知书。",
            "合作院校": "延世大学、湖西大学、明知大学、建国大学",
        },
    },
    {
        "chinaSchool": "浙江大学",
        "koreaSchools": "韩国重点大学申请型",
        "modeTitle": "0.5+4：浙江大学国内约500课时韩语预备课程 + 韩国本科4年",
        "fields": {
            "专业设置": "韩国留学预备课程；国内阶段重点学习生活韩语、专业词汇和韩国大学学习适应，韩国阶段专业按最终录取大学开放专业选择",
            "国内费用": "官方2026招生页没有列出国内阶段学费金额；以浙江大学外国语学院韩国留学课程班当年缴费通知为准",
            "韩方费用": "韩国阶段学费、住宿和生活费按最终录取韩国大学、专业和汇率执行；项目页未列固定韩方金额",
            "申请条件": "在浙江大学国内阶段学习约500课时韩语；达到TOPIK 3级以上或通过韩国大学校内语言考试后，可选择继续韩国语学习或进入韩国大学4年专业课。",
            "证书说明": "国内阶段为浙江大学韩国留学预备课程；语言达标并被韩国大学录取后进入韩国本科，完成韩方专业课程后取得韩国录取大学学士学位，认证以韩方学位材料为准。",
        },
    },
    {
        "chinaSchool": "南昌大学",
        "koreaIncludes": "全北大学",
        "fields": {
            "专业设置": "南昌大学2+2国际本科韩国方向；国内2年学习韩国语/英语提升、通识和专业基础课程，韩国阶段衔接全北大学对应本科专业第3-4年",
            "申请条件": "应往届高中毕业生或具有高中同等学历者；提交材料审核通过后参加南昌大学统一组织的自主招生入学测试，考试含综合能力笔试、综合素质面试和心理测试；条件特别优异者（如高考成绩优异或英语单科突出）可免笔试。",
            "证书说明": "国内2年在南昌大学学习韩国语/英语提升、通识与专业基础课程，完成后获南昌大学项目结业证书；所修学分被全北大学认可后，无需另参加韩国本科入学考试，进入全北大学对应专业第3-4年，修满学分获全北大学全日制学士学位并可申请中留服认证。"
        },
    },
    {
        "chinaSchool": "上海戏剧学院",
        "koreaSchools": "韩国对接院校 9所",
        "fields": {
            "专业设置": "表演类、编导类、传媒类、音乐类；按专业方向对接韩国大学本科三年级",
            "韩方费用": "大邱大学、嘉泉大学、大真大学、全州大学、京畿大学、诚信女子大学、中部大学、明知大学、启明大学分别按本校当年对应专业学费表收费；上戏项目页未列统一韩方金额",
            "申请条件": "国内外应往届高中毕业生或具备高中同等学力者，具有艺术专业基础者优先；在上戏完成3年阶段课程且成绩合格后，可申请升入韩国对接大学本科三年级。",
            "证书说明": "上海戏剧学院1-3年阶段成绩合格获上戏结业证书；第4-5年赴韩国对接大学，完成本科课程后取得该韩国大学本科学位，可按规定申请中留服认证。",
            "合作院校": "大邱大学、嘉泉大学、大真大学、全州大学、京畿大学、诚信女子大学、中部大学、明知大学、启明大学",
        },
    },
    {
        "chinaSchool": "四川外国语大学",
        "koreaIncludes": "首尔大学",
        "koreaSchools": "韩国合作院校 7所",
        "fields": {
            "专业设置": "川外韩语国际试验班→中韩国际本科3+2，开办专业：国际经营学、国际心理学、国际传媒、艺术设计",
            "韩方费用": "韩国本科阶段约50,000~60,000元/年",
            "申请条件": "国内应往届高中毕业生或中专、会考完高二在校生、职校、职高同等学历学生；参加川外统一组织的笔试、升学评估及面试合格；赴韩需取得川外成教专科毕业证、川外平均成绩不低于75、TOPIK3级、出勤率90%以上。",
            "证书说明": "在四川外国语大学学习3年后，达标参加韩国大学内部考试和面试，合格者编入韩国本科大三或大四；完成后取得韩国本科学历。",
            "合作院校": "首尔大学、延世大学、大邱加图立大学、建国大学、釜山外国语大学、圆光大学、湖西大学",
        },
    },
    {
        "chinaSchool": "济南大学",
        "koreaSchools": "韩国名校 12所",
        "fields": {
            "合作院校": "延世大学、高丽大学、弘益大学、中央大学、首尔艺术大学、东国大学、汉阳大学、世宗大学、建国大学、国民大学、庆熙大学、成均馆大学等",
            "专业设置": "名校特招班、大学直录班、艺术类名校定向班；可申请艺术、媒体、经营、工学、社会科学等方向",
            "国内费用": "国内语言培训费：18,000元/0.5年；28,000元/1年",
            "韩方费用": "国外大学学费：20,000~40,000元/年（不同大学及专业有差异）；国外生活费：40,000~60,000元/年",
            "申请条件": "应往届高中、专科、本科毕业生；高二、高三在读生可报，少量优秀中专、职高生可接受；学校统一组织入学面试，择优录取。国内0.5年/1年韩语与TOPIK课程后，语言合格或校考通过可申请韩国本科/硕士。",
            "证书说明": "国内阶段为济南大学韩国留学班语言培训/预科阶段；达到韩国大学录取要求后进入韩国合作大学语学院、本科或硕士阶段，完成韩方课程后取得韩国录取大学学位，学历认证以韩方学位材料为准。",
        },
    },
    {
        "chinaSchool": "江苏第二师范学院",
        "koreaSchools": "韩国东明大学",
        "modeTitle": "2.5+1.5：中国2.5年 + 韩国东明大学1.5年",
        "feeStatus": "PDF已核对 / PDF已核对",
        "fields": {
            "专业设置": "东明大学方向：人工智能、信息通信软件、视觉设计、媒体传播",
            "国内费用": "江苏第二师范学院前2.5学年学费 40,000元/人/年（含专本科学历费）；住宿约1,500元/人/年（4-5人间）；国外院校申请费及管理费40,000元/人",
            "韩方费用": "东明大学1.5学年学费约40,000元/人/年；东明大学公寓约1,500元/月/间（可住4人）；校内食堂约30元/餐",
            "申请条件": "招生对象为应往届高中毕业生或同等学历毕业生，招生总人数60人；录取满足其一：高考成绩达到户籍所在省本科录取线、艺术专业省联考成绩前20%、或参加项目组织的入学测试且成绩合格。",
            "证书说明": "国内2.5年完成东明大学认定的出国预备课程（语言、通识及部分专业基础课），获江苏第二师范学院课程结业证书；达到东明大学入学要求后赴韩1.5年，完成东明大学本科学习后取得学士学位，可在中留服认证。",
        },
    },
]


def apply_official_detail_overrides(program: dict[str, Any]) -> None:
    china_school = program.get("chinaSchool", "")
    korea_schools = program.get("koreaSchools", "")
    mode = program.get("mode", "")
    for override in OFFICIAL_DETAIL_OVERRIDES:
        if china_school != override["chinaSchool"]:
            continue
        match_mode = override.get("matchMode")
        if match_mode and mode != match_mode:
            continue
        korea_includes = override.get("koreaIncludes")
        if korea_includes and korea_includes not in korea_schools:
            continue
        fields = program.setdefault("fields", {})
        fields.update(override.get("fields", {}))
        if "koreaSchools" in override:
            program["koreaSchools"] = override["koreaSchools"]
            program["title"] = f"{program.get('chinaSchool', '')} ↔ {override['koreaSchools']}"
        if "feeStatus" in override:
            program["feeStatus"] = override["feeStatus"]
        for source in override.get("sources", []):
            existing_sources = program.setdefault("sources", [])
            existing_urls = {item.get("url") for item in existing_sources}
            if source.get("url") and source["url"] not in existing_urls:
                existing_sources.append(dict(source))
        if "mode" in override:
            program["mode"] = override["mode"]
        if "modeTitle" in override:
            program["modeTitle"] = override["modeTitle"]
        return


def load_programs() -> tuple[list[dict[str, Any]], dict[str, int]]:
    existing = extract_existing_programs()
    legacy_existing = extract_legacy_programs()
    lookup = build_profile_lookup(existing + legacy_existing)

    additional_wb = load_workbook(find_xlsx(ADDITIONAL_XLSX_DIR), read_only=True, data_only=True)
    additional_rows = [row for row in additional_wb.worksheets[3].iter_rows(min_row=2, values_only=True) if any(row)]
    entry_lookup = additional_entry_lookup(additional_rows)

    primary_wb = load_workbook(find_xlsx(PRIMARY_XLSX_DIR), read_only=True, data_only=True)
    primary_rows = [row for row in primary_wb.worksheets[1].iter_rows(min_row=2, values_only=True) if any(row)]
    clean_rows = [row for row in primary_rows if not is_vocational(row)]

    programs: list[dict[str, Any]] = []
    for row in clean_rows:
        programs.append(build_program_from_primary(row, existing, legacy_existing, lookup, entry_lookup, len(programs) + 1))

    for row in additional_rows:
        if str(row[1] or "") in SUPPLEMENT_SCHOOL_NAMES:
            programs.append(build_program_from_supplement(row, lookup, len(programs) + 1))

    if len(programs) != 63:
        raise RuntimeError(f"Expected 63 programs, got {len(programs)}")

    for index, program in enumerate(programs, start=1):
        clean_visible_program(program)
        apply_known_overrides(program)
        apply_official_detail_overrides(program)
        program["order"] = index

    summary = {
        "primary_total": len(primary_rows),
        "primary_clean": len(clean_rows),
        "primary_excluded_vocational": len(primary_rows) - len(clean_rows),
        "supplement_added": len(programs) - len(clean_rows),
        "final_total": len(programs),
    }
    return programs, summary


def mode_buttons(programs: list[dict[str, Any]]) -> str:
    preferred = ["2+2", "1+3", "1+4", "3+1", "3+2", "2.5+1.5", "0.5+4", "0.5+4.5", "0.5+0.5+4", "2+1+1", "4+0"]
    modes = []
    available = {program["mode"] for program in programs}
    for mode in preferred:
        if mode in available:
            modes.append(mode)
    for mode in sorted(available):
        if mode not in modes:
            modes.append(mode)
    return "\n".join(
        f'<button class="category-button mode-filter" type="button" data-filter="mode:{mode}" aria-pressed="false">{mode}</button>'
        for mode in modes
    )


def update_html(programs: list[dict[str, Any]]) -> None:
    program_json = json.dumps(programs, ensure_ascii=False, separators=(",", ":"))
    buttons_html = mode_buttons(programs)
    summary_css = """      .project-audit-strip {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0;
        border: 1px solid var(--ink);
        background: var(--surface);
      }

      .project-audit-strip > div {
        min-width: 0;
        border-right: 1px solid var(--ink);
        padding: 0.82rem 1rem;
      }

      .project-audit-strip > div:last-child { border-right: 0; }
      .project-audit-strip span {
        display: block;
        color: var(--muted);
        font-size: 0.72rem;
        font-weight: 900;
      }
      .project-audit-strip strong {
        display: block;
        margin-top: 0.32rem;
        font-size: 1.25rem;
        line-height: 1;
      }
      .project-audit-strip p {
        margin: 0.38rem 0 0;
        color: var(--muted);
        font-size: 0.76rem;
        font-weight: 700;
        line-height: 1.45;
      }

"""
    summary_html = """<section class="project-audit-strip" aria-label="项目库口径">
        <div><span>项目口径</span><strong>63项</strong><p>原93复核保留28 + 新增/官方35</p></div>
        <div><span>收录范围</span><strong>本科/预科</strong><p>不纳入专科/高职项目</p></div>
        <div><span>核对重点</span><strong>模式+费用</strong><p>以学校官方简章和链接为准</p></div>
      </section>"""

    for target in HTML_TARGETS:
        html = target.read_text(encoding="utf-8")
        if "      .project-audit-strip {" not in html:
            html = html.replace("      .toolbox {\n", summary_css + "      .toolbox {\n", 1)
        html = re.sub(
            r"const programs = \[[\s\S]*?\];\s*const caseSummaries",
            f"const programs = {program_json};\n      const caseSummaries",
            html,
            count=1,
        )
        html = re.sub(
            r'(<div class="category-controls mode-controls">\s*)[\s\S]*?(\s*</div>\s*</div>\s*<div class="filter-bottom-row">)',
            r"\1" + buttons_html + r"\2",
            html,
            count=1,
        )
        html = re.sub(
            r'placeholder="搜索：当前入库韩国\d+所高校"',
            'placeholder="搜索：当前展示63个本科/预科项目"',
            html,
            count=1,
        )
        if '<section class="project-audit-strip"' not in html:
            html = html.replace('<main class="wrap">\n      <section class="toolbox"', f'<main class="wrap">\n      {summary_html}\n\n      <section class="toolbox"', 1)
        else:
            html = re.sub(r'<section class="project-audit-strip"[\s\S]*?</section>', summary_html, html, count=1)
        target.write_text(html, encoding="utf-8", newline="\n")


def main() -> None:
    programs, summary = load_programs()
    update_html(programs)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
