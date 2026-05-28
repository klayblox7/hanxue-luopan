import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const universitySource = readFileSync(new URL("src/data/universities.ts", root), "utf8");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function field(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*"([^"]*)"`));
  return match?.[1] ?? "";
}

function numberField(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*(\\d+)`));
  return match ? Number(match[1]) : 0;
}

const universities = [...universitySource.matchAll(/\{\s*no:[\s\S]*?\n\s*\}/g)].map((match) => {
  const block = match[0];
  return {
    no: numberField(block, "no"),
    nameCn: field(block, "nameCn"),
    nameKr: field(block, "nameKr"),
    nameEn: field(block, "nameEn"),
    city: field(block, "city"),
    type: field(block, "type"),
    focus: field(block, "focus"),
    totalStudents: field(block, "totalStudents") || "待核验",
    foreignStudents: field(block, "foreignStudents") || "待核验",
    dormitoryCapacity: field(block, "dormitoryCapacity") || "\u5f85\u6838\u9a8c",
    dormitoryRate: field(block, "dormitoryRate") || "\u5f85\u6838\u9a8c",
    updatedAt: field(block, "updatedAt")
  };
}).filter((university) => university.no > 0);

const regionFilters = [
  { key: "seoul", label: "首尔", cities: ["首尔"] },
  { key: "gyeonggi", label: "京畿道", cities: ["水原", "城南", "龙仁", "安城", "富川", "高阳", "ERICA"] },
  { key: "incheon", label: "仁川", cities: ["仁川"] },
  { key: "busan", label: "釜山", cities: ["釜山"] },
  { key: "daegu", label: "大邱", cities: ["大邱"] },
  { key: "gwangju", label: "光州", cities: ["光州"] },
  { key: "daejeon", label: "大田", cities: ["大田"] },
  { key: "ulsan", label: "蔚山", cities: ["蔚山"] },
  { key: "sejong", label: "世宗", cities: ["世宗"] },
  { key: "gangwon", label: "江原道", cities: ["春川"] },
  { key: "chungbuk", label: "忠清北道", cities: ["清州"] },
  { key: "chungnam", label: "忠清南道", cities: ["天安", "牙山"] },
  { key: "jeonbuk", label: "全罗北道", cities: ["全州", "益山"] },
  { key: "gyeongbuk", label: "庆尚北道", cities: ["庆山", "浦项"] },
  { key: "jeju", label: "济州道", cities: ["济州"] }
];

function regionsForCity(city) {
  const regions = regionFilters
    .filter((region) => region.cities.some((cityName) => city.includes(cityName)))
    .map((region) => region.key);

  return [...new Set(regions.length > 0 ? regions : ["unknown"])];
}

const regionButtons = regionFilters
  .map(
    (region) =>
      `<button class="category-button region-filter" type="button" data-filter="region:${region.key}" aria-pressed="false">${region.label}</button>`
  )
  .join("\n          ");

const koreaRankingSourceUrl = "https://www.timeshighereducation.com/student/best-universities/best-universities-south-korea";

function koreaRank(sort, tableLabel = String(sort)) {
  const isTie = tableLabel.startsWith("=");
  const rankNumber = isTie ? tableLabel.slice(1) : tableLabel;

  return {
    sort,
    tableLabel,
    noteLabel: `${isTie ? "并列" : ""}第${rankNumber}名`
  };
}

const koreaRankings = new Map([
  ["首尔大学", koreaRank(1)],
  ["韩国科学技术院", koreaRank(2)],
  ["延世大学", koreaRank(3)],
  ["成均馆大学", koreaRank(4)],
  ["高丽大学", koreaRank(6)],
  ["汉阳大学", koreaRank(8, "=8")],
  ["庆熙大学", koreaRank(8, "=8")],
  ["世宗大学", koreaRank(8, "=8")],
  ["亚洲大学", koreaRank(12, "=12")],
  ["中央大学", koreaRank(12, "=12")],
  ["梨花女子大学", koreaRank(15, "=15")],
  ["嘉泉大学", koreaRank(15, "=15")],
  ["建国大学", koreaRank(15, "=15")],
  ["庆北大学", koreaRank(15, "=15")],
  ["釜山大学", koreaRank(15, "=15")],
  ["蔚山大学", koreaRank(15, "=15")],
  ["岭南大学", koreaRank(15, "=15")],
  ["加图立大学", koreaRank(22)],
  ["全南大学", koreaRank(23, "=23")],
  ["仁荷大学", koreaRank(23, "=23")],
  ["全北大学", koreaRank(23, "=23")],
  ["西江大学", koreaRank(23, "=23")],
  ["忠北大学", koreaRank(27, "=27")],
  ["忠南大学", koreaRank(27, "=27")],
  ["首尔市立大学", koreaRank(27, "=27")],
  ["济州大学", koreaRank(30, "=30")],
  ["江原大学", koreaRank(30, "=30")],
  ["国民大学", koreaRank(30, "=30")],
  ["釜庆大学", koreaRank(30, "=30")],
  ["首尔科学技术大学", koreaRank(30, "=30")],
  ["顺天乡大学", koreaRank(30, "=30")],
  ["檀国大学", koreaRank(40, "=40")]
]);

function rankingForUniversity(university) {
  const ranking = koreaRankings.get(university.nameCn);

  return (
    ranking ?? {
      sort: 9999,
      tableLabel: "*",
      noteLabel: "*"
    }
  );
}

function shell({ title, body, extraStyle = "" }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}｜韩学罗盘</title>
    <style>
      :root {
        --paper: #fbfbf8;
        --surface: #fffefb;
        --ink: #0a0a0a;
        --muted: #66645d;
        --panel: #f0eee6;
        --yellow: #ffe07a;
        --mint: #a4d4c5;
        --pink: #ffd0d8;
      }

      * { box-sizing: border-box; }

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

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        min-height: 7rem;
        padding: 1rem 2rem;
        border-bottom: 1px solid var(--ink);
      }

      .logo {
        width: 5rem;
        height: 5rem;
        object-fit: contain;
      }

      .nav {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--ink);
        border-radius: 999px;
        padding: 0.5rem 1rem;
        font-size: 1.25rem;
        font-weight: 700;
        line-height: 1;
      }

      .yellow { background: var(--yellow); }
      .mint { background: var(--mint); }
      .pink { background: var(--pink); }

      .wrap {
        width: min(1120px, calc(100% - 2rem));
        margin: 0 auto;
        padding: 2.5rem 0 4rem;
      }

      .back {
        display: inline-flex;
        border: 1px solid var(--ink);
        border-radius: 999px;
        padding: 0.55rem 0.9rem;
        font-weight: 700;
      }

      h1 {
        margin: 2rem 0 0;
        font-size: clamp(2.5rem, 7vw, 5.5rem);
        line-height: 0.95;
        letter-spacing: 0;
      }

      .lead {
        max-width: 46rem;
        margin: 1rem 0 0;
        color: var(--muted);
        font-size: 1.05rem;
        line-height: 1.8;
      }

      ${extraStyle}

      @media (max-width: 720px) {
        .header { min-height: auto; padding: 0.75rem 1rem; }
        .logo { width: 4rem; height: 4rem; }
        .nav { gap: 0.35rem; }
        .pill { padding: 0.5rem 0.65rem; font-size: 0.9rem; }
      }
    </style>
  </head>
  <body>
    <header class="header">
      <a href="./hanxue-luopan-home.html" aria-label="韩学罗盘">
        <img class="logo" src="./public/hanxue-luopan-logo.png" alt="韩学罗盘" />
      </a>
      <nav class="nav" aria-label="主导航">
        <a class="pill yellow" href="./exchange-rate.html">汇率</a>
        <a class="pill mint" href="./korea-overview.html">韩国概况</a>
        <a class="pill pink" href="./about.html">关于我们</a>
      </nav>
    </header>
    ${body}
  </body>
</html>`;
}

const universityRows = universities
  .map(
    (university) => {
      const regions = regionsForCity(university.city);
      const ranking = rankingForUniversity(university);

      return `<tr data-list-order="${university.no}" data-rank="${ranking.sort}" data-rank-label="${escapeHtml(ranking.tableLabel)}" data-city="${escapeHtml(university.city)}" data-type="${escapeHtml(university.type)}" data-primary-region="${regions[0]}" data-regions="${regions.join(" ")}">
              <td>${escapeHtml(ranking.tableLabel)}</td>
              <td>
                <strong class="university-name">${escapeHtml(university.nameCn)}<span class="rank-note">${escapeHtml(ranking.noteLabel)}</span></strong>
                <span>${escapeHtml(university.nameKr)} · ${escapeHtml(university.nameEn)}</span>
              </td>
              <td>${escapeHtml(university.city)}</td>
              <td>${escapeHtml(university.type)}</td>
              <td>${escapeHtml(university.focus)}</td>
              <td>
                <strong class="student-count">${escapeHtml(university.totalStudents)}</strong>
                <span class="student-scope">(${escapeHtml(university.foreignStudents)})</span>
              </td>
              <td>
                <strong class="student-count">${escapeHtml(university.dormitoryCapacity)}</strong>
                <span class="student-scope">(${escapeHtml(university.dormitoryRate)})</span>
              </td>
            </tr>`;
    }
  )
  .join("\n");

const universitiesHtml = shell({
  title: "韩国大学库",
  extraStyle: `
      .wrap {
        width: min(1500px, calc(100% - 4rem));
      }

      .university-panel {
        width: 91%;
        margin: 0 auto;
      }

      .university-titlebar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 2rem;
      }

      .university-titlebar h1 {
        margin: 0;
        font-size: clamp(1.25rem, 3.5vw, 2.75rem);
      }

      .university-titlebar .back {
        flex: 0 0 auto;
      }

      .category-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1.25rem;
      }

      .category-button {
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: var(--surface);
        color: var(--ink);
        cursor: pointer;
        font: inherit;
        font-size: 0.82rem;
        font-weight: 700;
        line-height: 1;
        padding: 0.5rem 0.85rem;
      }

      .category-button[aria-pressed="true"] {
        background: var(--yellow);
      }

      .category-region-sort {
        margin-left: auto;
      }

      .region-controls {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        gap: 0.5rem;
      }

      .region-filter {
        font-size: 0.78rem;
        padding: 0.45rem 0.75rem;
      }

      .ranking-note {
        margin: 0.75rem 0 0;
        color: var(--muted);
        font-size: 0.78rem;
        line-height: 1.6;
        text-align: right;
      }

      table {
        width: 100%;
        margin-top: 2rem;
        border-collapse: collapse;
        table-layout: fixed;
        background: #fffefb;
        border: 1px solid var(--ink);
      }

      th,
      td {
        border-bottom: 1px solid var(--ink);
        padding: 0.8rem 0.9rem;
        text-align: left;
        vertical-align: middle;
        word-break: keep-all;
        overflow-wrap: anywhere;
      }

      th {
        background: var(--panel);
        font-size: 1rem;
        font-weight: 800;
      }

      td span {
        display: block;
        margin-top: 0.25rem;
        color: var(--muted);
        font-size: 0.82rem;
      }

      .university-name .rank-note {
        display: none;
        margin: 0 0 0 0.35rem;
        color: var(--muted);
        font-size: 0.82em;
        font-style: italic;
        font-weight: 400;
      }

      .show-rank-note .university-name .rank-note {
        display: inline;
      }

      .student-head {
        display: block;
        line-height: 1.25;
      }

      .student-head span,
      .student-scope {
        display: block;
        margin-top: 0.2rem;
        color: var(--ink);
        font-weight: 400;
      }

      .student-count {
        display: block;
      }

      .badge {
        display: inline-flex;
        border: 1px solid #d8ceb5;
        border-radius: 999px;
        background: #f5f0e0;
        padding: 0.3rem 0.55rem;
        color: var(--muted);
        font-size: 0.78rem;
        font-weight: 700;
        white-space: nowrap;
      }

      @media (max-width: 880px) {
        .wrap {
          width: min(100% - 2rem, 1500px);
        }

        .university-panel {
          width: 100%;
        }

        .university-titlebar {
          align-items: flex-start;
        }

        .category-region-sort {
          margin-left: 0;
        }

        table {
          width: 100%;
          font-size: 0.85rem;
        }
        th:nth-child(3), td:nth-child(3) { display: none; }
      }
  `,
  body: `<main class="wrap">
      <section class="university-panel">
        <div class="university-titlebar">
          <h1>韩国大学库</h1>
          <a class="back" href="./hanxue-luopan-home.html">返回首页</a>
        </div>
        <div class="category-controls" aria-label="大学列表分类">
          <button class="category-button" type="button" data-filter="rank" aria-pressed="true">大学排名</button>
          <button class="category-button" type="button" data-filter="national" aria-pressed="false">国立</button>
          <button class="category-button" type="button" data-filter="private" aria-pressed="false">私立</button>
          <button class="category-button category-region-sort" type="button" data-filter="region" aria-pressed="false">地区分类</button>
          <div class="region-controls" aria-label="韩国地区筛选">
          ${regionButtons}
          </div>
        </div>
        <table>
          <colgroup>
            <col style="width: 6%" />
            <col style="width: 28%" />
            <col style="width: 8.4%" />
            <col style="width: 10%" />
            <col style="width: 24%" />
            <col style="width: 11.8%" />
            <col style="width: 11.8%" />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>学校</th>
              <th>城市</th>
              <th>类型</th>
              <th>方向参考</th>
              <th><span class="student-head">学生数<span>(外国人)</span></span></th>
              <th><span class="student-head">学校宿舍<span>(占学生数)</span></span></th>
            </tr>
          </thead>
          <tbody>
              ${universityRows}
          </tbody>
        </table>
        <p class="ranking-note">大学排名：<a href="${koreaRankingSourceUrl}" target="_blank" rel="noreferrer">THE World University Rankings 2026</a></p>
      </section>
      <script>
        (() => {
          const buttons = Array.from(document.querySelectorAll(".category-button"));
          const tbody = document.querySelector("tbody");
          const rows = Array.from(tbody.querySelectorAll("tr"));
          const regionOrder = new Map(${JSON.stringify(regionFilters.map((region, index) => [region.key, index]))});

          function applyFilter(filter) {
            buttons.forEach((button) => {
              button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
            });

            const [filterType, filterValue] = filter.split(":");

            const sortedRows = [...rows].sort((a, b) => {
              if (filter === "region") {
                const regionCompare =
                  (regionOrder.get(a.dataset.primaryRegion) ?? 999) -
                  (regionOrder.get(b.dataset.primaryRegion) ?? 999);
                if (regionCompare !== 0) return regionCompare;
              }
              const rankCompare = Number(a.dataset.rank) - Number(b.dataset.rank);
              if (rankCompare !== 0) return rankCompare;
              return Number(a.dataset.listOrder) - Number(b.dataset.listOrder);
            });

            let visibleIndex = 1;

            sortedRows.forEach((row) => {
              const type = row.dataset.type || "";
              const isNational = type.includes("国立") || type.includes("公立");
              const isPrivate = type.includes("私立");
              const regions = (row.dataset.regions || "").split(" ");
              const visible =
                filter === "rank" ||
                filter === "region" ||
                (filter === "national" && isNational) ||
                (filter === "private" && isPrivate) ||
                (filterType === "region" && regions.includes(filterValue));

              row.hidden = !visible;
              row.classList.toggle("show-rank-note", filter !== "rank");
              if (visible) {
                row.cells[0].textContent = filter === "rank" ? row.dataset.rankLabel : String(visibleIndex);
                visibleIndex += 1;
              }
              tbody.appendChild(row);
            });
          }

          buttons.forEach((button) => {
            button.addEventListener("click", () => applyFilter(button.dataset.filter));
          });

          applyFilter("rank");
        })();
      </script>
    </main>`
});

const placeholderPages = [
  ["exchange-rate.html", "汇率", "人民币与韩元汇率入口后续会接入实时或定期更新的参考数据。"],
  ["korea-overview.html", "韩国概况", "这里将整理韩国城市、学制、签证、住宿和生活信息。"],
  ["about.html", "关于我们", "韩学罗盘会把官方信息、学校信息、人民币估算和学生经验分层展示。"],
  ["topik.html", "TOPIK考试", "TOPIK等级、费用、考点、备考路线和大学申请关系将在这里扩展。"],
  ["cost.html", "留学费用（奖学金）", "学费、住宿、生活费人民币预算，以及政府、学校和TOPIK奖学金线索将在这里扩展。"],
  ["korean-learning.html", "韩语学习", "从零基础到TOPIK 6级的学习路线将在这里扩展。"],
  ["scholarships.html", "奖学金", "政府奖学金、学校奖学金和TOPIK等级奖学金将在这里扩展。"],
  ["application.html", "申请路线", "本科、插班、研究生、语学院的申请时间线、材料清单和关键截止日将在这里扩展。"],
  ["agency-check.html", "自申 vs 中介", "判断自己是否适合自己申请的工具将在这里扩展。"]
];

mkdirSync(root, { recursive: true });
writeFileSync(new URL("universities.html", root), universitiesHtml, "utf8");

for (const [fileName, title, description] of placeholderPages) {
  writeFileSync(
    new URL(fileName, root),
    shell({
      title,
      body: `<main class="wrap">
      <a class="back" href="./hanxue-luopan-home.html">返回首页</a>
      <h1>${escapeHtml(title)}</h1>
      <p class="lead">${escapeHtml(description)}</p>
    </main>`
    }),
    "utf8"
  );
}
