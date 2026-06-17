from __future__ import annotations

import json
import math
import random
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "outputs" / "simple_admission_cases_20260616"
OUTPUT_DIR = ROOT / "outputs" / "admission_case_augmentation_20260617"
ADMISSION_JSON = ROOT / "src" / "data" / "admission-cases.json"
MAJOR_TAGS_JSON = ROOT / "src" / "data" / "university-major-tags.json"
WORKBOOK_DATA_JSON = OUTPUT_DIR / "augmented_admission_cases_20260617.json"

RNG = random.Random(20260617)
T5_TARGET_PER_SCHOOL = 35

SOURCE_STATUS_COLLECTED = "collected_20260616"
SOURCE_STATUS_SYNTHETIC = "tier_augmented_20260617"

DEFAULT_MAJOR = "未披露（公开案例未注明）"
DEFAULT_UNKNOWN = "未注明"

ART_MAJORS = [
    "音乐学",
    "影视影像",
    "视觉设计",
    "舞台美术",
    "动画",
    "表演",
    "艺术经营",
]

TAG_MAJOR_MAP = {
    "工科": ["机械工学", "电子工学", "化学工学", "建筑工学"],
    "自然科学/生命": ["生命科学", "食品营养", "环境科学", "化学"],
    "人文/外语": ["国语国文", "传媒", "英语英文", "国际学"],
    "经营/商科": ["经营学", "经济学", "贸易学", "会计学"],
    "计算机/AI": ["计算机工学", "软件学", "人工智能", "数据科学"],
    "传媒/影视": ["传媒学", "电影影像", "广告宣传", "文化Contents"],
    "艺术/设计": ["视觉设计", "产业设计", "音乐学", "动画"],
    "社会科学": ["行政学", "社会学", "心理学", "政治外交"],
    "教育": ["教育学", "幼儿教育", "国语教育", "英语教育"],
    "护理/保健": ["护理学", "保健行政", "物理治疗", "临床病理"],
}

TIER_PROFILES = {
    "T1": {
        "gpa": (84, 96),
        "topik": [(4, 20), (5, 50), (6, 30)],
        "result": [("admitted", 66), ("rejected", 31), ("mixed", 3)],
    },
    "T2_ART": {
        "gpa": (78, 92),
        "topik": [(3, 20), (4, 45), (5, 25), (6, 10)],
        "result": [("admitted", 78), ("rejected", 20), ("mixed", 2)],
    },
    "T2": {
        "gpa": (78, 92),
        "topik": [(3, 24), (4, 50), (5, 20), (6, 6)],
        "result": [("admitted", 78), ("rejected", 20), ("mixed", 2)],
    },
    "T3": {
        "gpa": (74, 88),
        "topik": [(3, 45), (4, 42), (5, 10), (6, 3)],
        "result": [("admitted", 82), ("rejected", 17), ("mixed", 1)],
    },
    "T4": {
        "gpa": (70, 84),
        "topik": [(2, 5), (3, 60), (4, 32), (5, 3)],
        "result": [("admitted", 86), ("rejected", 13), ("mixed", 1)],
    },
    "T5": {
        "gpa": (70, 82),
        "topik": [(2, 32), (3, 58), (4, 10)],
        "result": [("admitted", 90), ("rejected", 10)],
    },
}


def first_source_xlsx() -> Path:
    files = [path for path in SOURCE_DIR.glob("*.xlsx") if not path.name.startswith("~$")]
    if not files:
        raise FileNotFoundError(f"No .xlsx file found under {SOURCE_DIR}")
    return files[0]


def clean_value(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    if pd.isna(value):
        return None
    if isinstance(value, str):
        stripped = value.strip()
        return stripped if stripped else None
    return value


def as_text(value: Any, default: str = DEFAULT_UNKNOWN) -> str:
    cleaned = clean_value(value)
    if cleaned is None:
        return default
    if isinstance(cleaned, float) and cleaned.is_integer():
        return str(int(cleaned))
    return str(cleaned)


def normalize_percent(value: float | None) -> int | float | None:
    if value is None or not math.isfinite(value):
        return None
    value = max(0, min(100, value))
    rounded = round(value, 1)
    return int(rounded) if rounded.is_integer() else rounded


def parse_gpa_percent(value: Any) -> int | float | None:
    text = as_text(value, "").replace("％", "%")
    if not text or "未披露" in text or "未注明" in text:
        return None

    match = re.search(r"(\d+(?:\.\d+)?)\s*/\s*100", text)
    if match:
        return normalize_percent(float(match.group(1)))

    match = re.search(r"(\d+(?:\.\d+)?)\s*/\s*4(?:\.0)?", text)
    if match:
        return normalize_percent(float(match.group(1)) / 4 * 100)

    match = re.search(r"(\d+(?:\.\d+)?)\s*/\s*5(?:\.0)?", text)
    if match:
        return normalize_percent(float(match.group(1)) / 5 * 100)

    match = re.search(r"(?:GPA|均分|平均分)\D*(\d+(?:\.\d+)?)", text, flags=re.IGNORECASE)
    if match:
        number = float(match.group(1))
        if number > 10:
            return normalize_percent(number)

    match = re.search(r"(\d+(?:\.\d+)?)", text)
    if match:
        number = float(match.group(1))
        if 50 <= number <= 100:
            return normalize_percent(number)

    return None


def parse_topik_level(value: Any) -> int | None:
    text = as_text(value, "")
    if not text:
        return None
    match = re.search(r"TOPIK\s*([0-6])", text, flags=re.IGNORECASE)
    if match:
        return int(match.group(1))
    match = re.search(r"TOPIK([0-6])", text, flags=re.IGNORECASE)
    if match:
        return int(match.group(1))
    if "高等级" in text:
        return 6
    return None


def parse_ielts(ielts_value: Any, topik_value: Any) -> str:
    ielts_text = as_text(ielts_value, "")
    topik_text = as_text(topik_value, "")
    combined = f"{ielts_text} {topik_text}"
    match = re.search(r"雅思\s*(\d(?:\.\d)?)", combined)
    if match:
        return f"雅思 {match.group(1)}"
    if "无雅思" in combined or "未提供雅思" in combined:
        return "未提供雅思"
    return DEFAULT_UNKNOWN


def normalize_result(value: Any) -> tuple[str, str]:
    text = as_text(value, DEFAULT_UNKNOWN)
    lower = text.lower()
    if "拒" in text:
        return "拒绝", "rejected"
    if "混" in text:
        return "混合", "mixed"
    if "录取" in text or "offer" in lower or "通过" in text or "合格" in text:
        return "录取", "admitted"
    return text, "unknown"


def result_label(result_key: str) -> str:
    return {
        "admitted": "录取",
        "rejected": "拒绝",
        "mixed": "混合",
        "unknown": DEFAULT_UNKNOWN,
    }.get(result_key, DEFAULT_UNKNOWN)


def is_year_text(value: Any) -> bool:
    return bool(re.fullmatch(r"\d{4}", str(value or "")))


def tier_profile_key(tier: str) -> str:
    if tier.startswith("T1"):
        return "T1"
    if "艺术" in tier:
        return "T2_ART"
    if tier.startswith("T2"):
        return "T2"
    if tier.startswith("T3"):
        return "T3"
    if tier.startswith("T4"):
        return "T4"
    if tier.startswith("T5"):
        return "T5"
    return "T4"


def weighted_choice(weighted_items: list[tuple[Any, int | float]]) -> Any:
    values = [item[0] for item in weighted_items]
    weights = [float(item[1]) for item in weighted_items]
    return RNG.choices(values, weights=weights, k=1)[0]


def distribution_choice(counter: Counter, fallback: list[tuple[Any, int | float]]) -> Any:
    items = [(key, count) for key, count in counter.items() if key is not None and count > 0]
    return weighted_choice(items if items else fallback)


def bounded_gpa(profile_key: str, observed_values: list[int | float]) -> int:
    low, high = TIER_PROFILES[profile_key]["gpa"]
    if observed_values:
        base = float(RNG.choice(observed_values))
        value = base + RNG.choice([-2, -1, 0, 1, 2])
        value = max(low, min(high, value))
    else:
        value = RNG.randint(low, high)
    return int(round(value))


def generated_major(school_name: str, school_tier: str, base_major: str, major_tags: dict[str, list[str]]) -> str:
    if "艺术" in school_tier or school_name == "韩国艺术综合学校":
        return RNG.choice(ART_MAJORS)
    if base_major and base_major != DEFAULT_MAJOR:
        return base_major

    tags = major_tags.get(school_name, [])
    candidates: list[str] = []
    for tag in tags:
        candidates.extend(TAG_MAJOR_MAP.get(tag, []))
    return RNG.choice(candidates) if candidates else DEFAULT_MAJOR


def build_collected_case(row: pd.Series, excel_row: int, school_meta: dict[str, dict[str, str]]) -> dict[str, Any]:
    school_name = as_text(row["입학학교"])
    meta = school_meta[school_name]
    gpa_text = as_text(row["GPA/내신성적"], "未披露")
    topik_text = as_text(row["TOPIK성적"], DEFAULT_UNKNOWN)
    result, result_key = normalize_result(row["입학결과"])
    entry_year = as_text(row["입학연도"], "不详")
    entry_year_number = int(float(entry_year)) if re.fullmatch(r"\d{4}(?:\.0)?", entry_year) else None

    return {
        "id": "",
        "sourceRow": excel_row,
        "schoolName": school_name,
        "schoolSlug": meta.get("schoolSlug"),
        "schoolTier": meta["schoolTier"],
        "major": as_text(row["입학전공"], DEFAULT_MAJOR),
        "highSchoolType": as_text(row["중국학교등급/유형"], DEFAULT_UNKNOWN),
        "gpa": gpa_text,
        "gpaPercent": parse_gpa_percent(gpa_text),
        "topik": topik_text,
        "topikLevel": parse_topik_level(topik_text),
        "ielts": parse_ielts(row["雅思성적"], topik_text),
        "gaokao": as_text(row["会考성적"], DEFAULT_UNKNOWN),
        "coreStrength": as_text(row["비고"], "公开案例注明成绩与申请结果。"),
        "entryYear": entry_year,
        "entryYearNumber": entry_year_number,
        "result": result,
        "resultKey": result_key,
        "synthetic": False,
        "sourceStatus": SOURCE_STATUS_COLLECTED,
        "generationBasis": f"source_xlsx_row_{excel_row}",
    }


def build_synthetic_case(
    school_name: str,
    school_meta: dict[str, dict[str, str]],
    tier_pools: dict[str, list[dict[str, Any]]],
    tier_stats: dict[str, dict[str, Any]],
    all_collected: list[dict[str, Any]],
    major_tags: dict[str, list[str]],
) -> dict[str, Any]:
    meta = school_meta[school_name]
    school_tier = meta["schoolTier"]
    profile_key = tier_profile_key(school_tier)
    pool = tier_pools.get(school_tier) or tier_pools.get("T2-一流名校/强势特色院校") or all_collected
    base = RNG.choice(pool)
    stats = tier_stats.get(school_tier) or tier_stats.get(base["schoolTier"]) or {}

    gpa = bounded_gpa(profile_key, stats.get("gpas", []))
    topik_level = distribution_choice(stats.get("topik", Counter()), TIER_PROFILES[profile_key]["topik"])
    result_key = distribution_choice(stats.get("result", Counter()), TIER_PROFILES[profile_key]["result"])

    if profile_key == "T5":
        gpa = RNG.randint(70, 82)
        topik_level = weighted_choice(TIER_PROFILES["T5"]["topik"])
        result_key = weighted_choice(TIER_PROFILES["T5"]["result"])

    topik = f"TOPIK {topik_level}级" if topik_level else "无TOPIK"
    result = result_label(result_key)
    major = generated_major(school_name, school_tier, base["major"], major_tags)
    high_school = base["highSchoolType"] if base["highSchoolType"] != DEFAULT_UNKNOWN else "普通高中"
    entry_year = str(weighted_choice([("2026", 60), ("2025", 30), ("2024", 10)]))

    return {
        "id": "",
        "sourceRow": 0,
        "schoolName": school_name,
        "schoolSlug": meta.get("schoolSlug"),
        "schoolTier": school_tier,
        "major": major,
        "highSchoolType": high_school,
        "gpa": f"{gpa}/100",
        "gpaPercent": gpa,
        "topik": topik,
        "topikLevel": topik_level,
        "ielts": base["ielts"],
        "gaokao": base["gaokao"] if base["gaokao"] != DEFAULT_UNKNOWN else "会考成绩未单独披露",
        "coreStrength": (
            f"基于{profile_key}层级实收案例分布补充样本：高中成绩约{gpa}/100，"
            f"{topik}，用于补足{school_name}同层级样本。"
        ),
        "entryYear": entry_year,
        "entryYearNumber": int(entry_year),
        "result": result,
        "resultKey": result_key,
        "synthetic": True,
        "sourceStatus": SOURCE_STATUS_SYNTHETIC,
        "generationBasis": f"{school_tier}; sampled_from={base['schoolName']}; seed=20260617",
    }


def summarize_tier(cases: list[dict[str, Any]], school_meta: dict[str, dict[str, str]]) -> list[dict[str, Any]]:
    school_by_tier: dict[str, set[str]] = defaultdict(set)
    for school_name, meta in school_meta.items():
        school_by_tier[meta["schoolTier"]].add(school_name)

    rows = []
    for tier in sorted({case["schoolTier"] for case in cases}):
        tier_cases = [case for case in cases if case["schoolTier"] == tier]
        gpas = [case["gpaPercent"] for case in tier_cases if isinstance(case.get("gpaPercent"), (int, float))]
        topik = Counter(case.get("topikLevel") for case in tier_cases)
        result = Counter(case.get("resultKey") for case in tier_cases)
        rows.append(
            {
                "schoolTier": tier,
                "schoolCount": len(school_by_tier[tier]),
                "finalCount": len(tier_cases),
                "collectedCount": sum(1 for case in tier_cases if not case["synthetic"]),
                "syntheticCount": sum(1 for case in tier_cases if case["synthetic"]),
                "avgGpa": round(sum(gpas) / len(gpas), 1) if gpas else None,
                "topikDistribution": ", ".join(f"{key}:{value}" for key, value in sorted(topik.items(), key=lambda item: str(item[0]))),
                "resultDistribution": ", ".join(f"{key}:{value}" for key, value in sorted(result.items())),
            }
        )
    return rows


def json_safe_row(row: pd.Series, excel_row: int) -> dict[str, Any]:
    values = {"원본행번호": excel_row}
    for column, value in row.items():
        cleaned = clean_value(value)
        values[str(column)] = cleaned
    return values


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    source_xlsx = first_source_xlsx()

    existing_cases = json.loads(ADMISSION_JSON.read_text(encoding="utf-8"))
    school_order: list[str] = []
    school_meta: dict[str, dict[str, str]] = {}
    existing_counts: Counter[str] = Counter()

    for case in existing_cases:
        school_name = case["schoolName"]
        existing_counts[school_name] += 1
        if school_name not in school_meta:
            school_order.append(school_name)
            school_meta[school_name] = {
                "schoolSlug": case.get("schoolSlug"),
                "schoolTier": case["schoolTier"],
            }

    t5_schools = [school for school in school_order if school_meta[school]["schoolTier"].startswith("T5-")]
    target_counts = {
        school: T5_TARGET_PER_SCHOOL if school in t5_schools else existing_counts[school]
        for school in school_order
    }

    major_tags = json.loads(MAJOR_TAGS_JSON.read_text(encoding="utf-8")) if MAJOR_TAGS_JSON.exists() else {}
    df = pd.read_excel(source_xlsx, sheet_name=0)

    collected_cases: list[dict[str, Any]] = []
    raw_rows: list[dict[str, Any]] = []
    for zero_index, row in df.iterrows():
        excel_row = zero_index + 2
        school_name = as_text(row["입학학교"])
        if school_name not in school_meta:
            raise ValueError(f"Input row {excel_row} has unknown school: {school_name}")
        collected_cases.append(build_collected_case(row, excel_row, school_meta))
        raw_rows.append(json_safe_row(row, excel_row))

    tier_pools: dict[str, list[dict[str, Any]]] = defaultdict(list)
    collected_by_school: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for case in collected_cases:
        tier_pools[case["schoolTier"]].append(case)
        collected_by_school[case["schoolName"]].append(case)

    tier_stats: dict[str, dict[str, Any]] = {}
    for tier, cases in tier_pools.items():
        tier_stats[tier] = {
            "gpas": [case["gpaPercent"] for case in cases if isinstance(case.get("gpaPercent"), (int, float))],
            "topik": Counter(case.get("topikLevel") for case in cases if case.get("topikLevel") is not None),
            "result": Counter(case.get("resultKey") for case in cases if case.get("resultKey") != "unknown"),
            "entryYear": Counter(case.get("entryYear") for case in cases if is_year_text(case.get("entryYear"))),
        }

    final_cases: list[dict[str, Any]] = []
    school_summary: list[dict[str, Any]] = []
    for school_name in school_order:
        target = target_counts[school_name]
        school_collected = collected_by_school.get(school_name, [])
        final_cases.extend(school_collected)
        synthetic_needed = max(0, target - len(school_collected))

        for _ in range(synthetic_needed):
            final_cases.append(
                build_synthetic_case(
                    school_name=school_name,
                    school_meta=school_meta,
                    tier_pools=tier_pools,
                    tier_stats=tier_stats,
                    all_collected=collected_cases,
                    major_tags=major_tags,
                )
            )

        school_summary.append(
            {
                "schoolName": school_name,
                "schoolSlug": school_meta[school_name]["schoolSlug"],
                "schoolTier": school_meta[school_name]["schoolTier"],
                "targetCount": target,
                "collectedCount": len(school_collected),
                "syntheticCount": synthetic_needed,
                "finalCount": len(school_collected) + synthetic_needed,
                "gap": len(school_collected) + synthetic_needed - target,
                "status": "OK",
            }
        )

    for index, case in enumerate(final_cases, start=1):
        case["id"] = f"case-{index:04d}"
        case["sourceRow"] = index + 1

    rules = [
        {"item": "sourceWorkbook", "value": str(source_xlsx.relative_to(ROOT))},
        {"item": "collectedRows", "value": str(len(collected_cases))},
        {"item": "targetTotal", "value": str(sum(target_counts.values()))},
        {"item": "schoolCoverage", "value": str(len(school_order))},
        {"item": "t5Policy", "value": "T5 4 schools x 35 cases = 140 cases"},
        {"item": "syntheticPolicy", "value": "Tier distribution from the 284 collected rows; T5 adjusted to TOPIK 2-3 and GPA 70-82"},
        {"item": "jsonMetadata", "value": "synthetic, sourceStatus, generationBasis"},
    ]

    workbook_data = {
        "cases": final_cases,
        "schoolSummary": school_summary,
        "tierSummary": summarize_tier(final_cases, school_meta),
        "rules": rules,
        "rawRows": raw_rows,
    }

    ADMISSION_JSON.write_text(json.dumps(final_cases, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    WORKBOOK_DATA_JSON.write_text(json.dumps(workbook_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(
        json.dumps(
            {
                "cases": len(final_cases),
                "schools": len(school_order),
                "collected": sum(1 for case in final_cases if not case["synthetic"]),
                "synthetic": sum(1 for case in final_cases if case["synthetic"]),
                "t5": sum(1 for case in final_cases if case["schoolTier"].startswith("T5-")),
                "workbookData": str(WORKBOOK_DATA_JSON.relative_to(ROOT)),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
